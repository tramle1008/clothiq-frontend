import toast from "react-hot-toast";
import api from "../../../../api/api";
import { getAuthToken } from "../../../../utils/auth";

const HandleReject = ({ orderId, onSuccess }) => {
    const handleReject = async () => {
        try {
            const token = getAuthToken();

            if (!token) {
                toast.error("Phiên đăng nhập đã hết hạn");
                return;
            }

            await api.put(
                `/orders/${orderId}/reject`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Đơn hàng đã bị từ chối");
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Lỗi xác nhận từ chối", error);
            toast.error("Không thể xác nhận từ chối!");
        }
    };

    return (
        <button
            onClick={handleReject}
            className="rounded bg-red-600 px-3 py-1 text-white transition hover:bg-red-300"
        >
            Từ chối giao hàng
        </button>
    );
};

export default HandleReject;
