import { useEffect, useState } from "react";
import {
    FiChevronDown,
    FiChevronUp,
    FiEye,
    FiRotateCcw,
    FiSearch,
    FiX,
} from "react-icons/fi";
import { useSearchParams } from "react-router-dom";

import PaginationRounded from "../../PaginationRounded";
import api from "../../../api/api";
import { getAuthToken } from "../../../utils/auth";
import DetailOrderDetailsDrawer from "./DetailOrderDetailsDrawer";

const PAGE_SIZE_OPTIONS = [5, 10, 15];

const SORT_FIELDS = {
    orderId: "orderId",
    userName: "userName",
    deliveryStatus: "deliveryStatus",
    paymentStatus: "paymentStatus",
    totalAmount: "totalAmount",
    dateOrder: "dateOrder",
};

const DELIVERY_STATUS_OPTIONS = [
    { value: "", label: "Tat ca trang thai giao hang" },
    { value: "PENDING", label: "PENDING" },
    { value: "SHIPPED", label: "SHIPPED" },
    { value: "DELIVERED", label: "DELIVERED" },
    { value: "REJECTED", label: "REJECTED" },
];

const PAYMENT_STATUS_OPTIONS = [
    { value: "", label: "Tat ca trang thai thanh toan" },
    { value: "PAID", label: "PAID" },
    { value: "UNPAID", label: "UNPAID" }
];

const PAYMENT_METHOD_OPTIONS = [
    { value: "", label: "Tat ca phuong thuc" },
    { value: "COD", label: "COD" },
    { value: "QR", label: "QR" },
];

const formatCurrency = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "--";
    }

    return `${Number(value).toLocaleString("vi-VN")} VND`;
};

const formatDate = (value) => {
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
        year: "numeric",
    });
};

const getStatusStyle = (status) => {
    switch (status) {
        case "PENDING":
            return "bg-amber-100 text-amber-700";
        case "SHIPPED":
            return "bg-blue-100 text-blue-700";
        case "DELIVERED":
            return "bg-emerald-100 text-emerald-700";
        case "REJECTED":
            return "bg-rose-100 text-rose-700";
        default:
            return "bg-slate-100 text-slate-600";
    }
};

const getPaymentStyle = (status) => {
    switch (status) {
        case "PAID":
            return "bg-emerald-100 text-emerald-700";
        case "UNPAID":
            return "bg-slate-100 text-slate-600";
        case "FAILED":
            return "bg-rose-100 text-rose-700";
        default:
            return "bg-slate-100 text-slate-600";
    }
};

const buildAddress = (address) => {
    if (!address) {
        return "--";
    }

    return (
        [address.detail, address.ward, address.district, address.province]
            .filter(Boolean)
            .join(", ") || "--"
    );
};

const SortHeader = ({ label, field, activeSortBy, activeSortOrder, onSort }) => {
    const isActive = activeSortBy === field;
    const Icon = isActive && activeSortOrder === "desc" ? FiChevronDown : FiChevronUp;

    return (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="inline-flex items-center gap-1 font-semibold text-slate-700 transition hover:text-emerald-700"
        >
            <span>{label}</span>
            <Icon className={isActive ? "opacity-100 transition" : "opacity-30 transition"} size={15} />
        </button>
    );
};

