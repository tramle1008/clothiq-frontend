import { toast } from "react-hot-toast";
import api from "../../../api/api";
import { getAuthToken } from "../../../utils/auth";

const AddProductToCart = async (productId, quantity = 1) => {
    try {
        const token = getAuthToken();

        if (!token) {
            toast.error("Vui lòng đăng nhập trước khi thêm vào giỏ hàng!");
            return null;
        }

        const response = await api.post(
            `/auth/cart/products/${productId}/quantity/${quantity}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        toast.success("Đã thêm sản phẩm vào giỏ hàng!");
        return response.data;
    } catch (err) {
        const errorMsg = err?.response?.data?.message || "Sản phẩm đã có sẵn trong giỏ hàng!";
        toast.error(errorMsg);
        console.error("Lỗi khi thêm vào giỏ:", err);
        return null;
    }
};

export default AddProductToCart;
