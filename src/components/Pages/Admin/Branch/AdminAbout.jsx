import { useEffect, useState } from "react";
import { FiMapPin, FiPlus, FiRotateCcw, FiSave, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
    createStoreBranch,
    deleteStoreBranch,
    fetchStoreBranches,
    replaceStoreBranches,
    updateStoreBranch,
} from "../../../../store/actions";
import { Typography } from "@mui/material";

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
    const dispatch = useDispatch();
    const {
        stores: storeBranches = [],
        loading = false,
        saving: storeSaving = false,
        error = null,
    } = useSelector((state) => state.storeBranches || {});

    const [stores, setStores] = useState([]);
    const [initialStores, setInitialStores] = useState([]);
    const [saving, setSaving] = useState(false);
    const isSaving = saving || storeSaving;

    useEffect(() => {
        dispatch(fetchStoreBranches());
    }, [dispatch]);

    useEffect(() => {
        if (!saving) {
            setStores(storeBranches);
            setInitialStores(storeBranches);
        }
    }, [saving, storeBranches]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

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
            await dispatch(deleteStoreBranch(id));
            setStores((prev) => prev.filter((store) => store.id !== id));
            setInitialStores((prev) => prev.filter((store) => store.id !== id));
            toast.success(`Đã xóa ${storeToDelete.branchName}.`);
        } catch (requestError) {
            const message = requestError?.response?.data?.message || "Không thể xóa cửa hàng.";
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
                    ? await dispatch(updateStoreBranch(store.id, payload))
                    : await dispatch(createStoreBranch(payload));

                savedStores.push(savedStore);
            }

            dispatch(replaceStoreBranches(savedStores));
            setStores(savedStores);
            setInitialStores(savedStores);
            toast.success("Đã lưu danh sách cửa hàng.");
        } catch (requestError) {
            const message = requestError?.response?.data?.message || "Không thể lưu cửa hàng.";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen flex-1 bg-stone-100 px-4 pb-8 pt-24 md:px-8 lg:px-10">
            <div className="mx-auto max-w-[1500px]">
                <section className="mb-8 rounded-md bg-amber-50">
                    <div className="mb-6 flex flex-col gap-4 rounded-md  p-5 shadow">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#334155" }}>
                                Quản lý cửa hàng
                            </Typography>
                        </div>
                    </div>
                </section>

                {loading ? (
                    <div className="rounded-[2rem] bg-white p-10 text-center text-base text-stone-600 shadow-sm ring-1 ring-stone-200">
                        Đang tải danh sách cửa hàng...
                    </div>
                ) : (
                    <div className="space-y-8 px-4 py-2 bg-gray-400 rounded-md ">
                        <div className="flex justify-end mb-2.5">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleAddStore}
                                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 shadow-sm hover:bg-emerald-50"
                                >
                                    <FiPlus />
                                    Thêm cơ sở
                                </button>

                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-stone-300 px-4 py-2 shadow-sm  hover:bg-emerald-50"
                                >
                                    <FiRotateCcw />
                                    Hoàn tác
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-stone-700 px-4 py-2 shadow-sm  text-white hover:bg-emerald-900"
                                >
                                    <FiSave />
                                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </div>
                        {stores.map((store, index) => (
                            <section
                                key={store.id}
                                className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-stone-200 mb-4"
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
                                        className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 lg:self-center"
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
