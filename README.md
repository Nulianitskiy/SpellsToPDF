# SpellsToPDF

A simple React application for preparing D&D spells and generating a PDF document.

## Features

- Filter spells by class and maximum spell level
- Search spells by name
- Filter by specific spell level (cantrips, 1st level, etc.)
- Mark spells as prepared with checkboxes
- Generate a formatted PDF document with all prepared spells

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── SpellCard.jsx      # Individual spell display
│   ├── SpellFilters.jsx   # Filter controls
│   └── SpellList.jsx      # Spell list grouped by level
├── data/
│   └── spells.json        # Spell database
├── utils/
│   └── pdfGenerator.js    # Markdown to PDF conversion
├── App.jsx                # Main application component
├── App.css                # Application styles
└── main.jsx               # Entry point
```

## Adding More Spells

Edit `src/data/spells.json` to add more spells. Each spell should follow this schema:

```json
{
  "id": "unique_spell_id",
  "name": "Spell Name",
  "level": 1,
  "school": "Evocation",
  "casting_time": "1 action",
  "range": "120 feet",
  "components": ["V", "S", "M"],
  "duration": "Instantaneous",
  "concentration": false,
  "ritual": false,
  "classes": ["Wizard", "Sorcerer"],
  "description": "Spell description...",
  "at_higher_levels": "Optional: effects at higher levels..."
}
```

## Tech Stack

- React + Vite
- marked (Markdown parsing)
- html2pdf.js (PDF generation)
