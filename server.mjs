import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createRuntimeConfig,
  generateItinerary,
  getPublicConfig
} from "./lib/itinerary-service.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";
const runtimeConfig = createRuntimeConfig(process.env);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if ((request.method === "GET" || request.method === "HEAD") && url.pathname === "/api/config") {
      return sendJson(response, 200, getPublicConfig(runtimeConfig), request.method === "HEAD");
    }

    if (request.method === "POST" && url.pathname === "/api/itinerary") {
      const body = await readJson(request);
      const result = await generateItinerary(body, runtimeConfig);
      return sendJson(response, 200, result);
    }

    if (request.method === "GET" || request.method === "HEAD") {
      return serveStatic(url.pathname, response, request.method === "HEAD");
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Unexpected server error" });
  }
});

server.listen(port, host, () => {
  console.log(`30-Second Tour running on http://${host}:${port}`);
});

async function serveStatic(pathname, response, isHead = false) {
  const normalizedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.join(publicDir, normalizedPath);

  if (!filePath.startsWith(publicDir)) {
    return sendJson(response, 403, { error: "Forbidden" });
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(isHead ? undefined : file);
  } catch {
    sendJson(response, 404, { error: "Not found" });
  }
}

async function readJson(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;
  }

  if (!body) {
    return {};
  }

  return JSON.parse(body);
}

function sendJson(response, statusCode, payload, isHead = false) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(isHead ? undefined : JSON.stringify(payload));
}
