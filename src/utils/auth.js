const normalizeRoles = (...sources) => {
    for (const source of sources) {
        if (Array.isArray(source)) {
            return source.filter(Boolean);
        }

        if (typeof source === "string" && source.trim()) {
            return [source.trim()];
        }
    }

    return [];
};

const normalizeAuthSession = (auth) => {
    if (!auth || typeof auth !== "object") {
        return null;
    }

    const accessToken =
        auth.accessToken ||
        auth.accesstoken ||
        auth.access_token ||
        auth.jwtToken ||
        auth.token ||
        null;
    const refreshToken =
        auth.refreshToken ||
        auth.refreshtoken ||
        auth.refresh_token ||
        auth.refeshToken ||
        null;
    const role = normalizeRoles(auth.role, auth.roles);

    return {
        ...auth,
        accessToken,
        refreshToken,
        role,
    };
};

export const getStoredAuth = () => {
    try {
        const auth = localStorage.getItem("auth");
        return auth ? normalizeAuthSession(JSON.parse(auth)) : null;
    } catch {
        return null;
    }
};

export const getAuthToken = () => getStoredAuth()?.accessToken || null;

export const getRefreshToken = () => getStoredAuth()?.refreshToken || null;

const decodeBase64Url = (value) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");

    return decodeURIComponent(
        atob(padded)
            .split("")
            .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
            .join("")
    );
};

export const decodeJwtPayload = (token) => {
    try {
        const [, payload] = token.split(".");
        if (!payload) {
            return null;
        }

        return JSON.parse(decodeBase64Url(payload));
    } catch {
        return null;
    }
};

export const buildAuthSession = (accessToken, refreshToken = null, profile = {}) => {
    const payload = decodeJwtPayload(accessToken) || {};
    const role = normalizeRoles(
        profile.role,
        profile.roles,
        payload.role,
        payload.roles,
        payload.authorities,
        payload.scope
    );

    return {
        accessToken,
        refreshToken: refreshToken || null,
        id: profile.id ?? payload.id ?? payload.userId ?? null,
        userName: profile.userName ?? payload.userName ?? payload.sub ?? "",
        email: profile.email ?? payload.email ?? "",
        role,
    };
};

export const persistAuthSession = (auth) => {
    localStorage.setItem("auth", JSON.stringify(normalizeAuthSession(auth)));
};

export const clearAuthSession = () => {
    localStorage.removeItem("auth");
};
