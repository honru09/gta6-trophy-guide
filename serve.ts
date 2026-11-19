// Static file server for local development and preview of the GTA 6 trophy guide.
// Serves static files under app/ on http://localhost:8080.

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 8080;
const HOST = 'localhost';

const basePath = fileURLToPath(new URL('.', import.meta.url));
const appDirectory = resolve(basePath, 'app');

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  const requestUrl = new URL(req.url ?? '/', `http://${HOST}:${PORT}`);
  let route = decodeURIComponent(requestUrl.pathname);

  if (route === '/') {
    route = '/index.html';
  }

  // Sanitize path against directory traversal
  const cleanRelative = normalize(route).replace(/^(\.\.[/\\])+/, '');
  const absoluteTarget = join(appDirectory, cleanRelative);

  if (!absoluteTarget.startsWith(appDirectory)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  if (!existsSync(absoluteTarget)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const targetStat = statSync(absoluteTarget);
  if (targetStat.isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const extension = extname(absoluteTarget).toLowerCase();
  const contentType = mimeTypes[extension] ?? 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': targetStat.size,
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  createReadStream(absoluteTarget).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
