# Acceptance Criteria

## Seat Hold and Booking Flow

- A signed-in user can hold one or more seats for a showtime.
- A held seat is written to both Redis and the `seat_locks` table.
- A seat already booked by another booking cannot be held again.
- A seat already held by another active session cannot be held again.
- Releasing a hold removes the seat from both Redis and the `seat_locks` table.
- Creating a booking consumes the held seats and clears the related hold state.
- If Redis hold creation fails after DB lock creation, the DB lock is rolled back.

## Test Coverage

- The hold-and-book flow is covered by an automated Spring Boot integration test.
- The integration test runs against isolated MySQL and Redis containers.
- The test verifies that hold state is present before booking and cleared after booking.
- The test verifies that the `seat_locks` row is present before booking and removed after booking.

## Operational Expectations

- Temporary dev-only authentication helpers are not part of the permanent codebase.
- Schema updates for locking behavior live in `backend/database/Finaldb.sql`.
- The project builds successfully with the integration tests enabled.