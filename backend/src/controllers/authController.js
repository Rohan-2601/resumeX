import crypto from "crypto";
import axios from "axios";
import User from "../models/User.js";
import OAuthCode from "../models/OAuthCode.js";
import { buildToken } from "../utils/auth.js";
import AppError from "../utils/AppError.js";

const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
const RESERVED_USERNAMES = [
  "admin",
  "api",
  "login",
  "dashboard",
  "public",
  "auth",
  "register",
  "null",
  "undefined",
];

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  username: user.username,
  authProvider: user.authProvider,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getUniqueUsername = async (baseValue) => {
  const base =
    (baseValue || "user")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 20) || "user";

  let candidate = base;
  let suffix = 1;

  while (
    (await User.exists({ username: candidate })) ||
    RESERVED_USERNAMES.includes(candidate)
  ) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return candidate;
};

export const register = async (req, res) => {
  const { username, password } = req.body;
  const normalizedUsername = username.trim().toLowerCase();

  if (RESERVED_USERNAMES.includes(normalizedUsername)) {
    throw new AppError("Username is unavailable", 409);
  }

  const existingByUsername = await User.findOne({
    username: normalizedUsername,
  });
  
  if (existingByUsername) {
    throw new AppError("Username is already taken", 409);
  }

  const user = await User.create({
    name: normalizedUsername,
    email: `${normalizedUsername}@local.resumex`,
    username: normalizedUsername,
    password,
    authProvider: "local",
  });

  const token = buildToken(user._id);

  res.status(201).json({
    message: "Registered successfully",
    token,
    user: serializeUser(user),
  });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const normalizedUsername = (username || "").trim().toLowerCase();

  const user = await User.findOne({ username: normalizedUsername }).select(
    "+password",
  );

  if (!user) {
    throw new AppError("Invalid username or password", 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Invalid username or password", 401);
  }

  const token = buildToken(user._id);

  res.json({
    message: "Login successful",
    token,
    user: serializeUser(user),
  });
};

export const githubLogin = (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${(process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "")}/api/auth/github/callback`;

  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:user,user:email&state=${state}`;
  res.redirect(githubAuthUrl);
};

export const githubCallback = async (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  const { code, state } = req.query;
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

  const savedState = req.cookies?.oauth_state;
  res.clearCookie("oauth_state");

  if (!state || !savedState || state !== savedState) {
    return res.redirect(`${frontendUrl}/login?error=InvalidState`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=NoCodeProvided`);
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.redirect(`${frontendUrl}/login?error=TokenExchangeFailed`);
    }

    // 2. Fetch user profile from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Fetch user emails separately as they might be private in the profile
    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const githubUser = userResponse.data;
    const verifiedEmails = emailResponse.data.filter((e) => e.verified);

    if (verifiedEmails.length === 0) {
      return res.redirect(`${frontendUrl}/login?error=NoVerifiedEmailFound`);
    }

    const primaryEmailObj =
      verifiedEmails.find((e) => e.primary) || verifiedEmails[0];
    const email = primaryEmailObj.email;

    // 3. Create or find user in DB
    let user = await User.findOne({ email });

    const avatar = githubUser.avatar_url || "/default.webp";

    if (!user) {
      const username = await getUniqueUsername(
        githubUser.login || email.split("@")[0]
      );
      user = await User.create({
        email,
        name: githubUser.name || username,
        username,
        authProvider: "github",
        avatar,
      });
    } else {
      let needsSave = false;
      if (user.authProvider === "local") {
        user.authProvider = "both";
        needsSave = true;
      }
      if (!user.avatar || user.avatar === "/default.webp") {
        user.avatar = avatar;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    // 4. Generate secure one-time code for frontend token handoff
    const exchangeCode = crypto.randomBytes(32).toString("hex");
    const codeHash = crypto.createHash("sha256").update(exchangeCode).digest("hex");

    await OAuthCode.create({
      codeHash,
      userId: user._id,
    });

    // 5. Redirect back to frontend auth callback
    res.redirect(`${frontendUrl}/auth/callback?code=${exchangeCode}`);
  } catch (error) {
    console.error("GitHub Auth Error:", error.message);
    res.redirect(`${frontendUrl}/login?error=AuthenticationFailed`);
  }
};

export const exchangeOAuthCode = async (req, res) => {
  const { code } = req.body;
  
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const oauthCode = await OAuthCode.findOne({ codeHash });

  if (!oauthCode) {
    throw new AppError("Invalid or expired code", 401);
  }

  const user = await User.findById(oauthCode.userId);

  // Invalidate the code so it cannot be replayed
  await OAuthCode.deleteOne({ _id: oauthCode._id });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const token = buildToken(user._id);

  res.json({
    message: "Exchange successful",
    token,
    user: serializeUser(user),
  });
};

export const getMe = async (req, res) => {
  // req.user should be populated by authMiddleware
  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ user: serializeUser(user) });
};
