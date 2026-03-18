import { describe, expect, it } from "vitest";
import Sudoku from "../src/index";

const BOARD =
    "000010080302607000070000003080070500004000600003050010200000050000705108060040000";

describe("Node module API", () => {
    it("solves board", () => {
        const result = Sudoku.solve(BOARD);
        expect(result.status).toBe("Unique Solution");
        expect(result.board.flat().includes(0)).toBe(false);
    });

    it("returns hint", () => {
        const result = Sudoku.hint(BOARD);
        expect(result.status).toBe("In progress");
        expect(result.move).not.toBeNull();
        expect(result.message).toMatch(/^place \d+ in row \d+ column \d+$/);
    });

    it("returns complete status for solved board", () => {
        const completedBoard =
            "974236158638591742125487936316754289742918563589362417867125394253649871491873625";
        const result = Sudoku.hint(completedBoard);
        expect(result.status).toBe("Complete");
        expect(result.move).toBeNull();
        expect(result.message).toBe("No more moves");
    });

    it("returns invalid status for unsolvable hint board", () => {
        const unsolvableBoard =
            "110010080302607000070000003080070500004000600003050010200000050000705108060040000";
        const result = Sudoku.hint(unsolvableBoard);
        expect(result.status).toBe("Invalid");
        expect(result.move).toBeNull();
        expect(result.message).toBe('Invalid Puzzle ("no solution")');
    });

    it("returns validation reasons for duplicate values", () => {
        const invalidBoard =
            "110010080302607000070000003080070500004000600003050010200000050000705108060040000";
        const result = Sudoku.validate(invalidBoard);
        expect(result.valid).toBe(false);
        expect(result.reasons.some((r) => r.type === "duplicate_in_row")).toBe(true);
    });

    it("returns invalid length reason for short board strings", () => {
        const result = Sudoku.validate("123");
        expect(result.valid).toBe(false);
        expect(result.reasons.some((r) => r.type === "invalid_board_length")).toBe(true);
    });

    it("returns invalid characters reason for malformed board strings", () => {
        const malformed =
            "00001008030260700007000000308007050000400060000305001020000005000070510806004000x";
        const result = Sudoku.validate(malformed);
        expect(result.valid).toBe(false);
        expect(result.reasons.some((r) => r.type === "invalid_board_characters")).toBe(true);
    });
});
