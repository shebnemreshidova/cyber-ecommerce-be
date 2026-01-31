import express from "express";
import upload from "../middleware/upload";

const router = express.Router();
router.get("/upload", (req, res) => {
try {
    res.send("UPLOAD ROUTE WORKS");
} catch (error) {
  console.log(error)
}
});

router.post(
  "/upload",
  upload.single("image"),
  (req, res) => {
    res.json({
      message: "Image uploaded",
      url: req.file?.path, 
    });
  }
);

export default router;
