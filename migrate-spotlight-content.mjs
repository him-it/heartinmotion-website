/**
 * One-time migration: convert legacy him_spotlight.content HTML blobs into the
 * structured JSON shape the app now uses:
 *
 *   { "details": ["role", "school", "class", …],
 *     "questions": [{ "question": "…", "answer": "…" }] }
 *
 * The legacy content is a series of <p> rows: a few leading header lines, then
 * alternating <strong>/<b> question paragraphs and plain answer paragraphs.
 *
 * Safety:
 *   - Backs up every row's original content to a timestamped JSON file BEFORE
 *     writing anything, so the migration is fully reversible.
 *   - Idempotent: rows whose content already parses as our JSON are skipped,
 *     so re-running is safe.
 *   - Reports rows that produced zero questions for manual review in the admin.
 *
 * Run once:  node migrate-spotlight-content.mjs
 * Restore:   see the printed backup filename; each entry is { id, content }.
 */

import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient();

// ── HTML → text helpers ─────────────────────────────────────────────────────

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&rsquo;|&#8217;|&apos;/g, "'")
    .replace(/&ldquo;|&rdquo;|&#8220;|&#8221;/g, '"')
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Parse a legacy content blob into { details, questions }. Leading non-bold
// segments (before the first bold one) are details; each bold segment starts a
// question whose answer is the following non-bold segment(s).
const parseLegacy = (html) => {
  const pBlocks = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1]);
  const source = pBlocks.length ? pBlocks : [html];

  const segments = [];
  for (const block of source) {
    // A <br><br> inside a paragraph acts as a paragraph break.
    const parts = block.split(/(?:<br\s*\/?>\s*)+/i);
    for (const part of parts) {
      const isBold = /<(strong|b)\b/i.test(part);
      const text = decode(part);
      if (text) segments.push({ isBold, text });
    }
  }

  const details = [];
  const questions = [];
  let i = 0;

  while (i < segments.length && !segments[i].isBold) {
    details.push(segments[i].text);
    i++;
  }

  while (i < segments.length) {
    if (segments[i].isBold) {
      const question = segments[i].text;
      i++;
      const answer = [];
      while (i < segments.length && !segments[i].isBold) {
        answer.push(segments[i].text);
        i++;
      }
      questions.push({ question, answer: answer.join("\n\n") });
    } else {
      // A stray plain segment after Q&A started — append to the last answer.
      if (questions.length)
        questions[questions.length - 1].answer +=
          "\n\n" + segments[i].text;
      else details.push(segments[i].text);
      i++;
    }
  }

  return { details, questions };
};

// Does this string already hold our structured JSON? (idempotency guard)
const isAlreadyMigrated = (raw) => {
  try {
    const o = JSON.parse(raw);
    return (
      o &&
      Array.isArray(o.details) &&
      Array.isArray(o.questions) &&
      o.questions.every(
        (q) => typeof q.question === "string" && typeof q.answer === "string"
      )
    );
  } catch {
    return false;
  }
};

async function main() {
  const rows = await prisma.him_spotlight.findMany({
    select: { id: true, name: true, content: true },
    orderBy: { id: "asc" },
  });

  // 1. Back up first — nothing is written before this file exists on disk.
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = `spotlight-content-backup-${stamp}.json`;
  writeFileSync(
    backupFile,
    JSON.stringify(
      rows.map((r) => ({ id: r.id, content: r.content })),
      null,
      2
    )
  );
  console.log(`Backed up ${rows.length} rows → ${backupFile}`);

  let migrated = 0;
  let skipped = 0;
  const noQuestions = [];

  for (const row of rows) {
    if (isAlreadyMigrated(row.content)) {
      skipped++;
      continue;
    }

    const parsed = parseLegacy(row.content);
    if (parsed.questions.length === 0)
      noQuestions.push({ id: row.id, name: row.name });

    await prisma.him_spotlight.update({
      where: { id: row.id },
      data: { content: JSON.stringify(parsed) },
    });
    migrated++;
  }

  console.log(`DONE: migrated ${migrated}, skipped (already JSON) ${skipped}`);
  if (noQuestions.length)
    console.log(
      `Rows with no questions — review by hand in the admin:`,
      JSON.stringify(noQuestions, null, 2)
    );
}

main()
  .catch((e) => {
    console.error("ERROR:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
