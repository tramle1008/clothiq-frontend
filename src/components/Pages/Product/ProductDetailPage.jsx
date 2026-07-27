import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaShoppingCart } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

import api from "../../../api/api";
import { updateCartQuantityApi } from "../../../api/cartApi";
import { fetchCart } from "../../../store/actions";
import { getAuthToken } from "../../../utils/auth";
import AddProductToCart from "../Cart/AddProductToCart";
import ProductReview from "./Review/ProductReview";

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} vnd`;

const ProductDetailPage = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const { products: cartProducts } = useSelector((state) => state.cart);
    const [product, setProduct] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [quantityInput, setQuantityInput] = useState("1");
    const [loading, setLoading] = useState(true);
    const [submittingCart, setSubmittingCart] = useState(false);
    const [error, setError] = useState("");
    const numericProductId = Number(productId);
    const cartItem = cartProducts.find((item) => Number(item.productId) === numericProductId);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                setError("");
                const { data } = await api.get(`/products/${productId}`);
                setProduct(data);
            } catch (requestError) {
                console.error(requestError);
                setError("Khong the tai thong tin san pham.");
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [productId]);

    useEffect(() => {
        if (getAuthToken()) {
            dispatch(fetchCart());
        }
    }, [dispatch]);

    useEffect(() => {
        const nextQuantity = Number(cartItem?.quantity || 1);
        setSelectedQuantity(nextQuantity);
        setQuantityInput(String(nextQuantity));
    }, [cartItem?.quantity]);

    const discountPercent = Number(product?.discount || 0);
    const finalPrice = useMemo(
        () => Number(product?.salePrice || 0) * (1 - discountPercent / 100),
        [product?.salePrice, discountPercent]
    );
    const isAvailable = Number(product?.quantity || 0) > 0 && product?.status === "ACTIVE";
    const maxStock = Number(product?.quantity || 0);

    const normalizeQuantity = (rawValue, fallback = selectedQuantity) => {
        const parsedQty = Number(rawValue);

        if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
            toast.error("Số lượng phải là số nguyên lớn hơn 0.");
            setQuantityInput(String(fallback));
            return null;
        }

        if (parsedQty > maxStock) {
            toast.error(`Số lượng không được vượt quá tồn kho hiện có (${maxStock}).`);
            setQuantityInput(String(fallback));
            return null;
        }

        return parsedQty;
    };

    const commitQuantity = (rawValue) => {
        const parsedQty = normalizeQuantity(rawValue);

        if (!parsedQty) {
            return;
        }

        setSelectedQuantity(parsedQty);
        setQuantityInput(String(parsedQty));
    };

    const handleQuantityDecrease = () => {
        const nextQuantity = selectedQuantity - 1;

        if (nextQuantity <= 0) {
            toast.error("Số lượng phải lớn hơn 0.");
            return;
        }

        setSelectedQuantity(nextQuantity);
        setQuantityInput(String(nextQuantity));
    };

    const handleQuantityIncrease = () => {
        const nextQuantity = selectedQuantity + 1;

        if (nextQuantity > maxStock) {
            toast.error(`Số lượng không được vượt quá tồn kho hiện có (${maxStock}).`);
            return;
        }

        setSelectedQuantity(nextQuantity);
        setQuantityInput(String(nextQuantity));
    };

    const handleAddToCart = async () => {
        const quantity = normalizeQuantity(quantityInput);

        if (!quantity) {
            return;
        }

        try {
            setSubmittingCart(true);

            if (cartItem) {
                await updateCartQuantityApi(product.productId, quantity);
                toast.success("Cập nhật thành công");
            } else {
                const addedCart = await AddProductToCart(product.productId, quantity);

                if (!addedCart) {
                    return;
                }

                if (addedCart) {
                    dispatch(fetchCart());
                }
            }

            setSelectedQuantity(quantity);
            setQuantityInput(String(quantity));
            dispatch(fetchCart());
        } catch (requestError) {
            const message =
                requestError?.response?.data?.message ||
                requestError?.response?.data ||
                "Không thể cập nhật giỏ hàng.";
            toast.error(String(message));
        } finally {
            setSubmittingCart(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center px-4 text-slate-600">
                Đang tải thông tin sản phẩm...
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="mx-auto flex min-h-[420px] max-w-3xl flex-col items-center justify-center px-4 text-center">
                <p className="text-lg font-semibold text-slate-800">{error || "Khong tim thay san pham."}</p>
                <Link
                    to="/products"
                    className="mt-4 rounded-lg bg-gray-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                    Quay lại
                </Link>
            </div>
        );
    }

    return (
        <section className="bg-slate-50 px-4 py-10 sm:px-8 ">
            <div className="mx-auto max-w-screen-2xl">
                <Link to="/products" className="text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-200 transition bg-gray-100 px-3 py-1 rounded-lg">
                    <FaArrowLeft className="inline" />  Quay lại
                </Link>
                <div className="mt-6 grid gap-8 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
                    <div className="overflow-hidden rounded-xl bg-slate-100">
                        <img
                            src={product.image}
                            alt={product.productName}
                            className="mx-auto w-full max-w-[500px] h-[550px] object-cover"
                        />
                    </div>

                    <div className="flex flex-col">


                        <h1 className="mt-4 text-3xl font-bold text-slate-900">{product.productName}</h1>

                        <p className="mt-4 text-base leading-7 text-slate-600">{product.description}</p>

                        <div className="mt-6 border-t border-slate-200 pt-6">
                            {discountPercent > 0 ? (
                                <div>
                                    <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
                                        Giảm {discountPercent}%
                                    </span>
                                    <p className="mt-3 text-sm text-slate-400 line-through">
                                        {formatCurrency(product.salePrice)}
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-700">
                                        {formatCurrency(finalPrice)}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-3xl font-bold text-slate-900">
                                    {formatCurrency(product.salePrice)}
                                </p>
                            )}
                        </div>

                        <div className="mt-5 space-y-2 text-sm text-slate-600">
                            <p>
                                <span className="font-semibold text-slate-800">Số lượng:</span> {product.quantity}
                            </p>

                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleQuantityDecrease}
                                    disabled={!isAvailable || submittingCart || selectedQuantity <= 1}
                                    className="h-11 w-11 rounded-lg border border-slate-300 text-lg font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max={maxStock || undefined}
                                    value={quantityInput}
                                    onChange={(event) => setQuantityInput(event.target.value)}
                                    onBlur={() => commitQuantity(quantityInput)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            commitQuantity(quantityInput);
                                        }
                                    }}
                                    disabled={!isAvailable || submittingCart}
                                    className="h-11 w-20 rounded-lg border border-slate-300 px-3 text-center text-sm font-semibold outline-none transition focus:border-emerald-500 disabled:bg-slate-100"
                                />
                                <button
                                    type="button"
                                    onClick={handleQuantityIncrease}
                                    disabled={!isAvailable || submittingCart || selectedQuantity >= maxStock}
                                    className="h-11 w-11 rounded-lg border border-slate-300 text-lg font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    +
                                </button>

                            </div>

                            <button
                                type="button"
                                disabled={!isAvailable || submittingCart}
                                onClick={handleAddToCart}
                                className={`flex h-11 w-full items-center justify-center rounded-lg px-5 text-sm font-semibold text-white transition sm:w-fit ${isAvailable ? "bg-emerald-700 hover:bg-emerald-900" : "cursor-not-allowed bg-slate-400"}`}
                            >
                                <FaShoppingCart className="mr-2" />
                                {submittingCart
                                    ? "Đang xử lý..."
                                    : cartItem
                                        ? "Cập nhật giỏ hàng"
                                        : isAvailable
                                            ? "Thêm vào giỏ hàng"
                                            : "Hết hàng"}
                            </button>
                        </div>

                        {cartItem && (
                            <p className="mt-3 text-sm text-orange-400">
                                Có sẳn trong giỏ hàng {cartItem.quantity}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <ProductReview
                    productId={product.productId}
                />
            </div>
        </section>
    );
};

export default ProductDetailPage;
