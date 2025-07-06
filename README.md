# React Multi-Camera Viewer

This is a simple React app that displays multiple video streams like a CCTV grid.

## Features

- Show multiple video streams
- Uses `.env` for backend base URL

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add `.env` file

Create a file named `.env` in the root folder:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Start the development server

```bash
npm run dev
```

## API Requirement

Your backend should provide a list of video URLs at:

```
GET /video-urls
```

Example response:

```json
[
  { "url": "/video/cam1.mp4" },
  { "url": "/video/cam2.mp4" }
]
```

Each video should be accessible at:

```
GET /video/:filename
```

## License

MIT