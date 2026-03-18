# Sudoku Solver (Node Module)

TypeScript module for Sudoku solve, hint, and validate operations.

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

Build output is written to `dist/`.

## Usage

```ts
import { solve, hint, validate } from "sudoku-solver";

const board =
    "000010080302607000070000003080070500004000600003050010200000050000705108060040000";

const solved = solve(board);
console.log(solved.status); // "Unique Solution"
console.log(solved.board); // number[][]

const next = hint(board);
console.log(next.message); // e.g. "place 4 in row 1 column 3"
console.log(next.move); // { row, col, value } | null

const check = validate(board);
console.log(check.valid); // true/false
console.log(check.reasons); // ValidationReason[]
```

## API

### `solve(boardInput)`

Accepts `string | number[][]`.

Returns:

```ts
{
    status: string;
    board: number[][];
}
```

Possible status values include:
- `"Unique Solution"`
- `"Invalid Puzzle (\"no solution\")"`
- `"Invalid Puzzle (\"no unique solution\")"`
- `"Invalid Puzzle (\"not enough givens\" / \"multiple solutions\")"`

### `hint(boardInput)`

Accepts `string | number[][]`.

Returns:

```ts
{
    status: "Complete" | "In progress" | "Invalid";
    move: { row: number; col: number; value: number } | null;
    board: number[][];
    message: string;
}
```

Notes:
- `move` is `null` when the board is complete or invalid.
- `message` uses 1-indexed row/column phrasing.

### `validate(boardInput)`

Accepts `string | number[][]`.

Returns:

```ts
{
    valid: boolean;
    message: string;
    reasons: ValidationReason[];
}
```

Reason types:
- `duplicate_in_row`
- `duplicate_in_column`
- `duplicate_in_box`
- `invalid_value`
- `invalid_board_length`
- `invalid_board_characters`
- `empty_cell_no_candidates`

## Development

```bash
npm test
npm run typecheck
```