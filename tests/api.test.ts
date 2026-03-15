import { describe, expect, it } from "vitest";
import worker from "../src/index";
import type { ApiResponse } from "../src/response";

const BOARD =
    "000010080302607000070000003080070500004000600003050010200000050000705108060040000";

const AUTH_HEADER = { Authorization: "Bearer test-token" };

async function json<T extends object>(res: Response): Promise<ApiResponse<T>> {
    return res.json() as Promise<ApiResponse<T>>;
}

describe("Worker API", () => {
    it("returns 401 without token", async () => {
        const req = new Request(`https://example.com/solve?board=${BOARD}`);
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(401);
        const payload = await json(res);
        expect(payload.code).toBe(401);
        expect(payload.message).toBe("Unauthorized");
    });

    it("solves board", async () => {
        const req = new Request(`https://example.com/solve?board=${BOARD}`, {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(200);
        const payload = await json<{ board: number[][] }>(res);
        expect(payload.code).toBe(200);
        expect(payload.message).toBe("Unique Solution");
        expect(payload.data.board.flat().includes(0)).toBe(false);
    });

    it("returns hint", async () => {
        const req = new Request(`https://example.com/hint?board=${BOARD}`, {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(200);
        const payload = await json<{ status: string; move: { row: number; col: number; value: number } | null; board: number[][] }>(res);
        expect(payload.code).toBe(200);
        expect(payload.data.move).not.toBeNull();
        expect(payload.message).toMatch(/^place \d+ in row \d+ column \d+$/);
    });

    it("returns validation reasons for invalid board", async () => {
        const invalidBoard =
            "110010080302607000070000003080070500004000600003050010200000050000705108060040000";
        const req = new Request(`https://example.com/validate?board=${invalidBoard}`, {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(200);
        const payload = await json<{ valid: boolean; reasons: Array<{ type: string }> }>(res);
        expect(payload.code).toBe(200);
        expect(payload.data.valid).toBe(false);
        expect(payload.data.reasons.some((r) => r.type === "duplicate_in_row")).toBe(true);
    });

    it("returns 405 for non-GET requests", async () => {
        const req = new Request(`https://example.com/solve?board=${BOARD}`, {
            method: "POST",
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(405);
        const payload = await json(res);
        expect(payload.code).toBe(405);
        expect(payload.message).toBe("Method not allowed");
    });

    it("returns 404 for unknown endpoint", async () => {
        const req = new Request("https://example.com/unknown", {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(404);
        const payload = await json(res);
        expect(payload.code).toBe(404);
        expect(payload.message).toBe("Not found");
    });

    it("returns 400 for missing board on solve", async () => {
        const req = new Request("https://example.com/solve", {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(400);
        const payload = await json(res);
        expect(payload.code).toBe(400);
        expect(payload.message).toBe("Missing board parameter");
    });

    it("returns 400 for invalid board characters on solve", async () => {
        const invalidCharsBoard =
            "00001008030260700007000000308007050000400060000305001020000005000070510806004000x";
        const req = new Request(`https://example.com/solve?board=${invalidCharsBoard}`, {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(400);
        const payload = await json(res);
        expect(payload.code).toBe(400);
        expect(payload.message).toContain("Invalid board format");
    });

    it("returns invalid length reason from validate endpoint", async () => {
        const req = new Request("https://example.com/validate?board=123", {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(200);
        const payload = await json<{ valid: boolean; reasons: Array<{ type: string }> }>(res);
        expect(payload.code).toBe(200);
        expect(payload.data.valid).toBe(false);
        expect(payload.data.reasons.some((r) => r.type === "invalid_board_length")).toBe(true);
    });

    it("returns 400 for short board on solve", async () => {
        const req = new Request("https://example.com/solve?board=123", {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(400);
        const payload = await json(res);
        expect(payload.code).toBe(400);
    });

    it("returns 400 for invalid board characters on hint", async () => {
        const invalidCharsBoard =
            "00001008030260700007000000308007050000400060000305001020000005000070510806004000x";
        const req = new Request(`https://example.com/hint?board=${invalidCharsBoard}`, {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(400);
        const payload = await json(res);
        expect(payload.code).toBe(400);
        expect(payload.message).toContain("Invalid board format");
    });

    it("returns 400 for missing board on validate", async () => {
        const req = new Request("https://example.com/validate", {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(400);
        const payload = await json(res);
        expect(payload.code).toBe(400);
        expect(payload.message).toBe("Missing board parameter");
    });

    it("returns move:null and complete status for a solved board on hint", async () => {
        const completedBoard =
            "974236158638591742125487936316754289742918563589362417867125394253649871491873625";
        const req = new Request(`https://example.com/hint?board=${completedBoard}`, {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(200);
        const payload = await json<{ status: string; move: null; board: number[][] }>(res);
        expect(payload.code).toBe(200);
        expect(payload.data.move).toBeNull();
        expect(payload.data.status).toBe("Complete");
        expect(payload.message).toBe("No more moves");
    });

    it("returns 400 for unsolvable board on hint", async () => {
        const unsolvableBoard =
            "110010080302607000070000003080070500004000600003050010200000050000705108060040000";
        const req = new Request(`https://example.com/hint?board=${unsolvableBoard}`, {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(400);
        const payload = await json(res);
        expect(payload.code).toBe(400);
    });

    it("returns invalid characters reason from validate endpoint", async () => {
        const invalidCharsBoard =
            "00001008030260700007000000308007050000400060000305001020000005000070510806004000x";
        const req = new Request(`https://example.com/validate?board=${invalidCharsBoard}`, {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(200);
        const payload = await json<{ valid: boolean; reasons: Array<{ type: string }> }>(res);
        expect(payload.code).toBe(200);
        expect(payload.data.valid).toBe(false);
        expect(payload.data.reasons.some((r) => r.type === "invalid_board_characters")).toBe(true);
    });
});
