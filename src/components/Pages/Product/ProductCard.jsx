import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

import AddProductToCart from "../Cart/AddProductToCart";
import { useDispatch } from "react-redux";
import { fetchCart } from "../../../store/actions";


const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} vnđ`;

const ProductCard = ({
    productId,
    productCode,
    productName,
    image,
    description,
    quantity,
    salePrice,
    costPrice,
    discount,
    categoryId,
    status,
}) => {
    const navigate = useNavigate();
    const isAvailable = Number(quantity) > 0;

    const dispatch = useDispatch();

    const discountPercent = Number(discount || 0);
    const finalPrice = useMemo(
        () => Number(salePrice || 0) * (1 - discountPercent / 100),
        [salePrice, discountPercent]
    );

    const handleProductDetail = () => {
        navigate(`/products/${productId}`);
    };

    const addToCartHandle = async (event) => {
        event.stopPropagation();
        const result = await AddProductToCart(productId, 1);

        if (result) {
            dispatch(fetchCart());
        }
    };

    return (
        <div
            onClick={handleProductDetail}
            className="cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
            <div className="aspect-square w-full overflow-hidden bg-slate-100">
                <img
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    src={image}
                    alt={productName}
                />
            </div>

            <div className="space-y-2 p-4">
                <div className="min-h-[48px]">
                    <h2 className="line-clamp-2 text-lg font-semibold text-slate-800">{productName}</h2>
                </div>

                <p className="min-h-[40px] text-sm text-slate-500 line-clamp-2">{description}</p>

                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                        {discountPercent > 0 ? (
                            <>
                                <span className="inline-flex w-fit rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                                    Giảm {discountPercent}%
                                </span>
                                <span className="mt-2 text-xs text-slate-400 line-through">
                                    {formatCurrency(salePrice)}
                                </span>
                                <span className="text-lg font-bold text-emerald-700">
                                    {formatCurrency(finalPrice)}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-slate-800">
                                {formatCurrency(salePrice)}
                            </span>
                        )}
                    </div>

                    <button
                        className={`flex w-32 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors duration-300 ${isAvailable ? "bg-emerald-700 hover:bg-emerald-900" : "bg-slate-400"
                            }`}
                        disabled={!isAvailable}
                        onClick={addToCartHandle}
                    >
                        <FaShoppingCart className="mr-2" />
                        {isAvailable ? "Thêm" : "Hết hàng"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
