export interface Env {
    BEARER_TOKEN: string;
}

export function authorize(request: Request, env: Env): boolean {
    const header = request.headers.get("Authorization");
    if (!header) {
        return false;
    }
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
        return false;
    }

    return token === env.BEARER_TOKEN;
}

export function unauthorizedResponse(): Response {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
}
