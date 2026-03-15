import { authorize, unauthorizedResponse, type Env } from "./auth";
import { solveRequest, hintRequest, validateRequest } from "./routes";
import { apiResponse } from "./response";

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (!authorize(request, env)) {
            return unauthorizedResponse();
        }

        if (request.method !== "GET") {
            return apiResponse(405, {}, "Method not allowed");
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

        return apiResponse(404, {}, "Not found");
    },
} satisfies ExportedHandler<Env>;
