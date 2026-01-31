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


router.post('/create-product', authMiddleware.authenticate(), upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const { name, price, order, description } = req.body;

    if (!name || !price || !order || !description || !file) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const product = {
      name,
      price: Number(price),
      order: Number(order),
      description,
      image: file.filename,
    };

    const db = Database.getDb();
    const products = db.collection('products');
    await products.insertOne(product);

    return res.status(201).json({ message: 'Product created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
