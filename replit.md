# UT Ticket Frontend

## Overview
This is a React + TypeScript + Vite frontend application for a ticket management system called "uptime". The application provides authentication (login/signup) and ticket management features. It connects to an external backend API for data operations.

**Current State**: Fully configured and running on Replit environment with all dependencies installed.

## Recent Changes
- **2025-11-18**: Professional UI Redesign with Brand Color System
  - Implemented comprehensive design system with brand color #ee754e as primary
  - Created complementary color palette: Teal accent #1fb6a6, Charcoal text #1f1f24, Surface #f5f5f8
  - Built professional Navbar component with user menu, notifications, and settings
  - Redesigned Landing Page with gradient backgrounds, feature highlights, and branded CTA button
  - Upgraded Home Page (TicketPage) with navbar integration, gradient section headers, and metrics badges
  - Enhanced ticket cards with gradient borders using p-[2px] wrapper technique
  - Integrated Lucide icons throughout (Tag, Star, AlertCircle, ArrowRight, Activity, TrendingUp)
  - Applied backdrop blur effects, hover transitions (20% to 40% gradient intensity), and rounded-2xl styling
  - Consistent design tokens for spacing, shadows, typography, and interactive states

- **2025-11-18**: Landing Page with Manual Microsoft SSO
  - Created professional landing page with Uptime logo and "Sign in with Microsoft" button
  - Replaced automatic SSO redirect with user-initiated authentication flow
  - Added loading state and error handling with toast notifications for better UX
  - Button shows spinner and "Redirecting..." text during sign-in process
  - Disabled button during sign-in to prevent duplicate submissions

- **2025-11-18**: Microsoft SSO Integration
  - Integrated Microsoft Authentication Library (MSAL) for Azure AD SSO
  - Removed traditional login/signup pages in favor of Microsoft authentication
  - Created AuthProvider component to sync MSAL authentication with Redux store
  - Updated SideBar component to use MSAL logout
  - Updated PrivateRoute component to work with MSAL authentication
  - Configured MSAL with support for User.Read scope
  - Tokens securely managed via MSAL's internal cache (not localStorage)
  
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
- **Styling**: Tailwind CSS 4.1.17 with custom design system
- **Icons**: Lucide React (replacing react-icons)
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
- **Professional Design System**: Modern UI with brand color #ee754e
  - Gradient borders with hover effects (20% to 40% opacity transitions)
  - Backdrop blur effects and rounded-2xl styling throughout
  - Consistent Lucide icon integration for visual clarity
  - Responsive layouts with proper spacing and typography
  - Custom Tailwind theme defined in src/index.css (@theme inline)
- **Authentication**: Microsoft Single Sign-On (SSO) using Azure AD with MSAL
  - Professional landing page with Uptime logo and sign-in button
  - User-initiated authentication via "Sign in with Microsoft" button
  - Silent token acquisition for seamless authentication
  - Secure logout with redirect to Microsoft logout page
  - Tokens stored securely in MSAL cache (not vulnerable to XSS attacks)
- **Ticket Management**: View in-progress and scored tickets with professional card designs
  - In-progress tickets: Orange gradient borders (#ee754e), Tag icons
  - Scored tickets: Teal gradient borders (#1fb6a6), Star icons, score badges
  - Triage indicators with AlertCircle icons
  - Smooth hover states and arrow animations
- **Navigation**: Professional Navbar component
  - User profile with avatar and name display
  - Notifications, settings, and logout functionality
  - Responsive design with proper spacing and shadows
- **Private Routes**: Protected routes requiring Microsoft authentication
- **Global Modal System**: Centralized modal management
- **Error Handling**: Global error handler with toast notifications
- **API Integration**: Axios-based API client with request/response interceptors

### Environment Variables
The application requires the following environment variables (see .env.example):
- `VITE_CLIENT_ID`: Microsoft Azure application (client) ID
- `VITE_TENANT_ID`: Microsoft Azure tenant ID
- `VITE_REDIRECT_URI`: Redirect URI for authentication callbacks (default: http://localhost:5000/)
- `VITE_API_URL`: Backend API base URL (e.g., https://dev.api.upstimegerlobal.tech)
- `VITE_HTTP_REQUEST_TIMEOUT`: HTTP request timeout in milliseconds
- `VITE_VERSION`: Application version
- `VITE_IS_PRODUCTION`: Production flag (true/false)
- `VITE_ENABLE_SENTRY`: Enable Sentry error tracking (true/false)
- `VITE_HUB_NAME`: SignalR hub name
- `VITE_INVITATION_DEFAULT_MESSAGE`: Default invitation message

**Important**: You must add these environment variables via Replit Secrets for the application to work properly.

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
- None currently

## Setup Instructions
1. Add all required environment variables via Replit Secrets (see Environment Variables section)
2. Make sure your Microsoft Azure app registration has the redirect URI configured
3. Visit the application to see the landing page
4. Click "Sign in with Microsoft" to authenticate
5. After successful authentication, users will be directed to the home page

## Authentication Flow
1. User visits the application and sees the landing page with Uptime logo
2. User clicks "Sign in with Microsoft" button
3. App redirects to Microsoft login page
4. User logs in with Microsoft credentials
5. Microsoft redirects back to the app with authentication token
6. App acquires access token silently and stores it securely in MSAL cache
7. User data is synced with Redux store
8. Protected routes are now accessible
