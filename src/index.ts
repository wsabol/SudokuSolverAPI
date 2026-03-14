import { authorize, unauthorizedResponse, type Env } from "./auth";
import { Sudoku, parseBoardString } from "./sudoku";
import { validateBoard } from "./validate";

function badRequest(error: string, details?: string): Response {
    return Response.json(
        {
            error,
            ...(details ? { details } : {}),
        },
        { status: 400 }
    );
}

function jsonNotFound(): Response {
    return Response.json({ error: "Not found" }, { status: 404 });
}

function parseBoardFromQuery(request: Request): { board?: string; error?: Response } {
    const board = new URL(request.url).searchParams.get("board");
    if (!board) {
        return { error: badRequest("Missing board parameter") };
    }
    if (board.length !== 81) {
        return { error: badRequest("Board must be 81 characters") };
    }
    return { board };
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (!authorize(request, env)) {
            return unauthorizedResponse();
        }

        if (request.method !== "GET") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const url = new URL(request.url);

        if (url.pathname === "/solve") {
            const parsed = parseBoardFromQuery(request);
            if (parsed.error || !parsed.board) {
                return parsed.error ?? badRequest("Invalid board format");
            }
            let board;
            try {
                board = parseBoardString(parsed.board);
            } catch (err) {
                return badRequest("Invalid board format", (err as Error).message);
            }

            const sudoku = new Sudoku(board);
            const status = sudoku.solve();
            return Response.json({
                status,
                board: sudoku.toJSONBoard(),
            });
        }

        if (url.pathname === "/hint") {
            const parsed = parseBoardFromQuery(request);
            if (parsed.error || !parsed.board) {
                return parsed.error ?? badRequest("Invalid board format");
            }
            let board;
            try {
                board = parseBoardString(parsed.board);
            } catch (err) {
                return badRequest("Invalid board format", (err as Error).message);
            }

            const sudoku = new Sudoku(board);
            if (!sudoku.isValid()) {
                return badRequest('Invalid Puzzle ("no solution")');
            }

            const move = sudoku.getNextMove();
            const message = move
                ? `place ${move.value} in row ${move.row + 1} column ${move.col + 1}`
                : "No more moves";

            if (move) {
                sudoku.setSquareValue(move.row, move.col, move.value);
            }

            return Response.json({
                status: sudoku.isComplete() ? "Complete" : "In progress",
                move,
                message,
                board: sudoku.toJSONBoard(),
            });
        }

        if (url.pathname === "/validate") {
            const board = url.searchParams.get("board");
            if (!board) {
                return badRequest("Missing board parameter");
            }
            if (board.length !== 81) {
                return Response.json({
                    valid: false,
                    message: "Board must be 81 characters",
                    reasons: [
                        {
                            type: "invalid_board_length",
                            detail: `Board must be 81 characters, got ${board.length}`,
                        },
                    ],
                });
            }
            if (!/^[0-9.]{81}$/.test(board)) {
                return Response.json({
                    valid: false,
                    message: "Board contains invalid characters",
                    reasons: [
                        {
                            type: "invalid_board_characters",
                            detail: "Only digits 0-9 and '.' are allowed",
                        },
                    ],
                });
            }
            const result = validateBoard(parseBoardString(board));
            return Response.json(result);
        }

        return jsonNotFound();
    },
} satisfies ExportedHandler<Env>;
