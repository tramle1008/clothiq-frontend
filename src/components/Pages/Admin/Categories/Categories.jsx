import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconButton } from "@mui/material";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FiPlus, FiSearch } from "react-icons/fi";

import { fetchCategories } from "../../../../store/actions";
import { searchCategoriesApi } from "../../../../api/inventoryApi";
import PaginationRounded from "../../../PaginationRounded";

const PAGE_SIZE_OPTIONS = [10, 15, 20];

const Categories = () => {
    const dispatch = useDispatch();
    const { categories, categoryPagination } = useSelector((state) => state.products);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const pageSizeParam = Number(searchParams.get("pageSize"));
    const pageSize = PAGE_SIZE_OPTIONS.includes(pageSizeParam) ? pageSizeParam : 10;
    const initialKeyword = searchParams.get("keyword") || "";
    const [searchTerm, setSearchTerm] = useState(initialKeyword);
    const [searchResults, setSearchResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const keyword = searchParams.get("keyword") || "";
    const isSearchMode = Boolean(keyword.trim());

    useEffect(() => {
        setSearchTerm(initialKeyword);
    }, [initialKeyword]);

    useEffect(() => {
        if (isSearchMode) {
            return;
        }

        const pageIndex = page - 1;
        dispatch(fetchCategories(`pageNumber=${pageIndex}&pageSize=${pageSize}`));
    }, [dispatch, isSearchMode, page, pageSize]);

    useEffect(() => {
        if (!isSearchMode) {
            setSearchResults([]);
            return;
        }

        let isMounted = true;

        const runSearch = async () => {
            try {
                setIsSearching(true);
                const data = await searchCategoriesApi(keyword);

                if (isMounted) {
                    setSearchResults(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Loi khi tim kiem danh muc:", error);
                if (isMounted) {
                    setSearchResults([]);
                }
            } finally {
                if (isMounted) {
                    setIsSearching(false);
                }
            }
        };

        runSearch();

        return () => {
            isMounted = false;
        };
    }, [isSearchMode, keyword]);

    useEffect(() => {
        const normalized = searchTerm.trim();

        if (!normalized) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        let isMounted = true;
        const timeoutId = setTimeout(async () => {
            try {
                const data = await searchCategoriesApi(normalized);

                if (isMounted) {
                    setSuggestions(Array.isArray(data) ? data : []);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Loi khi goi y danh muc:", error);
                if (isMounted) {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            }
        }, 300);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [searchTerm]);

    const displayedCategories = useMemo(() => {
        if (isSearchMode) {
            return searchResults;
        }

        return categories || [];
    }, [categories, isSearchMode, searchResults]);

    const handleDelete = () => {
        console.log("Delete action triggered");
    };

    const handleEdit = () => {
        console.log("Edit action triggered");
    };

    const handleSearch = (keywordValue = searchTerm) => {
        const normalized = keywordValue.trim();
        const nextParams = new URLSearchParams(searchParams);

        nextParams.set("page", "1");

        if (normalized) {
            nextParams.set("keyword", normalized);
        } else {
            nextParams.delete("keyword");
        }

        setShowSuggestions(false);
        setSearchParams(nextParams);
    };

    const handleSuggestionClick = (category) => {
        setSearchTerm(category.categoryName);
        setSuggestions([]);
        handleSearch(category.categoryName);
    };

    const handleAddCategory = () => {
        console.log("Add category action triggered");
    };

    const handlePageSizeChange = (event) => {
        const nextPageSize = Number(event.target.value);
        const nextParams = new URLSearchParams(searchParams);

        nextParams.set("pageSize", nextPageSize.toString());
        nextParams.set("page", "1");
        setSearchParams(nextParams);
    };

    return (
        <div className="flex min-h-screen flex-1 flex-col p-6 pt-[88px]">
            <div>
                <h1 className="text-2xl font-semibold text-slate-800">Danh mục sản phẩm</h1>

                <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full max-w-xl">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                onFocus={() => {
                                    if (suggestions.length > 0) {
                                        setShowSuggestions(true);
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Tìm kiếm danh mục"
                                className="h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
                            />
                            <button
                                type="button"
                                onClick={() => handleSearch()}
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-800 text-white transition hover:bg-slate-700"
                            >
                                <FiSearch />
                            </button>
                        </div>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                                {suggestions.map((category) => (
                                    <button
                                        key={category.categoryID}
                                        type="button"
                                        onClick={() => handleSuggestionClick(category)}
                                        className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition last:border-b-0 hover:bg-slate-50"
                                    >
                                        {category.categoryName}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleAddCategory}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                    >
                        <FiPlus />
                        Thêm danh mục
                    </button>
                </div>

                <div className="mt-6">
                    <table className="w-full table-auto border-collapse border border-gray-300 bg-white">
                        <thead>
                            <tr>
                                <th className="w-40 border border-gray-300 px-4 py-2">ID</th>
                                <th className="border border-gray-300 px-4 py-2">Tên danh mục</th>
                                <th className="w-50 border border-gray-300 px-2 py-2">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedCategories.length > 0 ? (
                                displayedCategories.map((category) => (
                                    <tr key={category.categoryID}>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            {category.categoryID}
                                        </td>
                                        <td className="border border-gray-300 px-5 py-2">
                                            {category.categoryName}
                                        </td>
                                        <td className="border border-gray-300 px-1 py-2 text-center">
                                            <IconButton size="small" onClick={handleEdit} aria-label="edit" color="info">
                                                <FaEdit />
                                            </IconButton>
                                            <IconButton size="small" onClick={handleDelete} aria-label="delete" color="error">
                                                <MdDelete />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-4 py-6 text-center text-slate-500">
                                        {isSearching
                                            ? "Đang tìm kiếm danh mục..."
                                            : isSearchMode
                                                ? "Không tìm thấy danh mục phù hợp."
                                                : "Không có danh mục nào."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {!isSearchMode && categoryPagination && (
                <div className="relative mt-auto pt-6">
                    <div className="mb-4 flex justify-end lg:absolute lg:right-0 lg:top-1/2 lg:z-10 lg:mb-0 lg:-translate-y-1/2">
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
                            <span>danh mục / trang</span>
                        </label>
                    </div>

                    <PaginationRounded numberofPage={categoryPagination?.totalPages || 1} />
                </div>
            )}
        </div>
    );
};

export default Categories;



