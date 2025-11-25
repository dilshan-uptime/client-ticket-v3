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
- **Responsive Navigation**: A professional sidebar component offers collapsible/expandable states, user profile display, dark/light mode toggle with persistence, and navigation links. A top navigation bar provides ticket search functionality with welcome message, search input field, filter dropdowns (Open, Recent Ticket), search button, and "+ New Ticket" button, all styled with brand colors (teal gradient background #1fb6a6 to #17a397).
- **Ticket Management**: Displays tickets in a specific order: (1) TICKET IN PROGRESS cards first, (2) UPCOMING TO-DOS cards second, (3) NEXT TICKET/NEXT TRIAGE TICKET card last. Tickets feature distinct visual cues (e.g., orange gradients for in-progress, teal for scored, gradient borders, and specific icons). Includes overdue task highlighting in the to-do list. When triage mode is active (`isTriageMode: true`), displays "NEXT TRIAGE TICKET" header with an amber warning banner showing the count of tickets requiring triage. Scored tickets conditionally render specialized triage dropdowns instead of approve/reject buttons when `isTriage: true`.
- **Ticket Approval/Rejection Workflow**: Professional confirmation dialogs with custom SVG illustrations for both approve and reject actions. Approve dialog features celebrating characters with checkmark, reject dialog shows confused characters with question mark. Both use brand color (#ee754e) for confirm buttons. Rejection requires mandatory reason input with validation.
- **Triage Mode with Dependent Dropdowns and Completion**: When a scored ticket has `isTriage: true`, displays specialized triage interface with 5 dropdown fields (Issue Type, Sub-Issue Type, Priority, Work Type, Queue) and two action buttons (Complete Triage, Open Full View). Implements intelligent dependent dropdown logic where Sub-Issue Type options are filtered based on the selected Issue Type using `subIssueTypeMap` from metadata. The Sub-Issue Type dropdown is disabled until an Issue Type is selected, and automatically clears when the Issue Type changes. Smart form synchronization preserves user edits during metadata refreshes while still pre-populating fields from ticket data when available. Validates that pre-populated sub-issue types belong to their corresponding issue type. Complete Triage button remains disabled until all 5 fields are filled, then submits a PUT request to `/api/v1/tickets/{ticket_id}` with the selected values (issue_type_id, sub_issue_type_id, priority_id, work_type_id, queue_id). Shows loading state during submission and provides success/error feedback via toast notifications. Open Full View button opens the ticket URL in a new browser tab. Replaces standard approve/reject workflow for tickets requiring triage classification.
- **Global Error Handling & Modals**: Centralized error handling with toast notifications and a global modal system for consistent user feedback.
- **API Integration**: Utilizes an Axios-based API client with interceptors for Bearer token authentication, automatic token refresh, request/response transformation (camelCase ↔ snake_case), and global error handling. After successful authentication, automatically fetches system metadata (issue types, sub-issue types, priorities, work types, queues) and stores in Redux for application-wide access.
- **Production-Ready Logout with Forced SSO Re-authentication**: Implements a fire-and-forget logout pattern that properly terminates Azure AD sessions. The logout process captures the active MSAL account before clearing state, passes the account object and `logoutHint` parameter to `logoutRedirect()` to ensure complete server-side session termination. After logout, users MUST complete Microsoft SSO login again (cannot use cached credentials). Login request includes `prompt: 'select_account'` to force account selection and prevent silent authentication.
- **SSO Token Storage Reliability**: Employs `useRef`-based subscription management to prevent race conditions and ensure reliable SSO token storage, specifically addressing issues with duplicate authentication providers and component unmount during API calls.
- **Professional Theme System**: Implements a complete light/dark mode system using CSS variables for seamless theme switching. Light mode features clean white cards (#ffffff) on a light gray background (#f8f9fa), while dark mode uses a fully dark professional navy background (#1a2332) with even darker sidebar (#131c29) and slate cards (#283548) for subtle contrast. All structural elements (backgrounds, text, borders, cards) adapt automatically via CSS variables with smooth 300ms transitions. The entire viewport is dark from edge to edge with no white spaces. Brand accent colors (teal #1fb6a6, orange #ee754e, purple) remain consistent across themes for visual identity. Theme preference persists in localStorage.

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