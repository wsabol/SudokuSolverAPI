import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { Sudoku, parseBoardString } from "../src/sudoku";
import { validateBoard } from "../src/validate";

const BOARD =
    "000010080302607000070000003080070500004000600003050010200000050000705108060040000";

interface SolveCase {
    title: string;
    board: string;
    result: string;
}

const solveCases = JSON.parse(
    readFileSync(new URL("./test-cases.json", import.meta.url), "utf8")
) as SolveCase[];

describe("Sudoku solver", () => {
    it("parses board string", () => {
        const board = parseBoardString(BOARD);
        expect(board).toHaveLength(9);
        expect(board[0]).toHaveLength(9);
    });

    it("solves known puzzle", () => {
        const sudoku = new Sudoku(BOARD);
        const status = sudoku.solve();
        expect(status).toBe("Unique Solution");
        const flat = sudoku.toJSONBoard().flat();
        expect(flat.includes(0)).toBe(false);
    });

    it("returns next move for hint", () => {
        const sudoku = new Sudoku(BOARD);
        const move = sudoku.getNextMove();
        expect(move).not.toBeNull();
        expect(move?.row).toBeGreaterThanOrEqual(0);
        expect(move?.col).toBeGreaterThanOrEqual(0);
        expect(move?.value).toBeGreaterThanOrEqual(1);
    });

    it.each(solveCases)('matches expected status for "$title"', ({ board, result }) => {
        const sudoku = new Sudoku(board);
        expect(sudoku.solve()).toBe(result);
    });
});

describe("Validation", () => {
    it("flags duplicates with structured reasons", () => {
        const invalidBoard =
            "110010080302607000070000003080070500004000600003050010200000050000705108060040000";
        const result = validateBoard(parseBoardString(invalidBoard));
        expect(result.valid).toBe(false);
        expect(result.reasons.some((r) => r.type === "duplicate_in_row")).toBe(true);
    });
});
