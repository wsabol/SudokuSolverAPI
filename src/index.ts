import { authorize, unauthorizedResponse, type Env } from "./auth";
import { solveRequest, hintRequest, validateRequest } from "./routes";

function jsonNotFound(): Response {
    return Response.json({ error: "Not found" }, { status: 404 });
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
            return solveRequest(request);
        }

        if (url.pathname === "/hint") {
            return hintRequest(request);
        }

        if (url.pathname === "/validate") {
            return validateRequest(request);
        }

        return jsonNotFound();
    },
} satisfies ExportedHandler<Env>;
