import { FiPlus } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../../api/api";

const TicketPage = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleCreateTicket = () => {
        navigate("/ticket/create");
    };

    const fetchTickets = async () => {
        try {
            setLoading(true);

            const response = await api.get("/tickets");

            setTickets(response.data);
        } catch (error) {
            toast.error("Không thể tải danh sách yêu cầu hỗ trợ.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTickets();
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
        <div className="p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Lịch sử yêu cầu</h1>
                </div>

                <button
                    type="button"
                    onClick={handleCreateTicket}
                    className="inline-flex w-fit items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                    <FiPlus className="text-sm" />
                    Tạo yêu cầu hỗ trợ
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Tên yêu cầu
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Trạng thái
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Tạo lúc
                            </th>

                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-10 text-center">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : tickets.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-500">
                                    Chưa có yêu cầu hỗ trợ nào.
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link to={`/ticket/detail/${ticket.id}`} className="text-blue-600 hover:cursor-pointer hover:underline">
                                            {ticket.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ticketStatusConfig[ticket.status]?.className ??
                                                "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {ticketStatusConfig[ticket.status]?.label ?? ticket.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TicketPage;
