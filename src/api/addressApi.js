import api from "./api";

export const getProvincesApi = async () => {
    const response = await api.get("/public/provinces");
    return response.data;
};

export const getWardsByProvinceApi = async (provinceId) => {
    const response = await api.get(`/public/${provinceId}/wards`);
    return response.data;
};
