import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../../../../api/api";
import { FiEye, FiEdit } from "react-icons/fi";

const AdminTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [pageInfo, setPageInfo] = useState({
        pageNumber: 0,
        totalPages: 0,
        totalElements: 0,
        lastPage: true,
    });
    const [loading, setLoading] = useState(true);
    const fetchAllTickets = async (page = 0) => {
        try {
            setLoading(true);

            const response = await api.get("/admin/tickets", {
                params: {
                    page,
                    size: 10,
                },
            });

            setTickets(response.data.content);

            setPageInfo({
                pageNumber: response.data.pageNumber,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements,
                lastPage: response.data.lastPage,
            });
        } catch (error) {
            toast.error("Không thể tải danh sách ticket.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTickets();
    }, []);
    const ticketStatusConfig = {
        OPEN: {
            label: "Chờ phản hồi",
            className: "bg-yellow-100 text-yellow-800",
        },
        RESOLVED: {
            label: "Đã trả lời",
            className: "bg-green-100 text-green-800",
        },
        CLOSED: {
            label: "Đã đóng",
            className: "bg-gray-100 text-gray-700",
        },
    };
    return (
        <div className="p-4 pt-[88px]">
            <h1 className="text-2xl font-semibold text-slate-800">Hỗ trợ khách hàng</h1>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm mt-4">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr className="text-left text-sm font-semibold text-slate-700">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Tên yêu cầu
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Khách hàng
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Trạng thái
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Cập nhật lần cuối
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : tickets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-500">
                                    Không có ticket nào.
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket) => (
                                <tr key={ticket.id} className="border-t border-slate-200 text-sm text-slate-700">
                                    <td className="px-3 py-2 text-sm font-semibold text-slate-700">{ticket.id}</td>

                                    <td className="px-3 py-2 text-sm text-slate-700">
                                        <Link
                                            to={`/admin/tickets/detail/${ticket.id}`}
                                            className="font-medium text-blue-600 hover:underline"
                                        >
                                            {ticket.title}
                                        </Link>
                                    </td>

                                    <td className="px-3 py-2 text-sm text-slate-700">
                                        {ticket.customerName}
                                    </td>

                                    <td className="px-3 py-2 text-sm text-slate-700">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${ticketStatusConfig[ticket.status]?.className ??
                                                "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {ticketStatusConfig[ticket.status]?.label ??
                                                ticket.status}
                                        </span>
                                    </td>

                                    <td className="px-3 py-2 text-sm text-slate-700">
                                        {new Date(ticket.updatedAt).toLocaleString("vi-VN")}
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <Link to={`/admin/tickets/detail/${ticket.id}`} className="hover:cursor-pointer">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                            >
                                                <FiEye size={14} />
                                            </button>
                                        </Link>

                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminTicket;