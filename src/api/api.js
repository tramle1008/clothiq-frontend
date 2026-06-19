// .../api/.../api.js
import axios from "axios";
import { getAuthToken, getRefreshToken, persistAuthSession, buildAuthSession } from "../utils/auth";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_URL}/api`,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    })
    
    isRefreshing = false;
    failedQueue = [];
};

api.interceptors.request.use((config) => {
    const token = getAuthToken();

    if (token && !config.headers?.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                const response = await axios.post(
                    `${import.meta.env.VITE_BACK_END_URL}/api/auth/refresh`,
                    { refreshToken },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                const accessToken =
                    response.data?.accessToken ||
                    response.data?.accesstoken ||
                    response.data?.access_token ||
                    response.data?.token;
                const newRefreshToken =
                    response.data?.refreshToken ||
                    response.data?.refreshtoken ||
                    response.data?.refresh_token ||
                    refreshToken;

                if (!accessToken) {
                    throw new Error("Refresh endpoint did not return an access token");
                }

                const auth = buildAuthSession(accessToken, newRefreshToken);
                persistAuthSession(auth);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                processQueue(null, accessToken);

                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                // Xóa auth và redirect tới login
                localStorage.removeItem("auth");
                window.location.href = "/login";
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
