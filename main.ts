// Packaging and bundle entrypoint for the GTA 6 trophy guide application.
// Copies static frontend files to the distribution output directory and creates the submission dossier.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Resolve repo source path and target output directory
const sourceRoot = fileURLToPath(new URL('.', import.meta.url));
const outputRoot = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// Ensure destination directories exist
mkdirSync(outputRoot, { recursive: true });
const outputScreenshots = join(outputRoot, 'screenshots');
mkdirSync(outputScreenshots, { recursive: true });

// Copy the app folder recursively
const appSource = join(sourceRoot, 'app');
const appDestination = join(outputRoot, 'app');
cpSync(appSource, appDestination, { recursive: true });

// Copy screenshots if present beside main.ts
const screenshotsSource = join(sourceRoot, 'screenshots');
if (existsSync(screenshotsSource)) {
  cpSync(screenshotsSource, outputScreenshots, { recursive: true });
}

// Scorer limits and caps as defined in bounty specification
const caps = {
  text_max_bytes: 163840,
  screenshots: {
    max: 4,
    max_bytes: 262144,
  },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

// Generate and write dossier.json manifest
let dossierBytes: Uint8Array | string;
try {
  dossierBytes = buildDossier(outputRoot, caps);
} catch (error) {
  // Gracefully handle missing screenshots during intermediate builds
  const warning = error instanceof Error ? error.message : String(error);
  dossierBytes = JSON.stringify({
    schema: 'makefun/dossier/v1',
    status: 'provisional',
    warning,
  }, null, 2);
}

writeFileSync(join(outputRoot, 'dossier.json'), dossierBytes);
