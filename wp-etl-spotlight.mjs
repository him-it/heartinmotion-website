/**
 * One-time ETL: migrate legacy WordPress "Leadership Spotlight" posts
 * (heartinmotion_org_4.wp_juk8dw_posts) into the new him_spotlight table.
 *
 * - Extracts name from post title ("Name, Month Year, Role")
 * - Category from WP category taxonomy (Officer / Volunteer / Intern)
 * - Downloads each spotlight photo and stores it as a blob in the row
 *   (image/image_mime), matching the files_file pattern already used
 *   elsewhere in this app, so future admin-added spotlights work the same
 *   way and nothing depends on the old WP uploads dir or wixstatic.com
 * - Cleans content: strips Gutenberg block comments, removes inline images
 *   (the photo is rendered separately from the image blob), and converts
 *   classic-editor plain-text paragraphs to <p> markup
 * - post_status 'private' -> hidden = true
 *
 * Idempotent: clears him_spotlight before inserting.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DB = "heartinmotion_org_4";

const CANONICAL_HOST_RE = /https?:\/\/(www\.)?heartinmotion\.org/g;

const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, "");

// The photo is rendered separately from image_url, so drop every <img> the
// post body carries (Gutenberg figure/div wrappers, classic-editor <img>
// nested inside <h1>, galleries, etc.) then collapse whatever wrapper
// elements are left empty as a result. Iterative because removing an inner
// empty figure can leave its parent div empty too.
const stripImages = (html) => {
  html = html.replace(/<img\b[^>]*>/gi, "");
  for (let i = 0; i < 5; i++) {
    const before = html;
    html = html
      .replace(/<figure[^>]*>\s*<\/figure>/gi, "")
      .replace(/<div[^>]*>\s*<\/div>/gi, "");
    if (html === before) break;
  }
  return html;
};

const BLOCK_TAG_RE = /^<\/?(h[1-6]|div|figure|p|ul|ol|li|table|blockquote|hr)\b/i;

// Classic-editor content stores paragraphs as plain text lines (WordPress
// applied wpautop at render time) — recreate that here line by line, since a
// block tag can be followed on the very next line (no blank line) by plain
// text that still needs its own <p> wrapper (e.g. "<h1>Name</h1>\nRole").
const wpautop = (text) => {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let buf = [];
  const flush = () => {
    const joined = buf.join("<br>").trim();
    if (joined) out.push(`<p>${joined}</p>`);
    buf = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (BLOCK_TAG_RE.test(line)) { flush(); out.push(line); }
    else buf.push(line);
  }
  flush();
  return out.join("\n");
};

const cleanContent = (raw) => {
  const isGutenberg = raw.includes("<!-- wp:");
  let html = stripComments(raw);
  html = stripImages(html);
  if (!isGutenberg) html = wpautop(html);
  html = html.replace(CANONICAL_HOST_RE, "https://heartinmotion.org");
  // Drop empty paragraphs left behind by the editor
  html = html.replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "");
  return html.trim();
};

const firstImgSrc = (html) => {
  const m = html.match(/<img[^>]*\ssrc="([^"]+)"/i);
  return m ? m[1] : null;
};

// Every post body opens with the person's name (as <h1> or <p>) — redundant
// with the `name` column, and it would double the heading on the detail page.
const stripLeadingName = (html, name) => {
  const m = html.match(/^\s*<(h[1-6]|p)[^>]*>([\s\S]*?)<\/\1>/i);
  if (!m) return html;
  const text = m[2]
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/[​ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (text === name.toLowerCase()) return html.slice(m.index + m[0].length).trimStart();
  return html;
};

const EXT_BY_MIME = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
  "image/gif": "image/gif",
};

const downloadImage = async (url) => {
  const httpsUrl = url
    .replace(/^http:\/\//, "https://")
    .replace(/https:\/\/www\.heartinmotion\.org/, "https://heartinmotion.org");
  try {
    const res = await fetch(httpsUrl, { redirect: "follow", signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const mimeHeader = (res.headers.get("content-type") || "").split(";")[0];
    // heartinmotion.org now serves the new Next.js app, so requests for the old
    // /wordpress/wp-content/uploads/... files come back 200 with an HTML page.
    // Only a real image content-type counts as a successful download.
    const mime = EXT_BY_MIME[mimeHeader];
    if (!mime) throw new Error(`not an image: ${mimeHeader || "unknown content-type"}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) throw new Error("empty body");
    return { buf, mime };
  } catch (e) {
    return { error: e.message, remote: httpsUrl };
  }
};

async function main() {
  const posts = await prisma.$queryRawUnsafe(
    `SELECT ID, post_title, post_date, post_status, post_content FROM ${DB}.wp_juk8dw_posts
     WHERE post_type='post' AND post_status IN ('publish','private')
     ORDER BY post_date ASC`
  );

  const thumbMeta = await prisma.$queryRawUnsafe(
    `SELECT post_id, meta_value AS thumb_id FROM ${DB}.wp_juk8dw_postmeta WHERE meta_key='_thumbnail_id'`
  );
  const thumbMap = new Map(thumbMeta.map((t) => [Number(t.post_id), Number(t.thumb_id)]));
  const attachIds = [...new Set(thumbMeta.map((t) => Number(t.thumb_id)))];
  const attachments = await prisma.$queryRawUnsafe(
    `SELECT ID, guid FROM ${DB}.wp_juk8dw_posts WHERE post_type='attachment' AND ID IN (${attachIds.join(",") || "0"})`
  );
  const guidMap = new Map(attachments.map((a) => [Number(a.ID), a.guid]));

  const rels = await prisma.$queryRawUnsafe(
    `SELECT tr.object_id, t.name FROM ${DB}.wp_juk8dw_term_relationships tr
     JOIN ${DB}.wp_juk8dw_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
     JOIN ${DB}.wp_juk8dw_terms t ON tt.term_id = t.term_id
     WHERE tt.taxonomy='category'`
  );
  const catMap = new Map(rels.map((r) => [Number(r.object_id), r.name]));

  await prisma.him_spotlight.deleteMany({});

  const failures = [];
  let inserted = 0;
  let totalBytes = 0;

  for (const p of posts) {
    const wpId = Number(p.ID);
    const name = p.post_title.split(",")[0].trim();
    const category = catMap.get(wpId) || "Volunteer";
    const content = stripLeadingName(cleanContent(p.post_content), name);

    // Prefer the image that actually rendered in the post; fall back to the
    // featured-image attachment.
    const sourceImage = firstImgSrc(p.post_content) || guidMap.get(thumbMap.get(wpId)) || null;

    let image = null;
    let imageMime = null;
    if (sourceImage) {
      const dl = await downloadImage(sourceImage);
      if (dl.buf) {
        image = dl.buf;
        imageMime = dl.mime;
        totalBytes += dl.buf.length;
      } else {
        failures.push({ wpId, name, url: dl.remote, error: dl.error });
      }
    }

    await prisma.him_spotlight.create({
      data: {
        wp_post_id: wpId,
        name,
        category,
        image,
        image_mime: imageMime,
        content,
        post_date: p.post_date,
        // Only WP-private posts are hidden. Rows without a recovered photo
        // still show publicly with a placeholder avatar (see the spotlight
        // pages) — backfill the photo later via the admin UI as it turns up.
        hidden: p.post_status === "private",
      },
    });
    inserted++;
    if (inserted % 50 === 0) console.log(`inserted ${inserted}/${posts.length}`);
  }

  console.log(`DONE: inserted ${inserted} rows`);
  console.log(`images downloaded: ${inserted - failures.length}, total ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
  if (failures.length) console.log("IMAGE FAILURES (no image stored for these rows):", JSON.stringify(failures, null, 2));

  // Report any remaining remote images still referenced inside content
  const rows = await prisma.him_spotlight.findMany({ select: { wp_post_id: true, content: true } });
  const remaining = rows.filter((r) => /<img[^>]*src="https?:\/\//i.test(r.content));
  console.log(`posts with remote inline images still in content: ${remaining.length}`,
    remaining.map((r) => r.wp_post_id).join(","));
}

main()
  .catch((e) => { console.error("ERROR:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
