import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaBoxOpen, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaPhoneAlt, FaReceipt, FaRedo, FaTimes } from "react-icons/fa";
import { fetchUserOrders } from "../../../store/actions";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { getAuthToken } from "../../../utils/auth";

const PAGE_SIZE = 4;

const deliveryStatusMap = {
    PENDING: {
        label: "Đang duyệt",
        className: "bg-amber-50 text-amber-700 ring-amber-200",
    },
    SHIPPED: {
        label: "Đang giao",
        className: "bg-sky-50 text-sky-700 ring-sky-200",
    },
    REJECTED: {
        label: "Đã hủy",
        className: "bg-rose-50 text-rose-700 ring-rose-200",
    },
    DELIVERED: {
        label: "Đã giao",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
};

const paymentStatusMap = {
    PAID: "Đã thanh toán",
    UNPAID: "Chưa thanh toán",
    PENDING: "Chờ thanh toán",
    COD: "Thanh toán khi nhận hàng",
};

const formatCurrency = (value = 0) =>
    Number(value || 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
    });

const formatDate = (value) => {
    if (!value) {
        return "Chưa có ngày";
    }

    return new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const getDeliveryStatus = (status) =>
    deliveryStatusMap[status] || {
        label: status || "Chưa cập nhật",
        className: "bg-neutral-100 text-neutral-700 ring-neutral-200",
    };

const getProductId = (product = {}) => product.productId || product.id;

const getProductImageSrc = (product = {}) => {
    const image = product.image || product.imageUrl || product.thumbnail;

    if (!image) {
        return "";
    }

    return image?.startsWith("http")
        ? image
        : `${import.meta.env.VITE_BACK_END_URL}/images/${image}`;
};

const getAddressText = (address = {}) => {
    const parts = [address.detail, address.wardName, address.provinceName].filter(Boolean);
    return parts.length ? parts.join(", ") : "Chưa có địa chỉ giao hàng";
};

const OrderView = () => {
    const dispatch = useDispatch();
    const {
        orders = [],
        totalPages = 0,
        loading = false,
        error = null,
    } = useSelector((state) => state.orderUser || {});

    const [page, setPage] = useState(0);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        dispatch(fetchUserOrders(page, PAGE_SIZE));
    }, [dispatch, page]);

    const orderSummary = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter((order) => order.deliveryStatus === "PENDING").length;
        const delivered = orders.filter((order) => order.deliveryStatus === "DELIVERED").length;

        return { total, pending, delivered };
    }, [orders]);



    const handleCancel = async (orderId) => {
        try {
            const token = getAuthToken();

            if (!token) {
                toast.error("Phiên đăng nhập đã hết hạn");
                return;
            }

            setCancellingId(orderId);

            await api.put(
                `/orders/${orderId}/reject`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Đơn hàng đã được hủy");
            dispatch(fetchUserOrders(page, PAGE_SIZE));
        } catch (requestError) {
            console.error("Lỗi hủy đơn hàng", requestError);
            toast.error("Không thể hủy đơn hàng!");
        } finally {
            setCancellingId(null);
        }
    };

    const handlePrev = () => {
        if (page > 0) {
            setPage((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (page < totalPages - 1) {
            setPage((prev) => prev + 1);
        }
    };

    return (
        <section className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
            <div className="mb-6 flex flex-col gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#7f9c8f]">Tài khoản của tôi</p>
                    <h2 className="mt-2 text-2xl font-bold text-neutral-900">Lịch sử đơn hàng</h2>
                    <p className="mt-2 max-w-2xl text-sm text-neutral-500">
                        Theo dõi trạng thái xử lý, thanh toán và thông tin giao hàng của các đơn đã đặt.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-sm">
                    <div className="min-w-20 rounded-md bg-neutral-50 px-3 py-2 text-center">
                        <p className="text-lg font-bold text-neutral-900">{orderSummary.total}</p>
                        <p className="text-xs text-neutral-500">Đơn</p>
                    </div>
                    <div className="min-w-20 rounded-md bg-amber-50 px-3 py-2 text-center">
                        <p className="text-lg font-bold text-amber-700">{orderSummary.pending}</p>
                        <p className="text-xs text-amber-700">Chờ duyệt</p>
                    </div>
                    <div className="min-w-20 rounded-md bg-emerald-50 px-3 py-2 text-center">
                        <p className="text-lg font-bold text-emerald-700">{orderSummary.delivered}</p>
                        <p className="text-xs text-emerald-700">Đã giao</p>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="grid gap-4">
                    {[1, 2].map((item) => (
                        <div key={item} className="animate-pulse rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                            <div className="h-5 w-40 rounded bg-neutral-200" />
                            <div className="mt-4 h-4 w-full rounded bg-neutral-100" />
                            <div className="mt-2 h-4 w-3/4 rounded bg-neutral-100" />
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {error}
                </div>
            )}

            {!loading && !error && orders.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
                    <FaBoxOpen className="text-4xl text-neutral-400" />
                    <h3 className="mt-4 text-lg font-semibold text-neutral-900">Bạn chưa có đơn hàng nào</h3>
                    <p className="mt-2 max-w-md text-sm text-neutral-500">
                        Khi bạn đặt hàng thành công, thông tin đơn hàng sẽ xuất hiện tại đây.
                    </p>
                </div>
            )}

            {!loading && !error && orders.length > 0 && (
                <>
                    <div className="grid gap-4">
                        {orders.map((order) => {
                            const deliveryStatus = getDeliveryStatus(order.deliveryStatus);
                            const orderItems = order.orderItemList || [];

                            return (
                                <article key={order.orderId} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                                    <div className="flex flex-col gap-3 border-b border-neutral-100 pb-4 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-2 text-base font-bold text-neutral-900">
                                                    <FaReceipt className="text-[#7f9c8f]" />
                                                    Mã đơn #{order.orderId}
                                                </span>
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${deliveryStatus.className}`}>
                                                    {deliveryStatus.label}
                                                </span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-500">
                                                <span className="inline-flex items-center gap-2">
                                                    <FaCalendarAlt className="text-neutral-400" />
                                                    {formatDate(order.dateOrder)}
                                                </span>
                                                <span>{paymentStatusMap[order.paymentStatus] || order.paymentStatus || "Chưa cập nhật thanh toán"}</span>
                                            </div>
                                        </div>

                                        <div className="text-left md:text-right">
                                            <p className="text-xs font-medium uppercase text-neutral-400">Tổng tiền</p>
                                            <p className="text-xl font-bold text-neutral-900">{formatCurrency(order.totalAmount)}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-5 py-4 xl:grid-cols-[1fr_360px]">
                                        <div>
                                            <h4 className="mb-3 text-sm font-semibold text-neutral-900">Sản phẩm</h4>
                                            <div className="divide-y divide-neutral-100 rounded-md border border-neutral-100">
                                                {orderItems.map((item) => {
                                                    const product = item.product || {};
                                                    const productId = getProductId(product);
                                                    const productImageSrc = getProductImageSrc(product);

                                                    return (
                                                        <div
                                                            key={item.orderItemId}
                                                            className="grid gap-3 px-3 py-3 sm:grid-cols-[64px_1fr_auto] sm:items-center"
                                                        >
                                                            <div className="h-16 w-16 overflow-hidden rounded-md bg-neutral-100">
                                                                {productImageSrc ? (
                                                                    <img
                                                                        src={productImageSrc}
                                                                        alt={product.productName || "Sản phẩm"}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center">
                                                                        <FaBoxOpen className="text-neutral-300" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium text-neutral-900">
                                                                    {product.productName || "Sản phẩm"}
                                                                </p>
                                                                <p className="mt-1 text-xs text-neutral-500">Số lượng: {item.quantity}</p>
                                                                <p className="mt-1 text-sm font-semibold text-neutral-800 sm:hidden">
                                                                    {formatCurrency(item.orderProductPrice)}
                                                                </p>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                                                <p className="hidden shrink-0 text-sm font-semibold text-neutral-800 sm:block">
                                                                    {formatCurrency(item.orderProductPrice)}
                                                                </p>
                                                                {productId && (
                                                                    <Link
                                                                        to={`/products/${productId}`}
                                                                        className="inline-flex items-center justify-center gap-2 rounded-md border border-[#7f9c8f] px-3 py-2 text-xs font-semibold text-[#587569] transition-colors hover:bg-[#7f9c8f] hover:text-white"
                                                                    >
                                                                        <FaRedo />
                                                                        Mua lại
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="rounded-md bg-neutral-50 p-4">
                                            <h4 className="text-sm font-semibold text-neutral-900">Thông tin nhận hàng</h4>
                                            <p className="mt-3 flex gap-2 text-sm leading-6 text-neutral-600">
                                                <FaMapMarkerAlt className="mt-1 shrink-0 text-[#7f9c8f]" />
                                                <span>{getAddressText(order.address)}</span>
                                            </p>
                                            <p className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
                                                <FaPhoneAlt className="text-[#7f9c8f]" />
                                                {order.address?.phoneNumber || "Chưa có số điện thoại"}
                                            </p>
                                        </div>
                                    </div>

                                    {order.deliveryStatus === "PENDING" && (
                                        <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-sm text-amber-800">
                                                Đơn hàng thường được giao sau 4 ngày. Bạn chỉ có thể hủy khi đơn còn ở trạng thái đang duyệt.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => handleCancel(order.orderId)}
                                                disabled={cancellingId === order.orderId}
                                                className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-500 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <FaTimes />
                                                {cancellingId === order.orderId ? "Đang hủy..." : "Hủy đơn"}
                                            </button>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-3 shadow-sm">
                        <button
                            type="button"
                            onClick={handlePrev}
                            disabled={page === 0}
                            className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FaChevronLeft />
                            Trước
                        </button>

                        <span className="text-sm font-medium text-neutral-500">
                            Trang {page + 1} / {Math.max(totalPages, 1)}
                        </span>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={page >= totalPages - 1}
                            className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Sau
                            <FaChevronRight />
                        </button>
                    </div>
                </>
            )}
        </section>
    );
};

export default OrderView;
