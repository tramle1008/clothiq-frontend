import React from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { FiX } from "react-icons/fi";

const DiscountFormModal = ({ open, form, isSubmitting, isEdit, onChange, onClose, onSubmit }) => (
    <Dialog
        open={open}
        as="div"
        className="relative z-[140] focus:outline-none"
        onClose={isSubmitting ? () => { } : onClose}
    >
        <DialogBackdrop className="fixed inset-0 bg-slate-900/45 backdrop-blur-[2px]" />

        <div className="fixed inset-0 z-[140] w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <DialogPanel className="w-full max-w-2xl rounded-md bg-white p-6 shadow-2xl">
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <DialogTitle as="h3" className="text-2xl font-semibold text-slate-900">
                                {isEdit ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"}
                            </DialogTitle>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Đóng modal"
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">Tên khuyến mãi</span>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(event) => onChange("name", event.target.value)}
                                    placeholder="Nhập tên khuyến mãi"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
                                    required
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">Phần trăm giảm</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={form.percent}
                                    onChange={(event) => onChange("percent", event.target.value)}
                                    placeholder="0 - 100"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
                                    required
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">Ngày bắt đầu</span>
                                <input
                                    type="datetime-local"
                                    value={form.startDate}
                                    onChange={(event) => onChange("startDate", event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">Ngày kết thúc</span>
                                <input
                                    type="datetime-local"
                                    value={form.endDate}
                                    onChange={(event) => onChange("endDate", event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
                                />
                            </label>
                        </div>

                        <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 md:w-1/3">
                            <div>
                                <span className="block text-sm font-medium text-slate-800">Kích hoạt</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => onChange("active", !form.active)}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${form.active ? "bg-emerald-500" : "bg-slate-300"}`}
                                aria-pressed={form.active}
                            >
                                <span
                                    className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition ${form.active ? "translate-x-7" : "translate-x-1"}`}
                                />
                            </button>
                        </label>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Thêm discount"}
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </div>
    </Dialog>
);

export default DiscountFormModal;
