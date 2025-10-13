# JollofAI

React + Vite + TypeScript app with TailwindCSS for AI-powered recipe generation.

## Features

- ✅ React + Vite + TypeScript setup
- ✅ TailwindCSS with custom primary color (`#16A34A`)
- ✅ React Router with responsive navigation
- ✅ Hero section with green CTA button
- ✅ Recipe Generator page with:
  - Ingredients input (text area)
  - Optional image upload
  - Loading states
  - Recipe cards with title, ingredients, instructions, and images
  - API integration (`POST /api/recipes/generate-recipe`)

## Quick Start

```powershell
cd c:\Users\HP\Documents\joffofai-frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Navbar.tsx       # Navigation with routing
│   │   └── Footer.tsx       # Simple footer
│   ├── pages/
│   │   ├── Home.tsx         # Hero + about section
│   │   └── Recipe.tsx          # Full recipe generation UI
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Tailwind directives
├── tailwind.config.cjs      # Primary color: #16A34A
└── package.json             # Dependencies + scripts
```

## API Integration

### Authentication

- `POST /auth/signup` - Create new user account
- `POST /auth/login` - User login with email/password
- `POST /auth/google` - Google OAuth authentication
- `POST /auth/reset-password` - Password reset functionality

### Recipes

- `POST /recipes/match-ingredients` - Generate recipes from ingredients (FormData with `ingredients` string and optional `image_*` files)
- `GET /recipes` - Get user's recipe history
- `GET /recipes/foryou` - Get personalized recommendations

### Vendors

- `GET /vendors` - Get all vendors
- `GET /vendors/nearby` - Get nearby vendors

### Response Formats

**Auth Response:**

```json
{
  "user": {
    "id": "string",
    "fullName": "string",
    "email": "string"
  },
  "token": "string"
}
```

**Recipe Response:**

```json
{
  "recipes": [
    {
      "id": "string",
      "title": "string",
      "ingredients": ["string"],
      "instructions": ["string"],
      "imageUrl": "string (optional)"
    }
  ]
}
```

### Configuration

Set `VITE_API_URL` environment variable or API defaults to `http://localhost:3000`
"instructions": ["string"],
"imageUrl": "string (optional)"
}
]
}

```

## Styling

- Primary brand color: `#16A34A` (used for buttons, links, focus states)
- Responsive design with Tailwind breakpoints
- Green CTA buttons throughout the app
- Clean, minimal UI with proper spacing and typography
```
