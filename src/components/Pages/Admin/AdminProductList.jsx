import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FiSearch, FiX } from "react-icons/fi";

import { fetchProduct, searchProducts } from "../../../store/actions";
import PaginationRounded from "../../PaginationRounded";
import AdminSidebar from "./AdminSidebar";
import AddProductForm from "./AddProductForm";

const PAGE_SIZE_OPTIONS = [5, 10, 15];

const AdminProductList = () => {
    const { products, pagination } = useSelector((state) => state.products);
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const searchKey = searchParams.get("key") || "";
    const pageSizeParam = Number(searchParams.get("pageSize"));
    const pageSize = PAGE_SIZE_OPTIONS.includes(pageSizeParam) ? pageSizeParam : 5;
    const [searchTerm, setSearchTerm] = useState(searchKey);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        setSearchTerm(searchKey);
    }, [searchKey]);

    const loadProducts = () => {
        const pageIndex = page - 1;
        const baseQuery = `pageNumber=${pageIndex}&pageSize=${pageSize}&sortBy=productId&sortOrder=asc`;

        if (searchKey.trim()) {
            dispatch(searchProducts(`key=${encodeURIComponent(searchKey.trim())}&${baseQuery}`));
            return;
        }

        dispatch(fetchProduct(baseQuery));
    };

    useEffect(() => {
        loadProducts();
    }, [dispatch, page, pageSize, searchKey]);

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

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />
            <div className="flex min-h-screen flex-1 flex-col p-6 pt-[50px]">
                <div>
                <div className="mb-4 mt-2 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">Danh sách sản phẩm</h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="rounded-xl bg-slate-600 px-4 py-3 text-center text-white shadow-md transition-colors hover:bg-slate-700"
                    >
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
                                aria-label="Tim kiem san pham"
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
                                <th className="border px-4 py-2">Giá</th>
                                <th className="border px-4 py-2">Giảm (%)</th>
                                <th className="border px-4 py-2">Tồn kho</th>
                                <th className="border px-4 py-2">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products && products.length > 0 ? (
                                products.map((product, index) => (
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
                                                <span className="italic text-gray-400">Khong co anh</span>
                                            )}
                                        </td>
                                        <td className="border px-4 py-2">{product.productName}</td>
                                        <td className="border px-4 py-2">{product.description}</td>
                                        <td className="border px-4 py-2 text-right">
                                            {product.price?.toLocaleString()} VND
                                        </td>
                                        <td className="border px-4 py-2 text-center">{product.discount}%</td>
                                        <td className="border px-4 py-2 text-center">{product.quantity}</td>
                                        <td className="border px-4 py-2 text-center align-middle">
                                            <div className="flex items-center justify-center gap-2">
                                                <a
                                                    href={`/admin/product/update/${product.productId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-500 hover:text-gray-800"
                                                >
                                                    <FaEdit size={25} />
                                                </a>
                                                <a
                                                    href="#"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <MdDelete size={25} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="py-4 text-center text-slate-500">
                                        {searchKey.trim()
                                            ? "Khong tim thay san pham phu hop."
                                            : "Khong co san pham nao."}
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
                                <span>Hiển thị</span>
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
                                <span>sản phẩm / trang</span>
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
            </div>
        </div>
    );
};

export default AdminProductList;
