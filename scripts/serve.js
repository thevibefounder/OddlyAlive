import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".gif": "image/gif",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

function openBrowser(url) {
  const command =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];
  const child = spawn(command[0], command[1], {
    detached: true,
    stdio: "ignore"
  });
  child.unref();
}

export function startServer({
  root = process.cwd(),
  port = 4173,
  pathname = "/examples/string-touch/",
  shouldOpen = true
} = {}) {
  const absoluteRoot = resolve(root);
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    const decodedPath = decodeURIComponent(requestUrl.pathname);
    let safePath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
    if (safePath.endsWith("/")) safePath += "index.html";
    const filePath = join(absoluteRoot, safePath);

    if (
      !filePath.startsWith(absoluteRoot) ||
      !existsSync(filePath) ||
      !statSync(filePath).isFile()
    ) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type":
        MIME_TYPES[extname(filePath)] ?? "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
  });

  return new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      const url = `http://127.0.0.1:${port}${pathname}`;
      console.log(`OddlyAlive is playing at ${url}`);
      if (shouldOpen) openBrowser(url);
      resolvePromise({ server, url });
    });
  });
}

const isDirect =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirect) {
  const portIndex = process.argv.indexOf("--port");
  const pathIndex = process.argv.indexOf("--path");
  await startServer({
    port: portIndex === -1 ? 4173 : Number(process.argv[portIndex + 1]),
    pathname:
      pathIndex === -1 ? "/examples/string-touch/" : process.argv[pathIndex + 1],
    shouldOpen: !process.argv.includes("--no-open")
  });
}
