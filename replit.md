# UT Ticket Frontend

## Overview
This is a React + TypeScript + Vite frontend application for a ticket management system called "uptime". It provides authentication (login/signup) and ticket management features by connecting to an external backend API. The project aims to deliver a professional, user-friendly experience with a focus on modern UI/UX and robust authentication using Microsoft SSO.

## User Preferences
The agent should prioritize iterative development and clear communication. Before making any major architectural changes or significant code refactors, the agent must ask for explicit approval. All explanations should be detailed, clear, and easy to understand. The agent should always ensure that the codebase remains clean, well-documented, and adheres to best practices.

## System Architecture

### Tech Stack
- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **UI Components**: Radix UI
- **Forms**: Formik with Yup validation
- **HTTP Client**: Axios with RxJS
- **Notifications**: Sonner

### Key Features and Design Decisions
- **Hybrid Authentication**: Integrates Microsoft SSO with a custom backend session management system. The flow involves user-initiated Microsoft login, exchange of MSAL's `idToken` with the backend for a custom JWT, and secure storage of backend tokens in `localStorage`. Logout clears both local storage and Microsoft sessions.
- **Professional Design System**: Implements a modern UI with a consistent brand color palette (primary: #ee754e, accent: #1fb6a6, text: #1f1f24, surface: #f5f5f8). Features include gradient borders, backdrop blur effects, rounded-2xl styling, and integrated Lucide icons.
- **Responsive Navigation**: A professional sidebar component offers collapsible/expandable states, user profile display, dark/light mode toggle with persistence, and navigation links.
- **Ticket Management**: Displays in-progress and scored tickets with distinct visual cues (e.g., orange gradients for in-progress, teal for scored, gradient borders, and specific icons). Includes a "Company To Do List" section with overdue task highlighting.
- **Global Error Handling & Modals**: Centralized error handling with toast notifications and a global modal system for consistent user feedback.
- **API Integration**: Utilizes an Axios-based API client with interceptors for Bearer token authentication, automatic token refresh, request/response transformation (camelCase ↔ snake_case), and global error handling.
- **Production-Ready Logout with Forced SSO Re-authentication**: Implements a fire-and-forget logout pattern that properly terminates Azure AD sessions. The logout process captures the active MSAL account before clearing state, passes the account object and `logoutHint` parameter to `logoutRedirect()` to ensure complete server-side session termination. After logout, users MUST complete Microsoft SSO login again (cannot use cached credentials). Login request includes `prompt: 'select_account'` to force account selection and prevent silent authentication.
- **SSO Token Storage Reliability**: Employs `useRef`-based subscription management to prevent race conditions and ensure reliable SSO token storage, specifically addressing issues with duplicate authentication providers and component unmount during API calls.

### Project Structure
The project follows a modular structure:
- `app/`: Redux store, slices, and route definitions.
- `assets/`: Static assets.
- `components/`: Reusable UI components, including Shadcn-style primitives.
- `constants/`: Application-wide constants.
- `hooks/`: Custom React hooks.
- `lib/`: Utility libraries.
- `models/`: TypeScript type definitions.
- `modules/`: Feature-specific modules (e.g., `auth`, `ticket`).
- `services/`: API clients, logging, error handling, and storage wrappers.
- `shared/`: Shared components like forms, global modals, and private routes.
- `utils/`: General utility functions.

## External Dependencies
- **Microsoft Azure AD**: Used for Microsoft Single Sign-On (SSO) authentication via Microsoft Authentication Library (MSAL).
- **Backend API**: A separate backend service providing authentication, user data, and ticket management functionalities. All data operations are performed against this API.
- **Replit Secrets**: Used to securely manage environment variables such as API keys and client IDs.
- **Sentry**: Optional integration for error tracking (`VITE_ENABLE_SENTRY`).
- **SignalR**: Used for real-time communication via a specified hub (`VITE_HUB_NAME`).