import type { AccessToken } from "@/types/Tokens"
import { deleteCookie, getCookie, setCookie } from "./cookieManagement";
import type { User } from "@/types/User";

export async function apiFetch<T>(endpoint: string, options?: RequestInit, useAuthentication: boolean = true): Promise<T> {

    const headers = new Headers(options?.headers)
    if (!(options?.method?.toUpperCase() === 'GET' || options?.method === undefined)) {
        if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
    }

    if (!useAuthentication) {

        var response = await fetch(
            `${import.meta.env.VITE_USER_MANAGEMENT_API_URL_BASE}/${endpoint}`,
            {
                ...options,
                headers: headers
            })
            .then(async (response) => {
                if (!response.ok) {
                    if (response.status === 400) {
                        var errorResponse = await response.json() as Array<{ code: string, description: string }>;
                        var errorMessage = errorResponse.map((error) => `${error.description}`).join('\n');
                        throw new Error(errorMessage);
                    }
                    throw new Error(response.statusText)
                }
                var responseJson = await response.json();
                return responseJson as Promise<T>;
            });

        return response;

    }

    var accessToken = getCookie<AccessToken>('accessToken');
    if (!accessToken) {
        throw new Error('No access token found, user is not authenticated');
    }

    const refreshTokenExpiry = getCookie<string>('refreshTokenExpiry');
    if (refreshTokenExpiry && new Date(refreshTokenExpiry) < new Date()) {
        deleteCookie('user');
        deleteCookie('accessToken');
        deleteCookie('refreshTokenExpiry');
        alert('Your session has expired, you are about to be logged out :(');
        window.location.replace("/");
        throw new Error('Session has expired, please log in again');
    }

    if (accessToken?.exp && new Date(accessToken.exp) < new Date()) {
        console.log("refreshing access token...");
        var refreshResponse = await fetch(`${import.meta.env.VITE_USER_MANAGEMENT_API_URL_BASE}/refresh`, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
            })
        })

        if (!(await refreshResponse.ok)) {
            throw new Error('Failed to refresh access token');
        }
        var refreshResponseJson = await refreshResponse.json() as AccessToken;
        setCookie('accessToken', refreshResponseJson);
        setCookie('refreshTokenExpiry', new Date(Date.now() + 24 * 60 * 60 * 1000));
        headers.set('Authorization', `Bearer ${refreshResponseJson.token}`);
    }
    else {
        headers.set('Authorization', `Bearer ${accessToken?.token}`)
    }

    var response = await fetch(
        `${import.meta.env.VITE_USER_MANAGEMENT_API_URL_BASE}/${endpoint}`,
        {
            ...options,
            headers: headers
        })
        .then(async (response) => {
            if (!response.ok) {
                if (response.status === 400) {
                    var errorResponse = await response.json() as Array<{ code: string, description: string }>;
                    var errorMessage = errorResponse.map((error) => `${error.description}`).join('\n');
                    throw new Error(errorMessage);
                }
                throw new Error(response.statusText)
            }
            var responseJson = await response.json();
            return responseJson as Promise<T>;
        });

    return response;
}