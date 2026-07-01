import { FaShoppingCart } from "react-icons/fa";
import { Link, useLocation } from 'react-router-dom';

import { Badge } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import UserMenu from "../UserMenu";
import { useEffect } from "react";
import { fetchCart } from "../../store/actions";

const Navbar = () => {
    const path = useLocation().pathname;
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { products } = useSelector((state) => state.cart);

    // Gọi fetchCart khi user đăng nhập
    useEffect(() => {
        if (user && user.id) {
            dispatch(fetchCart());
        }
    }, [dispatch, user]);
    return (

        <div className="h-[70px] bg-[#d9a05b] text-white z-50  flex items-center sticky top-0">
            <div className="lg:px-14 sm:px-8 px-4 w-full flex justify-between">
                <Link to="/" className="flex items-center text-2xl ">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 mr-2 object-contain" />
                    <span className="font-bold">Clothiq</span>
                </Link>
                <ul className="flex items-center gap-6">
                    <li>
                        <Link className={`${path === "/" ?
                            "text-[#8c4a0f] font-bold" : "text-white font-bold"
                            }`}
                            to="/"
                        >
                            Home</Link>
                    </li>
                    <li>
                        <Link className={`${path === "/products" ?
                            "text-[#8c4a0f] font-bold" : "text-white font-bold"
                            }`}
                            to="/products"
                        >
                            Product</Link>
                    </li>
                    <li>
                        <Link className={`${path === "/about" ?
                            "text-[#8c4a0f] font-bold" : "text-white font-bold"
                            }`}
                            to="/about"
                        >
                            About</Link>
                    </li>

                    <li>
                        <Link className={`${path === "/cart" ?
                            "text-[#8c4a0f] font-bold" : "text-white font-bold"
                            }`}
                            to="/cart"
                        >
                            <Badge
                                variant="dot"
                                color="error"
                                invisible={products.length === 0} // ẩn khi giỏ trống
                                overlap="circular"
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <FaShoppingCart size={25} />
                            </Badge>
                        </Link>
                    </li>
                    {user && user.id ? (
                        <li className="px-4  font-semibold text-gray-700">
                            <UserMenu />
                        </li>
                    ) : (
                        <li>
                            <Link
                                to="/login"
                                className="flex items-center space-x-2 px-4 py-1.5 bg-gradient-to-r from-indigo-700 to-red-500 font-bold rounded-md shadow-lg hover:from-indigo-500 hover:to-red-400 transition duration-300 ease-in-out text-white"
                            >
                                Login
                            </Link>
                        </li>
                    )}
                </ul>
            </div >
        </div >
    )
}

export default Navbar;
