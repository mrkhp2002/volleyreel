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

## [2026-05-27T11:12:00+05:30] - Premium Dark Theme & Responsive Tabs for Teams Section

### Added
- Integrated shared page-level navigation tabs at the top of the Teams section, enabling seamless switching between Team Directory and Create Team.
- Added responsive sub-tabs inside Team Directory: "All Teams" (table & pagination) and "Stats & Analytics" (aggregated cards, division breakdowns, roster ratio bars).
- Created a multi-step form wizard layout inside Create/Edit Team pages (divided into Team Info, Logistics, and Roster & Media steps) with forward/backward footer navigation controls.
- Added glowing ambient background accents to the Teams, Create Team, and Team Details views.

### Changed
- Overhauled `management.css` from a light theme to a premium dark glassmorphic design (transparent background panels, fine white borders, amber highlights) aligning with the app shell.
- Refactored `TeamsPage.jsx`, `CreateTeamPage.jsx`, and `TeamDetailsPage.jsx` to adopt the dark-mode layout parameters, new typography, and micro-animations.

### Files Changed
- `frontend/src/styles/management.css`
- `frontend/src/pages/teams/TeamsPage.jsx`
- `frontend/src/pages/teams/CreateTeamPage.jsx`
- `frontend/src/pages/teams/TeamDetailsPage.jsx`

## [2026-05-27T11:30:00+05:30] - Auto-Collapse and Hover Expansion for Sidebar Sub-menus

### Added
- Implemented hover-triggered auto-expansion (`onMouseEnter`) for sidebar navigation submenus (Teams, Players, Matches, Reports), allowing sections to slide down without requiring clicks.
- Added mouse exit handlers (`onMouseLeave`) to auto-collapse hovered submenus when moving the cursor away (active section submenus are preserved).

### Changed
- Refactored `Sidebar.jsx` navigation listeners to synchronize submenu collapse states bi-directionally. Expanded sub-menus now automatically collapse ("roll back") when navigating away.

### Files Changed
- `frontend/src/components/layout/Sidebar.jsx`

## [2026-05-27T11:40:00+05:30] - Smooth & Responsive Leaderboard Page

### Added
- Created `LeaderboardsPage.jsx` containing interactive tournament and division filters, rank cards for both teams and players, top three top performer highlight badges (gold/silver/bronze), and responsive highlight stats at the bottom.
- Created `leaderboards.css` with dark mode glassmorphism styles, hover transformations, layout grid columns, and media query wrappers.

### Files Changed
- `frontend/src/pages/leaderboards/LeaderboardsPage.jsx`
- `frontend/src/styles/leaderboards.css`

## [2026-05-27T11:58:00+05:30] - Smooth & Responsive Tournament Analytics Page

### Added
- Created `TournamentAnalyticsPage.jsx` containing dynamic tournament filters, interactive stats cards, an animated SVG line chart that draws itself on render with hover tooltips, top performing team rankings, and a click-to-filter tournament breakdown table.
- Created `analytics.css` with dark glassmorphic styling, drawing animations, and media queries for responsive layouts.

### Files Changed
- `frontend/src/pages/tournament-analytics/TournamentAnalyticsPage.jsx`
- `frontend/src/styles/analytics.css`

## [2026-05-27T12:05:00+05:30] - Smooth & Responsive Match List

### Added
- Created `MatchesPage.jsx` containing paginated match lists, dynamic stats calculations, a "+ Create Match" form wizard, an animated video upload simulation with progress indicators, and an inline mockup video player modal.
- Created scaffold pages for sub-items: `MatchesCreatePage.jsx`, `MatchesUploadPage.jsx`, and `MatchesVideosPage.jsx` under `frontend/src/pages/matches/`.
- Created `matches.css` with dark mode glassmorphic templates for list tables, action items, status badges, and video components.

### Changed
- Updated matches submenu navigation links inside `Sidebar.jsx` to direct to individual match sections (Match List, Create Match, Upload & Review, Generated Videos).
- Registered new matches subroutes in `AppRoutes.jsx`.

