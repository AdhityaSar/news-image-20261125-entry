import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.png");
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outputPath = join(outputDir, "entry.png");

const bytes = readFileSync(sourcePath);
if (bytes.length === 0 || bytes.length > MAX_BYTES) {
  throw new Error(`Invalid image size: ${bytes.length} bytes (max ${MAX_BYTES})`);
}
const isPng = bytes.subarray(0, 8).equals(PNG_MAGIC);
const isJpeg = bytes.subarray(0, 3).equals(JPEG_MAGIC);
if (!isPng && !isJpeg) {
  throw new Error("entry.png must be a valid PNG or JPEG file");
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, bytes, { mode: 0o644 });
try {
  chmodSync(outputPath, 0o644);
} catch {
  // Windows ignores POSIX chmod bits; safe to continue
}

console.log(`Wrote ${outputPath} (${bytes.length} bytes, ${isPng ? "PNG" : "JPEG"})`);
