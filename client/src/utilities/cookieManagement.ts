export const setCookie = (cookieName: string, cookieValue: any): void => {
    document.cookie = cookieName + "=" + JSON.stringify(cookieValue) + ";path=/";
}

export const getCookie = <T>(cookieName: string): T | null => {
    let name = cookieName + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookiesArray = decodedCookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
        let c = cookiesArray[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            try {
                return JSON.parse(c.substring(name.length, c.length));
            } catch {
                return null;
            }
        }
    }
    return null;
}

export const deleteCookie = (cookieName: string): void => {
    document.cookie = cookieName + "=; expires=" + new Date().toUTCString() + ";";
}