const DetailOrder = () => {
    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Number(searchParams.get("page")) || 1;
    const pageSizeParam = Number(searchParams.get("pageSize"));
    const pageSize = PAGE_SIZE_OPTIONS.includes(pageSizeParam) ? pageSizeParam : 10;
    const sortBy = searchParams.get("sortBy") || SORT_FIELDS.dateOrder;
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const deliveryStatus = searchParams.get("deliveryStatus") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const keyword = searchParams.get("keyword") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const hasAdvancedFilters = Boolean(paymentMethod || fromDate || toDate);

    const [searchTerm, setSearchTerm] = useState(keyword);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(hasAdvancedFilters);

    useEffect(() => {
        setSearchTerm(keyword);
    }, [keyword]);

    useEffect(() => {
        if (hasAdvancedFilters) {
            setShowAdvancedFilters(true);
        }
    }, [hasAdvancedFilters]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const token = getAuthToken();
                const params = {
                    pageNumber: page - 1,
                    pageSize,
                    sortBy,
                    sortOrder,
                };

                if (deliveryStatus) {
                    params.deliveryStatus = deliveryStatus;
                }

                if (paymentStatus) {
                    params.paymentStatus = paymentStatus;
                }

                if (paymentMethod) {
                    params.paymentMethod = paymentMethod;
                }

                if (keyword.trim()) {
                    params.keyword = keyword.trim();
                }

                if (fromDate) {
                    params.fromDate = fromDate;
                }

                if (toDate) {
                    params.toDate = toDate;
                }

                const res = await api.get("/admin/orders", {
                    params,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setOrders(res.data?.content || []);
                setTotalPages(Number(res.data?.totalPages) || 0);
                setTotalElements(Number(res.data?.totalElements) || 0);
            } catch (err) {
                setError("Khong the tai danh sach don hang.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [
        page,
        pageSize,
        sortBy,
        sortOrder,
        deliveryStatus,
        paymentStatus,
        paymentMethod,
        keyword,
        fromDate,
        toDate,
    ]);

    const updateParams = (updater) => {
        const nextParams = new URLSearchParams(searchParams);
        updater(nextParams);
        setSearchParams(nextParams);
    };

    const handleSearch = () => {
        updateParams((params) => {
            if (searchTerm.trim()) {
                params.set("keyword", searchTerm.trim());
            } else {
                params.delete("keyword");
            }

            params.set("page", "1");
        });
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        updateParams((params) => {
            params.delete("keyword");
            params.set("page", "1");
        });
    };

    const handleFilterChange = (key, value) => {
        updateParams((params) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }

            params.set("page", "1");
        });
    };

    const handlePageSizeChange = (event) => {
        const nextPageSize = Number(event.target.value);
        updateParams((params) => {
            params.set("pageSize", String(nextPageSize));
            params.set("page", "1");
        });
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setSearchParams(
            new URLSearchParams({
                page: "1",
                pageSize: String(pageSize),
                sortBy: SORT_FIELDS.dateOrder,
                sortOrder: "desc",
            })
        );
    };

    const handleSort = (field) => {
        updateParams((params) => {
            const currentSortBy = params.get("sortBy") || SORT_FIELDS.dateOrder;
            const currentSortOrder = params.get("sortOrder") || "desc";
            const nextSortOrder =
                currentSortBy === field && currentSortOrder === "asc" ? "desc" : "asc";

            params.set("sortBy", field);
            params.set("sortOrder", nextSortOrder);
            params.set("page", "1");
        });
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
    };

    const handleCloseDrawer = () => {
        setSelectedOrder(null);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-1 flex-col p-6 pt-[88px]">
                <div className="rounded bg-white py-10 text-center text-slate-500 shadow">
                    Dang tai du lieu...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-1 flex-col p-6 pt-[88px]">
                <div className="rounded bg-white py-10 text-center text-rose-600 shadow">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-1 flex-col p-6 pt-[88px]">
            <div>
                <div className="mb-4 mt-2 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">Chi tiet don hang</h1>
                    </div>
                </div>

                <div className="mb-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
                    <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-500 xl:col-span-2">
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="shrink-0 text-lg text-slate-500 transition hover:text-emerald-600"
                            aria-label="Tim kiem don hang"
                        >
                            <FiSearch />
                        </button>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            placeholder="Tim ma don, ten khach hang"
                            className="w-full bg-transparent text-sm text-slate-800 outline-none"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="text-slate-400 transition hover:text-slate-700"
                                aria-label="Xoa tim kiem"
                            >
                                <FiX />
                            </button>
                        )}
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-500">
                        <span className="shrink-0 text-sm font-medium text-slate-600">Giao hang</span>
                        <select
                            value={deliveryStatus}
                            onChange={(event) =>
                                handleFilterChange("deliveryStatus", event.target.value)
                            }
                            className="w-full bg-transparent text-sm text-slate-800 outline-none"
                        >
                            {DELIVERY_STATUS_OPTIONS.map((option) => (
                                <option key={option.value || "all-delivery"} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-500">
                        <span className="shrink-0 text-sm font-medium text-slate-600">Thanh toan</span>
                        <select
                            value={paymentStatus}
                            onChange={(event) =>
                                handleFilterChange("paymentStatus", event.target.value)
                            }
                            className="w-full bg-transparent text-sm text-slate-800 outline-none"
                        >
                            {PAYMENT_STATUS_OPTIONS.map((option) => (
                                <option key={option.value || "all-payment"} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="flex items-center justify-start gap-2 xl:col-span-2">
                        <button
                            type="button"
                            onClick={() => setShowAdvancedFilters((prev) => !prev)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            {showAdvancedFilters ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                            Tim kiem nang cao
                        </button>

                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <FiRotateCcw size={14} />
                            Reset
                        </button>
                    </div>
                </div>

                {showAdvancedFilters && (
                    <div className="mb-5 grid gap-3 lg:grid-cols-3">
                        <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-500">
                            <span className="shrink-0 text-sm font-medium text-slate-600">Phuong thuc</span>
                            <select
                                value={paymentMethod}
                                onChange={(event) =>
                                    handleFilterChange("paymentMethod", event.target.value)
                                }
                                className="w-full bg-transparent text-sm text-slate-800 outline-none"
                            >
                                {PAYMENT_METHOD_OPTIONS.map((option) => (
                                    <option key={option.value || "all-method"} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-500">
                            <span className="shrink-0 text-sm font-medium text-slate-600">Tu ngay</span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(event) => handleFilterChange("fromDate", event.target.value)}
                                className="w-full bg-transparent text-sm text-slate-800 outline-none"
                            />
                        </label>

                        <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-500">
                            <span className="shrink-0 text-sm font-medium text-slate-600">Den ngay</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(event) => handleFilterChange("toDate", event.target.value)}
                                className="w-full bg-transparent text-sm text-slate-800 outline-none"
                            />
                        </label>
                    </div>
                )}

                <div className="overflow-hidden rounded-md bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-sm font-semibold text-slate-700">
                                    <th className="px-4 py-3">
                                        <SortHeader
                                            label="Ma don"
                                            field={SORT_FIELDS.orderId}
                                            activeSortBy={sortBy}
                                            activeSortOrder={sortOrder}
                                            onSort={handleSort}
                                        />
                                    </th>
                                    <th className="px-4 py-3">
                                        <SortHeader
                                            label="Ho ten"
                                            field={SORT_FIELDS.userName}
                                            activeSortBy={sortBy}
                                            activeSortOrder={sortOrder}
                                            onSort={handleSort}
                                        />
                                    </th>
                                    <th className="px-4 py-3">
                                        <SortHeader
                                            label="Trang thai giao"
                                            field={SORT_FIELDS.deliveryStatus}
                                            activeSortBy={sortBy}
                                            activeSortOrder={sortOrder}
                                            onSort={handleSort}
                                        />
                                    </th>
                                    <th className="px-4 py-3">
                                        <SortHeader
                                            label="Trang thai TT"
                                            field={SORT_FIELDS.paymentStatus}
                                            activeSortBy={sortBy}
                                            activeSortOrder={sortOrder}
                                            onSort={handleSort}
                                        />
                                    </th>
                                    <th className="px-4 py-3">Dia chi</th>
                                    <th className="px-4 py-3 text-right">
                                        <SortHeader
                                            label="So tien"
                                            field={SORT_FIELDS.totalAmount}
                                            activeSortBy={sortBy}
                                            activeSortOrder={sortOrder}
                                            onSort={handleSort}
                                        />
                                    </th>
                                    <th className="px-4 py-3">
                                        <SortHeader
                                            label="Ngay dat"
                                            field={SORT_FIELDS.dateOrder}
                                            activeSortBy={sortBy}
                                            activeSortOrder={sortOrder}
                                            onSort={handleSort}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={order.orderId} className="border-t border-slate-200 text-sm text-slate-700">
                                            <td className="px-4 py-3 font-semibold text-slate-900">
                                                #{order.orderId}
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.userName || "Khong ro"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(order.deliveryStatus)}`}
                                                >
                                                    {order.deliveryStatus || "--"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStyle(order.paymentStatus)}`}
                                                >
                                                    {order.paymentStatus || "--"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {buildAddress(order.address)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {formatDate(order.dateOrder)}
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
                                            Khong co don hang nao.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 rounded px-2 py-1 text-sm text-slate-600 shadow sm:flex-row sm:items-center sm:justify-between">
                    <div>Tong so {totalElements}</div>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-500">
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="w-full bg-transparent text-sm text-slate-800 outline-none"
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size} / trang
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            <div className="mt-auto pt-6">
                <PaginationRounded numberofPage={totalPages} />
            </div>

            <DetailOrderDetailsDrawer
                open={Boolean(selectedOrder)}
                order={selectedOrder}
                onClose={handleCloseDrawer}
            />
        </div>
    );
};

export default DetailOrder;
