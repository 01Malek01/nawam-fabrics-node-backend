import AppError from "../utils/AppError.js";
import Post from "../models/Post.js";
import fs from "fs";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Multer paths use OS separators; store them URL-friendly. */
function normalizeImagePath(filePath) {
  return (filePath || "").replace(/\\/g, "/");
}

/** Tags arrive as a JSON array or a comma/Arabic-comma separated string. */
function parseTags(tags) {
  if (tags === undefined || tags === null) return undefined;
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      /* fall through to string splitting */
    }
    return tags
      .split(/[،,]/)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return undefined;
}

/**
 * Resolves the cover image: prefer an explicit valid selection,
 * otherwise fall back to the first uploaded image.
 */
function resolveCoverImage(explicit, uploadedImages, existingImages = []) {
  const candidates = [explicit, ...uploadedImages, ...existingImages].filter(
    Boolean
  );
  return candidates[0] || "";
}

// Admin - Create post
export async function createPost(req, res, next) {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      tags,
      status,
      seoTitle,
      seoDescription,
    } = req.body;

    let finalSlug = slug || slugify(title);
    if (!finalSlug) {
      finalSlug = Date.now().toString();
    }

    // Ensure slug uniqueness
    let count = 1;
    let tempSlug = finalSlug;
    while (await Post.findOne({ slug: tempSlug })) {
      tempSlug = `${finalSlug}-${count++}`;
    }
    finalSlug = tempSlug;

const images = req.files ? req.files.map((f) => normalizeImagePath(f.path)) : [];
    const coverImage = resolveCoverImage(req.body.coverImage, images);
    const parsedTags = parseTags(tags);

    const post = new Post({
      title,
      slug: finalSlug,
      content,
      excerpt: excerpt || "",
      coverImage,
      images,
      tags: parsedTags || [],
      status: status || "draft",
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt || "",
      publishedAt: status === "published" ? new Date() : null,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin - Get all posts
export async function getPosts(req, res, next) {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate("author");
    res.json(posts);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin - Get single post
export async function getPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id).populate("author");
    if (!post) return next(new AppError("Post not found", 404));
    res.json(post);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin - Update post
export async function updatePost(req, res, next) {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      tags,
      status,
      seoTitle,
      seoDescription,
      coverImage: existingCoverImage,
    } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError("Post not found", 404));

    let finalSlug = slug || slugify(title || post.title);
    if (finalSlug && finalSlug !== post.slug) {
      let count = 1;
      let tempSlug = finalSlug;
      while (await Post.findOne({ slug: tempSlug, _id: { $ne: post._id } })) {
        tempSlug = `${finalSlug}-${count++}`;
      }
      finalSlug = tempSlug;
      post.slug = finalSlug;
    }

const newImages = req.files
      ? req.files.map((f) => normalizeImagePath(f.path))
      : [];
    const updatedImages =
      newImages.length > 0 ? [...post.images, ...newImages] : post.images;
    const coverImage = resolveCoverImage(
      existingCoverImage,
      newImages,
      updatedImages
    );
    const parsedTags = parseTags(tags);

    post.title = title || post.title;
    post.content = content || post.content;
    post.excerpt = excerpt !== undefined ? excerpt : post.excerpt;
    post.coverImage = coverImage;
    post.images = updatedImages;
    post.tags = parsedTags !== undefined ? parsedTags : post.tags;
    post.status = status || post.status;
    post.seoTitle = seoTitle !== undefined ? seoTitle : post.seoTitle;
    post.seoDescription = seoDescription !== undefined ? seoDescription : post.seoDescription;
    if (status === "published" && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    await post.save();
    res.json(post);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin - Delete post
export async function deletePost(req, res, next) {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return next(new AppError("Post not found", 404));
    res.json({ message: "Post deleted" });
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Public - Get all published posts
export async function getPublishedPosts(req, res, next) {
  try {
    const posts = await Post.find({ status: "published" })
      .sort({ publishedAt: -1, createdAt: -1 })
      .select("-content");
    res.json(posts);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Public - Get single published post by slug or id
export async function getPublishedPost(req, res, next) {
  try {
    const { slugOrId } = req.params;
    let post;

    if (/^[0-9a-fA-F]{24}$/.test(slugOrId)) {
      post = await Post.findOne({ _id: slugOrId, status: "published" });
    }
    if (!post) {
      post = await Post.findOne({ slug: slugOrId, status: "published" });
    }
    if (!post) return next(new AppError("Post not found", 404));
    res.json(post);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin - Delete post image
export async function deletePostImage(req, res, next) {
  try {
    const { postId, imageIndex } = req.params;
    const post = await Post.findById(postId);
    if (!post) return next(new AppError("Post not found", 404));

    const idx = parseInt(imageIndex);
    if (idx >= 0 && idx < post.images.length) {
      const imagePath = post.images[idx];
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (e) {
        // ignore file deletion errors
      }
      post.images.splice(idx, 1);
      if (post.coverImage === imagePath) {
        post.coverImage = post.images.length > 0 ? post.images[0] : "";
      }
      await post.save();
    }
    res.json(post);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

