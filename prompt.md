# Prompt: Guitar Lick Library — Full-Stack Web Application

Build a complete, fully working **Guitar Lick Library** web application. This is a single-user app (no authentication) for cataloging and searching guitar licks by various criteria. The app must compile, run, and be fully functional out of the box via `docker-compose up`.

---

## Tech Stack

| Layer       | Technology                                                         |
|-------------|--------------------------------------------------------------------|
| Backend     | Java 25, Spring Boot 4.x (latest stable), Maven                    |
| Frontend    | Angular 21 (latest stable), PrimeNG (latest compatible), PrimeFlex |
| Database    | PostgreSQL 18.1                                                    |
| Containers  | Docker & docker-compose                                            |
| Testing     | JUnit + Mockito (backend), Jasmine + Karma (frontend)              |

---

## Project Structure

```
licksvault/           # current folder
├── backend/          # Spring Boot Maven project
├── frontend/         # Angular 19 project
├── docker-compose.yml
└── README.md
```

---

## Data Model — `Lick` Entity

| Field         | Type          | Constraints / Notes                                                                                                                                                                                           |
|---------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `id`          | Long (auto)   | Primary key, auto-generated                                                                                                                                                                                   |
| `name`        | String        | Required, max 255 chars. The title of the lick (e.g. "Minor Blues Turnaround")                                                                                                                                |
| `bpm`         | Integer       | Required, range 20–300                                                                                                                                                                                        |
| `root_note`   | String (enum) | Required. One of the 12 musical keys: C, C#, D, D#, E, F, F#, G, G#, A, A#, B. Store as a String backed by a Java enum. Allow both sharp and flat display (e.g. C# / Db) but store as the sharp variant only. |
| `mode`        | String (enum) | Required. One of the 7 modes of the major scale : 'ionian','dorian','phrygian','lydian','mixolydian','aeolian','locrian'. Store as a String backed by a Java enum.                                            |
| `lengthBars`  | Integer       | Required, range 1–64. Length of the lick in bars/measures.                                                                                                                                                    |
| `genre`       | String (enum) | Required. Predefined list: Blues, Jazz, Rock, Metal, Funk, Country, Fusion, Classical, Pop, Other. Java enum.                                                                                                 |
| `description` | String (text) | Optional, max 2000 chars. Free-text notes about the lick.                                                                                                                                                     |
| `tablature`   | String (text) | Tablature of the lick, stored in alphatex format.                                                                                                                                                             |
| `createdAt`   | LocalDateTime | Auto-set on creation, not editable.                                                                                                                                                                           |
| `updatedAt`   | LocalDateTime | Auto-set on creation and on every update.                                                                                                                                                                     |

Use Flyway for database migrations. Provide an initial migration that creates the `licks` table and seeds it with **5 example licks** spanning different keys, BPMs, genres, and lengths so the app is not empty on first launch.
Use the alphatex format to store the tablature diagram in the seeded licks. The alphatex format is a simple text-based format that describes the tablature diagram of a lick. It is easy to read and write, and it is also easy to parse and generate. It is a good choice for storing tablature diagrams in a database.

---

## Backend — Spring Boot REST API

### Endpoints

| Method | Path              | Description                                             |
|--------|-------------------|---------------------------------------------------------|
| GET    | `/api/licks`      | List / search licks (with filters, sorting, pagination) |
| GET    | `/api/licks/{id}` | Get a single lick by ID                                 |
| POST   | `/api/licks`      | Create a new lick                                       |
| PUT    | `/api/licks/{id}` | Update an existing lick                                 |
| DELETE | `/api/licks/{id}` | Delete a lick                                           |

### Search & Filtering (`GET /api/licks`)

All filter parameters are **optional** and combined with AND logic:

| Param       | Type    | Behavior                                            |
|-------------|---------|-----------------------------------------------------|
| `name`      | String  | Case-insensitive partial match (LIKE %value%)       |
| `bpmMin`    | Integer | BPM >= value                                        |
| `bpmMax`    | Integer | BPM <= value                                        |
| `key`       | String  | Exact match                                         |
| `mode`      | String  | Exact match                                         |
| `lengthMin` | Integer | lengthBars >= value                                 |
| `lengthMax` | Integer | lengthBars <= value                                 |
| `genre`     | String  | Exact match                                         |

The key and mode filters can't be used alone. They work in pairs.

### Sorting & Pagination

- Support sorting by any field via `sortBy` (default: `createdAt`) and `sortDir` (`asc` / `desc`, default: `desc`).
- Paginate via `page` (0-indexed, default 0) and `size` (default 20).
- Return a response wrapper: `{ content: [...], totalElements, totalPages, currentPage, pageSize }`.

### Validation & Error Handling

- Use Jakarta Bean Validation annotations on the DTO.
- Return `400` with a structured error body listing field errors on validation failure.
- Return `404` with a clear message when a lick is not found.
- Global exception handler (`@RestControllerAdvice`).

### Architecture

- Controller → Service → Repository (Spring Data JPA).
- Use DTOs for request/response (do not expose the entity directly).
- Use MapStruct for mapping between Entity ↔ DTO.
- Configure CORS to allow the Angular dev server (`http://localhost:4200`).

### Unit Tests (Backend)

