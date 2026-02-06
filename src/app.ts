import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import auth from "./routes/authRoutes";
import admin from "./routes/adminRoutes";
import products from "./routes/productRoutes";
import cart from "./routes/cartRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import payment from "./routes/payment";

const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/auth", auth);
app.use("/admin", admin);
app.use("/products", products);
app.use("/cart", cart);
app.use("/category", categoryRoutes);
app.use("/payment", payment);
export default app;


