import { apiFetch } from "./apiClient";
import { deleteCookie, setCookie } from "./cookieManagement";

export const logOut = async (userId: string) => {
    try {
        await apiFetch<null>('logout', { method: 'POST', body: JSON.stringify({ userId }) }, false);
        deleteCookie('user');
        deleteCookie('accessToken');
        deleteCookie('refreshTokenExpiry');
        window.location.replace("/");
    } catch (error) { }
}