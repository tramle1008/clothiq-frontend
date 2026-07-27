import api from "./api";

// thêm sản phẩm mới vào danh mục
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

// lấy danh sách danh mục
export const getCategoriesApi = async (queryString = "pageNumber=0&pageSize=10") => {
    const endpoint = queryString
        ? `/categories?${queryString}`
        : "/categories";

    const { data } = await api.get(endpoint);
    return data;
};

export const searchCategoriesApi = async (keyword = "") => {
    const endpoint = keyword.trim()
        ? `/categories/search?keyword=${encodeURIComponent(keyword.trim())}`
        : "/categories/search";

    const { data } = await api.get(endpoint);
    return data;
};

export const deleteProductApi = async (productId) => {
    const { data } = await api.delete(`/admin/products/${productId}`);
    return data;
}


export const addCategoryApi = async ({ category, token }) => {
    const { data } = await api.post("/categories/categories", category);
    return data;
};

export const updateCategoryApi = async ({ categoryId, category, token }) => {
    const { data } = await api.put(`/categories/${categoryId}`, category);
    return data;
};

export const deleteCategoryApi = async (categoryId, token) => {
    const { data } = await api.delete(`/categories/${categoryId}`);
    return data;
};
