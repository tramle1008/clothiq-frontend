import React from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { FiAlertTriangle, FiInfo, FiTrash2 } from "react-icons/fi";

const toneMap = {
    info: {
        icon: FiInfo,
        badgeClass: "bg-sky-100 text-sky-700",
        confirmClass: "bg-slate-800 hover:bg-slate-700 focus:ring-slate-300",
        label: "Thông báo",
    },
    warning: {
        icon: FiAlertTriangle,
        badgeClass: "bg-amber-100 text-amber-700",
        confirmClass: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-300",
        label: "Cảnh báo",
    },
    danger: {
        icon: FiTrash2,
        badgeClass: "bg-rose-100 text-rose-700",
        confirmClass: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-300",
        label: "Xác nhận",
    },
};

const AlertModel = ({
    open,
    title,
    message,
    onClose,
    onConfirm,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    loading = false,
    tone = "warning",
}) => {
    const config = toneMap[tone] || toneMap.warning;
    const Icon = config.icon;

    return (
        <Dialog
            open={open}
            as="div"
            className="relative z-[140] focus:outline-none"
            onClose={loading ? () => { } : onClose}
        >
            <DialogBackdrop className="fixed inset-0 bg-slate-900/45 backdrop-blur-[2px]" />

            <div className="fixed inset-0 z-[140] w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-md rounded-md bg-white p-6 shadow-2xl">
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${config.badgeClass}`}>
                                <Icon size={20} />
                            </div>

                            <div className="min-w-0 flex-1">


                                <DialogTitle as="h3" className="mt-3 text-xl font-bold text-slate-900">
                                    {title}
                                </DialogTitle>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {message}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {cancelText}
                            </button>

                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={loading}
                                className={`rounded-md px-4 py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${config.confirmClass}`}
                            >
                                {loading ? "Đang xử lý..." : confirmText}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default AlertModel;