### Files Changed
- `frontend/src/pages/matches/MatchesPage.jsx`
- `frontend/src/pages/matches/MatchesCreatePage.jsx`
- `frontend/src/pages/matches/MatchesUploadPage.jsx`
- `frontend/src/pages/matches/MatchesVideosPage.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/components/layout/Sidebar.jsx`

## [2026-05-27T12:12:00+05:30] - Complete Create Match Integration & Real-time State Sync

### Added
- Integrated localStorage state synchronization between `MatchesCreatePage.jsx` and `MatchesPage.jsx` to dynamically persist new matches and ensure they render immediately in the main directory.
- Implemented full-fidelity saving functionality in `MatchesCreatePage` mapping selected upload details, event detection, and generated highlight status to the record schema.

### Changed
- Configured the "Create Match" button on the Match List page to redirect directly to the dedicated creation layout.

### Files Changed
- `frontend/src/pages/matches/MatchesPage.jsx`
- `frontend/src/pages/matches/MatchesCreatePage.jsx`

## [2026-05-27T12:20:00+05:30] - Mobile & Tablet Responsive Layouts

### Added
- Implemented slide-out mobile navigation drawer overlay (`.sidebar--mobile-open`) for devices smaller than `1024px`.
- Added transparent backdrop overlay behind the drawer on mobile to close the navigation panel on external clicks.
- Added hamburger toggle button to the `Topbar` and close button (✕) to the `Sidebar` for viewport responsiveness.

### Changed
- Refactored `AppLayout.jsx` to manage mobile sidebar toggling states and close drawer automatically on location/path changes.
- Optimized Topbar grid flow and alignment, collapsing username label and wrapping search inputs cleanly onto a separate line on phones.
- Overrode margin, card paddings, page container paddings, and pagination button lists in `global.css` and `management.css` under `768px` and `480px` to optimize layout flow for touch targets.

### Files Changed
- `frontend/src/components/layout/AppLayout.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/components/layout/Topbar.jsx`
- `frontend/src/styles/global.css`
- `frontend/src/styles/management.css`

## [2026-05-27T12:50:00+05:30] - Mobile & Tablet Responsive Layouts for Authentication Pages

### Changed
- Converted `.auth-container` to stack vertically on viewports under `820px` by shifting the grid structure to `1fr`.
- Refactored `.auth-left` to collapse into a clean, horizontal top brand header bar on mobile devices by hiding the description copy, footer, and feature panel checklist.
- Optimized form spacing padding for `.auth-right` and card content wrapping in `.auth-card` to match touch guidelines on mobile and tablet devices.
- Refined `.auth-centered-page` paddings, layout gap sizes, and checkbox options rows for forgot password screens to align on screens under `480px`.

### Files Changed
- `frontend/src/styles/auth.css`

## [2026-05-27T15:15:00+05:30] - Implement Interactive Upload & Review and Generated Videos Pages

### Added
- Created a fully interactive `MatchesUploadPage.jsx` featuring dynamic match selector, drag-and-drop file uploader, AI pipeline timeline stages checklist, timeline seeker video control, dynamic court overlays (pulsing calibration grid, ball coordinates indicator, player identification boxes), play/pause controls, search filters, and inline tag editing.
- Created `MatchesVideosPage.jsx` containing the Video Library Summary counter matching the mockup screenshot, dynamic highlight card grids, "Retry Generation" progress triggers that fix statistics, and playback preview modal.
- Appended styling rules in `matches.css` to cover 2-column layout, computer vision screen overlays, event tables, edit inline boxes, library summary counters, and highlight video cards.

### Files Changed
- `frontend/src/pages/matches/MatchesUploadPage.jsx`
- `frontend/src/pages/matches/MatchesVideosPage.jsx`
- `frontend/src/styles/matches.css`

