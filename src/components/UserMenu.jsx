import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
    const [open, setOpen] = React.useState(false);
    const closeTimerRef = React.useRef(null);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const handleOpen = () => {
        clearCloseTimer();
        setOpen(true);
    };

    const handleClose = () => {
        clearCloseTimer();
        setOpen(false);
    };

    const handleMouseLeave = () => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout(() => {
            setOpen(false);
        }, 180);
    };

    const handleProfileClick = () => {
        handleClose();
        navigate("/user/profile");
    };

    const handleOrderClick = () => {
        handleClose();
        navigate("/user/order");
    };

    const handleSupportTicket = () => {
        handleClose();
        navigate("/ticket");
    }

    const handleLogout = () => {
        handleClose();
        localStorage.removeItem("auth");
        window.location.href = "/login";
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleOpen}
            onMouseLeave={handleMouseLeave}
            onFocus={handleOpen}
        >
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
                className="rounded-md border border-[#d9a05b] bg-white px-3 py-1 text-sm font-semibold text-[#1a1a1a] shadow-sm transition-colors hover:bg-[#fff7ed]"
            >
                {user?.userName}
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-[100] mt-2 w-44 overflow-hidden rounded-md border border-neutral-200 bg-white py-1 text-sm text-neutral-700 shadow-lg"
                    onMouseEnter={handleOpen}
                    onMouseLeave={handleMouseLeave}
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleProfileClick}
                        className="block w-full px-4 py-2 text-left hover:bg-orange-50 hover:text-[#8c4a0f]"
                    >
                        Hồ Sơ
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleOrderClick}
                        className="block w-full px-4 py-2 text-left hover:bg-orange-50 hover:text-[#8c4a0f]"
                    >
                        Đơn Hàng
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleSupportTicket}
                        className="block w-full px-4 py-2 text-left hover:bg-orange-50 hover:text-[#8c4a0f]"
                    >
                        Hỗ trợ
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left hover:bg-orange-50 hover:text-[#8c4a0f]"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;

