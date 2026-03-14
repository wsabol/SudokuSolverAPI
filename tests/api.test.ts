import { describe, expect, it } from "vitest";
import worker from "../src/index";

const BOARD =
    "000010080302607000070000003080070500004000600003050010200000050000705108060040000";

const AUTH_HEADER = { Authorization: "Bearer test-token" };

describe("Worker API", () => {
    it("returns 401 without token", async () => {
        const req = new Request(`https://example.com/solve?board=${BOARD}`);
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(401);
    });

    it("solves board", async () => {
        const req = new Request(`https://example.com/solve?board=${BOARD}`, {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(200);
        const payload = (await res.json()) as { status: string; board: number[][] };
        expect(payload.status).toBe("Unique Solution");
        expect(payload.board.flat().includes(0)).toBe(false);
    });

    it("returns hint", async () => {
        const req = new Request(`https://example.com/hint?board=${BOARD}`, {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(200);
        const payload = (await res.json()) as { move: { row: number; col: number; value: number } | null };
        expect(payload.move).not.toBeNull();
    });

    it("returns validation reasons for invalid board", async () => {
        const invalidBoard =
            "110010080302607000070000003080070500004000600003050010200000050000705108060040000";
        const req = new Request(`https://example.com/validate?board=${invalidBoard}`, {
            headers: AUTH_HEADER,
        });
        const res = await worker.fetch(req, { BEARER_TOKEN: "test-token" });
        expect(res.status).toBe(200);
        const payload = (await res.json()) as { valid: boolean; reasons: Array<{ type: string }> };
        expect(payload.valid).toBe(false);
        expect(payload.reasons.some((reason) => reason.type === "duplicate_in_row")).toBe(true);
    });
});
