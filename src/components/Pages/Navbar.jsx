import { useEffect, useState } from "react";
import { Badge } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { fetchCart } from "../../store/actions";
import { searchProductsApi } from "../../api/inventoryApi";
import UserMenu from "../UserMenu";

const Navbar = () => {
    const path = useLocation().pathname;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { products } = useSelector((state) => state.cart);

    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (user && user.id) {
            dispatch(fetchCart());
        }
    }, [dispatch, user]);

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
                setIsSearching(true);
                const queryString = [
                    `key=${encodeURIComponent(normalized)}`,
                    "pageNumber=0",
                    "pageSize=5",
                    "sortBy=productId",
                    "sortOrder=asc",
                ].join("&");

                const data = await searchProductsApi(queryString);
                if (isMounted) {
                    setSuggestions(Array.isArray(data?.content) ? data.content : []);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Loi khi tim kiem san pham:", error);
                if (isMounted) {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } finally {
                if (isMounted) {
                    setIsSearching(false);
                }
            }
        }, 300);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [searchTerm]);

    const handleSearchSubmit = (event) => {
        event?.preventDefault?.();

        const normalized = searchTerm.trim();
        if (!normalized) {
            return;
        }

        setShowSuggestions(false);
        navigate(`/products?key=${encodeURIComponent(normalized)}&page=1`);
    };

    const handleSuggestionClick = (productId) => {
        setSearchTerm("");
        setSuggestions([]);
        setShowSuggestions(false);
        navigate(`/products/${productId}`);
    };

    return (
        <div className="sticky top-0 z-50 flex h-[70px] items-center bg-[#d9a05b] text-white">
            <div className="w-full px-4 lg:px-14 sm:px-8">
                <div className="flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center text-2xl">
                        <img src="/logo.png" alt="Logo" className="mr-2 h-8 w-8 object-contain" />
                        <span className="font-bold">Clothiq</span>
                    </Link>

                    <div className="relative hidden w-full max-w-xl lg:block">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                onFocus={() => {
                                    if (suggestions.length > 0) {
                                        setShowSuggestions(true);
                                    }
                                }}
                                onBlur={() => {
                                    setTimeout(() => setShowSuggestions(false), 150);
                                }}
                                placeholder="Tìm sản phẩm..."
                                className="h-10 w-full rounded-full border border-white/30 bg-white/90 px-4 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700"
                                aria-label="Tìm kiếm"
                            >
                                <FaSearch size={14} />
                            </button>
                        </form>

                        {showSuggestions && (isSearching || suggestions.length > 0) && (
                            <div className="absolute left-0 top-[46px] z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl">
                                {isSearching ? (
                                    <div className="px-4 py-3 text-sm text-slate-500">Đang tìm kiếm...</div>
                                ) : (
                                    suggestions.map((product) => (
                                        <button
                                            key={product.productId}
                                            type="button"
                                            onMouseDown={() => handleSuggestionClick(product.productId)}
                                            className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                                        >
                                            <img
                                                src={product.image}
                                                alt={product.productName}
                                                className="h-10 w-10 rounded-md bg-slate-100 object-cover"
                                            />
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium text-slate-800">
                                                    {product.productName}
                                                </div>
                                                <div className="truncate text-xs text-slate-500">
                                                    {product.productCode}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <ul className="flex items-center gap-6">
                        <li>
                            <Link
                                className={`${path === "/" ? "text-[#8c4a0f] font-bold" : "text-white font-bold"}`}
                                to="/"
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                className={`${path === "/products" ? "text-[#8c4a0f] font-bold" : "text-white font-bold"}`}
                                to="/products"
                            >
                                Product
                            </Link>
                        </li>
                        <li>
                            <Link
                                className={`${path === "/about" ? "text-[#8c4a0f] font-bold" : "text-white font-bold"}`}
                                to="/about"
                            >
                                About
                            </Link>
                        </li>
                        <li>
                            <Link
                                className={`${path === "/cart" ? "text-[#8c4a0f] font-bold" : "text-white font-bold"}`}
                                to="/cart"
                            >
                                <Badge
                                    variant="dot"
                                    color="error"
                                    invisible={products.length === 0}
                                    overlap="circular"
                                    anchorOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                    }}
                                >
                                    <FaShoppingCart size={25} />
                                </Badge>
                            </Link>
                        </li>
                        {user && user.id ? (
                            <li className="px-4 font-semibold text-gray-700">
                                <UserMenu />
                            </li>
                        ) : (
                            <li>
                                <Link
                                    to="/login"
                                    className="flex items-center space-x-2 rounded-md bg-gradient-to-r from-indigo-700 to-red-500 px-4 py-1.5 font-bold text-white shadow-lg transition duration-300 ease-in-out hover:from-indigo-500 hover:to-red-400"
                                >
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
