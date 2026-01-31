import express from "express";
import { ObjectId } from "mongodb";
import Database from "../db/Database";
import auth from "../middleware/auth";
import { Request } from 'express';

const router = express.Router();
const authMiddleware = auth();


interface AuthRequest extends Request {
    user?: { _id: string; email: string };
}
router.get("/all", authMiddleware.authenticate(), async (req: AuthRequest, res) => {
    try {
        const db = Database.getDb();
        const userId = req.user!._id;

        const cartItems = await db.collection("cartList").aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $project: {
                    quantity: 1,
                    product: {
                        _id: "$product._id",
                        name: "$product.name",
                        price: "$product.price",
                        image: "$product.image"
                    }
                }
            }
        ]).toArray();

        res.status(200).json(cartItems);
    } catch (error) {
        return res.status(500).json({ message: "Server Error" });

    }
});


router.post("/add", authMiddleware.authenticate(), async (req: AuthRequest, res) => {
    try {
        const db = Database.getDb();
        const userId = req.user!._id;
        const { productId } = req.body;

        const productObjectId = new ObjectId(productId);
             await new Promise(resolve => setTimeout(resolve, 3000));

        const existingItem = await db.collection("cartList").findOne({
            userId,
            productId: productObjectId,
        });

        if (existingItem) {
            await db.collection("cartList").updateOne(
                { _id: existingItem._id },
                { $inc: { quantity: 1 } }
            );
        } else {
            await db.collection("cartList").insertOne({
                userId,
                productId: productObjectId,
                quantity: 1,
                createdAt: new Date(),
            });
        }

        res.status(201).json({ message: "Cart updated" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.delete("/remove", authMiddleware.authenticate(), async (req: AuthRequest, res) => {
    try {
        const db = Database.getDb();
        const userId = req.user!._id;
        const { productId } = req.body;
        const productObjectId = new ObjectId(productId);

        await db.collection("cartList").deleteOne({ userId, productId: productObjectId });
        return res.status(200).json({ message: "Deleted successfully " })
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
})
router.post("/decrease", authMiddleware.authenticate(), async (req: AuthRequest, res) => {
    try {
        const db = Database.getDb();
        const userId = req.user!._id;
        const { productId } = req.body;
        const productObjectId = new ObjectId(productId);

        const existingItem = await db.collection("cartList").findOne({
            userId,
            productId: productObjectId,
        });

        if (!existingItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        if (existingItem.quantity > 1) {
            await db.collection("cartList").updateOne(
                { _id: existingItem._id },
                { $inc: { quantity: -1 } }
            );
        } else {
            await db.collection("cartList").deleteOne({ _id: existingItem._id });
        }

        return res.status(200).json({ message: "Cart updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});


export default router;