## [2026-05-27T15:20:00+05:30] - Redesign Generated Videos Page Layout & Covers

### Added
- Created 3-column mock card grid inside `MatchesVideosPage.jsx` depicting the 6 standard video clips with custom cover thumbnails, Play icons, Duration stamps, status pills, meta info, and alerts.
- Added custom search wrapper and three outlined filter select selectors (Video Type, Tournament, Status) in `MatchesVideosPage.jsx`.

### Changed
- Refactored styles in `matches.css` to add `.matches-video-card-thumbnail`, `.matches-video-card-play-icon`, `.matches-video-card-duration`, and `.matches-video-card-badge` modifiers.
- Reworked in-card status alert panels (`.matches-video-card-generating-banner`, `.matches-video-card-failed-banner`, and `.matches-video-card-retry-btn`) to fit inside cards.

### Files Changed
- `frontend/src/pages/matches/MatchesVideosPage.jsx`
- `frontend/src/styles/matches.css`

## [2026-05-27T15:22:00+05:30] - Add Video Library Summary Widget to Bottom

### Added
- Appended the full-width `Video Library Summary` card widget at the bottom of the redesigned cards grid in `MatchesVideosPage.jsx`.
- Programmed dynamic stats counters: Total (31), Ready, Generating, and Failed quantities update in real-time as users retry generation pipelines or as generating tasks finish compiling.

### Files Changed
- `frontend/src/pages/matches/MatchesVideosPage.jsx`

## [2026-05-27T16:35:00+05:30] - Implement Complete Match Details Dashboard

### Added
- Created `MatchDetailsPage.jsx` containing full score summaries, venue schedules, upload statistics (uploaded by, file size, duration), dynamic review progress metrics (events detected, approved, pending), recent events list, generated clips list, activity timelines, and deletion modals.
- Registered `/matches/:matchId` route mapping to `MatchDetailsPage` inside `AppRoutes.jsx`.

### Changed
- Configured the Match ID column links in `MatchesPage.jsx` to navigate to `/matches/:matchId` instead of opening the video timeline modal.
- Refactored `MatchesUploadPage.jsx` to parse the `matchId` query parameters from the URL, allowing automatic selection of matches redirected from details views.
- Appended styling rules in `matches.css` to cover 2-column details layout grid, timeline bullet connector lines, metric containers, info rows, and back links.

### Files Changed
- `frontend/src/pages/matches/MatchesPage.jsx`
- `frontend/src/pages/matches/MatchesUploadPage.jsx`
- `frontend/src/pages/matches/MatchDetailsPage.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/styles/matches.css`

## [2026-05-27T16:40:00+05:30] - Verification & Compilation Checks for Match Flow

### Changed
- Executed production build checks using Vite compilation script to ensure complete asset resolution and build optimization without warnings.
- Run local dev server checks to verify successful server initialization.
- Finalized task lists and updated documentation.

### Files Changed
- None (Documentation & verification only)

## [2026-05-27T16:45:00+05:30] - Make Match Teams Clickable Links to Match Details

### Changed
- Wrapped the team names cell (e.g. "Thunder Strikers vs Ocean Waves") in `MatchesPage.jsx` with a React Router `Link` component navigating to `/matches/:matchId`.
- Added hover states and transitions for the teams cell link in `matches.css` to change the color to blue on mouse hover.

### Files Changed
- `frontend/src/pages/matches/MatchesPage.jsx`
- `frontend/src/styles/matches.css`

## [2026-05-27T16:50:00+05:30] - Link Dashboard and Team Details Matches to Match Details Page

### Changed
- Modified `RecentMatchesPanel.jsx` on the Dashboard to route both Match ID and Teams to the match details page (`/matches/:matchId`).
- Modified `TeamDetailsPage.jsx` linked matches table to route Match ID and Teams to the match details page (`/matches/:matchId`).
- Added styling rules and hover transitions for `.dash-table-teams-link` in `dashboard.css`.

