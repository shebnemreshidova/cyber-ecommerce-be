import express from 'express';
import Database from '../db/Database';
const router = express.Router();

router.get("/all", async (req, res) => {
    try {
        const db = Database.getDb();
        const categories = await db.collection("categories").find().toArray();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Initial Server Error" })
    }
})
export default router;