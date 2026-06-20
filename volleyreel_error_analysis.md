# VolleyReel — Full Project Error Analysis

> **Analysis Date:** June 5, 2026  
> **Scope:** Backend (FastAPI/SQLAlchemy) + Frontend (React/Vite)

---

## 🔴 CRITICAL ERRORS (Will Break at Runtime)

---

### 1. Wrong Primary Key Field Names in Route Filters
**Severity:** 🔴 CRITICAL — Every GET-by-ID endpoint will crash

**Files Affected:**
- [`matches.py` L27](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/matches.py#L27)
- [`tournaments.py` L27](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/tournaments.py#L27)
- [`teams.py` L30](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/teams.py#L30)
- [`players.py` L27](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/players.py#L27)
- [`events.py` L27](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/events.py#L27)

**Problem:** Every single `GET /{id}` endpoint uses `Model.id` to filter, but the actual SQLAlchemy model primary key columns use **custom names**:

| Model | Actual PK Column | Routes Use |
|---|---|---|
| `Match` | `match_id` | `Match.id` ❌ |
| `Tournament` | `tournament_id` | `Tournament.id` ❌ |
| `Team` | `team_id` | `Team.id` ❌ |
| `Player` | `player_id` | `Player.id` ❌ |
| `Event` | `event_id` | `Event.id` ❌ |

**Result:** Every `GET /matches/{id}`, `GET /tournaments/{id}`, etc. will always return **404 Not Found** because `Model.id` does not exist — SQLAlchemy will silently return `None`.

**Fix:** Change all route filter expressions to use the correct field:
```python
# WRONG
db.query(Match).filter(Match.id == match_id).first()

# CORRECT
db.query(Match).filter(Match.match_id == match_id).first()
```

---

### 2. Schema–Model Field Mismatch (Multiple Resources)
**Severity:** 🔴 CRITICAL — Will cause Pydantic serialization failures

**File:** [`schemas/match.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/schemas/match.py), [`schemas/tournament.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/schemas/tournament.py), [`schemas/team.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/schemas/team.py), [`schemas/player.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/schemas/player.py), [`schemas/event.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/schemas/event.py)

**Problem:** Pydantic `Read` schemas declare fields that **do not exist on the SQLAlchemy models**:

#### Match Schema vs Match Model
| Schema Field | Model Field | Match? |
|---|---|---|
| `id: int` | `match_id` | ❌ No `id` field |
| `match_date: datetime` | _not in model_ | ❌ Missing column |
| `audio_url: str` | _not in model_ | ❌ Missing column |
| `updated_at: datetime` | _not in model_ | ❌ Missing column |

#### Tournament Schema vs Tournament Model
| Schema Field | Model Field | Match? |
|---|---|---|
| `id: int` | `tournament_id` | ❌ No `id` field |
| `description: str` | _not in model_ | ❌ Missing column |
| `location: str` | _not in model_ | ❌ Missing column |
| `updated_at: datetime` | _not in model_ | ❌ Missing column |

#### Team Schema vs Team Model
| Schema Field | Model Field | Match? |
|---|---|---|
| `id: int` | `team_id` | ❌ No `id` field |
| `coach: str` | _not in model_ | ❌ Missing column |
| `club_name: str` | _not in model_ | ❌ Missing column |
| `logo_url: str` | _not in model_ | ❌ Missing column |
| `updated_at: datetime` | _not in model_ | ❌ Missing column |
| `tournament_id: int` | Present in model ✅ | **NOT in schema** ❌ |

#### Player Schema vs Player Model
| Schema Field | Model Field | Match? |
|---|---|---|
| `id: int` | `player_id` | ❌ No `id` field |
| `first_name: str` | _not in model_ | ❌ (model uses `name`) |
| `last_name: str` | _not in model_ | ❌ (model uses `name`) |
| `jersey_number: int` | _not in model_ | ❌ (model uses `number`) |
| `position`, `height`, `weight` | _not in model_ | ❌ Missing columns |
| `updated_at: datetime` | _not in model_ | ❌ Missing column |

#### Event Schema vs Event Model
| Schema Field | Model Field | Match? |
|---|---|---|
| `id: int` | `event_id` | ❌ No `id` field |
| `timestamp: float` | `timestamp_sec` | ❌ Different name |
| `is_verified: bool` | _not in model_ | ❌ Missing column |
| `verified_by_id: int` | _not in model_ | ❌ Missing column |
| `notes: str` | _not in model_ | ❌ Missing column |
| `updated_at: datetime` | _not in model_ | ❌ Missing column |

**Impact:** `response_model=MatchRead` (and equivalents) will fail to serialize DB rows → Pydantic `ValidationError` on all list/create endpoints.

---

### 3. `passlib` Not Installed — bcrypt Import Will Fail
**Severity:** 🔴 CRITICAL — Server cannot start

**File:** [`requirements.txt`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/requirements.txt) vs [`utils/security.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/utils/security.py)

**Problem:** `security.py` imports `bcrypt` directly:
```python
import bcrypt
```
But `requirements.txt` lists `passlib[bcrypt]==1.7.4` — the `passlib` library, **not the raw `bcrypt` package**. The `bcrypt` Python package is a separate package from `passlib`. If only `passlib` is installed without the standalone `bcrypt` package, `import bcrypt` will raise `ModuleNotFoundError` and the server will not start.

**Fix (Option A):** Add `bcrypt` to requirements.txt:
```
bcrypt>=4.0.1
```

**Fix (Option B):** Rewrite `security.py` to use `passlib.context`:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

---

### 4. Missing `jwt` Package (`PyJWT` vs `jwt`)
**Severity:** 🔴 CRITICAL — Server cannot start if wrong package installed

**Files:** [`utils/security.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/utils/security.py), [`routes/dependencies.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/dependencies.py)

**Problem:** Both files do `import jwt`, but `requirements.txt` does **not include `PyJWT`** (the package that provides the `jwt` module). This will raise `ModuleNotFoundError: No module named 'jwt'` at startup.

**Fix:** Add to `requirements.txt`:
```
PyJWT==2.8.0
```

---

### 5. `ProtectedRoute` Imports a Non-Existent Component
**Severity:** 🔴 CRITICAL — App will white-screen on auth check

**File:** [`routes/ProtectedRoute.jsx` L4](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/frontend/src/routes/ProtectedRoute.jsx#L4)

**Problem:**
```jsx
import Loader from "../components/layout/common/Loader";
```
The `Loader.jsx` file exists at:
```
frontend/src/components/layout/common/Loader.jsx  ✅
```
However, the **import path** is resolved from `src/routes/ProtectedRoute.jsx`:
- `../components/layout/common/Loader` → resolves to `src/components/layout/common/Loader` ✅

Actually after checking the directory listing this file _does_ exist. This is **not** an error. *(Corrected below.)*

---

## 🟠 HIGH-SEVERITY ERRORS (Logic Breaks / Data Loss)

---

### 6. `analytics.py` Route Always Returns Hardcoded Zeros
**Severity:** 🟠 HIGH — The analytics endpoint is non-functional

**File:** [`routes/analytics.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/analytics.py)

**Problem:** The `/api/analytics/summary` endpoint returns hardcoded empty data — it never queries the database:
```python
return {
    "tournaments_count": 0,   # ← hardcoded
    "teams_count": 0,          # ← hardcoded
    ...
}
```

**Fix:** Query the DB:
```python
def get_analytics_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return {
        "tournaments_count": db.query(Tournament).filter(Tournament.user_id == current_user.id).count(),
        "teams_count": db.query(Team).count(),
        ...
    }
```

---

### 7. `list_matches`, `list_teams`, `list_players`, `list_events` Return ALL Records (No User Scoping)
**Severity:** 🟠 HIGH — Data isolation / multi-tenant security issue

**Files:** All `GET /` route handlers in [`matches.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/matches.py), [`teams.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/teams.py), [`players.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/players.py), [`events.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/events.py)

**Problem:**
```python
def list_matches(db, current_user=Depends(get_current_user)):
    return db.query(Match).all()  # ← returns EVERYONE's matches
```
The `current_user` is injected but never used for filtering. Any authenticated user can see all other users' data.

**Fix:** Filter by `current_user.id`:
```python
return db.query(Match).join(Tournament).filter(Tournament.user_id == current_user.id).all()
```

---

### 8. `create_tournament` Does Not Set `user_id`
**Severity:** 🟠 HIGH — Tournaments have no owner, breaks FK constraint

**File:** [`routes/tournaments.py` L18](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/tournaments.py#L18)

**Problem:**
```python
tournament = Tournament(**payload.model_dump())
```
`TournamentCreate` schema has no `user_id` field, so `payload.model_dump()` will not include it. But the `Tournament` model has `user_id` as `nullable=False` — this will raise a database `NOT NULL constraint failed` error.

**Fix:**
```python
tournament = Tournament(**payload.model_dump(), user_id=current_user.id)
```

---

### 9. `teams.py` Name-Uniqueness Check Is Too Broad
**Severity:** 🟠 HIGH — Creates false "name already exists" errors across all users

**File:** [`routes/teams.py` L18](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/teams.py#L18)

**Problem:**
```python
existing = db.query(Team).filter(Team.name == payload.name).first()
```
This checks uniqueness globally, so if user A has a team called "Tigers", user B cannot create their own "Tigers" team — even though they should be in completely different tournaments.

---

### 10. `apiClient.js` Reads Token from Wrong Key
**Severity:** 🟠 HIGH — All backend API calls will fail with 401 Unauthorized

**File:** [`services/apiClient.js` L11](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/frontend/src/services/apiClient.js#L11)

**Problem:**
```js
if (user?.token) {
  config.headers.Authorization = `Bearer ${user.token}`;
}
```

The `AuthContext` stores the user object as:
```json
{ "email": "...", "fullName": "...", "token": "..." }
```

This looks correct. **However**, when login is handled by the backend (not mock), the `Token` schema returns `access_token` (snake_case). The `LoginForm` maps it:
```js
token: res.data.access_token,
```
This is fine. But the **mock logins** set `token: "mock-admin-token-12345"` — these mock tokens will be sent to the real backend and immediately rejected. This is an architectural issue: **mock auth credentials bypass the backend entirely**, meaning the app is not integrated.

---

### 11. `dependencies.py` OAuth2 `tokenUrl` Points to Wrong Path
**Severity:** 🟠 HIGH — Swagger UI and OAuth2 clients will fail

**File:** [`routes/dependencies.py` L10](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/routes/dependencies.py#L10)

**Problem:**
```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
```
The actual login endpoint is mounted at `/api/auth/login` (prefix `/api` in `main.py` + prefix `/auth` in `api.py`). The `tokenUrl` is used by Swagger UI — it points to the wrong path.

**Fix:**
```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
```

---

## 🟡 MEDIUM-SEVERITY ISSUES (Bad Practices / Incomplete Features)

---

### 12. `config.py` Has Insecure Default `secret_key`
**Severity:** 🟡 MEDIUM — Security risk

**File:** [`config.py` L8](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/config.py#L8)

```python
secret_key: str = "change-me"
```
If the `.env` file is missing or the `SECRET_KEY` env var is not set, the JWT signing key falls back to `"change-me"` — a trivially guessable value.

---

### 13. `console.log("LOGIN DATA:", userData)` Left in Production Code
**Severity:** 🟡 MEDIUM — Security / information disclosure

**File:** [`contexts/AuthContext.jsx` L25](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/frontend/src/contexts/AuthContext.jsx#L25)

```js
const login = (userData) => {
  console.log("LOGIN DATA:", userData);  // ← logs email, token, role to console
```
This logs the user's JWT token and email to the browser console in production — a security risk.

---

### 14. `match.py` Model Missing `updated_at` Column
**Severity:** 🟡 MEDIUM — Schema says it exists; model doesn't have it

**File:** [`models/match.py`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/models/match.py)

The `MatchRead` schema declares `updated_at: datetime` but the `Match` model has no `updated_at` column (same for Tournament, Team, Player, Event).

---

### 15. `ForgotPasswordPage` Has No Real Implementation
**Severity:** 🟡 MEDIUM — Broken feature presented to users

**File:** [`pages/auth/ForgotPasswordPage.jsx`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/frontend/src/pages/auth/ForgotPasswordPage.jsx)  
**File:** [`components/layout/auth/ForgotPasswordForm.jsx`](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/frontend/src/components/layout/auth/ForgotPasswordForm.jsx)

There is no backend endpoint for password reset — the form UI exists but submitting it does nothing real (no `/api/auth/forgot-password` route).

---

### 16. Admin Dashboard Uses `alert()` for User Feedback
**Severity:** 🟡 MEDIUM — Bad UX, blocking native browser dialog

**File:** [`AdminDashboardPage.jsx` L226](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/frontend/src/pages/admin/AdminDashboardPage.jsx#L226)

```js
alert(`Video ${itemId} has been permanently removed from the platform.`);
```
Using `window.alert()` blocks the entire UI thread and looks unprofessional. Should use a toast/snackbar pattern like the rest of the app.

---

### 17. `psycopg2-binary` Listed But Only SQLite Is Configured
**Severity:** 🟡 MEDIUM — Unnecessary dependency / will fail if PostgreSQL not installed

**File:** [`requirements.txt` L4](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/requirements.txt#L4)

`psycopg2-binary` (PostgreSQL adapter) is in requirements but the entire app uses SQLite. Installing this package requires native PostgreSQL libraries which may fail on some systems. Remove it if SQLite is the intended DB.

---

### 18. `python-dotenv` Listed in requirements but NOT Used
**Severity:** 🟡 MEDIUM — Redundant dependency

**File:** [`requirements.txt` L8](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/requirements.txt#L8)

`pydantic-settings` (already listed) handles `.env` loading natively via `SettingsConfigDict`. The `python-dotenv` package is a duplicate, redundant install.

---

### 19. `alembic` Listed But No Migrations Directory Exists
**Severity:** 🟡 MEDIUM — Tool listed but not set up

**File:** [`requirements.txt` L5](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/requirements.txt#L5)

`alembic` is required but there is no `alembic.ini` or `migrations/` folder in the backend. The app relies on `Base.metadata.create_all()` in the lifespan hook — which is fine for development but not for production schema management.

---

### 20. `MatchesCreatePage` Doesn't Call Any Backend API
**Severity:** 🟡 MEDIUM — Match creation is UI-only (localStorage), not persisted to DB

**File:** [`MatchesCreatePage.jsx` L203-L224](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/frontend/src/pages/matches/MatchesCreatePage.jsx#L203)

All data is written to `localStorage` only. The backend API endpoints are never called. Same applies to `MatchesPage.jsx`, `TeamsPage`, `TournamentsPage` — the entire frontend is localStorage-driven and disconnected from the backend.

---

## 🔵 LOW-SEVERITY ISSUES (Code Quality / Minor)

---

### 21. `Sidebar.jsx` — `SettingsIcon` Defined After It's Used
**Severity:** 🔵 LOW — Works due to hoisting but poor code organization

**File:** [`Sidebar.jsx` L82-L92](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/frontend/src/components/layout/Sidebar.jsx#L82)

`SettingsIcon` is used in `simpleNavItemsBottom` (L82) before it is defined (L85). This works in React because function declarations are hoisted, but it's a code smell and could break if converted to an arrow function.

---

### 22. `AppLayout.jsx` — `SIDEBAR_STORAGE_KEY` Defined but Never Used
**Severity:** 🔵 LOW — Dead code

**File:** [`AppLayout.jsx` L6](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/frontend/src/components/layout/AppLayout.jsx#L6)

```js
const SIDEBAR_STORAGE_KEY = "volleyreel-sidebar-collapsed";
```
This constant is never referenced — it was probably leftover from a removed persistent sidebar feature.

---

### 23. `match.py` Model Imports `uuid` but Has No `created_by` or Similar Audit Field
**Severity:** 🔵 LOW — Minor cleanup

**File:** [`models/match.py` L4](file:///c:/Users/REDTECH/Desktop/PROJECT/CapStone/volleyreel/backend/app/models/match.py#L4)

`import uuid` is used only for the `public_id` default. This is fine but worth noting that `public_id` is not included in any schema (`MatchRead`, `MatchCreate`), so it is generated but never exposed or usable through the API.

---

### 24. Duplicate Mock Data Arrays in `MatchesPage.jsx` and `MatchesCreatePage.jsx`
**Severity:** 🔵 LOW — DRY violation

Both files define identical `initialMatches` arrays. If the data changes in one, it will be out of sync with the other.

---

### 25. No `DELETE` Endpoints Defined on Any Resource
**Severity:** 🔵 LOW — Incomplete CRUD

None of the route files (`matches.py`, `teams.py`, `players.py`, `tournaments.py`, `events.py`) define a `DELETE` method. The frontend has delete UI (e.g., `DeleteConfirmModal.jsx` exists in components) but there is no corresponding API endpoint.

---

## 📋 Summary Table

| # | Error | Severity | File(s) |
|---|---|---|---|
| 1 | Wrong PK name in `.filter()` (all GET by ID) | 🔴 CRITICAL | all route files |
| 2 | Schema–Model field mismatch (all resources) | 🔴 CRITICAL | all schema files |
| 3 | `bcrypt` not in requirements | 🔴 CRITICAL | `requirements.txt`, `security.py` |
| 4 | `PyJWT` (`jwt`) not in requirements | 🔴 CRITICAL | `requirements.txt` |
| 5 | `create_tournament` missing `user_id` (NOT NULL fail) | 🟠 HIGH | `routes/tournaments.py` |
| 6 | Analytics endpoint returns hardcoded zeros | 🟠 HIGH | `routes/analytics.py` |
| 7 | No user scoping on list endpoints (data leak) | 🟠 HIGH | all list routes |
| 8 | Team name uniqueness check is global not per-user | 🟠 HIGH | `routes/teams.py` |
| 9 | `apiClient.js` mock tokens go to real backend | 🟠 HIGH | `apiClient.js`, `LoginForm.jsx` |
| 10 | `tokenUrl` wrong path in OAuth2 scheme | 🟠 HIGH | `routes/dependencies.py` |
| 11 | Insecure default `secret_key = "change-me"` | 🟡 MEDIUM | `config.py` |
| 12 | `console.log` leaks JWT token | 🟡 MEDIUM | `AuthContext.jsx` |
| 13 | Models missing `updated_at` column | 🟡 MEDIUM | all model files |
| 14 | Forgot password UI with no backend endpoint | 🟡 MEDIUM | `ForgotPasswordPage.jsx` |
| 15 | `alert()` used in admin dashboard | 🟡 MEDIUM | `AdminDashboardPage.jsx` |
| 16 | `psycopg2-binary` unnecessary for SQLite | 🟡 MEDIUM | `requirements.txt` |
| 17 | `python-dotenv` redundant with pydantic-settings | 🟡 MEDIUM | `requirements.txt` |
| 18 | `alembic` listed but no migrations configured | 🟡 MEDIUM | `requirements.txt` |
| 19 | Frontend never calls backend API (localStorage only) | 🟡 MEDIUM | all page components |
| 20 | `SettingsIcon` used before defined | 🔵 LOW | `Sidebar.jsx` |
| 21 | `SIDEBAR_STORAGE_KEY` unused dead code | 🔵 LOW | `AppLayout.jsx` |
| 22 | `public_id` generated but never in schema | 🔵 LOW | `models/match.py` |
| 23 | Duplicate mock data arrays | 🔵 LOW | `MatchesPage.jsx`, `MatchesCreatePage.jsx` |
| 24 | No DELETE endpoints on any resource | 🔵 LOW | all route files |

---

## ✅ What Is Working Correctly

- **Auth flow architecture** — JWT token generation logic in `security.py` is correct
- **CORS configuration** — correctly allows both localhost ports 3000 and 5173
- **SQLAlchemy relationships** — `back_populates` pairs are correctly defined across all models  
- **Cascade deletes** — `ondelete="CASCADE"` and `cascade="all, delete-orphan"` are correctly set
- **Pydantic v2 compatibility** — `model_config = SettingsConfigDict(...)` correctly used
- **`from_attributes = True`** — set on all Read schemas (ORM mode for Pydantic v2)
- **Database session management** — `get_db()` uses `try/finally` pattern correctly
- **`lifespan` pattern** — uses the correct FastAPI `asynccontextmanager` pattern (not deprecated `startup` event)
- **Frontend routing** — React Router v6 nested routes are correctly structured
- **AuthContext** — self-healing localStorage parse with try/catch is solid
- **NotificationsContext** — `useMemo` for `unreadCount` is correctly implemented
- **Mobile sidebar** — auto-close on route change via `useEffect + location.pathname` is correct
- **Vite config** — port 3000 matches CORS allowed origins in backend
