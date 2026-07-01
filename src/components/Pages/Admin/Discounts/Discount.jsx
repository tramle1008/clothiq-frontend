import React, { useEffect, useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FiLink, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";

import api from "../../../../api/api";
import AlertModel from "../../../AlerModel/AlertModel";
import DiscountFormModal from "./DiscountFormModal";
import ProductAssignmentDrawer from "./ProductAssignmentDrawer";

const EMPTY_FORM = {
    name: "",
    percent: "",
    startDate: "",
    endDate: "",
    active: true,
};

const pad = (value) => String(value).padStart(2, "0");

const toDateTimeLocalValue = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toApiDateTime = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const timezoneOffset = -date.getTimezoneOffset();
    const sign = timezoneOffset >= 0 ? "+" : "-";
    const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
    const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${offsetHours}:${offsetMinutes}`;
};

const formatDateTime = (value) => {
    if (!value) {
        return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getStatusMeta = (discount) => {
    const now = new Date();
    const start = discount.startDate ? new Date(discount.startDate) : null;
    const end = discount.endDate ? new Date(discount.endDate) : null;

    if (!discount.active) {
        return {
            label: "Chưa kích hoạt",
            className: "bg-slate-100 text-slate-600",
        };
    }

    if (start && now < start) {
        return {
            label: "Sắp diễn ra",
            className: "bg-blue-100 text-slate-700",
        };
    }

    if (end && now > end) {
        return {
            label: "Đã hết hạn",
            className: "bg-rose-100 text-rose-700",
        };
    }

    return {
        label: "Đã áp dụng",
        className: "bg-emerald-100 text-emerald-700",
    };
};

const Discount = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [switchingId, setSwitchingId] = useState(null);
    const [assigningDiscount, setAssigningDiscount] = useState(null);
    const [drawerProducts, setDrawerProducts] = useState([]);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [drawerSaving, setDrawerSaving] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [drawerPage, setDrawerPage] = useState(1);
    const [drawerPagination, setDrawerPagination] = useState({
        totalPages: 0,
        totalElements: 0,
    });
    const [deletingDiscount, setDeletingDiscount] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const response = await api.get("/discounts");
            setDiscounts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Khong the lay danh sach discount:", error);
            toast.error(error.response?.data?.message || "Khong the lay danh sach discount.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    useEffect(() => {
        if (!assigningDiscount) {
            return;
        }

        let isMounted = true;

        const fetchProductsForDrawer = async () => {
            try {
                setDrawerLoading(true);
                const params = new URLSearchParams({
                    pageNumber: String(drawerPage - 1),
                    pageSize: "10",
                    sortBy: "productId",
                    sortOrder: "asc",
                });

                if (productSearch.trim()) {
                    params.set("key", productSearch.trim());
                }

                const endpoint = productSearch.trim()
                    ? `/admin/products/search?${params.toString()}`
                    : `/admin/products?${params.toString()}`;

                const response = await api.get(endpoint);

                if (!isMounted) {
                    return;
                }

                setDrawerProducts(Array.isArray(response.data?.content) ? response.data.content : []);
                setDrawerPagination({
                    totalPages: Number(response.data?.totalPages) || 0,
                    totalElements: Number(response.data?.totalElements) || 0,
                });
            } catch (error) {
                console.error("Khong the lay danh sach san pham cho drawer:", error);
                if (isMounted) {
                    toast.error(error.response?.data?.message || "Khong the lay danh sach san pham.");
                }
            } finally {
                if (isMounted) {
                    setDrawerLoading(false);
                }
            }
        };

        fetchProductsForDrawer();

        return () => {
            isMounted = false;
        };
    }, [assigningDiscount, productSearch, drawerPage]);

    const filteredDiscounts = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) {
            return discounts;
        }

        return discounts.filter((discount) =>
            [discount.discountId, discount.name, discount.percent]
                .filter(Boolean)
                .some((value) => value.toString().toLowerCase().includes(keyword))
        );
    }, [discounts, searchTerm]);

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingDiscount(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (discount) => {
        setEditingDiscount(discount);
        setForm({
            name: discount.name || "",
            percent: discount.percent ?? "",
            startDate: toDateTimeLocalValue(discount.startDate),
            endDate: toDateTimeLocalValue(discount.endDate),
            active: Boolean(discount.active),
        });
        setIsModalOpen(true);
    };

    const closeModal = (force = false) => {
        if (isSubmitting && !force) {
            return;
        }

        setIsModalOpen(false);
        resetForm();
    };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const percentValue = Number(form.percent);
        const startDateValue = form.startDate ? new Date(form.startDate) : null;
        const endDateValue = form.endDate ? new Date(form.endDate) : null;

        if (Number.isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
            toast.error("Phan tram giam phai nam trong khoang 0 den 100.");
            return;
        }

        if (startDateValue && Number.isNaN(startDateValue.getTime())) {
            toast.error("Ngay bat dau khong hop le.");
            return;
        }

        if (endDateValue && Number.isNaN(endDateValue.getTime())) {
            toast.error("Ngay ket thuc khong hop le.");
            return;
        }

        if (startDateValue && endDateValue && startDateValue > endDateValue) {
            toast.error("Ngay ket thuc phai lon hon hoac bang ngay bat dau.");
            return;
        }

        const payload = {
            name: form.name.trim(),
            percent: percentValue,
            startDate: toApiDateTime(form.startDate),
            endDate: toApiDateTime(form.endDate),
            active: Boolean(form.active),
        };

        try {
            setIsSubmitting(true);

            if (editingDiscount?.discountId) {
                await api.put(`/discounts/${editingDiscount.discountId}`, payload);
                toast.success("Đã cập nhật khuyến mãi thành công.");
            } else {
                await api.post("/discounts", payload);
                toast.success("Đã thêm khuyến mãi thành công.");
            }

            closeModal(true);
            fetchDiscounts();
        } catch (error) {
            console.error("Không thể lưu khuyến mãi:", error);
            toast.error(error.response?.data?.message || "Không thể lưu khuyến mãi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (discount) => {
        try {
            setSwitchingId(discount.discountId);
            await api.put(`/discounts/${discount.discountId}/status`, {
                active: !discount.active,
            });
            setDiscounts((prev) =>
                prev.map((item) =>
                    item.discountId === discount.discountId
                        ? { ...item, active: !discount.active }
                        : item
                )
            );
            toast.success("Đã cập nhật trạng thái khuyến mãi.");
        } catch (error) {
            console.error("Khong the cap nhat trang thai khuyen mai:", error);
            toast.error(error.response?.data?.message || "Khong the cap nhat trang thai khuyen mai.");
        } finally {
            setSwitchingId(null);
        }
    };

    const handleDeleteDiscount = async () => {
        if (!deletingDiscount?.discountId) {
            return;
        }

        try {
            setIsDeleting(true);
            await api.delete(`/discounts/${deletingDiscount.discountId}`);
            setDeletingDiscount(null);
            toast.success("Đã xóa khuyến mãi.");
            fetchDiscounts();
        } catch (error) {
            console.error("Không thể xóa khuyến mãi:", error);
            toast.error(error.response?.data?.message || "Không thể xóa khuyến mãi.");
        } finally {
            setIsDeleting(false);
        }
    };

    const openAssignmentDrawer = (discount) => {
        const assigned = Array.isArray(discount.productIds) ? discount.productIds : [];
        setAssigningDiscount(discount);
        setSelectedProductIds(assigned);
        setProductSearch("");
        setDrawerPage(1);
    };

    const closeAssignmentDrawer = () => {
        if (drawerSaving) {
            return;
        }

        setAssigningDiscount(null);
        setDrawerProducts([]);
        setDrawerPagination({
            totalPages: 0,
            totalElements: 0,
        });
        setProductSearch("");
        setDrawerPage(1);
        setSelectedProductIds([]);
    };

    const handleProductSearchChange = (value) => {
        setProductSearch(value);
        setDrawerPage(1);
    };

    const handleToggleProductSelection = (productId) => {
        setSelectedProductIds((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const handleAssignSelectedProducts = async () => {
        if (!assigningDiscount?.discountId) {
            return;
        }

        const currentAssigned = assigningDiscount.productIds || [];
        const productIdsToAssign = selectedProductIds.filter((id) => !currentAssigned.includes(id));

        if (!productIdsToAssign.length) {
            toast.error("Khong co san pham moi de gan.");
            return;
        }

        try {
            setDrawerSaving(true);
            const response = await api.post(`/discounts/${assigningDiscount.discountId}/products`, {
                productIds: productIdsToAssign,
            });
            const updatedDiscount = response.data;
            setAssigningDiscount(updatedDiscount);
            setSelectedProductIds(updatedDiscount.productIds || []);
            setDiscounts((prev) =>
                prev.map((item) => (item.discountId === updatedDiscount.discountId ? updatedDiscount : item))
            );
            toast.success("Đã gán sản phẩm cho khuyến mãi.");
        } catch (error) {
            console.error("Khong the gan san pham cho khuyen mai:", error);
            toast.error(error.response?.data?.message || "Khong the gan san pham cho khuyen mai.");
        } finally {
            setDrawerSaving(false);
        }
    };

    const handleUnassignSelectedProducts = async () => {
        if (!assigningDiscount?.discountId) {
            return;
        }

        const currentAssigned = assigningDiscount.productIds || [];
        const productIdsToUnassign = selectedProductIds.filter((id) => currentAssigned.includes(id));

        if (!productIdsToUnassign.length) {
            toast.error("Hay chon it nhat mot san pham da duoc gan de bo gan.");
            return;
        }

        try {
            setDrawerSaving(true);
            const response = await api.delete(`/discounts/${assigningDiscount.discountId}/products`, {
                data: {
                    productIds: productIdsToUnassign,
                },
            });
            const updatedDiscount = response.data;
            setAssigningDiscount(updatedDiscount);
            setSelectedProductIds(updatedDiscount.productIds || []);
            setDiscounts((prev) =>
                prev.map((item) => (item.discountId === updatedDiscount.discountId ? updatedDiscount : item))
            );
            toast.success("Đã bỏ gán sản phẩm khỏi khuyến mãi.");
        } catch (error) {
            console.error("Khong the bo gan san pham khoi khuyen mai:", error);
            toast.error(error.response?.data?.message || "Khong the bo gan san pham khoi khuyen mai.");
        } finally {
            setDrawerSaving(false);
        }
    };

    const handleSelectAllVisibleProducts = () => {
        const visibleIds = drawerProducts.map((product) => product.productId).filter(Boolean);
        setSelectedProductIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    };

    const handleClearVisibleProducts = () => {
        const visibleIds = drawerProducts.map((product) => product.productId);
        setSelectedProductIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    };

    return (
        <div className="mt-[88px] flex min-h-screen flex-1 flex-col p-6">
            <div>
                <div className="mb-4 mt-2 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">Danh sách khuyến mãi</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                        >
                            <FiPlus />
                            Khuyến mãi mới
                        </button>
                    </div>
                </div>

                <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="max-w-2xl flex-1">
                        <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-500">
                            <span className="shrink-0 text-lg text-slate-500">
                                <FiSearch />
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Tìm theo mã, tên hoặc phần trăm giảm"
                                className="w-full bg-transparent text-sm text-slate-800 outline-none"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="text-slate-400 transition hover:text-slate-700"
                                    aria-label="Xóa tìm kiếm"
                                >
                                    <FiX />
                                </button>
                            )}
                        </label>
                    </div>
                </div>

                <div className="overflow-hidden rounded bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse border border-slate-300">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="border px-2 py-2">STT</th>
                                    <th className="border px-4 py-2">Tên khuyến mãi</th>
                                    <th className="border px-4 py-2">Giảm (%)</th>
                                    <th className="border px-4 py-2">Bắt đầu</th>
                                    <th className="border px-4 py-2">Kết thúc</th>
                                    <th className="border px-4 py-2">Số sản phẩm</th>
                                    <th className="border px-4 py-2">Hiện trạng</th>
                                    <th className="border px-4 py-2">Active</th>
                                    <th className="border px-4 py-2">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="py-6 text-center text-slate-500">
                                            Đang tải danh sách discount...
                                        </td>
                                    </tr>
                                ) : filteredDiscounts.length > 0 ? (
                                    filteredDiscounts.map((discount, index) => {
                                        const statusMeta = getStatusMeta(discount);

                                        return (
                                            <tr key={discount.discountId ?? index} className="hover:bg-slate-50">
                                                <td className="border px-2 py-2 text-center">{index + 1}</td>
                                                <td className="border px-4 py-2 font-medium text-slate-800">{discount.name}</td>
                                                <td className="border px-4 py-2 text-center">
                                                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                        {discount.percent}%
                                                    </span>
                                                </td>
                                                <td className="border px-4 py-2 text-center">{formatDateTime(discount.startDate)}</td>
                                                <td className="border px-4 py-2 text-center">{formatDateTime(discount.endDate)}</td>
                                                <td className="border px-4 py-2 text-center">{discount.productIds?.length || 0}</td>
                                                <td className="border px-4 py-2 text-center">
                                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                                                        {statusMeta.label}
                                                    </span>
                                                </td>
                                                <td className="border px-4 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleActive(discount)}
                                                        disabled={switchingId === discount.discountId}
                                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${discount.active ? "bg-emerald-500" : "bg-slate-300"} ${switchingId === discount.discountId ? "cursor-not-allowed opacity-60" : ""}`}
                                                        aria-label={`Chuyen trang thai discount ${discount.name}`}
                                                        aria-pressed={discount.active}
                                                    >
                                                        <span
                                                            className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transition ${discount.active ? "translate-x-7" : "translate-x-1"}`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="border px-4 py-2 text-center align-middle">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (discount.active) {
                                                                    openAssignmentDrawer(discount);
                                                                }
                                                            }}
                                                            className={`text-slate-500 transition ${discount.active ? "hover:text-slate-800" : "cursor-not-allowed opacity-40"}`}
                                                            aria-label={
                                                                discount.active
                                                                    ? `án sản phẩm cho discount ${discount.name}`
                                                                    : `Discount ${discount.name} đang unactive, không thể gán sản phẩm`
                                                            }
                                                            title={
                                                                discount.active
                                                                    ? "Gán sản phẩm"
                                                                    : "Discount đang unactive, hãy bật active trước khi gán sản phẩm"
                                                            }
                                                        >
                                                            <FiLink size={20} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(discount)}
                                                            className="text-gray-500 transition hover:text-gray-800"
                                                            aria-label={`Sua discount ${discount.name}`}
                                                        >
                                                            <FaEdit size={22} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingDiscount(discount)}
                                                            className="text-red-500 transition hover:text-red-700"
                                                            aria-label={`Xóa discount ${discount.name}`}
                                                        >
                                                            <MdDelete size={24} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="py-6 text-center text-slate-500">
                                            {searchTerm.trim() ? "Không tìm thấy discount phù hợp." : "Không có discount nào."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DiscountFormModal
                open={isModalOpen}
                form={form}
                isSubmitting={isSubmitting}
                isEdit={Boolean(editingDiscount)}
                onChange={handleFormChange}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />

            <ProductAssignmentDrawer
                open={Boolean(assigningDiscount)}
                discount={assigningDiscount}
                productSearch={productSearch}
                assigningIds={assigningDiscount?.productIds || []}
                products={drawerProducts}
                loading={drawerLoading}
                saving={drawerSaving}
                selectedIds={selectedProductIds}
                assignedIds={assigningDiscount?.productIds || []}
                page={drawerPage}
                totalPages={drawerPagination.totalPages}
                totalElements={drawerPagination.totalElements}
                onClose={closeAssignmentDrawer}
                onSearchChange={handleProductSearchChange}
                onPageChange={setDrawerPage}
                onToggleProduct={handleToggleProductSelection}
                onAssignSelected={handleAssignSelectedProducts}
                onUnassignSelected={handleUnassignSelectedProducts}
                onSelectAllVisible={handleSelectAllVisibleProducts}
                onClearVisible={handleClearVisibleProducts}
            />

            <AlertModel
                open={Boolean(deletingDiscount)}
                title="Xóa khuyến mãi"
                message={`Bạn có chắc chắn muốn xóa ${deletingDiscount?.name || "khuyến mãi này"} không?`}
                confirmText="Xóa khuyến mãi"
                cancelText="Hủy"
                tone="danger"
                loading={isDeleting}
                onClose={() => {
                    if (!isDeleting) {
                        setDeletingDiscount(null);
                    }
                }}
                onConfirm={handleDeleteDiscount}
            />
        </div>
    );
};

export default Discount;
