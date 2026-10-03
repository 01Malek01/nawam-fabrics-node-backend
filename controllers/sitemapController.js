import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Post from "../models/Post.js";
import LastPiece from "../models/LastPiece.js";

const SITE_URL = "https://elnawamfabrics.com";

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/blogs", priority: "0.7", changefreq: "daily" },
  { path: "/lastpieces", priority: "0.7", changefreq: "daily" },
  { path: "/faq", priority: "0.4", changefreq: "monthly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/return-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/shipping", priority: "0.4", changefreq: "monthly" },
  { path: "/complaints", priority: "0.3", changefreq: "yearly" },
  { path: "/fabric-types", priority: "0.4", changefreq: "monthly" },
  { path: "/branches", priority: "0.4", changefreq: "monthly" },
  { path: "/washing-instructions", priority: "0.4", changefreq: "monthly" },
];

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIso(date) {
  if (!date) return undefined;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function urlEntry(loc, { lastmod, changefreq, priority } = {}) {
  const parts = [`<loc>${escapeXml(loc)}</loc>`];
  if (lastmod) parts.push(`<lastmod>${lastmod}</lastmod>`);
  if (changefreq) parts.push(`<changefreq>${changefreq}</changefreq>`);
  if (priority) parts.push(`<priority>${priority}</priority>`);
  return `  <url>${parts.join("")}</url>`;
}

/**
 * Dynamically generates sitemap.xml from the database so product/category/post
 * routes are always included, unlike the build-time frontend sitemap.
 */
export async function getSitemap(req, res, next) {
  try {
    const [products, categories, posts, lastPieces] = await Promise.all([
      Product.find({}).select("_id updatedAt").lean(),
      Category.find({})
        .select("_id isSubCategory ParentCategory updatedAt")
        .lean(),
      Post.find({ status: "published" }).select("slug updatedAt").lean(),
      LastPiece.find({}).select("_id updatedAt").lean(),
    ]);

    const entries = [];

    for (const route of STATIC_ROUTES) {
      entries.push(
        urlEntry(`${SITE_URL}${route.path}`, {
          changefreq: route.changefreq,
          priority: route.priority,
        })
      );
    }

    for (const product of products) {
      entries.push(
        urlEntry(`${SITE_URL}/fabric/${product._id}`, {
          lastmod: toIso(product.updatedAt),
          changefreq: "weekly",
          priority: "0.8",
        })
      );
    }

    for (const category of categories) {
      const lastmod = toIso(category.updatedAt);
      if (category.isSubCategory) {
        if (category.ParentCategory) {
          entries.push(
            urlEntry(
              `${SITE_URL}/categories/${category.ParentCategory}/${category._id}`,
              { lastmod, changefreq: "weekly", priority: "0.6" }
            )
          );
        }
      } else {
        entries.push(
          urlEntry(`${SITE_URL}/categories/${category._id}`, {
            lastmod,
            changefreq: "weekly",
            priority: "0.7",
          })
        );
      }
    }

    for (const post of posts) {
      entries.push(
        urlEntry(`${SITE_URL}/blogs/${post.slug}`, {
          lastmod: toIso(post.updatedAt),
          changefreq: "monthly",
          priority: "0.6",
        })
      );
    }

    for (const piece of lastPieces) {
      entries.push(
        urlEntry(`${SITE_URL}/lastpieces/${piece._id}`, {
          lastmod: toIso(piece.updatedAt),
          changefreq: "weekly",
          priority: "0.5",
        })
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join(
      "\n"
    )}\n</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (err) {
    next(err);
  }
}
