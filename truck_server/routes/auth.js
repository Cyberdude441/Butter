import express from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";

router.post('/register', async (req, res) => {

    try{
        const {fullName, organization, email, password} = req.body;

        const userFound = await User.findOne({email});
        if (userFound){
            return res.status(400).json({
                message: 'User already present',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName, 
            organization,
            email, 
            password: hashedPassword,
        });

        res.status(201).json({
            message: "Registration success"
        });

    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
});


router.post('/login', async(req, res) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if (!user){
            return res.status(500).json({
                message: "Invalid Credentials",
            });
        }

        const match = await bcrypt.compare(
            password,
            user.password
        );

        
        if (!match){
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            organization: user.organization,
            email: user.email,
        },
        });
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
})


export default router;