import { apiFetch } from "./apiClient";
import { deleteCookie } from "./cookieManagement";

export const logOut = async () => {
    try {
        await apiFetch<null>('logout', { method: 'POST' });
    } catch (error) {
        console.error('Server-side logout failed:', error);
    } finally {
        deleteCookie('user');
        deleteCookie('accessToken');
        deleteCookie('refreshTokenExpiry');
        window.location.replace("/");
    }
}