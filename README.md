# Atelier — AI Personal Stylist

Atelier is a full-stack AI-powered personal styling app that helps users manage their wardrobe, generate outfit suggestions, and discover new fashion pieces — all tailored to their body type, skin tone, and style preferences.


## Features

- **My Wardrobe** — Upload photos of your clothes and let AI auto-detect the category, color, brand, season, and formality level of each item
- **Style Me** — A 3-step AI outfit generator: pick an occasion, set your mood and preferences, and get 2 fully styled outfit suggestions from your actual wardrobe
- **Quick Pick** — One-click outfit recommendation for when you're in a rush — pick an occasion and get the best outfit instantly
- **See on Model** — AI generates a full-body model photo wearing your exact outfit, styled for your body type and skin tone
- **Shop & Discover** — AI-curated shopping recommendations from your favorite brands, filtered by budget and sale preferences
- **Saved Outfits** — Save your favorite AI-generated looks and revisit them anytime
- **Style Profile** — Set your body type, height, weight, skin tone (auto-detected from a selfie), preferred styles, color palettes, and favorite brands

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6 |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| State Management | TanStack Query (React Query) |
| Routing | React Router v6 |
| AI | LLM inference via Base44 (outfit generation, image analysis, skin tone detection) |
| Image Generation | AI model visualization via Base44 |
| Backend / Database | Base44 (entities, auth, file storage) |

---

## Project Structure

```
src/
├── pages/
│   ├── Wardrobe.jsx          # Main wardrobe management page
│   ├── StyleMe.jsx           # 3-step AI outfit generator
│   ├── QuickStyle.jsx        # One-click outfit picker
│   ├── ShopDiscover.jsx      # AI shopping recommendations
│   ├── SavedOutfits.jsx      # Saved outfit collection
│   └── StyleProfilePage.jsx  # User style profile setup
├── components/
│   ├── styleme/              # Outfit generation components
│   ├── wardrobe/             # Wardrobe management components
│   └── ui/                   # shadcn/ui component library
├── api/
│   └── base44Client.js       # Backend API client
└── lib/
    └── AuthContext.js        # Authentication context
```

---

## Running Locally

This project uses [Base44](https://base44.com) as its backend for database, auth, AI inference, and file storage.

### Prerequisites

- Node.js v18 or higher
- A Base44 account with your own app instance

### Setup

1. Clone the repository

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory
```
VITE_BASE44_APP_ID=your_base44_app_id
VITE_BASE44_APP_BASE_URL=your_base44_app_url
```

You can find these values in your Base44 project settings.

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173)

---

## How the AI Works

### Outfit Generation
The app sends a structured summary of your entire wardrobe (item names, categories, colors, formality levels) along with your style profile (body type, skin tone, preferred styles) to an LLM. The model applies strict fashion rules — no pairing dresses with pants, correct layering order, color harmony — and returns 2 complete outfit combinations with styling advice.

### Clothing Auto-Detection
When you upload a photo of a clothing item, the image is sent to a vision model which identifies the item name, category, color, subcategory, season suitability, formality level, and brand if visible.

### Skin Tone Analysis
Uploading a selfie to your style profile triggers an AI vision analysis that detects your skin tone and suggests complementary clothing colors.

### Model Visualization
The "See on Model" feature sends your actual clothing item images as visual references to the AI, which generates a full-body editorial photo of a model wearing your exact outfit — styled for your body type and skin tone.

---

## Screenshots

> Add screenshots of the Wardrobe, Style Me, and Model Preview here

---
