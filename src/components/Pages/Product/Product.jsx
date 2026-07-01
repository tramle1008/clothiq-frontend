import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchCategories } from "../../../store/actions";
import PaginationRounded from "../../PaginationRounded";
import ReusableFilter from "../../ReusableFilter";
import useProductFilter from "../../useProductFilter";
import ProductCard from "./ProductCard";

const Product = () => {
    const dispatch = useDispatch();
    const { products, pagination, categories } = useSelector((state) => state.products);

    useEffect(() => {
        dispatch(fetchCategories("pageNumber=0&pageSize=1000"));
    }, [dispatch]);

    useProductFilter();

    const categoryFilterList = (categories || []).map((category) => ({
        value: category.categoryID,
        label: category.categoryName,
    }));

    return (
        <section>
            <div className="w-full bg-[#92a695] px-4 py-4 sm:px-8 lg:px-14">
                <ReusableFilter
                    filterLabel="Category"
                    filterParam="categoryId"
                    filterList={categoryFilterList}
                    searchEnabled={true}
                    sortEnabled={true}
                />

                <section className="pt-10">
                    {products?.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {products.map((item) => (
                                    <ProductCard key={item.productId} {...item} />
                                ))}
                            </div>

                            <div className="flex justify-center px-10">
                                <PaginationRounded
                                    numberofPage={pagination?.totalPages}
                                    totalProducts={pagination?.totalElements}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-white/70 px-6 text-center text-slate-700 shadow-sm">
                            Khong tim thay san pham phu hop.
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
};

export default Product;
