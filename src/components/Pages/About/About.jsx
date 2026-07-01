import { useEffect, useState } from "react";
import { FiExternalLink, FiMapPin, FiPhone } from "react-icons/fi";
import toast from "react-hot-toast";
import { getStoresApi } from "../../../api/storeBranchApi";

const About = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStores = async () => {
            try {
                const data = await getStoresApi();
                setStores(Array.isArray(data) ? data : []);
            } catch (error) {
                const message = error?.response?.data?.message || "Không tải được danh sách cửa hàng.";
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        loadStores();
    }, []);

    return (
        <section className="min-h-screen bg-stone-50 px-4 py-10 md:px-8">
            <div className="mx-auto ">
                <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-700 to-lime-600 px-6 py-10 text-white shadow-lg md:px-10">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">
                        Clothiq Store Locator
                    </p>
                    <h1 className="text-3xl font-bold md:text-4xl">Hệ thống cửa hàng Clothiq</h1>
                    <p className="mt-3 max-w-2xl text-sm text-emerald-50 md:text-base">
                        Xem địa chỉ các cơ sở và mở Google Maps để đi đến cửa hàng gần bạn.
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-3xl bg-white p-8 text-center text-stone-600 shadow-md ring-1 ring-stone-200">
                        Đang tải danh sách cửa hàng...
                    </div>
                ) : stores.length === 0 ? (
                    <div className="rounded-3xl bg-white p-8 text-center text-stone-600 shadow-md ring-1 ring-stone-200">
                        Chưa có cửa hàng nào để hiển thị.
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {stores.map((store, index) => (
                            <article
                                key={store.id}
                                className="grid overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-stone-200 lg:grid-cols-[1fr_1.2fr]"
                            >
                                <div className="flex flex-col justify-between p-6 md:p-8">
                                    <div>
                                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                                            {store.branchName || `Cơ sở ${index + 1}`}
                                        </span>
                                        <h2 className="mt-4 text-2xl font-bold text-stone-900">
                                            {store.branchName}
                                        </h2>
                                        <div className="mt-4 flex items-start gap-3 text-stone-600">
                                            <FiMapPin className="mt-1 shrink-0 text-lg text-emerald-700" />
                                            <p className="text-base leading-7">{store.address}</p>
                                        </div>
                                        <div className="mt-2 flex items-start gap-3 text-stone-600">
                                            <FiPhone className="mt-1 shrink-0 text-lg text-emerald-700" />
                                            <p className="text-base leading-7">{store.phoneNumber}</p>
                                        </div>
                                    </div>

                                    <a
                                        href={store.mapUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                    >
                                        Mở Google Maps
                                        <FiExternalLink />
                                    </a>
                                </div>

                                <div className="min-h-[320px] bg-stone-100">
                                    <iframe
                                        title={store.branchName}
                                        src={store.embedUrl}
                                        className="h-full min-h-[320px] w-full border-0"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        allowFullScreen
                                    />
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default About;
