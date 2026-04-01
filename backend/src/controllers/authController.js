import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const githubLogin = (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:user,user:email`;
  res.redirect(githubAuthUrl);
};

export const githubCallback = async (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
  
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
      }
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
    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = userResponse.data;
    const primaryEmailObj = emailResponse.data.find(e => e.primary) || emailResponse.data[0];
    const email = primaryEmailObj?.email;

    if (!email) {
      return res.redirect(`${frontendUrl}?error=NoEmailFound`);
    }

    // 3. Create or find user in DB
    let user = await User.findOne({ email });

    if (!user) {
      const username = githubUser.login || email.split("@")[0];
      user = await User.create({
        email,
        name: githubUser.name || username,
        username,
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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

    console.log("Decoded user:", req.user);

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
