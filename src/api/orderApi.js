import api from "./api";
import { getAuthToken } from "../utils/auth";

export const getOrdersApi = async () => {
    const { data } = await api.get("orders/user");
    return data;
};

export const getUserOrdersApi = async ({
    page = 0,
    size = 2,
    sortBy = "orderId",
    sortDir = "desc",
}) => {
    const { data } = await api.get("orders/user", {
        params: {
            page,
            size,
            sortBy,
            sortDir,
        },
    });

    return data;
};

export const getAdminOrdersApi = async (queryString) => {
    const { data } = await api.get(`/admin/orders?${queryString}`);
    return data;
};

export const getStats = async () => {
    const token = getAuthToken();

    const { data } = await api.get("/admin/stats", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return data;
};

export const getRevenueChart = async ({ fromDate, toDate, groupBy }) => {
    const token = getAuthToken();

    const { data } = await api.get("/admin/revenue/chart", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            fromDate,
            toDate,
            groupBy,
        },
    });

    return data;
};
