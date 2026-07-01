import api from "./api";
import { getAuthToken } from "../utils/auth";

export const getCartApi = async () => {
    const token = getAuthToken();

    const { data } = await api.get("/auth/carts/user/cart", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return data;
};

export const updateCartQuantityApi = async (productId, quantity) => {
    const token = getAuthToken();

    const { data } = await api.put(
        `/auth/cart/${productId}/quantity`,
        { quantity },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return data;
};
