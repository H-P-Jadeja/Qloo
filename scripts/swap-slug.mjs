#!/usr/bin/env node
/**
 * Usage: node scripts/swap-slug.mjs <NEW_SLUG> <COMPARE_COUNT>
 *
 * Example: node scripts/swap-slug.mjs abc123xyz 8
 *
 * Replaces the old demo slug (4tpk4dgk) everywhere and updates
 * the "X of 10" compare figure in all docs.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const OLD_SLUG = '4tpk4dgk';
const OLD_COUNT = '7'; // the "7 of 10" number currently in copy

const [, , newSlug, newCount] = process.argv;
if (!newSlug) {
  console.error('Usage: node scripts/swap-slug.mjs <NEW_SLUG> [COMPARE_COUNT]');
  process.exit(1);
}
const count = newCount || '7'; // if not provided, leave the number as-is

const FILES = [
  'src/app/page.js',
  'src/components/TryDemoButton.js',
  'src/components/AppleHeader.js',
  'src/components/AppleFooter.js',
  'README.md',
  'DEVPOST_SUBMISSION.md',
];

let total = 0;
for (const rel of FILES) {
  const file = resolve(root, rel);
  let content;
  try {
    content = readFileSync(file, 'utf-8');
  } catch {
    console.warn(`  SKIP (not found): ${rel}`);
    continue;
  }

  let updated = content;

  // Replace slug
  const slugCount = (updated.match(new RegExp(OLD_SLUG, 'g')) || []).length;
  updated = updated.replaceAll(OLD_SLUG, newSlug);

  // Replace "7 of 10" / "7 out of 10" figure if a new count was given
  if (newCount && count !== OLD_COUNT) {
    updated = updated.replaceAll(`${OLD_COUNT} of 10`, `${count} of 10`);
    updated = updated.replaceAll(`${OLD_COUNT} out of 10`, `${count} out of 10`);
    // Also handle "6–8 of 10" range → exact number
    updated = updated.replaceAll('6–8 of 10', `${count} of 10`);
  }

  if (updated !== content) {
    writeFileSync(file, updated, 'utf-8');
    console.log(`  ✔ ${rel}  (${slugCount} slug hits, count updated: ${newCount ? 'yes' : 'no'})`);
    total++;
  } else {
    console.log(`  — ${rel}  (no changes)`);
  }
}

console.log(`\nDone. ${total} files updated.`);
console.log(`New demo slug: ${newSlug}`);
if (newCount) console.log(`New compare figure: ${newCount} of 10`);