### Files Changed
- `frontend/src/components/dashboard/RecentMatchesPanel.jsx`
- `frontend/src/styles/dashboard.css`
- `frontend/src/pages/teams/TeamDetailsPage.jsx`

## [2026-05-27T16:55:00+05:30] - Nested Route Resolution and Defensive State Fallbacks

### Changed
- Refactored `AppRoutes.jsx` to group `/matches` and `/teams` subroutes under explicit nested route configurations (with index element and relative sub-paths) to eliminate path specificity resolving conflicts.
- Patched `MatchDetailsPage.jsx` with defensive checks to prevent runtime splits on missing or corrupt `match.teams` and `match.date` properties, ensuring fallback templates load reliably without throwing component render exceptions.

### Files Changed
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/pages/matches/MatchDetailsPage.jsx`

## [2026-05-27T17:05:00+05:30] - Player Management Dashboard & CustomSelect Theme Integration

### Added
- Created `playersData.js` containing initial player profiles and dynamic stats helper base values.
- Created `players.css` containing dark glassmorphic styling, dotted file uploader dropzones, avatar badges, and pop-up modal configurations.

### Changed
- Re-architected `PlayersPage.jsx` to build a complete Player Management dashboard supporting search filtering, dynamic metrics updates, directory table pagination, and local persistence.
- Implemented centered pop-up modals for adding, editing, viewing, and deleting players (replacing right-side drawers).
- Integrated `CustomSelect` dropdown filters across matches lists, timeline editors, report creators, team managers, and signup role forms.
- Updated `analytics.css`, `reports.css`, `management.css`, `auth.css`, and `matches.css` to target custom select trigger class rules.

### Files Changed
- `frontend/src/pages/players/playersData.js`
- `frontend/src/styles/players.css`
- `frontend/src/pages/players/PlayersPage.jsx`
- `frontend/src/pages/tournament-analytics/TournamentAnalyticsPage.jsx`
- `frontend/src/styles/analytics.css`
- `frontend/src/pages/reports/TournamentReportsPage.jsx`
- `frontend/src/pages/reports/PublicReportsPage.jsx`
- `frontend/src/styles/reports.css`
- `frontend/src/pages/teams/TeamsPage.jsx`
- `frontend/src/pages/teams/CreateTeamPage.jsx`
- `frontend/src/styles/management.css`
- `frontend/src/components/layout/auth/RegisterForm.jsx`
- `frontend/src/styles/auth.css`
- `frontend/src/pages/matches/MatchesPage.jsx`
- `frontend/src/pages/matches/MatchesUploadPage.jsx`
- `frontend/src/styles/matches.css`

## [2026-05-27T17:15:00+05:30] - Player Details Page & Directory Links

### Added
- Created `PlayerDetailsPage.jsx` featuring dynamic biography cards, dynamic performance stats rows, mock matches recent table, quick actions list, edit modal, and delete confirmation modal.

### Changed
- Configured nested routing for `/players/:playerId` route mapping to `PlayerDetailsPage` in `AppRoutes.jsx`.
- Wrapped table name cells in `PlayersPage.jsx` with clickable navigation Links leading to the Player Details page.
- Appended styling rules in `players.css` for details grids, performance tables, card stat boxes, and info item rows.

### Files Changed
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/pages/players/PlayersPage.jsx`
- `frontend/src/styles/players.css`
- `frontend/src/pages/players/PlayerDetailsPage.jsx`

## [2026-05-27T17:25:00+05:30] - Complete Team Name Clickable Routing

### Changed
- Wrapped team names in `RecentMatchesPanel.jsx` (Dashboard) in individual `<Link>` tags pointing to `/teams/:teamId`.
- Wrapped team and player names in `LeaderboardsPage.jsx` in individual `<Link>` tags pointing to `/teams/:teamId` and `/players/:playerId` respectively.
- Wrapped top performing team names in `TournamentAnalyticsPage.jsx` in `<Link>` tags pointing to `/teams/:teamId`.
- Wrapped team names in `PlayerDetailsPage.jsx` (biography details and recent performance table) in `<Link>` tags pointing to `/teams/:teamId`.
- Wrapped recent match opponent team names in `TeamDetailsPage.jsx` in `<Link>` tags pointing to `/teams/:teamId`.
- Added hover transition styles in `leaderboards.css` and `analytics.css` for the newly linked tags.

