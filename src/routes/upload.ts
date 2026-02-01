import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const isProduction = process.env.NODE_ENV === "production";

let storage;

if (isProduction) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder: "products",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    }),
  });
} else {
  storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    },
  });
}

const upload = multer({ storage });

export default upload;