- **Service layer**: test each CRUD operation + search with filters using Mockito for the repository.
- **Controller layer**: test each endpoint using `@WebMvcTest` with MockMvc.
- Tests must pass with `mvn test`.

---

## Frontend — Angular 21 + PrimeNG

### Pages / Routes

| Route             | Component           | Description                                       |
|-------------------|---------------------|---------------------------------------------------|
| `/`               | LickListComponent   | Main page — table/list of licks with search panel |
| `/licks/new`      | LickFormComponent   | Create a new lick                                 |
| `/licks/:id`      | LickDetailComponent | View lick details                                 |
| `/licks/:id/edit` | LickFormComponent   | Edit an existing lick (reuse form component)      |

### Lick List Page (`/`)

- **Search/filter panel** (collapsible sidebar or top panel):
  - Text input for name search.
  - Range slider or two number inputs for BPM range.
  - Dropdown (PrimeNG `p-dropdown`) for key selection (with "All keys" option).
  - Range slider or two number inputs for length range (bars).
  - Dropdown for genre (with "All genres" option).
  - "Search" button and "Reset filters" button.
- **Results table** (PrimeNG `p-table`):
  - Columns: Name, BPM, Key, Length (bars), Genre, Created date.
  - Sortable columns (client-triggered server sort).
  - Paginator built into the table.
  - Row click navigates to detail page.
  - Action buttons per row: Edit (pencil icon), Delete (trash icon with confirmation dialog).
- **"+ New Lick" button** in the header or above the table, navigates to `/licks/new`.

### Lick Form Page (`/licks/new` and `/licks/:id/edit`)

- PrimeNG form components:
  - `p-inputText` for name.
  - `p-inputNumber` for BPM (min 20, max 300, spinner).
  - `p-dropdown` for key.
  - `p-inputNumber` for length in bars (min 1, max 64, spinner).
  - `p-dropdown` for genre.
  - `p-textarea` for description.
  - `p-textarea` for the alphatex tablature diagram.
- Client-side validation matching backend rules, with inline error messages.
- "Save" and "Cancel" buttons.
- On successful save, navigate back to the list with a PrimeNG `p-toast` success message.

### Lick Detail Page (`/licks/:id`)

- Display all fields in a clean read-only card layout.
- Display the tablature diagram of the lick using alphaTab, last version. alphaTab is sensitive to bundling because it spawns Web Workers and Audio Worklets. There is documentation on the alphatab website to implement it using Angular.
- "Edit" and "Delete" buttons (delete with confirmation dialog via `p-confirmDialog`).
- "Back to list" link.

### Services & Architecture

- `LickService` — handles all HTTP calls to the backend API.
- Use Angular's `HttpClient` with a configurable base URL (environment file).
- Use Angular reactive forms with validators.
- Proper error handling: show PrimeNG `p-toast` messages on API errors.

### Theming & Responsiveness

- **Light mode by default** using a PrimeNG dark theme (e.g. `lara-dark-indigo` or `aura-dark`). Provide a light/dark toggle button in the top navigation bar that switches the PrimeNG theme at runtime and persists the choice in `localStorage`.
- **Mobile-responsive**: the layout must work on mobile screens. Use PrimeFlex grid for responsive layout. The search panel should collapse on small screens. The table should be scrollable horizontally or switch to a card/list view on mobile.
- Add a simple top navbar with the app title ("Guitar Lick Library") and the dark/light toggle.

### Unit Tests (Frontend)

- Test `LickService` — mock `HttpClient`, verify correct URLs and params.
- Test `LickListComponent` — verify filters render, table renders rows from mock data.
- Test `LickFormComponent` — verify form validation (required fields, ranges).
- Tests must pass with `ng test --watch=false --browsers=ChromeHeadless`.

---

## Docker & docker-compose

Provide a `docker-compose.yml` that starts **three services**:

1. **db** — PostgreSQL 18.1, with a named volume for persistence. Pre-configure database name, user, password via environment variables.
2. **backend** — Multi-stage Dockerfile: build with Maven, run with a slim JDK 25 image. Expose port `8080`. Depends on `db`. Application properties should read DB connection from environment variables set in docker-compose.
3. **frontend** — Multi-stage Dockerfile: build with Node 24 + `ng build`, serve with Nginx. Expose port `4200`. Nginx config should proxy `/api/**` requests to the backend service.

Running `docker-compose up --build` from the project root should build everything and make the app available at `http://localhost:4200` with zero manual setup.

---

## README.md

Include a README with:

- Project description.
- Prerequisites (Docker & docker-compose).
- Quick start: `docker-compose up --build`, then open `http://localhost:4200`.
- Local development instructions (running backend and frontend separately for development).
- Tech stack summary.
- Project structure overview.

---

## Important Implementation Notes

- **Do not use authentication or authorization** — this is a single-user local app.
- Ensure all enum values (keys, genres) are defined in **both** backend and frontend and kept consistent.
- The Angular app should use `environment.ts` / `environment.prod.ts` for the API base URL (`http://localhost:8080/api` for dev, `/api` for production behind Nginx proxy).
- Use the latest stable versions of all dependencies at the time of generation.
- All code should compile and all tests should pass. Verify this before considering the task complete.
