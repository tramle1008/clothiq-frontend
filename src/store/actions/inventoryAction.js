import {
    getAllProductsApi,
    getCategoriesApi,
    getProductsApi,
    searchProductsApi,
} from "../../api/inventoryApi";

const buildProductPayload = (data) => ({
    products: data.content,
    pageNumber: data.pageNumber,
    pageSize: data.pageSize,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    lastPage: data.lastPage,
});

const buildCategoryPayload = (data) => ({
    categories: data.content,
    pageNumber: data.pageNumber,
    pageSize: data.pageSize,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    lastPage: data.lastPage,
});

export const fetchProduct = (queryString = "") => async (dispatch) => {
    try {
        const data = await getProductsApi(queryString);

        dispatch({
            type: "FETCH_PRODUCTS",
            payload: buildProductPayload(data),
        });
    } catch (error) {
        console.error("Loi khi fetch san pham:", error);
    }
};

export const fetchAllProduct = () => async (dispatch) => {
    try {
        const data = await getAllProductsApi();

        dispatch({
            type: "FETCH_PRODUCTS",
            payload: buildProductPayload(data),
        });
    } catch (error) {
        console.error("Loi khi fetch tat ca san pham:", error);
    }
};

export const searchProducts = (queryString = "") => async (dispatch) => {
    try {
        const data = await searchProductsApi(queryString);

        dispatch({
            type: "FETCH_PRODUCTS",
            payload: buildProductPayload(data),
        });
    } catch (error) {
        console.error("Loi khi tim kiem san pham:", error);
    }
};

export const fetchCategories = (queryString = "pageNumber=0&pageSize=10") => async (dispatch) => {
    try {
        const data = await getCategoriesApi(queryString);

        dispatch({
            type: "FETCH_CATEGORIES",
            payload: buildCategoryPayload(data),
        });
    } catch (error) {
        console.error("Loi khi fetch category:", error);
    }
};
