import { createRuntimeConfig, generateItinerary } from "../../lib/itinerary-service.mjs";

const runtimeConfig = createRuntimeConfig(process.env);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const payload = await generateItinerary(body, runtimeConfig);
    return jsonResponse(200, payload);
  } catch (error) {
    return jsonResponse(500, {
      error: error.message || "Unexpected server error"
    });
  }
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  };
}
