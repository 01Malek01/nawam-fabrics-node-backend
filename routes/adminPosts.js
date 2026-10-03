import express from "express";
import { checkAuth, checkRole } from "../middleware/authMiddleware.js";
import { uploadPostImages } from "../middleware/postUploadMiddleware.js";
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  deletePostImage,
} from "../controllers/postController.js";

const router = express.Router();

router.use(checkAuth, checkRole("admin"));

// Upload a single image to be inserted inline while writing a post.
// Returns the relative path so the client can prefix it with its API base URL.
router.post(
  "/posts/upload-image",
  uploadPostImages.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    const relativePath = req.file.path.replace(/\\/g, "/");
    res.json({ path: relativePath, url: `/${relativePath}` });
  }
);

router.post("/posts", uploadPostImages.array("images"), createPost);
router.get("/posts", getPosts);
router.get("/posts/:id", getPost);
router.put("/posts/:id", uploadPostImages.array("images"), updatePost);
router.delete("/posts/:id", deletePost);
router.put("/posts/:postId/gallery/:imageIndex", deletePostImage);

export default router;
