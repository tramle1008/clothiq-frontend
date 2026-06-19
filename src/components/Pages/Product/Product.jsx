import { FaExclamationTriangle } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchCategories } from "../../../store/actions";
import useProductFilter from "../../useProductFilter";
import PaginationRounded from "../../PaginationRounded";
import ReusableFilter from "../../ReusableFilter";
import ProductCard from "./ProductCard";

const Product = () => {
    const dispatch = useDispatch();
    const { isLoading, errorMessage } = useSelector((state) => state.products);
    const { products, pagination } = useSelector((state) => state.products);
    const categories = useSelector((state) => state.products.categories) || [];
    useEffect(() => {
        dispatch(fetchCategories("pageNumber=0&pageSize=1000"));
    }, [dispatch]);

    const categoryFilterList = categories
        .map((cat) => ({
            value: cat.categoryID,
            label: cat.categoryName,
        }));
    useProductFilter();
    return (
        <section>


            <div className="w-full lg:px-14 sm:px-8 px-4 py-4 bg-[#92a695]">

                <ReusableFilter
                    filterLabel="Category"
                    filterParam="categoryId"
                    filterList={categoryFilterList}
                    searchEnabled={true}
                    sortEnabled={true}
                />
                {isLoading ? (
                    <p>is loading ... </p>
                ) : errorMessage ? (
                    <div className='flex justify-center items-center h-[200px]'>
                        <FaExclamationTriangle className="text-slate-800 text-3xl mr-2" />
                        <span className="text-slate-800">{errorMessage}</span>
                    </div>
                ) : (

                    <section className="pt-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {products && products.map((item) => (
                                <ProductCard key={item.productId} {...item} />
                            ))}
                        </div>
                        <div className="flex justify-center px-10 ">
                            <PaginationRounded
                                numberofPage={pagination?.totalPages}
                                totalProducts={pagination?.totalElements}
                            />

                        </div>
                    </section>

                )}
            </div>
        </section>
    );
};

export default Product;
