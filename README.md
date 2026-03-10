

## Overview
Image Analysis Tool is a web application designed to analyze images using modern computer vision techniques. It features a client-side interface built with React and TypeScript, and a server-side API for processing and storage.

## Features
- Face tracking and session management
- Dynamic UI components (accordion, dialog, toast, etc.)
- Dashboard and session details pages
- Image storage and retrieval
- Real-time updates

## Project Structure
```
components.json
client/
  index.html
  src/
    App.tsx
    components/
    hooks/
    lib/
    pages/
server/
  db.ts
  index.ts
  routes.ts
shared/
  routes.ts
  schema.ts
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd Image-Analysis-Tool
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Client
```bash
cd client
npm run dev
```

### Running the Server
```bash
cd server
npm run dev
```

## Configuration
- `drizzle.config.ts`, `tailwind.config.ts`, `vite.config.ts`: Project configs
- `tsconfig.json`: TypeScript settings

## Usage
- Access the dashboard at `http://localhost:3000` (or as configured)
- Upload images, track sessions, and view analysis results

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
MIT

## Contact
For questions or support, contact the maintainer.
