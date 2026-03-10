# 30-Second Tour Prototype

A lightweight website prototype for Fill The Map's AI itinerary concept.

## What it does

- Collects a traveler brief in a few fast choices
- Builds one best-fit Northern Vietnam itinerary
- Shows route, highlights, hidden gems, stays, restaurants, transport, services, and pricing in-page
- Uses Gemini with Google Search grounding when `GEMINI_API_KEY` is present
- Falls back to a local FTM demo generator when no Gemini key is configured

## Run locally

```bash
cd "/Users/judes/Documents/FTM - Tourism/website"
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

- `GEMINI_API_KEY`: enables live Gemini itinerary generation
- `GEMINI_MODEL`: optional, defaults to `gemini-2.5-flash`
- `AGENCY_NAME`: optional label for the action area. Quote it if it contains spaces.
- `AGENCY_EMAIL`: enables the "Talk to the agency" button
- `AGENCY_WHATSAPP`: enables WhatsApp booking handoff if `BOOKING_LINK` is not set
- `BOOKING_LINK`: enables the "Buy the service" button

## Deploy on Netlify

This project is now set up for Netlify with static hosting plus Netlify Functions.

If you connect the full repository to Netlify:
- Base directory: `website`
- Build command: leave empty
- Publish directory: `public`

The Netlify API routes are already mapped through [`netlify.toml`](/Users/judes/Documents/FTM%20-%20Tourism/website/netlify.toml):
- `/api/config`
- `/api/itinerary`

Add these environment variables in the Netlify site settings if you want live Gemini mode:
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `AGENCY_NAME`
- `AGENCY_EMAIL`
- `AGENCY_WHATSAPP`
- `BOOKING_LINK`

If `GEMINI_API_KEY` is missing, the deployed site still works in demo mode.

## Notes

- The current prototype is intentionally narrow: Northern Vietnam, fast inputs, one decisive answer.
- In demo mode, hotel suggestions are stay profiles rather than live named properties.
- In grounded mode, Gemini is prompted to use current web research for hotels, restaurants, and practical details.
