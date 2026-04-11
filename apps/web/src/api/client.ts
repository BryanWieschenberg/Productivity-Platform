import { config } from "@/config";

type RequestOptions = {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    captchaToken?: string;
    headers?: Record<string, string>;
};

export class ApiError extends Error {
    status: number;
    detail: string;

    constructor(status: number, detail: string) {
        super(detail);
        this.status = status;
        this.detail = detail;
    }
}

export async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, captchaToken, headers = {} } = options;

    const finalHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
    };

    if (captchaToken) finalHeaders["X-Captcha-Token"] = captchaToken;

    const response = await fetch(`${config.apiUrl}/api/${path}`, {
        method,
        credentials: "include",
        headers: finalHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) return undefined as T;

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 429) {
            throw new ApiError(
                429,
                "You are performing this action too quickly. Please wait a moment and try again.",
            );
        }
        const detail = (data as { detail?: string }).detail ?? response.statusText;
        throw new ApiError(response.status, detail);
    }

    return data as T;
}
