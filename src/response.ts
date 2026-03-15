export interface ApiResponse<T extends object = object> {
    code: number;
    data: T;
    message: string;
}

export function apiResponse<T extends object>(
    status: number,
    data: T,
    message: string
): Response {
    const body: ApiResponse<T> = { code: status, data, message };
    return Response.json(body, { status });
}
