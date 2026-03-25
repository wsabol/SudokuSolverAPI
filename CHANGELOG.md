# Changelog

## Unreleased

### Added

- `PlacementMove` / `EliminationMove`: `message` (same text as `MoveResult.message` for that step) and `reasoning` (one-sentence why the move is valid).
- `src/move.ts`: `Move`, `PlacementMove`, `EliminationMove`, `MoveStatus`.
- `src/boardGeo.ts`: `Board` type alias.
- `SudokuSolver.applyMove(move)`: dispatches placement vs elimination.

### Changed

- `Sudoku.nextMove`: after a valid puzzle, top-level `message` is `move.message` (built in the solver).
- `describe()`: when `isValid === false`, `difficulty` is `null` (not an empty string).
- Elimination `message` for multiple digit values uses `{a/b/c}` in the bracketed set (sorted).
- `Algorithm` includes `"Last Digit"` (placement label when the ninth copy of a digit is forced).
