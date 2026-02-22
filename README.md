# Guitar Lick Library (LicksVault)

A full-stack web application for cataloging and searching guitar licks.

## Tech Stack

- **Backend**: Java 21, Spring Boot 3.4, Maven, PostgreSQL 18, Flyway, MapStruct, Lombok.
- **Frontend**: Angular 21, PrimeNG, PrimeFlex, alphaTab.
- **Containers**: Docker & docker-compose.

## Prerequisites

- Docker and docker-compose installed.

## Quick Start

1. Clone the repository.
2. From the project root, run:
   ```bash
   docker-compose up --build
   ```
3. Open your browser at `http://localhost:4200`.

The application will be pre-seeded with 5 example licks.

## Local Development

### Backend

- Navigate to `backend/`.
- Ensure you have a PostgreSQL database running.
- Update `src/main/resources/application.properties` with your DB credentials.
- Run:
  ```bash
  mvn spring-boot:run
  ```

### Frontend

- Navigate to `frontend/`.
- Run:
  ```bash
  npm install
  npm start
  ```
- The frontend will be available at `http://localhost:4200`.

## Project Structure

- `backend/`: Spring Boot application.
- `frontend/`: Angular application.
- `docker-compose.yml`: Docker composition of DB, Backend, and Frontend services.
