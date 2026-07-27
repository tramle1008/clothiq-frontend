import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../../../../api/api";

const getImageKey = (image) => `${image.name}-${image.size}-${image.lastModified}`;


const ticketStatusConfig = {
    OPEN: {
        label: "Đang mở",
        className: "bg-yellow-100 text-yellow-800",
    },
    RESOLVED: {
        label: "Đã xử lý",
        className: "bg-green-100 text-green-800",
    },
    CLOSED: {
        label: "Đã đóng",
        className: "bg-gray-100 text-gray-700",
    },
};

const senderTypeConfig = {
    ADMIN: {
        label: "Admin",
        className: "w-full max-w-3xl bg-slate-100 text-slate-800",
        metaClassName: "text-slate-500",
    },
    CUSTOMER: {
        label: "Khách hàng",
        className: "w-full max-w-3xl border border-slate-200 bg-white text-slate-800",
        metaClassName: "text-emerald-500",
    },
};

const formatDateTime = (value) => {
    if (!value) {
        return "";
    }

    return new Date(value).toLocaleString("vi-VN");
};

const getErrorMessage = (error, fallbackMessage) => {
    return error?.response?.data?.message || fallbackMessage;
};

const AdminTicketDetail = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const imageInputRef = useRef(null);
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [replyContent, setReplyContent] = useState("");
    const [images, setImages] = useState([]);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const imagePreviews = useMemo(
        () => images.map((image) => ({ file: image, key: getImageKey(image), url: URL.createObjectURL(image) })),
        [images]
    );

    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [imagePreviews]);

    const fetchTicketDetail = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/admin/tickets/${ticketId}`);
            setTicket(response.data);
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể tải chi tiết ticket.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!ticketId) {
            return;
        }

        fetchTicketDetail();
    }, [ticketId]);

    const handleImagesChange = (event) => {
        const selectedImages = Array.from(event.target.files || []);

        if (selectedImages.length === 0) {
            return;
        }

        setImages((currentImages) => {
            const imageKeys = new Set(currentImages.map(getImageKey));
            const nextImages = [...currentImages];

            selectedImages.forEach((image) => {
                const imageKey = getImageKey(image);
                if (!imageKeys.has(imageKey)) {
                    imageKeys.add(imageKey);
                    nextImages.push(image);
                }
            });

            return nextImages;
        });

        event.target.value = "";
    };

    const handleRemoveImage = (imageKey) => {
        setImages((currentImages) => currentImages.filter((image) => getImageKey(image) !== imageKey));
    };

    const handleAddImagesClick = () => {
        imageInputRef.current?.click();
    };

    const handleReplySubmit = async (event) => {
        event.preventDefault();

        if (!replyContent.trim()) {
            toast.error("Vui lòng nhập nội dung phản hồi.");
            return;
        }

        const formData = new FormData();
        formData.append("content", replyContent.trim());
        images.forEach((image) => {
            formData.append("images", image);
        });

        try {
            setIsSubmittingReply(true);
            const response = await api.post(`/admin/tickets/${ticketId}/messages`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setTicket(response.data);
            setReplyContent("");
            setImages([]);
            toast.success("Đã gửi phản hồi cho khách hàng.");
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể gửi phản hồi. Vui lòng thử lại sau.";
            toast.error(message);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleStatusChange = async (event) => {
        const nextStatus = event.target.value;

        if (!nextStatus || nextStatus === ticket?.status) {
            return;
        }

        try {
            setIsUpdatingStatus(true);
            const response = await api.put(
                `/admin/tickets/${ticketId}/status`,
                { status: nextStatus },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setTicket(response.data);
            toast.success("Đã cập nhật trạng thái ticket.");
        } catch (error) {
            if (error?.response?.status === 409) {
                toast.error(getErrorMessage(error, "Ticket đã đóng, không thể cập nhật."));
                return;
            }

            const message = getErrorMessage(error, "Không thể cập nhật trạng thái ticket.");
            toast.error(message);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6 pt-[88px] text-slate-600">
                Đang tải chi tiết ticket...
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 pt-[88px] text-center">
                <p className="text-slate-600">Không tìm thấy ticket.</p>
                <Link to="/admin/tickets" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                    Quay lại danh sách ticket
                </Link>
            </div>
        );
    }

    const statusConfig = ticketStatusConfig[ticket.status] || {
        label: ticket.status,
        className: "bg-gray-100 text-gray-700",
    };
    const isClosedTicket = ticket.status === "CLOSED";

    return (
        <div className="min-h-screen bg-slate-50 p-6 pt-[88px]">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-4 inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                    >
                        Quay lại
                    </button>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                                    #{ticket.id}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.className}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
                            <div className="mt-2 grid gap-1 text-sm text-slate-500 sm:grid-cols-2">
                                <p>Khách hàng: {ticket.customerName || "Không có tên"}</p>
                                <p>Mã khách hàng: {ticket.customerId || "-"}</p>
                                <p>Tạo lúc: {formatDateTime(ticket.createdAt)}</p>
                                <p>Cập nhật: {formatDateTime(ticket.updatedAt)}</p>
                                {ticket.closedAt && <p>Đóng lúc: {formatDateTime(ticket.closedAt)}</p>}
                            </div>
                        </div>

                        <div className="w-full max-w-xs">
                            <label htmlFor="ticket-status" className="mb-2 block text-sm font-semibold text-slate-700">
                                Trạng thái
                            </label>
                            <select
                                id="ticket-status"
                                value={ticket.status || ""}
                                onChange={handleStatusChange}
                                disabled={isUpdatingStatus || isClosedTicket}
                                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                            >
                                {Object.entries(ticketStatusConfig).map(([status, config]) => (
                                    <option key={status} value={status}>
                                        {config.label}
                                    </option>
                                ))}
                            </select>
                            {isClosedTicket && (
                                <p className="mt-2 text-xs text-slate-500">Ticket đã đóng nên không thể thay đổi trạng thái.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Nội dung trao đổi</h2>
                    <div className="flex flex-col gap-4">
                        {ticket.messages?.length > 0 ? (
                            ticket.messages.map((message) => {
                                const senderConfig = senderTypeConfig[message.senderType] || senderTypeConfig.CUSTOMER;

                                return (
                                    <div key={message.id} className={`rounded-lg p-3 shadow-sm ${senderConfig.className}`}>
                                        <div className={`mb-2 text-xs font-semibold ${senderConfig.metaClassName}`}>
                                            {senderConfig.label} • {message.senderName || "Người gửi"} • {formatDateTime(message.createdAt)}
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>

                                        {message.imageUrls?.length > 0 && (
                                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {message.imageUrls.map((imageUrl) => (
                                                    <a
                                                        key={imageUrl}
                                                        href={imageUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block overflow-hidden rounded border border-slate-200 bg-white"
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt="Ảnh đính kèm"
                                                            className="h-28 w-full object-cover"
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="py-8 text-center text-sm text-slate-500">Ticket chưa có nội dung trao đổi.</p>
                        )}
                    </div>
                </div>

                <form onSubmit={handleReplySubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold text-slate-900">Phản hồi khách hàng</h2>
                    <textarea
                        value={replyContent}
                        onChange={(event) => setReplyContent(event.target.value)}
                        disabled={isSubmittingReply}
                        placeholder="Nhập nội dung phản hồi"
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                        rows={4}
                    />

                    <div className="mt-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleAddImagesClick}
                            disabled={isSubmittingReply || isClosedTicket}
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            Thêm ảnh
                        </button>
                        <span className="text-sm text-gray-500">
                            {images.length > 0 ? `${images.length} ảnh đã chọn` : "Chưa chọn ảnh"}
                        </span>
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImagesChange}
                            className="sr-only"
                            disabled={isSubmittingReply}
                        />
                    </div>

                    {imagePreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {imagePreviews.map((preview) => (
                                <div key={preview.key} className="overflow-hidden rounded-lg border bg-white">
                                    <div className="relative">
                                        <img src={preview.url} alt={preview.file.name} className="h-24 w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(preview.key)}
                                            disabled={isSubmittingReply}
                                            className="absolute right-1 top-1 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:bg-red-300"
                                            aria-label={`Xóa ảnh ${preview.file.name}`}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                    <p className="truncate p-1 text-center text-xs text-gray-600">{preview.file.name}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmittingReply || isClosedTicket}
                            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                        >
                            {isSubmittingReply ? "Đang gửi..." : "Gửi phản hồi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminTicketDetail;
