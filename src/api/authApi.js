import api from "./api";

export const loginApi = async ({ username, password }) => {
    const response = await api.post(
        "/auth/signin",
        { username, password },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};

export const refreshTokenApi = async (refreshToken) => {
    const response = await api.post(
        "/auth/refresh",
        { refreshToken },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};

export const registerApi = async ({ username, email, password, role = null }) => {
    const response = await api.post(
        "/auth/signup",
        { username, email, password, role },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};

export const addUserAddressApi = async (address, token) => {
    const response = await api.post("/auth/user/addresses", address, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    return response.data;
};
