import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import generateToken from "../utils/generateToken.js";

const generateTokens = (id) => {
    return {
        accessToken: generateToken(id),
        refreshToken: jwt.sign({ id }, process.env.REFRESH_SECRET || "refresh_secret_key", {
            expiresIn: "7d",
        })
    };
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        // Set Refresh Token in httpOnly Cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // REQUIRED for sameSite: "none"
            sameSite: "none", // REQUIRED for cross-site (Vercel -> Render)
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            message: "Login successful",
            token: accessToken, // Access token for frontend state
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
};

export const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || "refresh_secret_key");
        const { accessToken } = generateTokens(decoded.id);

        res.json({ token: accessToken });
    } catch (error) {
        res.status(401).json({ message: "Invalid refresh token" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
};

export const getProfile = async (req, res) => {
    res.json(req.user);
};
