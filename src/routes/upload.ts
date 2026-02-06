import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";


let storage;

  storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder: "products",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    }),
  });

const upload = multer({ storage });

export default upload;
