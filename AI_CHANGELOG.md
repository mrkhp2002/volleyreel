# AI Changelog

## [2026-05-26T12:48:00+05:30] - Complete Base Project & Database Foundation

### Added
- Created missing React/Vite configurations (`frontend/package.json`, `frontend/vite.config.js`, `frontend/index.html`).
- Created React authentication context `AuthContext.jsx` providing state management for logins, logouts, session persistence, and loading checks.
- Created reusable visual UI components: `Button.jsx`, `Input.jsx`, `Card.jsx`, and their CSS rules in `common.css`.
- Created SQLAlchemy database models for `tournament`, `team`, `player`, `match`, and `event` entities, and registered them on the model metadata.
- Created validation schemas (Pydantic models) for tournaments, teams, players, matches, and events.
- Created a centralized endpoint routing system in backend (`app/routes/api.py`) with sub-router placeholders for `tournaments`, `teams`, `players`, `matches`, `events`, and `analytics`.
- Created the security authorization middleware `get_current_user` in `dependencies.py` utilizing JWT decoding.

### Changed
- Configured CORS middleware, lifespan setup, and registered centralized routes inside `backend/app/main.py`.
- Corrected import paths and session navigation callbacks in `LoginForm.jsx` and `LoginPage.jsx`.
- Modified `AppRoutes.jsx` to map all subpages (Tournaments, Teams, Players, Matches, Analytics, Reports, Leaderboards) under `ProtectedRoute` and `AppLayout`.
- Polished layouts and styling in `Sidebar.jsx`, `Topbar.jsx`, `global.css`, `auth.css`, `Loader.jsx`, and `ErrorMessage.jsx` with high fidelity visual assets and animations.
- Appended `pyjwt` dependency to `backend/requirements.txt` and security helpers to `app/utils/security.py`.

### Removed
- Deleted obsolete context file `frontend/src/contexts/AppContext.jsx`.

## [2026-05-26T13:22:00+05:30] - Implement Figma-based Create Account Auth Screen

### Added
- Built a new register flow UI modeled after the provided Figma design, including full form structure, validation, and API integration with `/auth/register`.
- Added a dedicated register page that reuses the existing auth layout with configurable content blocks and feature list.

### Changed
- Refactored the shared auth layout to support reusable props (`pageEyebrow`, `heading`, `description`, `features`) without creating duplicate layouts.
- Updated login form navigation to route users directly to the new register page while keeping current login/auth behavior intact.
- Registered a new public `/register` route in the app routing setup.
- Reworked shared auth styles to provide a production-like, responsive split layout matching the Figma direction across login and register pages.

### Files Changed
- `frontend/src/components/layout/auth/AuthLayout.jsx`
- `frontend/src/components/layout/auth/LoginForm.jsx`
- `frontend/src/components/layout/auth/RegisterForm.jsx`
- `frontend/src/pages/auth/LoginPage.jsx`
- `frontend/src/pages/auth/RegisterPage.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/styles/auth.css`

## [2026-05-26T14:02:00+05:30] - Fine-tune Login and Registration UI

### Added
- Added custom input wrapper styles (`.input-group-wrapper`) and inline SVG icons to authentication form inputs.
- Integrated animated-like background glows (radial animations) for authentic visual depth.
- Created custom SVG checkmarks inside glass badges for the features checklist in `AuthLayout`.

### Changed
- Converted the authentication screen layout from light-mode to a high-end, dark-mode glassmorphic interface matching the dashboard base theme.
- Refactored `AuthLayout.jsx` to dynamically parse and highlight the final word of headings.
- Refactored `LoginForm.jsx` and `RegisterForm.jsx` to utilize input wrappers and inline SVGs.
- Enhanced submit buttons, hover effects, scale transformations, and active state transitions in `auth.css`.

### Files Changed
- `frontend/src/styles/auth.css`
- `frontend/src/components/layout/auth/AuthLayout.jsx`
- `frontend/src/components/layout/auth/LoginForm.jsx`
- `frontend/src/components/layout/auth/RegisterForm.jsx`

## [2026-05-26T14:25:00+05:30] - Forgot Password Page (Figma)

### Added
- Built a centered forgot-password screen with gradient background, brand header, email form, and back-to-sign-in navigation.
- Added reusable `AuthBrand` and `AuthCenteredLayout` components for standalone auth screens without duplicating the split-panel layout.

### Changed
- Wired login "Forgot Password?" link to `/forgot-password`.
- Registered public `/forgot-password` route.
- Extended shared `auth.css` with centered-page and light-card styles matching the Figma design.

### Files Changed
- `frontend/src/components/layout/auth/AuthBrand.jsx`
- `frontend/src/components/layout/auth/AuthCenteredLayout.jsx`
- `frontend/src/components/layout/auth/ForgotPasswordForm.jsx`
- `frontend/src/pages/auth/ForgotPasswordPage.jsx`
- `frontend/src/components/layout/auth/LoginForm.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/styles/auth.css`

## [2026-05-26T14:09:00+05:30] - Fine-tune Forgot Password Page & Theme Continuation

### Added
- Integrated glowing backdrops and animations (radial glows) inside the centered page container.
- Added absolute-positioned SVG mail icon to the reset email input.

### Changed
- Replaced the light-mode centering layout with the premium, dark-mode glassmorphic theme.
- Refactored `ForgotPasswordForm.jsx` to inherit the dark `auth-card` and standard error banner components.
- Upgraded the brand header (`AuthBrand`) in the centered page to use matching gradient text styling and rotating volleyball emblem.
- Cleaned up redundant `.auth-card--light` and light-theme banishing styles in `auth.css`.

### Files Changed
- `frontend/src/styles/auth.css`
- `frontend/src/components/layout/auth/ForgotPasswordForm.jsx`


