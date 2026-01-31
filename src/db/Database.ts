import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let instance: Database | null = null;

class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor() {
    if (!instance) {
      instance = this;
    }
    return instance;
  }

  async connect(uri: string, dbName: string) {
    try {
      if (!uri) throw new Error('MongoDB URI is not provided');

      this.client = new MongoClient(uri, {
        ssl: uri.startsWith("mongodb+srv://"), // Atlas üçün SSL
        tlsAllowInvalidCertificates: uri.startsWith("mongodb+srv://"),
      });

      await this.client.connect();
      this.db = this.client.db(dbName);

      console.log('MongoDB connected successfully');
    } catch (error: any) {
      console.error('MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB disconnected');
    }
  }
}

export default new Database();
