import app from "./app";
import Database from "./db/Database";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 5000;

async function startServer() { 
  await Database.connect(
    process.env.MONGO_URI as string,
    process.env.DB_NAME as string
  );

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
