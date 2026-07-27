import api from "./api";

export const getReviewsByProductId = async ({ productId }) => {
    const { data } = await api.get(`/products/${productId}/reviews`);

    return data;
};
