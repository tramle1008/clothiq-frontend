import api from "./api";

export const getBannersApi = async (placement) => {
    const response = await api.get("/banners", { params: placement ? { placement } : {} });
    return response.data;
};

export const createBannerApi = async (payload) => (await api.post("/banners", payload)).data;
export const updateBannerApi = async (id, payload) => (await api.put(`/banners/${id}`, payload)).data;
export const deleteBannerApi = async (id) => api.delete(`/banners/${id}`);

export const resolveBannerImage = (imageUrl) => {
    if (!imageUrl) return "";
    if (/^(https?:)?\/\//i.test(imageUrl) || imageUrl.startsWith("data:")) return imageUrl;
    const base = import.meta.env.VITE_BACK_END_URL || "";
    return `${base.replace(/\/$/, "")}/${imageUrl.replace(/^\//, "")}`;
};
