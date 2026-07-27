import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import api from "../../../api/api";
import { FiPlus } from "react-icons/fi";

const getImageKey = (image) => `${image.name}-${image.size}-${image.lastModified}`;

const TicketCreate = () => {
    const navigate = useNavigate();
    const imageInputRef = useRef(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const imagePreviews = useMemo(
        () => images.map((image) => ({ file: image, key: getImageKey(image), url: URL.createObjectURL(image) })),
        [images]
    );

    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [imagePreviews]);

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

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!title.trim() || !content.trim()) {
            toast.error("Vui lòng nhập đầy đủ tiêu đề và mô tả.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("content", content.trim());
        images.forEach((image) => {
            formData.append("images", image);
        });

        try {
            setIsSubmitting(true);
            await api.post("/tickets", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Đã tạo yêu cầu hỗ trợ.");
            navigate("/ticket");
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể tạo yêu cầu hỗ trợ. Vui lòng thử lại sau.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-1 flex-col p-6 pt-[88px]">
            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-center text-2xl font-bold">Tạo yêu cầu hỗ trợ</h2>
                <div className="mb-4">
                    <label htmlFor="title" className="mb-2 block font-semibold text-gray-700">
                        Tiêu đề *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Nhập tiêu đề yêu cầu hỗ trợ"
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                    <label htmlFor="content" className="mb-2 mt-4 block font-semibold text-gray-700">
                        Mô tả chi tiết *
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder="Nhập mô tả chi tiết về vấn đề bạn gặp phải"
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                        rows={5}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="images" className="mb-2 block font-semibold text-gray-700">
                        Hình ảnh đi kèm
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleAddImagesClick}
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
                            <FiPlus />
                        </button>
                        <span className="text-sm text-gray-500">
                            {images.length > 0 ? `${images.length} ảnh đã chọn` : "Chưa chọn ảnh"}
                        </span>
                    </div>
                    <input
                        ref={imageInputRef}
                        type="file"
                        id="images"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                        className="sr-only"
                    />
                    {imagePreviews.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-2 text-sm font-medium text-gray-700">
                                Ảnh đã chọn ({imagePreviews.length})
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {imagePreviews.map((preview) => (
                                    <div
                                        key={preview.key}
                                        className="overflow-hidden rounded-lg border bg-white"
                                    >
                                        <div className="relative">
                                            <img
                                                src={preview.url}
                                                alt={preview.file.name}
                                                className="h-24 w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(preview.key)}
                                                className="absolute right-1 top-1 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
                                                aria-label={`Xóa ảnh ${preview.file.name}`}
                                            >
                                                X
                                            </button>
                                        </div>
                                        <p className="truncate p-1 text-center text-xs text-gray-600">
                                            {preview.file.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mr-2 inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                    >
                        {isSubmitting ? "Đang tạo..." : "Tạo yêu cầu"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TicketCreate;
