import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { getRevenueChart, getStats } from "../../../api/orderApi";
import { fetchAllProduct } from "../../../store/actions";

const RANGE_OPTIONS = [
    { key: "7d", label: "1 tuan", groupBy: "day" },
    { key: "1m", label: "1 thang", groupBy: "day" },
    { key: "1y", label: "1 nam", groupBy: "month" },
];

const pad = (value) => String(value).padStart(2, "0");

const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    return `${year}-${month}-${day}`;
};

const getYearBounds = (year) => ({
    fromDate: `${year}-01-01`,
    toDate: `${year}-12-31`,
    groupBy: "month",
});

const buildPresetParams = (rangeKey) => {
    const now = new Date();
    const currentYear = now.getFullYear();

    switch (rangeKey) {
        case "7d": {
            const fromDate = new Date(now);
            fromDate.setDate(now.getDate() - 6);
            return {
                fromDate: formatDateForApi(fromDate),
                toDate: formatDateForApi(now),
                groupBy: "day",
            };
        }
        case "1m": {
            const fromDate = new Date(now);
            fromDate.setMonth(now.getMonth() - 1);
            fromDate.setDate(fromDate.getDate() + 1);
            return {
                fromDate: formatDateForApi(fromDate),
                toDate: formatDateForApi(now),
                groupBy: "day",
            };
        }
        case "1y":
        default:
            return getYearBounds(currentYear);
    }
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const buildPeriodMap = (points = []) =>
    points.reduce((accumulator, point) => {
        accumulator[point.period] = Number(point.revenue) || 0;
        return accumulator;
    }, {});

const buildMonthSeries = (fromDate, toDate, points) => {
    const periodMap = buildPeriodMap(points);
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const result = [];

    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const final = new Date(end.getFullYear(), end.getMonth(), 1);

    while (cursor <= final) {
        const period = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}`;
        result.push({
            period,
            label: String(cursor.getMonth() + 1),
            revenue: periodMap[period] || 0,
        });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return result;
};

const buildDaySeries = (fromDate, toDate, points) => {
    const periodMap = buildPeriodMap(points);
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const result = [];
    const cursor = new Date(start);

    while (cursor <= end) {
        const period = formatDateForApi(cursor);
        result.push({
            period,
            label: `${pad(cursor.getDate())}/${pad(cursor.getMonth() + 1)}`,
            revenue: periodMap[period] || 0,
        });
        cursor.setDate(cursor.getDate() + 1);
    }

    return result;
};

const buildYearSeries = (fromDate, toDate, points) => {
    const periodMap = buildPeriodMap(points);
    const startYear = new Date(fromDate).getFullYear();
    const endYear = new Date(toDate).getFullYear();
    const result = [];

    for (let year = startYear; year <= endYear; year += 1) {
        const period = String(year);
        result.push({
            period,
            label: period,
            revenue: periodMap[period] || 0,
        });
    }

    return result;
};

const normalizeChartPoints = (chartData, filters) => {
    if (!chartData) {
        return [];
    }

    if (filters.groupBy === "month") {
        return buildMonthSeries(filters.fromDate, filters.toDate, chartData.points);
    }

    if (filters.groupBy === "year") {
        return buildYearSeries(filters.fromDate, filters.toDate, chartData.points);
    }

    return buildDaySeries(filters.fromDate, filters.toDate, chartData.points);
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "10px 12px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
        >
            <p style={{ margin: 0, fontWeight: 700 }}>{label}</p>
            <p style={{ margin: "6px 0 0", color: "#0f766e" }}>
                {formatCurrency(payload[0].value)}
            </p>
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [selectedRange, setSelectedRange] = useState("1y");
    const [chartLoading, setChartLoading] = useState(false);
    const [chartFilters, setChartFilters] = useState(() => buildPresetParams("1y"));
    const [draftFilters, setDraftFilters] = useState(() => buildPresetParams("1y"));
    const { products } = useSelector((state) => state.products);
    const dispatch = useDispatch();

    useEffect(() => {
        getStats()
            .then((data) => setStats(data))
            .catch((error) => console.error("Loi lay thong ke:", error));

        dispatch(fetchAllProduct());
    }, [dispatch]);

    useEffect(() => {
        setChartLoading(true);

        getRevenueChart(chartFilters)
            .then((data) => setChartData(data))
            .catch((error) => console.error("Loi lay chart doanh thu:", error))
            .finally(() => setChartLoading(false));
    }, [chartFilters]);

    const lowStockProducts = useMemo(
        () => products?.filter((product) => product.quantity < 5) || [],
        [products]
    );

    const chartPoints = useMemo(
        () => normalizeChartPoints(chartData, chartFilters),
        [chartData, chartFilters]
    );

    const handlePresetSelect = (rangeKey) => {
        const preset = buildPresetParams(rangeKey);
        setSelectedRange(rangeKey);
        setDraftFilters(preset);
        setChartFilters(preset);
    };

    const handleDraftChange = (event) => {
        const { name, value } = event.target;
        setSelectedRange("custom");
        setDraftFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleApplyFilters = () => {
        if (!draftFilters.fromDate || !draftFilters.toDate) {
            return;
        }

        setChartFilters(draftFilters);
    };

    if (!stats) {
        return <p>Dang tai du lieu...</p>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Dashboard Admin</h1>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginTop: "45px",
                }}
            >
                <StatCard label="Khách hàng" value={stats.totalUsers} />
                <Link to="/admin/product">
                    <StatCard label="Sản phẩm" value={stats.totalProducts} />
                </Link>
                <Link to="/admin/orders">
                    <StatCard label="Đơn chờ xác nhận" value={stats.pendingDeliveries} />
                </Link>
                <StatCard label="Doanh thu tháng" value={formatCurrency(stats.revenueThisMonth)} />
            </div>

            <div
                style={{
                    marginTop: "30px",
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
                    padding: "20px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                        marginBottom: "18px",
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0, fontSize: "22px" }}>Biểu đồ</h2>
                        <p style={{ margin: "6px 0 0", color: "#666" }}>
                            <b>Tổng doanh thu trên biểu đồ:</b>  {formatCurrency(chartData?.totalRevenue)}
                        </p>
                    </div>

                    <label style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "170px" }}>
                        <span style={{ fontSize: "14px", color: "#555" }}>Thời gian</span>
                        <select
                            value={selectedRange === "custom" ? "" : selectedRange}
                            onChange={(event) => {
                                const value = event.target.value;
                                if (!value) {
                                    return;
                                }
                                handlePresetSelect(value);
                            }}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "10px 12px",
                                background: "#fff",
                            }}
                        >
                            <option value="">Chọn thời gian</option>
                            {RANGE_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <details
                    style={{
                        marginBottom: "18px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        background: "#fafafa",
                        padding: "12px 14px",
                    }}
                >
                    <summary
                        style={{
                            cursor: "pointer",
                            fontWeight: 600,
                            color: "#374151",
                            userSelect: "none",
                        }}
                    >
                        Tùy chỉnh thời gian
                    </summary>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "12px",
                            alignItems: "end",
                            marginTop: "14px",
                        }}
                    >
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontSize: "14px", color: "#555" }}>fromDate</span>
                            <input
                                type="date"
                                name="fromDate"
                                value={draftFilters.fromDate}
                                onChange={handleDraftChange}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    padding: "10px 12px",
                                    background: "#fff",
                                }}
                            />
                        </label>

                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontSize: "14px", color: "#555" }}>toDate</span>
                            <input
                                type="date"
                                name="toDate"
                                value={draftFilters.toDate}
                                onChange={handleDraftChange}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    padding: "10px 12px",
                                    background: "#fff",
                                }}
                            />
                        </label>

                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontSize: "14px", color: "#555" }}>groupBy</span>
                            <select
                                name="groupBy"
                                value={draftFilters.groupBy}
                                onChange={handleDraftChange}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    padding: "10px 12px",
                                    background: "#fff",
                                }}
                            >
                                <option value="day">day</option>
                                <option value="month">month</option>
                                <option value="year">year</option>
                            </select>
                        </label>

                        <button
                            type="button"
                            onClick={handleApplyFilters}
                            style={{
                                padding: "10px 16px",
                                borderRadius: "8px",
                                border: "none",
                                background: "#0f766e",
                                color: "#fff",
                                cursor: "pointer",
                                fontWeight: 600,
                                height: "21px",
                            }}
                        >
                            Cập nhật biểu đồ
                        </button>
                    </div>
                </details>

                <div style={{ width: "100%", height: "320px" }}>
                    {chartLoading ? (
                        <div
                            style={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#666",
                            }}
                        >
                            Đang tải biểu đồ...
                        </div>
                    ) : chartPoints.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartPoints}
                                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis tickFormatter={(value) => Number(value).toLocaleString("vi-VN")} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0f766e"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div
                            style={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#666",
                            }}
                        >
                            Chưa có dữ liệu trong khoảng thời gian này
                        </div>
                    )}
                </div>
            </div>

            {/* <h1 className="my-5 text-center text-2xl font-semibold text-slate-800">Sản phẩm sắp hết hàng</h1> */}
            {/* <div className="rounded bg-white shadow">
                <table className="mr-18 min-w-full table-auto border-collapse border border-slate-300">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="border px-4 py-2">#id</th>
                            <th className="border px-4 py-2">Ảnh</th>
                            <th className="border px-4 py-2">Tên</th>
                            <th className="border px-4 py-2">Mô tả</th>
                            <th className="border px-4 py-2">Giá</th>
                            <th className="border px-4 py-2 text-red-600">Tồn kho</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lowStockProducts.length > 0 ? (
                            lowStockProducts.map((product, index) => (
                                <tr key={index} className="hover:bg-slate-50">
                                    <td className="border px-4 py-2 text-center">{product.productId}</td>
                                    <td className="border px-4 py-2 text-center">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.productName}
                                                className="mx-auto mt-1 h-14 w-14 rounded-md object-cover"
                                            />
                                        ) : (
                                            <span className="italic text-gray-400">Khong co anh</span>
                                        )}
                                    </td>
                                    <td className="border px-4 py-2">{product.productName}</td>
                                    <td className="border px-4 py-2">{product.description}</td>
                                    <td className="border px-4 py-2 text-right">
                                        {product.price?.toLocaleString()} VND
                                    </td>
                                    <td className="border px-4 py-2 text-center">{product.quantity}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-4 text-center text-slate-500">
                                    Không có sản phẩm nào sắp hết hàng
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div> */}
        </div>
    );
};

const StatCard = ({ label, value }) => (
    <div
        style={{
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 0 10px rgba(0,0,0,0.05)",
            textAlign: "center",
        }}
    >
        <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>{value}</h2>
        <p style={{ fontSize: "16px", color: "#555" }}>{label}</p>
    </div>
);

export default Dashboard;
