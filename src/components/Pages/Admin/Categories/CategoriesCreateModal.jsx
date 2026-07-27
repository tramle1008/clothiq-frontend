import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Switch } from "@headlessui/react";
import { FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";

import { addCategoryApi } from "../../../../api/inventoryApi";

const CategoriesCreateModal = ({ isOpen, onClose, onSuccess }) => {
    const [categoryName, setCategoryName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setCategoryName("");
        setIsActive(true);
    };

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onClose?.();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const normalizedName = categoryName.trim();
        if (!normalizedName) {
            toast.error("Vui lòng nhập tên danh mục.");
            return;
        }

        try {
            setIsSubmitting(true);

            await addCategoryApi({
                category: {
                    categoryName: normalizedName,
                    status: isActive ? "ACTIVE" : "INACTIVE",
                },
            });

            toast.success("Đã thêm danh mục.");
            resetForm();
            await onSuccess?.();
            onClose?.();
        } catch (error) {
            console.error("Loi khi them danh muc:", error);
            toast.error(error?.response?.data?.message || "Thêm danh mục thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} as="div" className="relative z-[140] focus:outline-none" onClose={handleClose}>
            <DialogBackdrop className="fixed inset-0 bg-slate-900/45 backdrop-blur-[2px]" />

            <div className="fixed inset-0 z-[140] w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-lg rounded-md bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <DialogTitle as="h3" className="text-xl font-bold text-slate-900">
                                    Thêm danh mục
                                </DialogTitle>

                            </div>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:bg-slate-50"
                            >
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Tên danh mục
                                </label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(event) => setCategoryName(event.target.value)}
                                    className="h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
                                    placeholder="Nhập tên danh mục"
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                                <div>
                                    <div className="text-sm font-medium text-slate-800">Trạng thái</div>
                                    <div className="text-xs text-slate-500">
                                        Bật để danh mục hoạt động, tắt để ẩn khỏi danh sách.
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium ${isActive ? "text-emerald-600" : "text-slate-500"}`}>
                                        {isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                    <Switch
                                        checked={isActive}
                                        onChange={setIsActive}
                                        className={`${isActive ? "bg-emerald-600" : "bg-slate-300"
                                            } relative inline-flex h-7 w-12 items-center rounded-full transition`}
                                    >
                                        <span
                                            className={`${isActive ? "translate-x-6" : "translate-x-1"
                                                } inline-block h-5 w-5 transform rounded-full bg-white transition`}
                                        />
                                    </Switch>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? "Đang thêm..." : "Thêm danh mục"}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default CategoriesCreateModal;
