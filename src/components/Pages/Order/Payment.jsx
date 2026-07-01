import { useCallback, useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../../../api/api";
import { getAuthToken } from "../../../utils/auth";

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

const Payment = ({ onNext, onBack, addressId, paymentMethod }) => {
    const [qrUrl, setQrUrl] = useState(null);
    const [orderCode, setOrderCode] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const { products } = useSelector((state) => state.cart);
    const totalPrice = getCalculatedTotalPrice(products);
    const token = getAuthToken();

    const handlePlaceOrder = async () => {
        if (!token) {
            toast.error("Bạn cần đăng nhập");
            return;
        }

        if (paymentMethod === "COD") {
            try {
                await api.post(
                    "/payments/COD",
                    { addressId },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                onNext();
            } catch (err) {
                toast.error("Lỗi xác nhận đơn hàng COD");
                console.error(err);
            }

            return;
        }

        if (paymentMethod === "QR") {
            try {
                const response = await api.post(
                    "/payments/qr",
                    { addressId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setQrUrl(response.data.qrUrl);
                setOrderCode(response.data.orderCode);
                setCheckingStatus(true);
            } catch (err) {
                console.error(" lỗi tạo QR:", err);
                toast.error("Không thể tạo QR thanh toán");
            }
        }
    };

    const checkPaymentStatus = useCallback(async () => {
        if (!orderCode || !token) {
            return;
        }

        try {
            const response = await api.get(`/orders/status/${orderCode}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data === "PAID") {
                toast.success("Đã xác nhận thanh toán thành công");
                setCheckingStatus(false);
                onNext();
            }
        } catch (err) {
            console.error(" lỗi kiểm tra trạng thái:", err);
        }
    }, [orderCode, onNext, token]);

    useEffect(() => {
        if (!orderCode || !checkingStatus) {
            return undefined;
        }

        const interval = setInterval(() => {
            checkPaymentStatus();
        }, 7000);

        const timeout = setTimeout(() => {
            toast.error("Hết thời gian chờ thanh toán. Vui lòng thử lại.");
            setCheckingStatus(false);
        }, 300000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [orderCode, checkingStatus, checkPaymentStatus]);

    if (!token) {
        return null;
    }

    return (
        <div className="flex justify-center text-center">
            <Box>
                {!qrUrl && (
                    <>
                        <Typography variant="h6" gutterBottom>Don Hang</Typography>
                        <div className="grid grid-cols-4 bg-[#7f9c8f] p-1.5 mb-0.5">
                            <p>Hình ảnh</p>
                            <p>Tên</p>
                            <p>Giá</p>
                            <p>Số lượng</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {products.map((item) => (
                                <div key={item.productId} className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-4 items-center">
                                        <img
                                            src={`${import.meta.env.VITE_BACK_END_URL}/images/${item.image}`}
                                            alt={item.productName}
                                            className="w-28 h-28 object-cover rounded-md"
                                        />
                                        <div>
                                            <h4 className="font-semibold">{item.productName}</h4>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{getDiscountedUnitPrice(item).toLocaleString()}d</h4>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{item.quantity?.toLocaleString()}</h4>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="text-xl font-semibold">
                                Tổng cộng: <span className="text-red-500">{Number(totalPrice).toLocaleString()} VND</span>
                            </div>
                        </div>
                    </>
                )}

                {paymentMethod === "COD" && (
                    <div className="mt-4 mb-10">
                        <Typography>Bạn sẽ thanh toán khi nhận hàng.</Typography>
                        <div className="flex gap-4 justify-center mt-6">
                            <button
                                onClick={onBack}
                                className="text-rose-700 border border-rose-600 rounded-md bg-red-100 hover:bg-rose-600 hover:text-white transition-colors duration-200 px-6 py-2 font-semibold"
                            >
                                Quay lại
                            </button>

                            <button
                                onClick={handlePlaceOrder}
                                className="text-blue-700 border border-blue-600 rounded-md bg-blue-100 hover:bg-blue-600 hover:text-white transition-colors duration-200 px-6 py-2 font-semibold"
                            >
                                Xác nhận đơn hàng
                            </button>
                        </div>
                    </div>
                )}

                {paymentMethod === "QR" && (
                    <div className="mt-6 mb-10">
                        {!qrUrl ? (
                            <div className="flex flex-col items-center gap-4">
                                <Typography>Nhận để tạo mã QR thanh toán:</Typography>
                                <div className="flex gap-4 justify-center mt-6">
                                    <button
                                        onClick={onBack}
                                        className="text-rose-700 border border-rose-600 rounded-md bg-red-100 hover:bg-rose-600 hover:text-white transition-colors duration-200 px-6 py-2 font-semibold"
                                    >
                                        Quay lại
                                    </button>
                                    <Button variant="outlined" onClick={handlePlaceOrder}>
                                        Tạo QR
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Typography variant="h6">Quét mã QR bằng app ngân hàng:</Typography>
                                <div className="flex">
                                    <img src={qrUrl} alt="QR thanh toan" className="mt-3 w-64 mx-auto" />

                                    <div className="text-left w-fit mx-auto mt-4">
                                        <p><strong>Ngân hàng:</strong> VietinBank</p>
                                        <p><strong>Chủ tài khoản:</strong> LE BICH TRAM</p>
                                        <p><strong>Số tài khoản:</strong> 108876614804</p>
                                        <p><strong> Nội dung chuyển khoản:</strong> SEVQR{orderCode}</p>
                                        <p><strong>Tổng số tiền:</strong> {Number(totalPrice).toLocaleString()} VND</p>
                                    </div>
                                </div>

                                <Typography variant="body2" sx={{ mt: 2, color: "gray" }}>
                                    Vui lòng thanh toán trong 5 phút.
                                </Typography>
                                <Typography variant="body2" sx={{ color: "gray" }}>
                                    Đang kiểm tra thanh toán tự động...
                                </Typography>
                            </div>
                        )}
                    </div>
                )}

                {!checkingStatus && qrUrl && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        Thanh toán chưa thành công sau 5 phút. Vui lòng thử lại hoặc đặt lại đơn hàng.
                    </Typography>
                )}
            </Box>
        </div>
    );
};

export default Payment;
