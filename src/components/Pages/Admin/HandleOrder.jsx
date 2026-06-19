import { useCallback, useEffect, useState } from "react";
import HandleShip from "../Order_Admin/HandleShip";
import { useSearchParams, Link } from "react-router-dom";
import PaginationRounded from "../../PaginationRounded";
import AdminSidebar from "./AdminSidebar";
import StatCard from "./StatCard";
import HandleReject from "../Order_Admin/HandleReject";
import api from "../../../api/api";
import { getAuthToken } from "../../../utils/auth";

const HandleOrder = () => {
    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = 5;

    const fetchPendingOrders = useCallback(async () => {
        setLoading(true);
        try {
            const token = getAuthToken();

            const response = await api.get("/admin/pending", {
                params: {
                    pageNumber: page - 1,
                    pageSize,
                    sortBy: "orderId",
                    sortOrder: "desc",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOrders(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError("Không thể tải đơn hàng (token hoặc quyền bị lỗi).");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchPendingOrders();
    }, [fetchPendingOrders]);

    if (loading) return <p className="text-center mt-4">Đang tải dữ liệu...</p>;
    if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />

            <main className="flex-1 flex flex-col items-center w-full">

                <section className="w-full max-w-6xl px-4 pb-10 mt-23">
                    <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Các đơn hàng chờ xác nhận</h2>

                    {orders.length === 0 ? (
                        <p className="text-center text-gray-500">Không có đơn hàng nào.</p>
                    ) : (
                        <>
                            <div className="grid gap-6">
                                {orders.map((order) => (
                                    <div
                                        key={order.orderId}
                                        className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition duration-200"
                                    >
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-3">
                                            <div><span className="font-semibold">Mã đơn:</span> {order.orderId}</div>
                                            <div><span className="font-semibold">Email:</span> {order.email}</div>
                                            <div><span className="font-semibold">Tên KH:</span> {order.userName}</div>
                                            <div><span className="font-semibold">Ngày đặt:</span> {order.dateOrder}</div>
                                            <div><span className="font-semibold">Trạng thái:</span> {order.deliveryStatus}</div>
                                            <div><span className="font-semibold">SĐT:</span> {order.address?.phoneNumber}</div>
                                            <div className="col-span-2">
                                                <span className="font-semibold">Địa chỉ:</span>{" "}
                                                {order.address?.detail
                                                    ? `${order.address.detail}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`
                                                    : `${order.address.ward}, ${order.address.district}, ${order.address.province}`}
                                            </div>
                                        </div>

                                        <div className="text-sm">
                                            <span className="font-semibold">Sản phẩm:</span>
                                            <ol className="list-decimal pl-5 mt-1">
                                                {order.orderItemList.map((item) => (
                                                    <li key={item.orderItemId} className="mt-1">
                                                        {item.product.productName} - SL: {item.quantity} - Giá:{" "}
                                                        {Number(item.product.specialPrice).toLocaleString()} VND
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>

                                        <div className="mt-2 font-semibold">
                                            Tổng tiền: {Number(order.totalAmount).toLocaleString()} VND
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <HandleShip orderId={order.orderId} onSuccess={fetchPendingOrders} />
                                            <HandleReject orderId={order.orderId} onSuccess={fetchPendingOrders} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6">
                                <PaginationRounded numberofPage={totalPages} />
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

export default HandleOrder;