### Files Changed
- `frontend/src/components/dashboard/RecentMatchesPanel.jsx`
- `frontend/src/pages/leaderboards/LeaderboardsPage.jsx`
- `frontend/src/styles/leaderboards.css`
- `frontend/src/pages/tournament-analytics/TournamentAnalyticsPage.jsx`
- `frontend/src/styles/analytics.css`
- `frontend/src/pages/players/PlayerDetailsPage.jsx`
- `frontend/src/pages/teams/TeamDetailsPage.jsx`

## [2026-05-27T17:35:00+05:30] - Redesign Tournaments Page & Create Tournament Wizard

### Added
- Created `tournamentsData.js` containing initial mock tournaments dataset (12 profiles) and routing helpers.
- Created `CreateTournamentPage.jsx` featuring multi-section form fields, schedule dates, setup limits, drag-and-drop uploader dropzones, settings options, and localStorage sync.
- Created `EditTournamentPage.jsx` to load selected profile states and save in-place changes.
- Created `TournamentDetailsPage.jsx` rendering detailed metrics card, schedule summaries, and quick action panels.

### Changed
- Refactored `Sidebar.jsx` to convert simple Tournaments link into collapsible `NavGroup` submenu.
- Registered nested routing paths for index, create, edit, and details subpages of `/tournaments` in `AppRoutes.jsx`.
- Overwrote `TournamentsPage.jsx` to add card stats boxes, search inputs, custom location/status filter selects, listing rows with hover highlights, pagination, and `DeleteConfirmModal` overrides.

