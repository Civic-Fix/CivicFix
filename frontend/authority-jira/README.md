# CivicFix

CivicFix is a modern civic-tech landing page built with React, Vite, and Tailwind CSS. The platform concept helps residents report civic issues such as potholes, garbage, broken streetlights, blocked drains, and public maintenance problems, then track their resolution transparently.

## Features

- Modern SaaS-style landing page
- Responsive navbar with theme toggle
- Hero section with strong call-to-action buttons
- Live issue board preview
- How It Works section
- Feature cards for reporting, tracking, upvotes, and transparency
- Impact statistics
- Testimonials
- Final CTA and footer
- Light/dark theme support

## Tech Stack

- React
- Vite
- Tailwind CSS
- JavaScript

## Project Structure

```txt
src/
  components/
    Features.jsx
    Footer.jsx
    Hero.jsx
    HowItWorks.jsx
    Icon.jsx
    Navbar.jsx
    Stats.jsx
    Testimonials.jsx
    landingData.js
  App.css
  App.jsx
  index.css
  main.jsx
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```bash
http://localhost:5173/
```

## Tailwind Setup

This project uses Tailwind CSS v4 with the Vite plugin.

Make sure `vite.config.js` includes:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Make sure `src/index.css` includes:

```css
@import "tailwindcss";
```

## Available Scripts

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Git Workflow

Before starting new work, update your local `main` branch:

```bash
git checkout main
git pull origin main
```

Create a new branch:

```bash
git checkout -b civicfix-landing-page
```

After making changes, check the files:

```bash
git status
```

Stage your changes:

```bash
git add src/App.jsx src/App.css src/index.css src/components
```

Commit your changes:

```bash
git commit -m "Build CivicFix landing page"
```

Push your branch:

```bash
git push origin civicfix-landing-page
```

Then open a pull request on GitHub from your branch into `main`.

## Notes

- The landing page is currently frontend-only.
- The issue data is stored in `src/components/landingData.js`.
- The theme toggle stores the selected theme in `localStorage`.
- Future work can include real issue submission, authentication, maps, dashboards, and backend API integration.
