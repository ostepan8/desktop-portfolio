# Desktop Portfolio

A personal portfolio website designed to look and function like a macOS desktop experience.

## Features

- macOS-style window management (drag, resize, minimize, maximize)
- Interactive dock with app icons
- Virtual file system with folders and files
- Built-in apps: Finder, Terminal, TextEdit, About Me, Projects
- Desktop icons with grid layout
- Right-click context menus
- Boot sequence animation
- Fully responsive with mobile support

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State**: React Context + localStorage

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the desktop.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/
│   ├── desktop/         # Desktop background, icons grid
│   ├── dock/            # Dock component
│   ├── menubar/         # Top menu bar
│   ├── window/          # Window system components
│   ├── apps/            # Individual app components
│   └── icons/           # Icon components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── store/               # State management
└── types/               # TypeScript type definitions
```

## License

MIT