### Files Changed
- `frontend/src/pages/tournaments/tournamentsData.js`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/pages/tournaments/TournamentsPage.jsx`
- `frontend/src/pages/tournaments/CreateTournamentPage.jsx`
- `frontend/src/pages/tournaments/EditTournamentPage.jsx`
- `frontend/src/pages/tournaments/TournamentDetailsPage.jsx`

## [2026-05-27T17:40:00+05:30] - Fix Missing useMemo Import in CreateTournamentPage

### Changed
- Imported `useMemo` in `CreateTournamentPage.jsx` to fix the runtime ReferenceError causing the creation page to crash and redirect back to the main dashboard.

### Files Changed
- `frontend/src/pages/tournaments/CreateTournamentPage.jsx`

## [2026-05-27T17:45:00+05:30] - Implement Defensive Local Storage Parsing & Self-Healing

### Added
- Integrated self-healing logic on startup in `main.jsx` to clean up corrupted or malformed local storage keys (`volleyreel_tournaments`, `volleyreel_matches`, `volleyreel_players`) to prevent routing crashes.

### Changed
- Patched all tournament pages (`CreateTournamentPage.jsx`, `EditTournamentPage.jsx`, `TournamentDetailsPage.jsx`, and `tournamentsData.js`) to verify parsing arrays using `Array.isArray`.
- Patched all matches pages (`MatchesPage.jsx`, `MatchDetailsPage.jsx`, `MatchesCreatePage.jsx`, `MatchesUploadPage.jsx`, and `MatchesVideosPage.jsx`) to verify parsing arrays using `Array.isArray` with try-catch fallbacks.
- Patched player pages (`PlayersPage.jsx` and `PlayerDetailsPage.jsx`) to verify parsing arrays using `Array.isArray`.

### Files Changed
- `frontend/src/main.jsx`
- `frontend/src/pages/tournaments/CreateTournamentPage.jsx`
- `frontend/src/pages/tournaments/EditTournamentPage.jsx`
- `frontend/src/pages/tournaments/TournamentDetailsPage.jsx`
- `frontend/src/pages/tournaments/tournamentsData.js`
- `frontend/src/pages/players/PlayersPage.jsx`
- `frontend/src/pages/players/PlayerDetailsPage.jsx`
- `frontend/src/pages/matches/MatchesPage.jsx`
- `frontend/src/pages/matches/MatchDetailsPage.jsx`
- `frontend/src/pages/matches/MatchesCreatePage.jsx`
- `frontend/src/pages/matches/MatchesUploadPage.jsx`

## [2026-05-27T17:51:00+05:30] - Implement User Profile Dropdown & Settings Dashboard Tabs

### Added
- Integrated hover-triggered user profile dropdown menu inside the `Topbar.jsx` component that displays profile metadata, links to dedicated tabs, and actions logout.
- Styled user dropdown card inside `global.css` with radial gradient glowing avatar, typography, dividers, and custom transitions (smooth fade-in and scale-up on hover).
- Completely re-architected `SettingsPage.jsx` to build a multi-tab settings panel containing interactive forms for Profile Biography (with avatar upload triggers), Platform Defaults (CV calibration sliders and rules selects), Instant Notification Toggles, and Account Security zones.

### Changed
- Configured settings navigation tabs to automatically route and update view panes dynamically based on query parameters matching dropdown option selections.

### Files Changed
- `frontend/src/components/layout/Topbar.jsx`
- `frontend/src/styles/global.css`

## [2026-05-27T19:10:00+05:30] - Fix Stacking Context for User Profile Dropdown

### Changed
- Added `position: relative` and `z-index: 100` to the `.topbar` container in `global.css` to prevent the user profile hover dropdown from rendering behind dashboard cards and elements.


## [2026-05-27T19:17:00+05:30] - Create User Profile Page with Live Edit Modals

### Added
- Created `ProfilePage.jsx` featuring detailed profile cards (Summary, Personal Info, Account Info, Preferences, Security, and Activity stats counters) matching the mockup layouts.
- Created `profile.css` containing custom grid columns, details list layouts, stats cards, and glassmorphic pop-up edit modals.
- Implemented functional edit modals for editing profile details (with avatar picture uploader), changing password, managing security, and updating preferences in-place.

### Changed
- Extended `AuthContext.jsx` with an `updateUser` function to sync profile changes in real-time across the app.
- Registered `/profile` route in `AppRoutes.jsx`.
- Directed "View Profile" option inside `Topbar.jsx` user dropdown to `/profile`.
- Patched `Topbar.jsx` and `Sidebar.jsx` to render custom profile avatars from context.

### Files Changed
- `frontend/src/contexts/AuthContext.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/components/layout/Topbar.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/styles/profile.css`
- `frontend/src/pages/profile/ProfilePage.jsx`

## [2026-05-27T19:35:00+05:30] - Fine-tune Dashboard Quick Actions & Player Registration Trigger

### Added
- Integrated a query parameter listener (`?add=true`) inside `PlayersPage.jsx` to automatically pop up the "Add Player" modal upon loading.

### Changed
- Refactored all Dashboard "Quick Actions" buttons inside `DashboardPage.jsx` to route directly to their respective subpage destinations (e.g. `/tournaments/create`, `/teams/create`, `/players?add=true`, `/matches/create`, `/matches/upload`, and `/reports/tournament`) rather than general indexes.

### Files Changed
- `frontend/src/pages/dashboard/DashboardPage.jsx`
- `frontend/src/pages/players/PlayersPage.jsx`

## [2026-05-27T19:55:00+05:30] - Implement Global Notifications Synchronized Dropdown & Logs Page

### Added
- Created `NotificationsContext.jsx` to maintain global, localStorage-persistent notifications and unread alert counts.
- Created `useNotifications.js` React hook for component consumption.

### Changed
- Connected `Topbar.jsx` notifications dropdown to use the shared notifications state, dynamically updating the unread badge and the listed preview items.
- Connected `NotificationsPage.jsx` to the global hook to sync notifications list management (mark-as-read, delete, clear all, tabs filter) across views.
- Modified `main.jsx` to wrap the app root inside the new `NotificationsProvider` and added its state key to the local storage self-healing system.
- Polished the responsive alignment of `.topbar-notify-dropdown` in `global.css` for viewports under 640px.

### Files Changed
- `frontend/src/contexts/NotificationsContext.jsx`
- `frontend/src/hooks/useNotifications.js`
- `frontend/src/main.jsx`
- `frontend/src/components/layout/Topbar.jsx`
- `frontend/src/pages/notifications/NotificationsPage.jsx`
- `frontend/src/styles/global.css`

## [2026-05-28T22:20:00+05:30] - Fix Dropdown Select List Z-Index Stacking Context

### Changed
- Added `:focus-within` and `:hover` z-index overrides on `.mgmt-card` in `management.css` to dynamically lift the stacking layer of cards containing active form elements.
- Added `:focus-within` z-index rule for `.custom-select-container` in `global.css` to guarantee open select dropdown menus stack on top of other sibling inputs inside the same card.

- `frontend/src/styles/global.css`

## [2026-05-28T22:38:00+05:30] - Fix Filter Dropdowns Z-Index Layering and Layout Alignment

### Changed
- Added focus-within z-index rules for `.mgmt-filter-bar` and `.matches-filter-bar` to lift their stacking layer above stats rows and tables when select dropdowns are active.
- Overrode custom select trigger background colors in filter bars to match input fields (e.g. `rgba(255, 255, 255, 0.04)` on Matches page and `rgba(255, 255, 255, 0.03)` on Player Management page) for visual consistency.
- Updated `.matches-filter-select` and `.players-filter-select` to use `flex: 1` instead of `width: auto`, allowing even desktop scaling.
- Configured media queries for filter bars to stack vertically on screen widths <= 768px and set width to 100% for full mobile layout blending.

### Files Changed
- `frontend/src/styles/management.css`

## [2026-05-28T22:46:00+05:30] - Fix Dropdowns Z-Index Layering and Layout for Analytics, Reports, and Leaderboards

### Changed
- Added focus-within z-index rules for `.analytics-filter-row`, `.reports-filter-bar`, and `.leaderboard-filter-bar` to lift their stacking layer above stats grids and lists when select dropdowns are active.
- Overrode custom select trigger background colors in those filter rows to match input fields (e.g. `rgba(255, 255, 255, 0.04)` on Reports and `rgba(255, 255, 255, 0.03)` on Analytics and Leaderboards) for visual consistency.
- Updated `.reports-filter-select` and `.leaderboard-filter-select` to use `flex: 1` instead of `width: auto`, allowing desktop scaling.
- Updated `.reports-search-wrapper` to use `flex: 2` to match the proportions of the other filter rows.

- `frontend/src/styles/leaderboards.css`

## [2026-05-28T22:58:00+05:30] - Implement Hover-Triggered Sidebar Expansion (Desktop Overlay)

### Added
- Integrated `onMouseEnter` and `onMouseLeave` props and callbacks in `Sidebar.jsx` and attached them to the sidebar's `<aside>` container.

### Changed
- Refactored `AppLayout.jsx` to maintain a stable, non-shifting grid width (`76px`) on desktop, while using a local hover state to control the collapsed state of the sidebar.
- Modified `global.css` sidebar layout rules to explicit pixel dimensions (`250px` when expanded, `76px` when collapsed) with a smooth transition and premium overlay drop shadow.
- Hid the redundant manual toggle collapse button (`.sidebar-collapse-btn`) on desktop viewports.

### Files Changed
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/components/layout/AppLayout.jsx`
- `frontend/src/styles/global.css`
## [2026-05-28T23:48:00+05:30] - Center and Redesign Brand Logo Mark

