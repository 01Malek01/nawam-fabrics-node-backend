import express from "express";
import {
  getPublishedPosts,
  getPublishedPost,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/blogs", getPublishedPosts);
router.get("/blogs/:slugOrId", getPublishedPost);

export default router;

