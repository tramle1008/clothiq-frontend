import { useEffect, useMemo, useState } from "react";

import DeleteItem from "./DeleteItem";
import SetQuantity from "./SetQuantity";

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} đ`;

const ItemContent = ({
    productId,
    productName,
    image,
    description,
    quantity,
    salePrice,
    discount,
    onRemove,
    onUpdate,
}) => {
    const [currentQuantity, setCurrentQuantity] = useState(quantity);
    const discountPercent = Number(discount || 0);

    useEffect(() => {
        setCurrentQuantity(quantity);
    }, [quantity]);

    const basePrice = Number(salePrice || 0);
    const finalPrice = useMemo(
        () => basePrice * (1 - discountPercent / 100),
        [basePrice, discountPercent]
    );

    const handleQuantityChange = (newQty) => {
        setCurrentQuantity(newQty);
    };

    const handleRemoveFromCart = () => {
        DeleteItem(productId, () => {
            if (typeof onRemove === "function") {
                onRemove();
            }
        });
    };

    const imageSrc = image?.startsWith("http")
        ? image
        : `${import.meta.env.VITE_BACK_END_URL}/images/${image}`;

    return (
        <div className="grid grid-cols-6 items-center border-b border-slate-200 py-4 text-sm md:text-base">
            <div className="col-span-2 flex items-center gap-4">
                <img
                    src={imageSrc}
                    alt={productName}
                    className="h-26 w-26 rounded-md object-cover"
                />
                <div>
                    <h4 className="font-semibold">{productName}</h4>
                    <p className="text-xs text-gray-500 md:text-sm">{description}</p>
                </div>
            </div>

            <div className="text-center">
                {discountPercent > 0 ? (
                    <div className="flex flex-col items-center">
                        <span className="font-semibold text-emerald-700">
                            {formatCurrency(finalPrice)}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                            {formatCurrency(basePrice)}
                        </span>

                    </div>
                ) : (
                    <span className="font-semibold text-emerald-700">
                        {formatCurrency(basePrice)}
                    </span>
                )}
            </div>

            <div className="flex justify-center">
                <SetQuantity
                    productId={productId}
                    quantity={quantity}
                    onUpdate={onUpdate}
                    onQuantityChange={handleQuantityChange}
                />
            </div>

            <div className="text-center font-semibold text-gray-700">
                {formatCurrency(Number(currentQuantity) * finalPrice)}
            </div>

            <div className="flex justify-center">
                <button
                    className="flex items-center rounded-md border border-rose-600 px-4 py-1 font-bold transition-colors duration-200 hover:bg-red-50"
                    onClick={handleRemoveFromCart}
                >
                    Xóa
                </button>
            </div>
        </div>
    );
};

export default ItemContent;
