import "dotenv/config";
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "node:crypto";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import OAuthCode from "../src/models/OAuthCode.js";
import app from "../src/app.js";

describe("GitHub OAuth and Rate Limiting Tests", () => {
  let server;
  let baseUrl;

  before(async () => {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test("Trust proxy is properly configured for Render reverse proxy environment", () => {
    const trustProxy = app.get("trust proxy");
    assert.strictEqual(
      trustProxy,
      1,
      "Express trust proxy should be set to 1 to trust Render's immediate reverse proxy hop"
    );
  });

  test("First-time OAuth attempt: redirects to GitHub, sets oauth_state cookie, and starts with fresh rate-limit quota", async () => {
    const clientIp = "192.0.2.10";
    const res = await fetch(`${baseUrl}/api/auth/github`, {
      method: "GET",
      headers: {
        "x-forwarded-for": clientIp,
      },
      redirect: "manual",
    });

    assert.strictEqual(res.status, 302, "Should return 302 redirect");

    const location = res.headers.get("location");
    assert.ok(location, "Location header must be present");
    assert.ok(
      location.startsWith("https://github.com/login/oauth/authorize"),
      "Should redirect to GitHub OAuth authorization URL"
    );

    const redirectUrl = new URL(location);
    const stateInUrl = redirectUrl.searchParams.get("state");
    const clientIdInUrl = redirectUrl.searchParams.get("client_id");
    const redirectUriInUrl = redirectUrl.searchParams.get("redirect_uri");
    const scopeInUrl = redirectUrl.searchParams.get("scope");

    assert.ok(stateInUrl, "OAuth state must be generated and included in GitHub URL");
    assert.strictEqual(scopeInUrl, "read:user,user:email", "Scope must request read:user and user:email");
    assert.ok(redirectUriInUrl.endsWith("/api/auth/github/callback"), "Redirect URI must target callback endpoint");

    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie, "oauth_state cookie must be set");
    assert.ok(setCookie.includes(`oauth_state=${stateInUrl}`), "oauth_state cookie must match the state parameter in the URL");
    assert.ok(setCookie.toLowerCase().includes("httponly"), "oauth_state cookie must be HttpOnly");

    // Rate limit headers
    const limitHeader = res.headers.get("ratelimit-limit");
    const remainingHeader = res.headers.get("ratelimit-remaining");
    assert.strictEqual(limitHeader, "20", "Rate limit max should be 20");
    assert.strictEqual(remainingHeader, "19", "Remaining should be 19 after first attempt");
  });

  test("Repeated attempts from the same client IP: correctly hits 429 rate limit after 20 attempts", async () => {
    const abusiveIp = "192.0.2.99";

    // Exhaust remaining attempts (1 through 20)
    for (let i = 1; i <= 20; i++) {
      const res = await fetch(`${baseUrl}/api/auth/github`, {
        method: "GET",
        headers: {
          "x-forwarded-for": abusiveIp,
        },
        redirect: "manual",
      });
      assert.strictEqual(res.status, 302, `Request ${i} should succeed with 302 before rate limit is reached`);
      const remaining = Number(res.headers.get("ratelimit-remaining"));
      assert.strictEqual(remaining, 20 - i, `Request ${i} remaining counter should be ${20 - i}`);
    }

    // Attempt 21 from the same abusive IP must be blocked
    const blockedRes = await fetch(`${baseUrl}/api/auth/github`, {
      method: "GET",
      headers: {
        "x-forwarded-for": abusiveIp,
      },
      redirect: "manual",
    });

    assert.strictEqual(blockedRes.status, 429, "Attempt 21 should return 429 Too Many Requests");
    const bodyText = await blockedRes.text();
    assert.strictEqual(
      bodyText,
      "Too many authentication attempts, please try again later",
      "Exact rate limit error message must be returned"
    );
    assert.strictEqual(blockedRes.headers.get("ratelimit-remaining"), "0", "Remaining quota should be 0");
  });

  test("Different client IPs: a legitimate user is NOT blocked even when another IP has exhausted the rate limit", async () => {
    const abusiveIp = "192.0.2.99"; // already exhausted in previous test
    const legitimateIpA = "192.0.2.101";
    const legitimateIpB = "192.0.2.102";

    // Verify abusive IP is still blocked
    const blockedRes = await fetch(`${baseUrl}/api/auth/github`, {
      method: "GET",
      headers: {
        "x-forwarded-for": abusiveIp,
      },
      redirect: "manual",
    });
    assert.strictEqual(blockedRes.status, 429, "Abusive IP must still be blocked");

    // Legitimate User A making their first attempt must succeed
    const legitResA = await fetch(`${baseUrl}/api/auth/github`, {
      method: "GET",
      headers: {
        "x-forwarded-for": legitimateIpA,
      },
      redirect: "manual",
    });
    assert.strictEqual(legitResA.status, 302, "Legitimate User A must not be affected by User 99's rate limit");
    assert.strictEqual(legitResA.headers.get("ratelimit-remaining"), "19", "Legitimate User A must have full quota minus 1");

    // Legitimate User B making their first attempt must also succeed independently
    const legitResB = await fetch(`${baseUrl}/api/auth/github`, {
      method: "GET",
      headers: {
        "x-forwarded-for": legitimateIpB,
      },
      redirect: "manual",
    });
    assert.strictEqual(legitResB.status, 302, "Legitimate User B must not be affected by other users");
    assert.strictEqual(legitResB.headers.get("ratelimit-remaining"), "19", "Legitimate User B must have independent quota");
  });

  test("OAuth callback validates state parameter and cookie: prevents CSRF when state is missing, mismatched, or tampered", async () => {
    const clientIp = "192.0.2.200";
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

    // 1. Missing state query param and cookie
    const resNoState = await fetch(`${baseUrl}/api/auth/github/callback?code=fake_code`, {
      method: "GET",
      headers: { "x-forwarded-for": clientIp },
      redirect: "manual",
    });
    assert.strictEqual(resNoState.status, 302);
    assert.strictEqual(resNoState.headers.get("location"), `${frontendUrl}/login?error=InvalidState`);

    // 2. State in query param but no cookie
    const resNoCookie = await fetch(`${baseUrl}/api/auth/github/callback?code=fake_code&state=some_random_state`, {
      method: "GET",
      headers: { "x-forwarded-for": clientIp },
      redirect: "manual",
    });
    assert.strictEqual(resNoCookie.status, 302);
    assert.strictEqual(resNoCookie.headers.get("location"), `${frontendUrl}/login?error=InvalidState`);

    // 3. State in query param does not match cookie state (CSRF attack attempt)
    const resMismatched = await fetch(`${baseUrl}/api/auth/github/callback?code=fake_code&state=attack_state_123`, {
      method: "GET",
      headers: {
        "x-forwarded-for": clientIp,
        cookie: "oauth_state=legitimate_state_456",
      },
      redirect: "manual",
    });
    assert.strictEqual(resMismatched.status, 302);
    assert.strictEqual(resMismatched.headers.get("location"), `${frontendUrl}/login?error=InvalidState`);

    // 4. Valid state matching cookie, but missing code
    const validState = "correct_matching_state_789";
    const resNoCode = await fetch(`${baseUrl}/api/auth/github/callback?state=${validState}`, {
      method: "GET",
      headers: {
        "x-forwarded-for": clientIp,
        cookie: `oauth_state=${validState}`,
      },
      redirect: "manual",
    });
    assert.strictEqual(resNoCode.status, 302);
    assert.strictEqual(resNoCode.headers.get("location"), `${frontendUrl}/login?error=NoCodeProvided`);

    // Ensure oauth_state cookie was cleared in response
    const clearCookieHeader = resNoCode.headers.get("set-cookie");
    assert.ok(clearCookieHeader, "oauth_state cookie should be cleared on callback");
    assert.ok(
      clearCookieHeader.includes("oauth_state=;") || clearCookieHeader.includes("oauth_state= ;") || clearCookieHeader.includes("Max-Age=0") || clearCookieHeader.includes("Expires="),
      "Cookie must be cleared"
    );
  });

  test("Proxy header handling: correctly resolves client IP when X-Forwarded-For contains multiple proxy hops", async () => {
    // When X-Forwarded-For is "client, proxy1", with trust proxy 1, Express treats "proxy1" as the 1 trusted hop
    // and returns the preceding IP as req.ip
    const clientIp = "198.51.100.55";
    const res = await fetch(`${baseUrl}/api/auth/github`, {
      method: "GET",
      headers: {
        "x-forwarded-for": `${clientIp}, 10.0.0.1`,
      },
      redirect: "manual",
    });

    assert.strictEqual(res.status, 302);
    // Counter for 198.51.100.55 should be 19 remaining
    assert.strictEqual(res.headers.get("ratelimit-remaining"), "19");
  });

  test("OAuth code exchange endpoint: rejects invalid or missing codes and preserves auth validation", async () => {
    // 1. Missing body/code
    const resEmpty = await fetch(`${baseUrl}/api/auth/exchange`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "192.0.2.150",
      },
      body: JSON.stringify({}),
    });
    assert.strictEqual(resEmpty.status, 400, "Missing code should fail schema validation with 400");
    const jsonEmpty = await resEmpty.json();
    assert.strictEqual(jsonEmpty.success, false);

    // 2. Invalid code (not in DB)
    const resInvalid = await fetch(`${baseUrl}/api/auth/exchange`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "192.0.2.150",
      },
      body: JSON.stringify({ code: "nonexistent_fake_code_12345" }),
    });
    // Either 401 (AppError: Invalid or expired code) or handled safely
    assert.strictEqual(resInvalid.status, 401, "Invalid code should return 401");
    const jsonInvalid = await resInvalid.json();
    assert.strictEqual(jsonInvalid.message, "Invalid or expired code");
  });

  test("OAuth code exchange: successfully exchanges code for JWT and prevents replay attacks", async () => {
    // Create test user
    const testUsername = `testoauth_${Date.now()}`;
    const testUser = await User.create({
      name: "OAuth Test User",
      email: `${testUsername}@test.resumex`,
      username: testUsername,
      authProvider: "github",
    });

    const rawCode = `test_secret_code_${crypto.randomBytes(16).toString("hex")}`;
    const codeHash = crypto.createHash("sha256").update(rawCode).digest("hex");

    await OAuthCode.create({
      codeHash,
      userId: testUser._id,
    });

    try {
      // First exchange: should succeed
      const resExchange = await fetch(`${baseUrl}/api/auth/exchange`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "192.0.2.160",
        },
        body: JSON.stringify({ code: rawCode }),
      });

      assert.strictEqual(resExchange.status, 200, "First exchange should succeed with 200");
      const data = await resExchange.json();
      assert.strictEqual(data.message, "Exchange successful");
      assert.ok(data.token, "JWT token must be returned");
      assert.strictEqual(data.user.username, testUsername);

      // Verify code was deleted from database
      const foundCode = await OAuthCode.findOne({ codeHash });
      assert.strictEqual(foundCode, null, "OAuthCode should be deleted after successful exchange");

      // Replay attempt: must fail with 401
      const resReplay = await fetch(`${baseUrl}/api/auth/exchange`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "192.0.2.160",
        },
        body: JSON.stringify({ code: rawCode }),
      });
      assert.strictEqual(resReplay.status, 401, "Replaying same code must be rejected with 401");
    } finally {
      await OAuthCode.deleteMany({ codeHash });
      await User.deleteOne({ _id: testUser._id });
    }
  });
});