### Added
- Created modern, geometric SVG `Logo.jsx` component representing a volleyball with custom linear gradients and clean transparent seam masking.

### Changed
- Integrated `<Logo />` in `Sidebar.jsx`, `Topbar.jsx`, `AuthBrand.jsx`, and `AuthLayout.jsx` to replace the raw `🏐` emoji.
- Centered the brand logo in the collapsed desktop sidebar in `global.css` using `justify-content: center` and padding overrides.

### Files Changed
- `frontend/src/components/common/Logo.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/components/layout/Topbar.jsx`
- `frontend/src/components/layout/auth/AuthLayout.jsx`
- `frontend/src/styles/global.css`

## [2026-05-29T00:15:00+05:30] - Create Scoped Admin Dashboard UI and Intercept Credentials

### Added
- Created `frontend/src/pages/admin/AdminDashboardPage.jsx` featuring System Overview default cards, KPI widgets with sparkline charts, User Management, AI Job Queue monitor, and Content Moderation lists.
- Created `frontend/src/styles/admin.css` containing variables, layouts, tables, and badge styling, scoped under `.admin-dashboard` to isolate it from the rest of the application.

### Changed
- Intercepted the admin credentials (`admin@volleyreel.com` / `admin123`) in `LoginForm.jsx` to log in as role `"admin"` and redirect to the admin panel.
- Modified `ProtectedRoute.jsx` to check `allowedRoles` for role-locked pages.
- Mounted `/admin/dashboard` in `AppRoutes.jsx` locked to `"admin"` users.

