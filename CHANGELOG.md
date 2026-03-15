# Changelog

## Unreleased

### Added
- `src/response.ts`: shared `apiResponse<T>()` builder and `ApiResponse<T>` interface enforce the response envelope in one place.
- Validation now detects `empty_cell_no_candidates` for boards with no valid candidate for an empty cell.
- API tests for hint with a completed board (`move: null`) and hint with an unsolvable board (400).
- Validation tests for `empty_cell_no_candidates`, valid board returning no reasons, and duplicate boards not emitting spurious `empty_cell_no_candidates` reasons.

### Changed
- **Breaking**: All responses now use the envelope `{ code, data, message }`.
  - `/solve`: `message` = solve status string; `data` = `{ board }`.
  - `/hint`: `message` = human-readable hint text; `data` = `{ status, move, board }`.
  - `/validate`: `message` = validation summary; `data` = `{ valid, reasons }`.
  - Errors: `data: {}`, `message` = error description.
- `src/auth.ts`: token comparison now uses `crypto.subtle.timingSafeEqual` (Cloudflare Workers) with a constant-time XOR fallback for other environments; rejects empty `BEARER_TOKEN`.
- `src/sudoku.ts`: removed `calcPossibles()` side effect from `isValid()`; `setSquareValue` now manages possibles freshness explicitly. Removed unused `SolveResult` interface and `solveResult()` method.
- `src/routes.ts`: extracted shared `parseBoard()` helper, eliminating duplicated try/catch in `solveRequest` and `hintRequest`; `badRequest` no longer accepts a `details` parameter.
- `src/validate.ts`: removed unreachable `try/catch` around `new Sudoku()`; `empty_cell_no_candidates` check is now skipped when the board already has other validation errors, preventing spurious reasons.
