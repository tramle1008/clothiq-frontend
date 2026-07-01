import toast from "react-hot-toast";
import api from "../../../api/api";
import { getAuthToken } from "../../../utils/auth";

const DeleteItem = async (productId, onSuccess) => {
    const token = getAuthToken();

    if (!token) {
        toast.error("Bạn cần đăng nhập để thao tác với giỏ hàng");
        return;
    }

    try {
        const response = await api.delete(`/auth/user/cart/product/${productId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        toast.success(response.data || "Đã xóa sản phẩm khỏi giỏ hàng");

        if (onSuccess) {
            onSuccess();
        }
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        toast.error("Xóa sản phẩm thất bại");
    }
};

export default DeleteItem;
