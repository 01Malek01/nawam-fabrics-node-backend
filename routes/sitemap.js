import express from "express";
import { getSitemap } from "../controllers/sitemapController.js";

const router = express.Router();

// Dynamic sitemap served at the canonical top-level path (see robots.txt).
router.get("/sitemap.xml", getSitemap);

export default router;
