import { getCartApi } from "../../api/cartApi";

export const fetchCart = () => async (dispatch) => {
    dispatch({ type: "CART_REQUEST" });

    try {
        const data = await getCartApi();

        dispatch({
            type: "CART_SUCCESS",
            payload: data,
        });
    } catch {
        dispatch({
            type: "CART_FAILURE",
            payload: "Khong thay duoc gio hang cua nguoi dung",
        });
    }
};

export const addToCart = (data, qty = 1, toast) =>
    (dispatch, getState) => {
        const { products } = getState().products;

        const getProduct = products.find(
            (item) => item.productId === data.productId
        );

        if (!getProduct) {
            console.warn("Khong tim thay san pham voi ID:", data.productId);
            return;
        }

        const isQuantityExist = getProduct.quantity >= qty;

        if (isQuantityExist) {
            dispatch({
                type: "ADD_CART",
                payload: {
                    ...data,
                    quantity: qty,
                },
            });
            toast.success(`${data?.productName} da duoc them vao gio hang`);
            localStorage.setItem("cartItems", JSON.stringify(getState().cart.cart));
        } else {
            toast.error("San pham hien dang het hang");
        }
    };
