import type { Algorithm } from "./sudokuSolver.js";

export type MoveStatus = "Complete" | "In progress" | "Invalid";

export interface PlacementMove {
    type: "placement";
    row: number;
    col: number;
    value: number;
    algorithm: Algorithm;
    message: string;
    reasoning: string;
}

export interface EliminationMove {
    type: "elimination";
    eliminations: Array<{ row: number; col: number; value: number }>;
    algorithm: Algorithm;
    message: string;
    reasoning: string;
}

export type Move = PlacementMove | EliminationMove;