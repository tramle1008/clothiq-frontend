import api from "./api";

export const addProductApi = async ({ categoryId, product, imageFile, token }) => {
    const formData = new FormData();
    formData.append("product", JSON.stringify(product));

    if (imageFile) {
        formData.append("image", imageFile);
    }

    const { data } = await api.post(
        `/admin/categories/${categoryId}/product`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return data;
};

export const getProductsApi = async (queryString = "") => {
    const endpoint = queryString
        ? `/public/products?${queryString}`
        : "/public/products";

    const { data } = await api.get(endpoint);
    return data;
};

export const searchProductsApi = async (queryString = "") => {
    const endpoint = queryString
        ? `/public/products/search?${queryString}`
        : "/public/products/search";

    const { data } = await api.get(endpoint);
    return data;
};

export const getAllProductsApi = async () => {
    const { data } = await api.get("/public/products");
    return data;
};

export const getCategoriesApi = async (queryString = "pageNumber=0&pageSize=10") => {
    const endpoint = queryString
        ? `/public/categories?${queryString}`
        : "/public/categories";

    const { data } = await api.get(endpoint);
    return data;
};

export const searchCategoriesApi = async (keyword = "") => {
    const endpoint = keyword.trim()
        ? `/public/categories/search?keyword=${encodeURIComponent(keyword.trim())}`
        : "/public/categories/search";

    const { data } = await api.get(endpoint);
    return data;
};
