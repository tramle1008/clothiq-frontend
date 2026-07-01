import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";

import { deleteProductApi } from "../../../../api/inventoryApi";
import { fetchCategories, fetchProduct } from "../../../../store/actions";
import AlertModel from "../../../AlerModel/AlertModel";
import PaginationRounded from "../../../PaginationRounded";
import AddProductForm from "./AddProductForm";
import ProductUpdateDrawer from "./ProductUpdateDrawer";

const PAGE_SIZE_OPTIONS = [5, 10, 15];

const formatCurrency = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "--";
    }

    return `${Number(value).toLocaleString()} VND`;
};

const AdminProductList = () => {
    const { products, categories, pagination } = useSelector((state) => state.products);
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const searchKey = searchParams.get("key") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const pageSizeParam = Number(searchParams.get("pageSize"));
    const pageSize = PAGE_SIZE_OPTIONS.includes(pageSizeParam) ? pageSizeParam : 5;
    const [searchTerm, setSearchTerm] = useState(searchKey);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setSearchTerm(searchKey);
    }, [searchKey]);

    useEffect(() => {
        dispatch(fetchCategories("pageNumber=0&pageSize=1000"));
    }, [dispatch]);

    const loadProducts = () => {
        const pageIndex = page - 1;
        const params = new URLSearchParams({
            pageNumber: pageIndex.toString(),
            pageSize: pageSize.toString(),
            sortBy: "productId",
            sortOrder: "asc",
        });

        if (searchKey.trim()) {
            params.set("key", searchKey.trim());
        }

        if (categoryId) {
            params.set("categoryId", categoryId);
        }

        dispatch(fetchProduct(params.toString()));
    };

    useEffect(() => {
        loadProducts();
    }, [dispatch, page, pageSize, searchKey, categoryId]);

    const handleSearch = () => {
        const nextParams = new URLSearchParams(searchParams);

        if (searchTerm.trim()) {
            nextParams.set("key", searchTerm.trim());
        } else {
            nextParams.delete("key");
        }

        nextParams.set("page", "1");
        setSearchParams(nextParams);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("key");
        nextParams.set("page", "1");
        setSearchParams(nextParams);
    };

    const handlePageSizeChange = (event) => {
        const nextPageSize = Number(event.target.value);
        const nextParams = new URLSearchParams(searchParams);

        nextParams.set("pageSize", nextPageSize.toString());
        nextParams.set("page", "1");
        setSearchParams(nextParams);
    };

    const handleCategoryChange = (event) => {
        const nextCategoryId = event.target.value;
        const nextParams = new URLSearchParams(searchParams);

        if (nextCategoryId) {
            nextParams.set("categoryId", nextCategoryId);
        } else {
            nextParams.delete("categoryId");
        }

        nextParams.set("page", "1");
        setSearchParams(nextParams);
    };

    const handleConfirmDelete = async () => {
        if (!deletingProduct?.productId) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteProductApi(deletingProduct.productId);
            setDeletingProduct(null);
            loadProducts();
        } catch (error) {
            console.error("Loi khi xoa san pham:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-1 flex-col p-6 pt-[88px]">
            <div>
                <div className="mb-4 mt-2 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">Danh sách sản phẩm</h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                    >
                        <FiPlus />
                        Thêm sản phẩm
                    </button>
                </div>

                <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="max-w-2xl flex-1">
                        <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-500">
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="shrink-0 text-lg text-slate-500 transition hover:text-emerald-600"
                                aria-label="Tìm kiếm sản phẩm"
                            >
                                <FiSearch />
                            </button>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Tìm mã sản phẩm, tên sản phẩm"
                                className="w-full bg-transparent text-sm text-slate-800 outline-none"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="text-slate-400 transition hover:text-slate-700"
                                    aria-label="Xóa tìm kiếm"
                                >
                                    <FiX />
                                </button>
                            )}
                        </label>
                    </div>
                    <div className="w-full xl:w-[320px]">
                        <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-500">
                            <span className="shrink-0 text-sm font-medium text-slate-600">Loai san pham</span>
                            <select
                                value={categoryId}
                                onChange={handleCategoryChange}
                                className="w-full bg-transparent text-sm text-slate-800 outline-none"
                            >
                                <option value="">Tat ca danh muc</option>
                                {categories.map((category) => (
                                    <option key={category.categoryID} value={String(category.categoryID)}>
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                <div className="rounded bg-white shadow">
                    <table className="min-w-full table-auto border-collapse border border-slate-300">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border px-2 py-2">STT</th>
                                <th className="border px-4 py-2">Mã sản phẩm</th>
                                <th className="border px-4 py-2">Ảnh</th>
                                <th className="border px-4 py-2">Tên</th>
                                <th className="border px-4 py-2">Mô tả</th>
                                <th className="border px-4 py-2">Giá nhập</th>
                                <th className="border px-4 py-2">Giá bán</th>
                                <th className="border px-4 py-2">Khuyến mãi</th>
                                <th className="border px-4 py-2">Giá sau giảm</th>
                                <th className="border px-4 py-2">Tồn kho</th>
                                <th className="border px-4 py-2">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products && products.length > 0 ? (
                                products.map((product, index) => {
                                    const salePrice = Number(product.salePrice ?? 0);
                                    const costPrice = Number(product.costPrice ?? 0);
                                    const discountPercent = Number(product.discount ?? 0);
                                    const finalPrice = salePrice * (1 - discountPercent / 100);

                                    return (
                                        <tr key={product.productId ?? index} className="hover:bg-slate-50">
                                            <td className="border px-2 py-2 text-center">
                                                {pagination?.pageNumber !== undefined
                                                    ? pagination.pageNumber * (pagination.pageSize || pageSize) + index + 1
                                                    : index + 1}
                                            </td>
                                            <td className="border px-4 py-2 text-center">{product.productCode}</td>
                                            <td className="border px-4 py-2 text-center">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.productName}
                                                        className="mx-auto mt-1 h-14 w-14 rounded-md object-cover"
                                                    />
                                                ) : (
                                                    <span className="italic text-gray-400">Tạm thời không có ảnh</span>
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">{product.productName}</td>
                                            <td className="border px-4 py-2">{product.description}</td>
                                            <td className="border px-4 py-2 text-right text-sm text-slate-600">
                                                {formatCurrency(costPrice)}
                                            </td>
                                            <td className="border px-4 py-2 text-right">
                                                <div className="font-semibold text-slate-800">
                                                    {formatCurrency(salePrice)}
                                                </div>
                                            </td>
                                            <td className="border px-4 py-2 text-center">
                                                {discountPercent > 0 ? (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                        -{discountPercent}%
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">--</span>
                                                )}
                                            </td>
                                            <td className="border px-4 py-2 text-right">
                                                <div className="font-semibold text-emerald-700">
                                                    {formatCurrency(finalPrice)}
                                                </div>
                                                {discountPercent > 0 ? (
                                                    <div className="text-xs text-slate-400 line-through">
                                                        {formatCurrency(salePrice)}
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td className="border px-4 py-2 text-center">{product.quantity}</td>
                                            <td className="border px-4 py-2 text-center align-middle">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingProductId(product.productId)}
                                                        className="text-gray-500 hover:text-gray-800"
                                                    >
                                                        <FaEdit size={25} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingProduct(product)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <MdDelete size={25} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="11" className="py-4 text-center text-slate-500">
                                        {searchKey.trim()
                                            ? "Không tìm thấy sản phẩm"
                                            : "Không có sản phẩm nào."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="relative mt-auto pt-6">
                <div className="mb-4 flex justify-end xl:absolute xl:right-0 xl:top-1/2 xl:z-10 xl:mb-0 xl:-translate-y-1/2">
                    <div className="flex flex-col items-start gap-3 xl:items-end">
                        <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                            <span>Hien thi</span>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-500"
                            >
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            <span>san pham / trang</span>
                        </label>
                    </div>
                </div>

                <PaginationRounded
                    numberofPage={pagination?.totalPages}
                    totalProducts={pagination?.totalElements}
                />
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="max-h-[92vh] w-[92vw] max-w-[1280px] overflow-y-auto">
                        <AddProductForm
                            onClose={() => setIsAddModalOpen(false)}
                            onSuccess={loadProducts}
                        />
                    </div>
                </div>
            )}

            <ProductUpdateDrawer
                open={Boolean(editingProductId)}
                productId={editingProductId}
                onClose={() => setEditingProductId(null)}
                onSuccess={loadProducts}
            />

            <AlertModel
                open={Boolean(deletingProduct)}
                title="Xoa san pham"
                message={`Ban co chac chan muon xoa ${deletingProduct?.productName || "san pham nay"} khong? Hanh dong nay khong the hoan tac.`}
                confirmText="Xoa san pham"
                cancelText="Huy"
                tone="danger"
                loading={isDeleting}
                onClose={() => {
                    if (!isDeleting) {
                        setDeletingProduct(null);
                    }
                }}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default AdminProductList;
