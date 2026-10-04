# Atelier — AI Personal Stylist

Atelier is an AI personal styling web app (React + Vite, built on the [Base44](https://base44.com) platform) that helps users manage their wardrobe, generate outfit suggestions, and discover new fashion pieces — all tailored to their body type, skin tone, and style preferences.


## Features

- **My Wardrobe** — Upload photos of your clothes and let AI auto-detect the category, color, brand, season, and formality level of each item
- **Style Me** — A 3-step AI outfit generator: pick an occasion, set your mood and preferences, and get 2 fully styled outfit suggestions from your actual wardrobe
- **Quick Pick** — One-click outfit recommendation for when you're in a rush — pick an occasion and get the best outfit instantly
- **See on Model** — AI generates a full-body model photo wearing your exact outfit, styled for your body type and skin tone
- **Shop & Discover** — AI-suggested pieces from your favorite brands with estimated prices, filtered to your budget in code, each linking to a shopping search for that item
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
| Language | JavaScript (JSX) |
| AI | Multimodal LLM calls via Base44 integrations (outfit generation, clothing photo analysis, skin tone detection) |
| Image Generation | AI model visualization via Base44 |
| Backend / Database | Base44 (entities, auth, file storage) |
| Testing / CI | Vitest, GitHub Actions |

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
    ├── prompts.js            # Wardrobe/profile summaries and outfit prompt builders
    ├── outfits.js            # Validates LLM-returned item IDs against the wardrobe
    ├── shopping.js           # Shopping prompt, search links, price + budget filtering
    ├── __tests__/            # Vitest unit tests for the modules above
    └── AuthContext.jsx       # Authentication context
```

---

## Running Locally

This project uses [Base44](https://base44.com) as its backend for database, auth, AI inference, and file storage.

### Prerequisites

- Node.js 20 or higher
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

## What I built vs. what Base44 provides

Atelier runs on Base44, so it's worth being clear about which parts are mine.

**Base44 provides:** hosting, authentication, the entity/database layer (`ClothingItem`, `StyleProfile`, `SavedOutfit`), file storage for uploaded photos, and the LLM and image-generation endpoints that the app calls through `@base44/sdk`.

**I built:** the product design and all of the UI and user flows; the prompts and structured-output (JSON schema) design for each AI feature; the code that checks what comes back — outfit item IDs validated against the real wardrobe, shopping links built in code rather than taken from the model, budget enforced as a numeric filter — plus error handling around every AI call, and the unit tests and CI.

---

## How the AI Works

### Outfit Generation
The app sends a structured summary of your entire wardrobe (item names, categories, colors, formality levels) along with your style profile (body type, skin tone, preferred styles) to an LLM. The model applies strict fashion rules — no pairing dresses with pants, correct layering order, color harmony — and returns 2 complete outfit combinations with styling advice. The returned item IDs are then checked against the actual wardrobe in code: unknown or duplicate IDs are dropped, and an outfit left with no real items is discarded.

### Clothing Auto-Detection
When you upload a photo of a clothing item, the image is sent to a multimodal LLM (via Base44) which identifies the item name, category, color, subcategory, season suitability, formality level, and brand if visible.

### Skin Tone Analysis
Uploading a selfie to your style profile sends it to the same multimodal LLM, which returns a description of your skin tone. That is saved to your profile and used in the outfit and shopping prompts.

### Shopping Recommendations
The LLM suggests specific items (brand, item name, estimated USD price, why it suits you). It is told not to produce URLs; instead each card links to a Google Shopping search for "brand + item name", built in code. The chosen budget is parsed into a numeric range and items whose estimated price falls outside it are filtered out. Prices are shown as estimates.

### Model Visualization
The "See on Model" feature sends your actual clothing item images as visual references to Base44's image-generation endpoint, which generates a full-body editorial photo of a model wearing your exact outfit — styled for your body type and skin tone.

---

## Tests

Unit tests cover the pure logic in `src/lib/`: prompt builders, outfit ID validation, the shopping search-link builder, and price/budget filtering.

```bash
npm test
```

CI (`.github/workflows/ci.yml`) runs lint, tests and a production build on Node 20 for every push and pull request. The build uses placeholder Base44 env values, so no credentials are needed.

---

## License

[MIT](LICENSE)