### Files Changed
- `frontend/src/routes/ProtectedRoute.jsx`
- `frontend/src/components/layout/auth/LoginForm.jsx`
- `frontend/src/styles/admin.css`
- `frontend/src/pages/admin/AdminDashboardPage.jsx`
- `frontend/src/routes/AppRoutes.jsx`

## [2026-05-29T00:25:00+05:30] - Redesign Admin Dashboard Theme with Premium Dark Glassmorphism

### Changed
- Refactored `admin.css` variables, background filters, borders, and modal shadows to implement the dark glassmorphic styling, matching the exact look-and-feel of other platform UIs.
- Styled panels, sidebar links, header controls, KPI cards, text readability, inputs, and moderation lists with a gold, blue, and dark theme.

### Files Changed
- `frontend/src/styles/admin.css`

## [2026-05-29T00:29:00+05:30] - Implement Hover Dynamics and Logo Centering on Admin Sidebar

### Changed
- Refactored `AdminDashboardPage.jsx` to expand the sidebar on hover (`onMouseEnter`/`onMouseLeave`) and removed the manual toggle collapse button from the sidebar header.
- Updated `admin.css` to use a stable grid layout for the page, preventing reflow/shifting of main content when the sidebar expands.
- Styled header centering, brand logo alignment, active nav items, and centered icons inside the collapsed state of the admin sidebar.

### Files Changed
- `frontend/src/pages/admin/AdminDashboardPage.jsx`
- `frontend/src/styles/admin.css`

## [2026-05-29T00:36:00+05:30] - Implement Admin Settings, Database Backups, & Dropdown Fine-Tuning

### Added
- Created the **Database Restore confirmation overlay modal** in the admin dashboard, prompting for the backup ID as security validation and including a 1.2s mock loader with a modern visual spinner.
- Integrated checkbox custom accent colors (`accent-color`) and customized select dropdown options styling to follow the dark glassmorphism theme.

### Changed
- Refactored header profile dropdown menu styling inside `admin.css` to utilize translucent background colors (`rgba(10, 15, 30, 0.95)`), backdrop filters (`blur(12px)`), inset highlights, left-aligned border accents on hover, and smooth slide/padding transitions.
- Adjusted SVGs in the dropdown menu to utilize a structured SVG helper class (`.admin-dropdown-icon`).

### Files Changed
- `frontend/src/pages/admin/AdminDashboardPage.jsx`
- `frontend/src/styles/admin.css`
