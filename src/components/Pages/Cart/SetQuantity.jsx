import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../../../api/api";
import { updateCartQuantityApi } from "../../../api/cartApi";
import { getAuthToken } from "../../../utils/auth";

const SetQuantity = ({ productId, quantity, onUpdate, onQuantityChange }) => {
    const [currentQty, setCurrentQty] = useState(Number(quantity || 1));
    const [inputQty, setInputQty] = useState(String(quantity || 1));
    const [maxStock, setMaxStock] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const nextQty = Number(quantity || 1);
        setCurrentQty(nextQty);
        setInputQty(String(nextQty));
    }, [quantity]);

    useEffect(() => {
        let isMounted = true;

        const fetchStock = async () => {
            try {
                const response = await api.get(`/products/${productId}`);
                if (isMounted) {
                    setMaxStock(Number(response.data?.quantity ?? 0));
                }
            } catch (error) {
                if (isMounted) {
                    setMaxStock(null);
                }
            }
        };

        if (productId) {
            fetchStock();
        }

        return () => {
            isMounted = false;
        };
    }, [productId]);

    const submitQuantity = async (rawValue) => {
        const token = getAuthToken();

        if (!token) {
            toast.error("Ban can dang nhap!");
            return;
        }

        const parsedQty = Number(rawValue);

        if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
            toast.error("So luong phai la so nguyen lon hon 0.");
            setInputQty(String(currentQty));
            return;
        }

        if (maxStock !== null && parsedQty > maxStock) {
            toast.error(`So luong khong duoc vuot qua ton kho hien co (${maxStock}).`);
            setInputQty(String(currentQty));
            return;
        }

        try {
            setIsSubmitting(true);
            const cart = await updateCartQuantityApi(productId, parsedQty);
            const updatedQty = cart.products.find((product) => product.productId === productId)?.quantity ?? parsedQty;

            setCurrentQty(updatedQty);
            setInputQty(String(updatedQty));
            onQuantityChange?.(updatedQty);
            onUpdate?.();
            toast.success("Da cap nhat so luong san pham.");
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                "Khong the cap nhat so luong!";
            toast.error(String(message));
            setInputQty(String(currentQty));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQtyIncrease = () => {
        const nextQty = currentQty + 1;
        if (maxStock !== null && nextQty > maxStock) {
            toast.error(`So luong khong duoc vuot qua ton kho hien co (${maxStock}).`);
            return;
        }

        setInputQty(String(nextQty));
        submitQuantity(nextQty);
    };

    const handleQtyDecrease = () => {
        const nextQty = currentQty - 1;
        if (nextQty <= 0) {
            toast.error("So luong phai lon hon 0.");
            return;
        }

        setInputQty(String(nextQty));
        submitQuantity(nextQty);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={handleQtyDecrease}
                className="rounded-md border px-3 py-1 disabled:opacity-50"
                disabled={isSubmitting || currentQty <= 1}
            >
                -
            </button>

            <input
                type="number"
                min="1"
                max={maxStock ?? undefined}
                value={inputQty}
                onChange={(event) => setInputQty(event.target.value)}
                onBlur={() => submitQuantity(inputQty)}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        submitQuantity(inputQty);
                    }
                }}
                disabled={isSubmitting}
                className="w-16 rounded-md border border-slate-300 px-2 py-1 text-center outline-none focus:border-emerald-500 disabled:bg-slate-100"
            />

            <button
                type="button"
                onClick={handleQtyIncrease}
                className="rounded-md border px-3 py-1 disabled:opacity-50"
                disabled={isSubmitting || (maxStock !== null && currentQty >= maxStock)}
            >
                +
            </button>
        </div>
    );
};

export default SetQuantity;
