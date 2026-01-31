  import express from "express";
  import cors from "cors";
  import dotenv from "dotenv";
  dotenv.config();
  import auth from "./routes/authRoutes";
  import admin from "./routes/adminRoutes";
  import products from "./routes/productRoutes";
  import cart from "./routes/cartRoutes";
  const app = express();

  app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",               
  "https://cyber-ecommerce-eight.vercel.app"  
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,  
  })
);


  app.use("/auth", auth);
  app.use("/admin", admin);
  app.use("/products", products);
  app.use("/cart", cart);

  export default app;


