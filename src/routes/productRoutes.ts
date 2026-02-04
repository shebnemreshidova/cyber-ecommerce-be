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

router.get("/all", async (req, res) => {
    try {
        const db = Database.getDb();

        const {
            filter,
            query,
            category,
            page = "1",
            limit = "10",
        } = req.query;
        const filterObj: any = {};

        if (category) {
            filterObj.category = category;
        }
        if (query) {
            filterObj.name = { $regex: query, $options: "i" };
        }

        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;

        let sort = {};
        if (filter === 'new-arrival') {
            sort = { createdAt: -1 }
        } else if (filter === 'bestseller') {
            sort = { sold: -1 }
        } else if (filter === 'featured-products') {
            sort = { featured: -1 }
        }


        const products = await db.collection("products").find(filterObj).sort(sort).skip(skip).limit(limitNumber).toArray();
        const total = await db
            .collection("products")
            .countDocuments(filterObj);

        return res.status(200).json({
            products,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages: Math.ceil(total / limitNumber),
            },
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server Error" });
    }
});

router.get("/wishlist/all", authMiddleware.authenticate(), async (req: AuthRequest, res) => {
    try {
        const userId = req.user?._id;
        const db = Database.getDb();

        const wishlistDocs = await db
            .collection("wishlist")
            .find({ userId })
            .toArray();

        const productIds = wishlistDocs.map(
            (item) => new ObjectId(item.productId)
        );

        const products = await db
            .collection("products")
            .find({ _id: { $in: productIds } })
            .toArray();

        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
});

router.post(
    "/wishlist/toggle",
    authMiddleware.authenticate(),
    async (req: AuthRequest, res) => {
        try {
            const userId = req.user?._id;
            const { productId } = req.body;
            const db = Database.getDb();

            if (!userId || !productId) {
                return res.status(400).json({ message: "productId is required" });
            }
            //  await new Promise(resolve => setTimeout(resolve, 3000));
            const exists = await db
                .collection("wishlist")
                .findOne({ userId, productId });

            if (exists) {
                await db.collection("wishlist").deleteOne({ userId, productId });
                return res.status(200).json({ inWishlist: false });
            }

            await db.collection("wishlist").insertOne({
                userId,
                productId,
                createdAt: new Date(),
            });

            return res.status(200).json({ inWishlist: true });
        } catch (error: any) {
            // ?
            if (error.code === 11000) {
                return res.status(200).json({ inWishlist: true });
            }

            return res.status(500).json({ message: "Server Error" });
        }
    }
);



router.post("/sync-wishlist", authMiddleware.authenticate(), async (req: AuthRequest, res) => {
    try {
        const userId = req.user?._id;
        const productIds = req.body;

        const db = Database.getDb();

        for (const item of productIds) {
            const exists = await db.collection("wishlist").findOne({ userId, productId: item.productId });
            if (!exists) {
                await db.collection("wishlist").insertOne({
                    userId,
                    productId: item.productId,
                    createdAt: new Date(),
                });
            }
        }

        const wishlist = await db.collection("wishlist").find({ userId }).toArray();
        return res.status(200).json(wishlist);
    } catch (error) {
        return res.status(500).json({ message: "Server Error" });

    }
});

export default router;
