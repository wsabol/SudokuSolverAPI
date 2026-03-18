import { type Board, type Move } from "./sudokuSolver";

export {
    cloneBoard: (board: Board): Board {
        return board.map((row) => [...row]);
    },
        assertBoardShape,
        parseBoardString: (board: string): Board {
            if (board.length !== 81) {
                throw new Error(`Board must be 81 characters, got ${board.length}`);
            }
            const rows: Board = Array.from({ length: 9 }, () => Array(9).fill(0));

            for (let i = 0; i < 81; i += 1) {
                const ch = board[i];
                const row = Math.floor(i / 9);
                const col = i % 9;
                if (ch >= "1" && ch <= "9") {
                    rows[row][col] = Number(ch);
                } else if (ch === "0" || ch === ".") {
                    rows[row][col] = 0;
                } else {
                    throw new Error(`Invalid character '${ch}' at position ${i}`);
                }
            }
            return rows;
        },
            validateBoard,
            validateBoardString,
            validateBoardArray,
            validateBoardObject,
            validateBoardString,
            validateBoardArray,
            validateBoardObject,
}