import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

import AlertModel from "../../AlerModel/AlertModel";
import api from "../../../api/api";

const getImageKey = (image) => `${image.name}-${image.size}-${image.lastModified}`;

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

const senderTypeConfig = {
    CUSTOMER: {
        label: "Bạn",
        className: "w-full max-w-3xl border border-slate-200 bg-white text-slate-800",
        metaClassName: "text-emerald-500",
    },
    ADMIN: {
        label: "Hỗ trợ",
        className: "w-full max-w-3xl bg-slate-100 text-slate-800",
        metaClassName: "text-slate-500",
    },
};

const formatDateTime = (value) => {
    if (!value) {
        return "";
    }

    return new Date(value).toLocaleString("vi-VN");
};

const TicketDetail = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const imageInputRef = useRef(null);
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCloseAlertOpen, setIsCloseAlertOpen] = useState(false);

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
            const response = await api.get(`/tickets/${ticketId}`);
            setTicket(response.data);
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể tải chi tiết yêu cầu hỗ trợ.";
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
    const handleCloseTicket = async () => {
        try {
            setIsSubmitting(true);
            await api.put(`/tickets/${ticketId}/close`);
            toast.success("Yêu cầu đã được đóng.");
            setIsCloseAlertOpen(false);
            fetchTicketDetail();
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể đóng yêu cầu. Vui lòng thử lại sau.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddImagesClick = () => {
        imageInputRef.current?.click();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!content.trim()) {
            toast.error("Vui lòng nhập nội dung phản hồi.");
            return;
        }

        const formData = new FormData();
        formData.append("content", content.trim());
        images.forEach((image) => {
            formData.append("images", image);
        });

        try {
            setIsSubmitting(true);
            const response = await api.post(`/tickets/${ticketId}/messages`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setTicket(response.data);
            setContent("");
            setImages([]);
            toast.success("Đã gửi phản hồi.");
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể gửi phản hồi. Vui lòng thử lại sau.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-1 items-center justify-center p-6 pt-[88px] text-slate-600">
                Đang tải chi tiết yêu cầu...
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 p-6 pt-[88px] text-center">
                <p className="text-slate-600">Không tìm thấy yêu cầu hỗ trợ.</p>
                <Link to="/ticket" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    const statusConfig = ticketStatusConfig[ticket.status] || {
        label: ticket.status,
        className: "bg-gray-100 text-gray-700",
    };
    const isClosed = ticket.status === "CLOSED";

    return (
        <div className="min-h-screen flex-1 bg-slate-50 p-6 pt-[88px]">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-4 inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                    >
                        Quay lại
                    </button>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Tạo lúc {formatDateTime(ticket.createdAt)}
                                {ticket.updatedAt ? ` • Cập nhật ${formatDateTime(ticket.updatedAt)}` : ""}
                            </p>
                        </div>
                        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.className}`}>
                            {statusConfig.label}
                        </span>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Trao đổi</h2>
                    <div className="flex flex-col gap-4">
                        {(ticket.messages || []).map((message) => {
                            const senderConfig = senderTypeConfig[message.senderType] || senderTypeConfig.ADMIN;

                            return (
                                <div key={message.id} className={`max-w-[85%] rounded-lg p-3 shadow-sm ${senderConfig.className}`}>
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
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold text-slate-900">Gửi phản hồi</h2>
                    <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        disabled={isClosed || isSubmitting}
                        placeholder={isClosed ? "Yêu cầu đã đóng." : "Nhập nội dung phản hồi"}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                        rows={4}
                    />

                    <div className="mt-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleAddImagesClick}
                            disabled={isClosed || isSubmitting}
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
                            disabled={isClosed || isSubmitting}
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
                                            disabled={isSubmitting}
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
                            type="button"
                            disabled={isClosed || isSubmitting}
                            className="mr-2 inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                            onClick={() => setIsCloseAlertOpen(true)}
                        >
                            Đóng yêu cầu
                        </button>
                        <button
                            type="submit"
                            disabled={isClosed || isSubmitting}
                            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                        >
                            {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
                        </button>
                    </div>
                </form>

                <AlertModel
                    open={isCloseAlertOpen}
                    title="Đóng yêu cầu hỗ trợ?"
                    message="Sau khi đóng, bạn sẽ không thể gửi thêm phản hồi cho yêu cầu này."
                    onClose={() => setIsCloseAlertOpen(false)}
                    onConfirm={handleCloseTicket}
                    confirmText="Đóng yêu cầu"
                    cancelText="Hủy"
                    loading={isSubmitting}
                    tone="danger"
                />
            </div>
        </div>
    );
};

export default TicketDetail;
