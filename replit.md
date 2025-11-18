# UT Ticket Frontend

## Overview
This is a React + TypeScript + Vite frontend application for a ticket management system called "uptime". The application provides authentication (login/signup) and ticket management features. It connects to an external backend API for data operations.

**Current State**: Fully configured and running on Replit environment with all dependencies installed.

## Recent Changes
- **2025-11-18**: Initial project import and Replit environment setup
  - Configured Vite to run on port 5000 with host 0.0.0.0 for Replit proxy compatibility
  - Set up HMR (Hot Module Replacement) with WebSocket support
  - Installed all npm dependencies
  - Created workflow for the development server
  - Added .gitignore for Node.js/React projects
  - Created .env.example for environment variable reference

## Project Architecture

### Tech Stack
- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.2
- **State Management**: Redux Toolkit 2.10.1
- **Routing**: React Router DOM 7.9.5
- **Styling**: Tailwind CSS 4.1.17
- **UI Components**: Radix UI (Avatar, Dialog, Label, Separator, Slot, Tooltip)
- **Forms**: Formik 2.4.9 with Yup validation
- **HTTP Client**: Axios 1.13.2 with RxJS 7.8.2
- **Notifications**: Sonner 2.0.7

### Project Structure
```
src/
├── app/              # App-level configuration
│   ├── redux/        # Redux store and slices
│   └── routes/       # Route definitions
├── assets/           # Static assets
├── components/       # Reusable UI components
│   └── ui/          # Shadcn-style UI primitives
├── constants/        # App constants (API URLs, storage keys, etc.)
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries
├── models/          # TypeScript type definitions
├── modules/         # Feature modules
│   ├── auth/        # Authentication module
│   └── ticket/      # Ticket management module
├── services/        # API and utility services
│   ├── api/         # API client setup
│   ├── logger/      # Logging service
│   ├── other/       # Error handling, toaster, modals
│   └── storage/     # LocalStorage wrapper
├── shared/          # Shared components
│   ├── forms/       # Form components
│   ├── global-modal/
│   └── private-route/
└── utils/           # Utility functions
```

### Key Features
- **Authentication**: Login and signup with JWT token management and auto-refresh
- **Ticket Management**: View in-progress and scored tickets
- **Private Routes**: Protected routes requiring authentication
- **Global Modal System**: Centralized modal management
- **Error Handling**: Global error handler with toast notifications
- **API Integration**: Axios-based API client with request/response interceptors

### Environment Variables
The application requires the following environment variables:
- `VITE_API_URL`: Backend API base URL (currently set to example)
- `VITE_FRONTEND_URL`: Frontend URL for CORS and redirects

### Backend Integration
This is a frontend-only application that connects to a separate backend API. The base API service (`src/services/api/base-api.ts`) handles:
- Bearer token authentication
- Automatic token refresh on 401/403 errors
- Request/response transformation (camelCase ↔ snake_case)
- Global error handling

### Development
- **Port**: 5000
- **Host**: 0.0.0.0 (required for Replit proxy)
- **Command**: `npm run dev`
- **HMR**: Enabled with WebSocket support

### Build & Deployment
- Build command: `npm run build`
- Output directory: `dist`
- TypeScript compilation followed by Vite build

## Known Issues
- The backend API URL is set to a placeholder (`https://api.example.com`)
- Users will need to configure the actual backend API URL via environment variables
- One minor LSP warning in `base-api.ts` for unused parameter in stubbed function (non-critical)
