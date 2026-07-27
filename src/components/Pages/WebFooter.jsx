import { useEffect } from "react";
import { FaFacebook, FaInstagramSquare, FaTiktok } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FiExternalLink, FiMapPin, FiPhone } from "react-icons/fi";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchStoreBranches } from "../../store/actions";

const WebFooter = () => {
    const dispatch = useDispatch();
    const {
        stores = [],
        loading = false,
        error = null,
    } = useSelector((state) => state.storeBranches || {});

    useEffect(() => {
        dispatch(fetchStoreBranches());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const featuredStores = stores.slice(0, 3);
    const primaryStore = stores[0];

    return (
        <footer className="bg-stone-950 text-white">
            <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-[1.1fr_0.7fr_1.4fr]">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-3">
                            <img src="/logo.png" alt="Clothiq" className="h-10 w-10 object-contain" />
                            <span className="text-2xl font-bold">Clothiq</span>
                        </Link>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-stone-400">
                            Thời trang hằng ngày với hệ thống cửa hàng được cập nhật trực tiếp từ trang quản trị.
                        </p>

                        {/* <div className="mt-5 flex gap-3">
                            <a href="#" className="rounded-full bg-white/10 p-2 text-stone-300 transition hover:bg-white hover:text-stone-950">
                                <FaFacebook />
                                <span className="sr-only">Facebook</span>
                            </a>
                            <a href="#" className="rounded-full bg-white/10 p-2 text-stone-300 transition hover:bg-white hover:text-stone-950">
                                <FaSquareXTwitter />
                                <span className="sr-only">Twitter</span>
                            </a>
                            <a href="#" className="rounded-full bg-white/10 p-2 text-stone-300 transition hover:bg-white hover:text-stone-950">
                                <FaInstagramSquare />
                                <span className="sr-only">Instagram</span>
                            </a>
                            <a href="#" className="rounded-full bg-white/10 p-2 text-stone-300 transition hover:bg-white hover:text-stone-950">
                                <FaTiktok />
                                <span className="sr-only">TikTok</span>
                            </a>
                        </div> */}
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-300">
                            Liên kết
                        </h3>
                        <nav className="mt-4 grid gap-3 text-sm">
                            <Link to="/" className="text-stone-400 transition hover:text-white">Trang chủ</Link>
                            <Link to="/products" className="text-stone-400 transition hover:text-white">Sản phẩm</Link>
                            <Link to="/about" className="text-stone-400 transition hover:text-white">Hệ thống cửa hàng</Link>
                            <Link to="/user/order" className="text-stone-400 transition hover:text-white">Đơn hàng của tôi</Link>
                        </nav>
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-300">
                                Cửa hàng
                            </h3>
                            <Link to="/about" className="text-xs font-semibold text-emerald-300 transition hover:text-emerald-200">
                                Xem tất cả
                            </Link>
                        </div>

                        {loading ? (
                            <p className="mt-4 text-sm text-stone-400">Đang tải hệ thống cửa hàng...</p>
                        ) : featuredStores.length === 0 ? (
                            <p className="mt-4 text-sm text-stone-400">Chưa có cửa hàng để hiển thị.</p>
                        ) : (
                            <div className="mt-4 grid gap-3">
                                {featuredStores.map((store, index) => (
                                    <div key={store.id || index} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {store.branchName || `Cơ sở ${index + 1}`}
                                                </p>
                                                <p className="mt-2 flex gap-2 text-sm leading-6 text-stone-400">
                                                    <FiMapPin className="mt-1 shrink-0 text-emerald-300" />
                                                    <span>{store.address || "Chưa cập nhật địa chỉ"}</span>
                                                </p>
                                                <p className="mt-1 flex items-center gap-2 text-sm text-stone-400">
                                                    <FiPhone className="text-emerald-300" />
                                                    {store.phoneNumber || "Chưa cập nhật số điện thoại"}
                                                </p>
                                            </div>

                                            {store.mapUrl && (
                                                <a
                                                    href={store.mapUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="shrink-0 rounded-full bg-emerald-500/15 p-2 text-emerald-300 transition hover:bg-emerald-400 hover:text-stone-950"
                                                >
                                                    <FiExternalLink />
                                                    <span className="sr-only">Mở bản đồ</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-stone-500 md:flex-row md:items-center md:justify-between">
                    <p>© 2026 Clothiq. All rights reserved.</p>
                    {primaryStore?.phoneNumber && (
                        <a href={`tel:${primaryStore.phoneNumber}`} className="transition hover:text-white">
                            Hotline: {primaryStore.phoneNumber}
                        </a>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default WebFooter;
