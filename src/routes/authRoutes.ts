import express from 'express';
const router = express.Router();
import Database from '../db/Database';
const bcrypt = require('bcrypt');
const config = require('../config');
import jwt from 'jwt-simple';
router.post('/register', async (req, res) => {
    try {
        const db = Database.getDb();
        const users = db.collection('users');
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User alreeady exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { email, password: hashedPassword, firstName, lastName };
        await users.insertOne(newUser);
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})
router.post('/login', async (req, res) => {
    try {
        const db = Database.getDb();
        const users = db.collection('users');
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {

            return res.status(401).json({ message: "Invalid email or password" });
        }
        let payload = {
            id: user._id,
            exp: Math.floor(Date.now() / 1000) + parseInt(config.JWT.EXPIRES_IN)
        }
        const token = jwt.encode(payload, config.JWT.SECRET);

        const userData = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            token: token
        }

        return res.status(200).json({  user: userData });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})
export default router; 
