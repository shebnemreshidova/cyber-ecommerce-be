import express from 'express';
import multer from 'multer';
import Database from '../db/Database';
import auth from '../middleware/auth';
const authMiddleware = auth();
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get("/products", authMiddleware.authenticate(), async (req, res) => {
  try {
    const db = Database.getDb();
    const productsCollection = db.collection('products');
    const products = await productsCollection.find().toArray();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});


router.post(
  "/create-product",
  authMiddleware.authenticate(),
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, price, order, description } = req.body;
      const file = req.file;

      if (!name || !price || !order || !description || !file) {
        return res.status(400).json({ message: "All fields are required" });
      }
const imagePath = file.path.replace(/\\/g, "/");

      const product = {
        name,
        price: Number(price),
        order: Number(order),
        description,
        image: imagePath, 
                          
        createdAt: new Date(),
      };

      const db = Database.getDb();
      await db.collection("products").insertOne(product);

      res.status(201).json({
        message: "Product created",
        product,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post(
  "/add-category",
  authMiddleware.authenticate(),
  upload.single("image"),
  async (req, res) => {
    try {
      const { categoryName } = req.body;
      const file = req.file;

      if (!categoryName || !file) {
        return res.status(400).json({ message: "All fields required" });
      }

      const category = {
        name: categoryName,
        image: file.path,
      };

      const db = Database.getDb();
      await db.collection("categories").insertOne(category);

      res.status(201).json({ message: "Category added" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);


export default router;
