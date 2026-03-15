# Sudoku Solver API (Cloudflare Worker)

TypeScript REST API for Sudoku solve/hint/validate.

## Endpoints

All endpoints require bearer authentication:

`Authorization: Bearer <token>`

Board format is an 81-character string passed via `?board=` where blanks are `0` or `.`.

All responses use the envelope:

```json
{ "code": <http_status>, "data": <object>, "message": <string> }
```

Errors always have `data: {}` and `message` describing the problem:

```json
{ "code": 400, "data": {}, "message": "Missing board parameter" }
```

### GET `/solve`

Returns the solved board. `message` is the solve status string.

Example:

```bash
curl -H "Authorization: Bearer $TOKEN" \
    "http://127.0.0.1:8787/solve?board=000010080302607000070000003080070500004000600003050010200000050000705108060040000"
```

Response:

```json
{
    "code": 200,
    "data": { "board": [[... 9x9 ...]] },
    "message": "Unique Solution"
}
```

Possible `message` values: `"Unique Solution"`, `"Invalid Puzzle (\"no solution\")"`, `"Invalid Puzzle (\"no unique solution\")"`, `"Invalid Puzzle (\"not enough givens\" / \"multiple solutions\")"`.

### GET `/hint`

Returns the next logical move (if any) and the board after applying it. `message` is the human-readable hint. `move` is `null` when the board is already complete. Row and column in `move` are 0-indexed; `message` uses 1-indexed coordinates.

Response:

```json
{
    "code": 200,
    "data": {
        "status": "In progress",
        "move": { "row": 0, "col": 2, "value": 4 },
        "board": [[... 9x9 ...]]
    },
    "message": "place 4 in row 1 column 3"
}
```

`data.status` is `"Complete"` when no moves remain.

### GET `/validate`

Returns validity and structured reasons for invalid boards. Always responds with HTTP 200; use `data.valid` to check the result.

Response:

```json
{
    "code": 200,
    "data": {
        "valid": false,
        "reasons": [
            { "type": "duplicate_in_row", "detail": "Duplicate value 7 in row 0", "row": 0, "value": 7 }
        ]
    },
    "message": "Duplicate value 7 in row 0"
}
```

Reason types: `duplicate_in_row`, `duplicate_in_column`, `duplicate_in_box`, `invalid_value`, `invalid_board_length`, `invalid_board_characters`, `empty_cell_no_candidates`.

## Local Development

Install dependencies:

```bash
npm install
```

Set token for local dev in `.dev.vars`:

```ini
BEARER_TOKEN=your-dev-token
```

Run:

```bash
npm run dev
```

## Deploy

Set production secret:

```bash
npx wrangler secret put BEARER_TOKEN
```

Deploy worker:

```bash
npm run deploy
```

## GitHub Actions CI/CD

This repository includes a workflow at `.github/workflows/ci-cd.yml`.

- On pull requests: runs unit tests with coverage via `npm run test:coverage`.
- Pull requests fail if overall coverage drops below 80% for lines, functions, branches, or statements.

## External Resources

- CLI Version of this API: [wsabol/SudokuSolver](https://github.com/wsabol/SudokuSolver)