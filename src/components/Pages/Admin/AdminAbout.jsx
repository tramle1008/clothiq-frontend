import { useEffect, useState } from "react";
import { FiLink, FiMapPin, FiPlus, FiRotateCcw, FiSave, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import {
    createStoreApi,
    deleteStoreApi,
    getStoresApi,
    updateStoreApi,
} from "../../../api/storeBranchApi";

const createEmptyStore = (index) => ({
    id: `new-${Date.now()}-${index}`,
    branchName: `Cơ sở ${index + 1}`,
    phoneNumber: "",
    address: "",
    mapUrl: "",
    embedUrl: "",
    latitude: 0,
    longitude: 0,
});

const extractGoogleMapsEmbedUrl = (value) => {
    if (!value) {
        return "";
    }

    const trimmedValue = value.trim();
    const iframeSrcMatch = trimmedValue.match(/src=["']([^"']+)["']/i);

    if (iframeSrcMatch?.[1]) {
        return iframeSrcMatch[1];
    }

    return trimmedValue;
};

const isPersistedStore = (id) => typeof id === "number";

const AdminAbout = () => {
    const [stores, setStores] = useState([]);
    const [initialStores, setInitialStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadStores = async () => {
            try {
                const data = await getStoresApi();
                const normalizedData = Array.isArray(data) ? data : [];
                setStores(normalizedData);
                setInitialStores(normalizedData);
            } catch (error) {
                const message = error?.response?.data?.message || "Không tải được danh sách cửa hàng.";
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        loadStores();
    }, []);

    const handleStoreChange = (id, field, value) => {
        const nextValue = field === "embedUrl" ? extractGoogleMapsEmbedUrl(value) : value;

        setStores((prev) =>
            prev.map((store) => (store.id === id ? { ...store, [field]: nextValue } : store))
        );
    };

    const handleAddStore = () => {
        setStores((prev) => [...prev, createEmptyStore(prev.length)]);
    };

    const handleDeleteStore = async (id) => {
        const storeToDelete = stores.find((store) => store.id === id);
        if (!storeToDelete) {
            return;
        }

        if (!isPersistedStore(id)) {
            setStores((prev) => prev.filter((store) => store.id !== id));
            return;
        }

        try {
            await deleteStoreApi(id);
            setStores((prev) => prev.filter((store) => store.id !== id));
            setInitialStores((prev) => prev.filter((store) => store.id !== id));
            toast.success(`Đã xóa ${storeToDelete.branchName}.`);
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể xóa cửa hàng.";
            toast.error(message);
        }
    };

    const handleReset = () => {
        setStores(initialStores);
    };

    const handleSave = async () => {
        const invalidStore = stores.find(
            (store) =>
                !store.branchName?.trim() ||
                !store.phoneNumber?.trim() ||
                !store.address?.trim() ||
                !store.mapUrl?.trim() ||
                !store.embedUrl?.trim()
        );

        if (invalidStore) {
            toast.error("Vui lòng nhập đủ tên cơ sở, số điện thoại, địa chỉ, link map và link embed.");
            return;
        }

        try {
            setSaving(true);

            const savedStores = [];
            for (const store of stores) {
                const payload = {
                    branchName: store.branchName.trim(),
                    phoneNumber: store.phoneNumber.trim(),
                    address: store.address.trim(),
                    mapUrl: store.mapUrl.trim(),
                    embedUrl: extractGoogleMapsEmbedUrl(store.embedUrl),

                };

                const savedStore = isPersistedStore(store.id)
                    ? await updateStoreApi(store.id, payload)
                    : await createStoreApi(payload);

                savedStores.push(savedStore);
            }

            setStores(savedStores);
            setInitialStores(savedStores);
            toast.success("Đã lưu danh sách cửa hàng.");
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể lưu cửa hàng.";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen flex-1 px-4 pb-8 pt-24 md:px-8 lg:px-10 bg-stone-100">
            <div className="mx-auto max-w-[1500px]">
                <section className="mb-8 rounded-[2rem] bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-800 p-8 text-white shadow-xl md:p-10">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
                                Admin About
                            </p>
                            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                                Quản lý hệ thống cửa hàng
                            </h1>

                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
                            <button
                                type="button"
                                onClick={handleAddStore}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-stone-900 transition hover:bg-emerald-50"
                            >
                                <FiPlus />
                                Thêm cơ sở
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                <FiRotateCcw />
                                Hoàn tác
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <FiSave />
                                {saving ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </div>
                </section>

                {loading ? (
                    <div className="rounded-[2rem] bg-white p-10 text-center text-base text-stone-600 shadow-sm ring-1 ring-stone-200">
                        Đang tải danh sách cửa hàng...
                    </div>
                ) : (
                    <div className="space-y-8">
                        {stores.map((store, index) => (
                            <section
                                key={store.id}
                                className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-stone-200"
                            >
                                <div className="flex flex-col gap-5 border-b border-stone-200 bg-stone-50 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                            <FiMapPin className="text-2xl" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                                                Cửa hàng {index + 1}
                                            </p>
                                            <h2 className="mt-2 text-2xl font-bold text-stone-900">
                                                {store.branchName || `Cơ sở ${index + 1}`}
                                            </h2>

                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteStore(store.id)}
                                        className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 lg:self-center"
                                    >
                                        <FiTrash2 />
                                        Xóa cơ sở
                                    </button>
                                </div>

                                <div className="grid gap-6 p-6 lg:grid-cols-2 lg:p-8">
                                    <div className="space-y-5">
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-stone-700">
                                                Tên cơ sở
                                            </span>
                                            <input
                                                type="text"
                                                value={store.branchName}
                                                onChange={(e) =>
                                                    handleStoreChange(store.id, "branchName", e.target.value)
                                                }
                                                className="w-full rounded-2xl border border-stone-300 px-5 py-4 text-base outline-none transition focus:border-emerald-500"
                                                placeholder={`Cơ sở ${index + 1}`}
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-stone-700">
                                                Số điện thoại
                                            </span>
                                            <input
                                                type="tel"
                                                value={store.phoneNumber || ""}
                                                onChange={(e) =>
                                                    handleStoreChange(store.id, "phoneNumber", e.target.value)
                                                }
                                                className="w-full rounded-2xl border border-stone-300 px-5 py-4 text-base outline-none transition focus:border-emerald-500"
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-stone-700">
                                                Địa chỉ
                                            </span>
                                            <textarea
                                                value={store.address}
                                                onChange={(e) =>
                                                    handleStoreChange(store.id, "address", e.target.value)
                                                }
                                                className="min-h-28 w-full rounded-2xl border border-stone-300 px-5 py-4 text-base outline-none transition focus:border-emerald-500"
                                                placeholder="Nhập địa chỉ cơ sở"
                                            />
                                        </label>
                                    </div>

                                    <div className="space-y-5">
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-stone-700">
                                                Link Google Maps
                                            </span>
                                            <input
                                                type="url"
                                                value={store.mapUrl}
                                                onChange={(e) =>
                                                    handleStoreChange(store.id, "mapUrl", e.target.value)
                                                }
                                                className="w-full rounded-2xl border border-stone-300 px-5 py-4 text-base outline-none transition focus:border-emerald-500"
                                                placeholder="https://maps.app.goo.gl/..."
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-stone-700">
                                                Embed URL hoặc iframe
                                            </span>
                                            <textarea
                                                value={store.embedUrl}
                                                onChange={(e) =>
                                                    handleStoreChange(store.id, "embedUrl", e.target.value)
                                                }
                                                className="min-h-44 w-full rounded-2xl border border-stone-300 px-5 py-4 text-base outline-none transition focus:border-emerald-500"
                                                placeholder={'Dán embed URL hoặc <iframe src="..."></iframe>'}
                                            />
                                        </label>
                                    </div>


                                </div>
                            </section>
                        ))}

                        {stores.length === 0 && (
                            <div className="rounded-[2rem] bg-white p-10 text-center text-stone-600 shadow-sm ring-1 ring-stone-200">
                                Chưa có cơ sở nào. Hãy thêm cơ sở đầu tiên.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

export default AdminAbout;
