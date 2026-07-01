import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchCart } from "../../../store/actions";
import { decodeJwtPayload, getAuthToken } from "../../../utils/auth";
import ItemContent from "./ItemContent";

const getDiscountedUnitPrice = (item) => {
    const salePrice = Number(item?.salePrice || 0);
    const discount = Number(item?.discount || 0);

    return salePrice * (100 - discount) * 0.01;
};

const getCalculatedTotalPrice = (products = []) =>
    products.reduce((sum, item) => {
        const quantity = Number(item?.quantity || 0);
        return sum + getDiscountedUnitPrice(item) * quantity;
    }, 0);

const Cart = () => {
    const dispatch = useDispatch();
    const { loading, products, error } = useSelector((state) => state.cart);
    const [authMessage, setAuthMessage] = useState("");
    const calculatedTotalPrice = getCalculatedTotalPrice(products);

    useEffect(() => {
        const token = getAuthToken();

        if (!token) {
            setAuthMessage("Vui long dang nhap de xem gio hang.");
            return;
        }

        const payload = decodeJwtPayload(token);
        const isExpired = payload?.exp ? payload.exp * 1000 <= Date.now() : false;

        if (isExpired) {
            setAuthMessage("Phien dang nhap da het han. Vui long dang nhap lai.");
            return;
        }

        setAuthMessage("");
        dispatch(fetchCart());
    }, [dispatch]);

    return (
        <div className="py-10 sm:px-8 lg:px-14">
            <div>
                <div className="mb-12 flex flex-col items-center">
                    <h1 className="flex items-center gap-1.5 text-4xl font-bold text-gray-500">
                        Gio Hang
                    </h1>
                </div>

                <div className="grid grid-cols-6 border-b py-2 text-center text-sm font-semibold md:text-base">
                    <div className="col-span-2 pl-2 text-left">Sản phẩm</div>
                    <div>Giá</div>
                    <div>Số lượng</div>
                    <div>Thành tiền</div>
                    <div>Xóa</div>
                </div>

                {loading ? (
                    <p className="mt-4 text-center">Đang tải...</p>
                ) : authMessage ? (
                    <p className="mt-4 text-center text-amber-600">{authMessage}</p>
                ) : error ? (
                    <p className="mt-4 text-center text-red-500">{error}</p>
                ) : products.length > 0 ? (
                    <>
                        {products.map((item, index) => (
                            <ItemContent
                                key={index}
                                {...item}
                                onUpdate={() => dispatch(fetchCart())}
                                onRemove={() => dispatch(fetchCart())}
                            />
                        ))}
                        <div className="mt-6 text-right">
                            <div className="text-sm text-slate-500">
                                Thành tiền
                            </div>
                            <div className="text-xl font-semibold text-emerald-700">
                                {calculatedTotalPrice.toLocaleString()} VND
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="mt-4 text-center text-gray-400">Giỏ hàng trống.</p>
                )}
            </div>

            <div className="mt-4 flex justify-end">
                <Link to="/checkout">
                    <button
                        disabled={products.length === 0}
                        className={`rounded-lg px-6 py-2 font-semibold shadow-md transition duration-300 ${products.length === 0
                            ? "cursor-not-allowed bg-gray-300 text-gray-500"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                    >
                        Thanh toán
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default Cart;
