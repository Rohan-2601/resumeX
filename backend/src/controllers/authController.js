import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

const buildToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  username: user.username,
  authProvider: user.authProvider,
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

  while (await User.exists({ username: candidate })) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return candidate;
};

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "username and password are required",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();

    if (!usernameRegex.test(normalizedUsername)) {
      return res.status(400).json({
        message:
          "Username must be 3-30 characters and can only contain letters, numbers, _ and -",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingByUsername = await User.findOne({
      username: normalizedUsername,
    });
    if (existingByUsername) {
      return res.status(409).json({ message: "Username is already taken" });
    }

    const user = await User.create({
      name: normalizedUsername,
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
  } catch (error) {
    console.error("Register Error:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = (username || "").trim().toLowerCase();

    if (!normalizedUsername || !password) {
      return res.status(400).json({
        message: "username and password are required",
      });
    }

    const user = await User.findOne({ username: normalizedUsername }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = buildToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const githubLogin = (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:user,user:email`;
  res.redirect(githubAuthUrl);
};

export const githubCallback = async (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  if (!code) {
    return res.redirect(`${frontendUrl}?error=NoCodeProvided`);
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
      },
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.redirect(`${frontendUrl}?error=TokenExchangeFailed`);
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
      },
    );

    const githubUser = userResponse.data;
    const primaryEmailObj =
      emailResponse.data.find((e) => e.primary) || emailResponse.data[0];
    const email = primaryEmailObj?.email;

    if (!email) {
      return res.redirect(`${frontendUrl}?error=NoEmailFound`);
    }

    // 3. Create or find user in DB
    let user = await User.findOne({ email });

    if (!user) {
      const username = await getUniqueUsername(
        githubUser.login || email.split("@")[0],
      );
      user = await User.create({
        email,
        name: githubUser.name || username,
        username,
        authProvider: "github",
      });
    } else if (user.authProvider === "local") {
      user.authProvider = "both";
      await user.save();
    }

    // 4. Generate JWT
    const token = buildToken(user._id);

    // 5. Redirect back to frontend with token
    res.redirect(`${frontendUrl}?token=${token}`);
  } catch (error) {
    console.error("GitHub Auth Error:", error.message);
    res.redirect(`${frontendUrl}?error=AuthenticationFailed`);
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user should be populated by authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
