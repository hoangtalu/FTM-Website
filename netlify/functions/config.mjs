import { createRuntimeConfig, getPublicConfig } from "../../lib/itinerary-service.mjs";

const runtimeConfig = createRuntimeConfig(process.env);

export async function handler(event) {
  if (!["GET", "HEAD"].includes(event.httpMethod)) {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  return jsonResponse(200, getPublicConfig(runtimeConfig), event.httpMethod === "HEAD");
}

function jsonResponse(statusCode, payload, isHead = false) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: isHead ? "" : JSON.stringify(payload)
  };
}
