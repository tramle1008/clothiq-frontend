import React from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { FiSearch, FiX } from "react-icons/fi";

import AdminDrawer from "../AdminDrawer";

const ProductAssignmentDrawer = ({
    open,
    discount,
    productSearch,
    assigningIds,
    products,
    loading,
    saving,
    selectedIds,
    assignedIds,
    page,
    totalPages,
    totalElements,
    onClose,
    onSearchChange,
    onPageChange,
    onToggleProduct,
    onAssignSelected,
    onUnassignSelected,
    onSelectAllVisible,
    onClearVisible,
}) => {
    const visibleSelectedCount = products.filter((product) => selectedIds.includes(product.productId)).length;

    const footer = (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="ml-auto flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <button
                    type="button"
                    onClick={onUnassignSelected}
                    disabled={saving || !selectedIds.some((id) => assignedIds.includes(id))}
                    className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? "Đang xử lý..." : "Bỏ gắn đã chọn"}
                </button>
                <button
                    type="button"
                    onClick={onAssignSelected}
                    disabled={saving || !selectedIds.some((id) => !assignedIds.includes(id))}
                    className="rounded-md bg-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? "Đang xử lý..." : "Áp dụng đã chọn"}
                </button>
            </div>
        </div>
    );

    return (
        <AdminDrawer
            open={open}
            onClose={onClose}
            title={discount ? discount.name : "Áp dụng khuyến mãi"}
            width={920}
            topOffset={60}
            footer={footer}
        >
            <div className="space-y-5">
                <div className="rounded-md border border-slate-200 bg-white p-2 shadow-sm">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <label className="flex flex-1 items-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-3 focus-within:border-emerald-500">
                            <FiSearch className="shrink-0 text-slate-500" />
                            <input
                                type="text"
                                value={productSearch}
                                onChange={(event) => onSearchChange(event.target.value)}
                                placeholder="Tìm theo mã hoặc tên sản phẩm"
                                className="w-full bg-transparent text-sm text-slate-800 outline-none"
                            />
                            {productSearch && (
                                <button
                                    type="button"
                                    onClick={() => onSearchChange("")}
                                    className="text-slate-400 transition hover:text-slate-700"
                                    aria-label="Xóa tìm kiếm"
                                >
                                    <FiX />
                                </button>
                            )}
                        </label>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={onSelectAllVisible}
                                disabled={!products.length}
                                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Chọn tất cả
                            </button>
                            <button
                                type="button"
                                onClick={onClearVisible}
                                disabled={!visibleSelectedCount}
                                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Bỏ tất cả
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                        <span className="rounded-md bg-blue-100 px-3 py-1 text-gray-700">
                            Đang chọn: {visibleSelectedCount}
                        </span>
                    </div>
                </div>

                <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="border-b border-slate-200 px-4 py-3 text-left">Chọn</th>
                                    <th className="border-b border-slate-200 px-4 py-3 text-left">Mã sản phẩm</th>
                                    <th className="border-b border-slate-200 px-4 py-3 text-left">Tên sản phẩm</th>
                                    <th className="border-b border-slate-200 px-4 py-3 text-left">Tồn kho</th>
                                    <th className="border-b border-slate-200 px-4 py-3 text-left">Trạng thái áp dụng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-6 text-center text-slate-500">
                                            Đang tải danh sách sản phẩm...
                                        </td>
                                    </tr>
                                ) : products.length > 0 ? (
                                    products.map((product) => {
                                        const isSelected = selectedIds.includes(product.productId);
                                        const isAssigned = assignedIds.includes(product.productId);

                                        return (
                                            <tr key={product.productId} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td
                                                    className="cursor-pointer px-4 py-3"
                                                    onClick={() => onToggleProduct(product.productId)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => onToggleProduct(product.productId)}
                                                        onClick={(event) => event.stopPropagation()}
                                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                </td>

                                                <td className="px-4 py-3 text-sm text-slate-700">{product.productCode || "--"}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-slate-800">{product.productName || "--"}</td>
                                                <td className="px-4 py-3 text-sm text-slate-700">{product.quantity ?? "--"}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-semibold ${isAssigned ? "bg-emerald-200 text-gray-700" : "bg-slate-100 text-slate-600"}`}
                                                    >
                                                        {isAssigned ? "Đã áp dụng" : "Chưa áp dụng"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-6 text-center text-slate-500">
                                            Không tìm thấy sản phẩm nào phù hợp.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && totalPages > 1 ? (
                        <div className="border-t border-slate-200 px-4 py-4">
                            <div className="mb-3 text-center text-sm text-slate-500">
                                Hiển thị {products.length} / {totalElements} sản phẩm
                            </div>
                            <Stack spacing={2} alignItems="center">
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    variant="outlined"
                                    shape="rounded"
                                    color="success"
                                    onChange={(_, value) => onPageChange(value)}
                                />
                            </Stack>
                        </div>
                    ) : null}
                </div>

                {assigningIds.length > 0 ? (
                    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 text-sm font-semibold text-slate-800">Product đang được áp dụng khuyến mãi</div>
                        <div className="flex flex-wrap gap-2">
                            {assigningIds.map((productId) => {
                                const assignedProduct = products.find((product) => product.productId === productId);

                                return (
                                    <span key={productId} className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                        {assignedProduct?.productCode || `#${productId}`}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                ) : null}
            </div>
        </AdminDrawer>
    );
};

export default ProductAssignmentDrawer;
