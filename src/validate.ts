export type ValidationReasonType =
    | "duplicate_in_row"
    | "duplicate_in_column"
    | "duplicate_in_box"
    | "invalid_value"
    | "invalid_board_length"
    | "invalid_board_characters"
    | "empty_cell_no_candidates";

export interface ValidationReason {
    type: ValidationReasonType;
    detail: string;
    row?: number;
    col?: number;
    box?: number;
    value?: number;
}

export interface ValidationResult {
    isValid: boolean;
    message: string;
    reasons: ValidationReason[];
}

export function pushUniqueReason(reasons: ValidationReason[], reason: ValidationReason): void {
    const found = reasons.some(
        (r) =>
            r.type === reason.type &&
            r.row === reason.row &&
            r.col === reason.col &&
            r.box === reason.box &&
            r.value === reason.value
    );
    if (!found) {
        reasons.push(reason);
    }
}
