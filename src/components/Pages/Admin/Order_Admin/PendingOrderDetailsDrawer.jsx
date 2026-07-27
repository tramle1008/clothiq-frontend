import { Button, Chip, Divider, Drawer, IconButton, Typography } from "@mui/material";
import { FiX } from "react-icons/fi";

const formatCurrency = (value) => `${Number(value || 0).toLocaleString("vi-VN")} VND`;

const formatDate = (value) => {
    if (!value) {
        return "--";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("vi-VN");
};

const buildAddress = (address) =>
    [address?.detail, address?.ward, address?.district, address?.province]
        .filter(Boolean)
        .join(", ") || "--";

const getOrderCodeLabel = (order) => order.code || `#${order.orderId}`;

const getPaymentMethodLabel = (order) =>
    order.paymentMethod || order.payment?.paymentMethod || "Chưa có dữ liệu";

const getCustomerNote = (order) => order.note || "Chưa có dữ liệu";

const getLineTotal = (item) => {
    const orderProductPrice = Number(item?.orderProductPrice || 0);
    const discount = Number(item?.discount || 0);
    const quantity = Number(item?.quantity || 0);

    return orderProductPrice * (100 - discount) * 0.01 * quantity;
};

const getImageSrc = (image) => {
    if (!image) {
        return "";
    }

    if (image.startsWith("http")) {
        return image;
    }

    return `${import.meta.env.VITE_BACK_END_URL}/images/${image}`;
};

const PendingOrderDetailsDrawer = ({
    open,
    order,
    submittingAction,
    onClose,
    onAction,
}) => (
    <Drawer anchor="right" open={open} onClose={onClose}>
        <div className="flex h-full w-[50vw] min-w-[720px] max-w-[980px] flex-col bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Chi tiết đơn hàng
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                        {order ? getOrderCodeLabel(order) : ""}
                    </Typography>
                </div>
                <IconButton onClick={onClose}>
                    <FiX />
                </IconButton>
            </div>

            {order && (
                <>
                    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                        <div className="rounded-md border border-slate-200 p-4">
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                A. Thông tin đơn hàng
                            </Typography>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div><span className="font-semibold">Order ID:</span> {order.orderId}</div>
                                <div><span className="font-semibold">Ngày đặt:</span> {formatDate(order.dateOrder)}</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Trạng thái:</span>
                                    <Chip label={order.deliveryStatus || "--"} size="small" color="warning" variant="outlined" />
                                </div>
                                <div><span className="font-semibold">Ghi chú khách hàng:</span> {getCustomerNote(order)}</div>
                            </div>
                        </div>

                        <div className="rounded-md border border-slate-200 p-4">
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                B. Thông tin khách hàng
                            </Typography>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div><span className="font-semibold">Tên:</span> {order.userName || "--"}</div>
                                <div><span className="font-semibold">SĐT:</span> {order.address?.phoneNumber || "--"}</div>
                                <div><span className="font-semibold">Email:</span> {order.email || "--"}</div>
                                <div><span className="font-semibold">Địa chỉ giao hàng:</span> {buildAddress(order.address)}</div>
                            </div>
                        </div>

                        <div className="rounded-md border border-slate-200 p-4">
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                C. Danh sách sản phẩm - số tiền
                            </Typography>
                            <div className="space-y-3">
                                {(order.orderItemList || []).map((item) => (
                                    <div key={item.orderItemId} className="rounded-md bg-slate-50 p-3">
                                        <div className="flex gap-3">
                                            <img
                                                src={getImageSrc(item.product?.image)}
                                                alt={item.product?.productName || "product"}
                                                className="h-20 w-20 rounded-md object-cover"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-semibold text-slate-900">
                                                    {item.product?.productName || "--"}
                                                </div>
                                                <div className="mt-1 text-sm text-slate-600">
                                                    SL: {item.quantity} | Don gia: {formatCurrency(item.orderProductPrice)}
                                                </div>
                                                <div className="mt-1 text-sm text-slate-600">
                                                    Khuyến mãi: {Number(item.discount || 0)}%
                                                </div>
                                                <div className="mt-2 text-sm font-semibold text-emerald-700">
                                                    Thành tiền: {formatCurrency(getLineTotal(item))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Divider />
                                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                                    <span>Tổng đơn</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border border-slate-200 p-4">
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                D. Thanh toán
                            </Typography>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div><span className="font-semibold">Phương thức:</span> {getPaymentMethodLabel(order)}</div>
                                <div><span className="font-semibold">Tổng thanh toán:</span> {order.payment?.pgName || "--"}</div>
                                <div><span className="font-semibold">Mã giao dịch:</span> {order.payment?.pgPaymentId || "--"}</div>
                                <div><span className="font-semibold">Trạng thái thanh toán:</span> {order.paymentStatus || "--"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 px-6 py-4">
                        <div className="flex gap-3">
                            <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                disabled={submittingAction !== ""}
                                onClick={() => onAction("ship")}
                            >
                                {submittingAction === "ship" ? "Dang xu ly..." : "Xac nhan giao"}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                disabled={submittingAction !== ""}
                                onClick={() => onAction("reject")}
                            >
                                {submittingAction === "reject" ? "Dang xu ly..." : "Tu choi"}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    </Drawer>
);

export default PendingOrderDetailsDrawer;
