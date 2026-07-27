import { useSearchParams } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { useEffect } from "react";
import { fetchProduct } from "../store/actions";

const useProductFilter = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    useEffect(() => {
        const params = new URLSearchParams();

        const currentPage = (searchParams.get("page")) || "1";
        const sortOrder = searchParams.get("sortOrder") || "asc";
        const categoryId = searchParams.get("categoryId");
        const key = searchParams.get("key");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");

        params.set("pageNumber", (currentPage - 1));
        params.set("sortBy", "productId");
        params.set("sortOrder", sortOrder);

        if (categoryId !== null && categoryId !== "undefined") {
            params.set("categoryId", categoryId);
        }

        if (key) params.set("key", key);
        if (minPrice !== null && minPrice !== "") {
            params.set("minPrice", minPrice);
        }
        if (maxPrice !== null && maxPrice !== "") {
            params.set("maxPrice", maxPrice);
        }

        const queryString = params.toString();

        dispatch(fetchProduct(queryString));
    }, [dispatch, searchParams]);

};

export default useProductFilter;
