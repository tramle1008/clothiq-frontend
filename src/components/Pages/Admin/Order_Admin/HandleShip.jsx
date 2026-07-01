import toast from "react-hot-toast";
import api from "../../../../api/api";
import { getAuthToken } from "../../../../utils/auth";

const HandleShip = ({ orderId, onSuccess }) => {
    const handleShip = async () => {
        try {
            const token = getAuthToken();

            if (!token) {
                toast.error("Phiên đăng nhập đã hết hạn");
                return;
            }

            await api.put(
                `/admin/orders/${orderId}/ship`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Đơn hàng đã được chuyển sang trạng thái 'Đang giao'");
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Lỗi xác nhận giao hàng:", error);
            toast.error("Không thể xác nhận giao hàng!");
        }
    };

    return (
        <button
            onClick={handleShip}
            className="rounded bg-[#506553] px-3 py-1 text-white transition hover:bg-[#92a695]"
        >
            Xác nhận giao hàng
        </button>
    );
};

export default HandleShip;
