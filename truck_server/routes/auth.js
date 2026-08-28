import express from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import mongoose from "mongoose";

// In-memory user store fallback for local dev when MongoDB is offline
const inMemoryUsers = new Map();
// Seed default demo user
(async () => {
    const demoHashed = await bcrypt.hash("password123", 10);
    inMemoryUsers.set("demo@butter.com", {
        _id: "demo-user-12345",
        fullName: "Demo Charterer",
        organization: "Butter Logistics Ltd",
        email: "demo@butter.com",
        password: demoHashed,
    });
})();

const JWT_SECRET = process.env.JWT_SECRET || "butter-freight-session-secret-change-this";

router.post('/register', async (req, res) => {
    try {
        const { fullName, organization, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const isDbConnected = mongoose.connection.readyState === 1;

        if (isDbConnected) {
            const userFound = await User.findOne({ email });
            if (userFound) {
                return res.status(400).json({ message: 'User already present' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({ fullName, organization, email, password: hashedPassword });
        } else {
            if (inMemoryUsers.has(email.toLowerCase())) {
                return res.status(400).json({ message: 'User already present' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            inMemoryUsers.set(email.toLowerCase(), {
                _id: "user-" + Date.now(),
                fullName,
                organization,
                email: email.toLowerCase(),
                password: hashedPassword,
            });
        }

        res.status(201).json({ message: "Registration success" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        let user = null;
        const isDbConnected = mongoose.connection.readyState === 1;

        if (isDbConnected) {
            try {
                user = await User.findOne({ email });
            } catch {
                user = null;
            }
        }

        if (!user && inMemoryUsers.has(email.toLowerCase())) {
            user = inMemoryUsers.get(email.toLowerCase());
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                fullName: user.fullName || "User",
                organization: user.organization || "Maritime Trading",
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;