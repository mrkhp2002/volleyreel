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

## [2026-05-26T15:10:00+05:30] - Dashboard UI (Figma Screens)

### Added
- Built full dashboard page with stat cards, quick actions, recent matches table, active tournaments list, and bottom metric panels.
- Added modular dashboard components (`StatCard`, `QuickActionButton`, `RecentMatchesPanel`, `ActiveTournamentsPanel`, `MetricPanel`, shared SVG icons).
- Added `dashboardData.js` for mock dashboard content and `dashboard.css` for responsive grid styling.

### Changed
- Updated `Sidebar` and `Topbar` to match Figma app shell (navy sidebar, blue topbar, search, notifications, user pill, logout).
- Refreshed `global.css` to light dashboard theme aligned with design screenshots.

### Files Changed
- `frontend/src/pages/dashboard/DashboardPage.jsx`
- `frontend/src/pages/dashboard/dashboardData.js`
- `frontend/src/components/dashboard/StatCard.jsx`
- `frontend/src/components/dashboard/QuickActionButton.jsx`
- `frontend/src/components/dashboard/RecentMatchesPanel.jsx`
- `frontend/src/components/dashboard/ActiveTournamentsPanel.jsx`
- `frontend/src/components/dashboard/MetricPanel.jsx`
- `frontend/src/components/dashboard/icons.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/components/layout/Topbar.jsx`
- `frontend/src/styles/dashboard.css`
- `frontend/src/styles/global.css`

## [2026-05-26T14:30:00+05:30] - Auto-Login & Dashboard Redirection on Account Creation

### Added
- Integrated `useAuth` into `RegisterForm.jsx` to access frontend login context.
- Configured automatic credentials authentication via `/auth/login` right after successful user registration.

### Changed
- Redirected the account registration post-success path from the Sign In page (`/login`) directly to the analytics dashboard (`/dashboard`).

### Files Changed
- `frontend/src/components/layout/auth/RegisterForm.jsx`

## [2026-05-26T14:45:00+05:30] - Make User Role Selectable (Coach or Player)

### Changed
- Replaced the text input for the `role` field in `RegisterForm.jsx` with a custom dropdown select element featuring `Coach` and `Player` options.
- Updated frontend validation to require selecting a role during registration.
- Added custom styles for select elements, dropdown arrow icons, and select options inside `auth.css` matching the premium dark glass theme.

### Files Changed
- `frontend/src/components/layout/auth/RegisterForm.jsx`
- `frontend/src/styles/auth.css`

## [2026-05-26T20:08:00+05:30] - Premium Dark Theme & Glassmorphism Dashboard UI Tuning

### Added
- Injected decorative ambient glows (`.dashboard-glow`) inside the main layout of `DashboardPage.jsx`.

### Changed
- Converted the main application shell variables in `global.css` to dark mode values matching the login screens (deep dark background `#080b16`, border styling, and user pill glass elements).
- Redesigned the sidebar navigation: customized branding header, side borders, and glowing active links.
- Styled topbar search input and custom scrollbars for dark mode coherence.
- Refactored `dashboard.css` from the ground up: transformed stat cards, quick-action buttons, recent match tables, active tournament lists, and metric trackers into premium glassmorphism layouts.
- Styled quick-action buttons to be responsive, featuring custom gradients, button hover/press transformations, and interactive color theme glows.

### Files Changed
- `frontend/src/styles/global.css`
- `frontend/src/pages/dashboard/DashboardPage.jsx`
- `frontend/src/styles/dashboard.css`

## [2026-05-26T20:28:00+05:30] - Fix Dashboard Theme Rendering

### Changed
- Imported `frontend/src/styles/global.css` in `frontend/src/main.jsx` so the dashboard uses the correct theme variables and background.
- Ensured quick-action SVG icons render with proper `currentColor` styling by setting `color: #ffffff` on `.dash-quick-action`.

### Files Changed
- `frontend/src/main.jsx`
- `frontend/src/styles/dashboard.css`

## [2026-05-26T20:45:00+05:30] - Collapsible Sidebar + Scrollable Logout

### Added
- Collapsible sidebar toggle (minimize to icon-only rail) with persisted state in `localStorage`.
- Scrollable sidebar body so navigation, user info, and logout move together when scrolling.

### Changed
- Wired collapse state through `AppLayout` and animated grid width via CSS variables.
- Refactored `Sidebar` layout: fixed header, scrollable nav + footer block (logout no longer pinned outside scroll flow).

### Files Changed
- `frontend/src/components/layout/AppLayout.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/styles/global.css`

## [2026-05-26T21:15:00+05:30] - Team Management UI (Figma Screens)

### Added
- Built full Team Management module: list page with filters, stats, table, pagination, and delete modal.
- Added Create Team multi-section form (details, coach/location, setup, branding upload, notes).
- Added Team Details page with summary cards, quick actions, registered players table, linked matches table, and delete confirmation modal.
- Added Edit Team page reusing the create form in edit mode.
- Added shared management styles and reusable `DeleteConfirmModal` + table action icons.
- Expanded sidebar with collapsible Teams submenu (Team List, Create Team).

### Changed
- Registered team routes: `/teams`, `/teams/create`, `/teams/:teamId`, `/teams/:teamId/edit`.
- Create team form posts to `POST /api/teams/` when creating (edit mode updates UI locally for now).

### Files Changed
- `frontend/src/pages/teams/TeamsPage.jsx`
- `frontend/src/pages/teams/CreateTeamPage.jsx`
- `frontend/src/pages/teams/TeamDetailsPage.jsx`
- `frontend/src/pages/teams/EditTeamPage.jsx`
- `frontend/src/pages/teams/teamsData.js`
- `frontend/src/styles/management.css`
- `frontend/src/components/common/DeleteConfirmModal.jsx`
- `frontend/src/components/common/TableActionIcons.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/styles/global.css`

## [2026-05-27T11:25:00+05:30] - Tournament & Public Reports Pages + Collapsible Navigation Submenus

### Added
- Created `TournamentReportsPage.jsx` featuring dynamic searches, report type filtering, modal-based simulated report generation, and detail popups.
- Created `PublicReportsPage.jsx` featuring a 3-column glassmorphic grid layout of shared highlights, views count increments, social sharing simulations, and a select-and-share report wizard.
- Created `SettingsPage.jsx` scaffold component to enable valid link resolution in sidebar.
- Created `reports.css` with dark glassmorphism rules for lists, card headers, view layouts, badges, and modals.

### Changed
- Refactored `Sidebar.jsx` to dynamically support multiple expandable navigation sections (Teams, Players, Matches, Reports) with collapsible submenus and integrated settings icon.
- Updated `AppRoutes.jsx` to map nested paths for `/reports/tournament`, `/reports/public`, and `/settings`.

### Files Changed
- `frontend/src/pages/reports/TournamentReportsPage.jsx`
- `frontend/src/pages/reports/PublicReportsPage.jsx`
- `frontend/src/pages/settings/SettingsPage.jsx`
- `frontend/src/styles/reports.css`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
