import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Chip, TextField, Typography } from "@mui/material";
import { FiEye, FiSearch } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";

import PaginationRounded from "../../../PaginationRounded";
import api from "../../../../api/api";
import { getAuthToken } from "../../../../utils/auth";
import PendingOrderDetailsDrawer from "./PendingOrderDetailsDrawer";

const PAGE_SIZE = 5;

const formatCurrency = (value) => `${Number(value || 0).toLocaleString("vi-VN")} VND`;

const formatShortDate = (value) => {
    if (!value) {
        return "--";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
    });
};

const getOrderCodeLabel = (order) => order.code || `#${order.orderId}`;

const getPaymentMethodLabel = (order) =>
    order.paymentMethod || order.payment?.paymentMethod || "Chua co du lieu tu backend";

const PendingOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [submittingAction, setSubmittingAction] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Number(searchParams.get("page")) || 1;
    const keyword = searchParams.get("keyword") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";

    const [draftKeyword, setDraftKeyword] = useState(keyword);

    useEffect(() => {
        setDraftKeyword(keyword);
    }, [keyword]);

    const fetchPendingOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const token = getAuthToken();
            const response = await api.get("/admin/pending", {
                params: {
                    pageNumber: page - 1,
                    pageSize: PAGE_SIZE,
                    sortBy: "orderId",
                    sortOrder: "desc",
                    ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
                    ...(fromDate ? { fromDate } : {}),
                    ...(toDate ? { toDate } : {}),
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOrders(response.data?.content || []);
            setTotalPages(Number(response.data?.totalPages) || 0);
        } catch (err) {
            setError("Khong the tai don hang pending.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, keyword, fromDate, toDate]);

    useEffect(() => {
        fetchPendingOrders();
    }, [fetchPendingOrders]);

    const updateParams = (updater) => {
        const nextParams = new URLSearchParams(searchParams);
        updater(nextParams);
        setSearchParams(nextParams);
    };

    const handleSearch = () => {
        updateParams((params) => {
            if (draftKeyword.trim()) {
                params.set("keyword", draftKeyword.trim());
            } else {
                params.delete("keyword");
            }
            params.set("page", "1");
        });
    };

    const handleDateChange = (key, value) => {
        updateParams((params) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            params.set("page", "1");
        });
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
    };

    const handleCloseDrawer = () => {
        setSelectedOrder(null);
    };

    const handleOrderAction = async (type) => {
        if (!selectedOrder?.orderId) {
            return;
        }

        const token = getAuthToken();
        if (!token) {
            toast.error("Phien dang nhap da het han");
            return;
        }

        setSubmittingAction(type);

        try {
            const endpoint =
                type === "ship"
                    ? `/admin/orders/${selectedOrder.orderId}/ship`
                    : `/orders/${selectedOrder.orderId}/reject`;

            await api.put(
                endpoint,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(type === "ship" ? "Da chuyen sang trang thai SHIPPED" : "Da tu choi don hang");
            handleCloseDrawer();
            fetchPendingOrders();
        } catch (actionError) {
            console.error(actionError);
            toast.error(type === "ship" ? "Khong the xac nhan giao hang" : "Khong the tu choi don hang");
        } finally {
            setSubmittingAction("");
        }
    };

    if (loading) {
        return <p className="mt-4 text-center">Dang tai du lieu...</p>;
    }

    if (error) {
        return <p className="mt-4 text-center text-red-500">{error}</p>;
    }

    return (
        <main className="flex min-h-screen flex-1 flex-col bg-slate-100 pt-[88px]">
            <section className="mx-auto w-full max-w-[1500px] px-4 pb-10 pt-6 bg-white">
                <div className="mb-6 flex flex-col gap-4 rounded-md  p-5 shadow">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#334155" }}>
                            Pending Orders
                        </Typography>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_220px_220px]">
                        <label className="flex items-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-500">
                            <FiSearch className="shrink-0 text-slate-500" />
                            <input
                                type="text"
                                value={draftKeyword}
                                onChange={(event) => setDraftKeyword(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Search..."
                                className="w-full bg-transparent text-sm text-slate-800 outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                            >
                                Search
                            </button>
                        </label>

                        <TextField
                            label="Date from"
                            type="date"
                            value={fromDate}
                            onChange={(event) => handleDateChange("fromDate", event.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />

                        <TextField
                            label="Date to"
                            type="date"
                            value={toDate}
                            onChange={(event) => handleDateChange("toDate", event.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-md bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-sm font-semibold text-slate-700">
                                    <th className="px-4 py-3">Ma don</th>
                                    <th className="px-4 py-3">Khach hang</th>
                                    <th className="px-4 py-3">SDT</th>
                                    <th className="px-4 py-3 text-right">Tong tien</th>
                                    <th className="px-4 py-3">Thanh toan</th>
                                    <th className="px-4 py-3">Ngay dat</th>
                                    <th className="px-4 py-3">Trang thai</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={order.orderId} className="border-t border-slate-200 text-sm text-slate-700">
                                            <td className="px-4 py-3 font-semibold text-slate-900">
                                                {getOrderCodeLabel(order)}
                                            </td>
                                            <td className="px-4 py-3">{order.userName || "--"}</td>
                                            <td className="px-4 py-3">{order.address?.phoneNumber || "--"}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="px-4 py-3">{getPaymentMethodLabel(order)}</td>
                                            <td className="px-4 py-3">{formatShortDate(order.dateOrder)}</td>
                                            <td className="px-4 py-3">
                                                <Chip
                                                    label={order.deliveryStatus || "PENDING"}
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewOrder(order)}
                                                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    <FiEye size={14} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                                            Khong co don hang pending.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6">
                    <PaginationRounded numberofPage={totalPages} />
                </div>
            </section>

            <PendingOrderDetailsDrawer
                open={Boolean(selectedOrder)}
                order={selectedOrder}
                submittingAction={submittingAction}
                onClose={handleCloseDrawer}
                onAction={handleOrderAction}
            />
        </main>
    );
};

export default PendingOrdersPage;
