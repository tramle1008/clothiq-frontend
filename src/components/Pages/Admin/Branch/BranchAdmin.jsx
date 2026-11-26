import { useCallback, useEffect, useState } from "react";
import { createBannerApi, deleteBannerApi, getBannersApi, resolveBannerImage, updateBannerApi } from "../../../../api/bannerApi";

const emptyForm = { title: "", description: "", linkUrl: "/products", displayOrder: 0, placement: "HERO", image: null };
const inputClass = "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-stone-700";

const BranchAdmin = () => {
    const [banners, setBanners] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [localPreview, setLocalPreview] = useState("");
    const loadBanners = useCallback(async () => {
        setLoading(true);
        try { setBanners(await getBannersApi()); }
        catch (e) { setError(e.response?.data?.message || "Không thể tải danh sách banner."); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { loadBanners(); }, [loadBanners]);
    useEffect(() => {
        if (!form.image) { setLocalPreview(""); return undefined; }
        const objectUrl = URL.createObjectURL(form.image);
        setLocalPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [form.image]);

    const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === "file" ? event.target.files?.[0] || null : event.target.value }));
    const reset = () => { setForm(emptyForm); setEditingId(null); setError(""); };
    const submit = async (event) => {
        event.preventDefault(); setSaving(true); setError("");
        const payload = new FormData();
        payload.append("title", form.title.trim());
        payload.append("description", form.description.trim());
        payload.append("linkUrl", form.linkUrl.trim() || "/products");
        payload.append("displayOrder", String(Number(form.displayOrder) || 0));
        payload.append("placement", form.placement);
        if (form.image) payload.append("image", form.image);
        try {
            if (editingId) await updateBannerApi(editingId, payload);
            else await createBannerApi(payload);
            reset(); await loadBanners();
        } catch (e) { setError(e.response?.data?.message || "Không thể lưu banner."); }
        finally { setSaving(false); }
    };
    const edit = (banner) => {
        setEditingId(banner.bannerId);
        setForm({ title: banner.title || "", description: banner.description || "", imageUrl: banner.imageUrl || "", linkUrl: banner.linkUrl || "/products", displayOrder: banner.displayOrder ?? 0, placement: banner.placement || "HERO", image: null });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const remove = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa banner này?")) return;
        try { await deleteBannerApi(id); await loadBanners(); }
        catch (e) { setError(e.response?.data?.message || "Không thể xóa banner."); }
    };

    return <main className="min-h-screen flex-1 bg-stone-100 px-4 pb-8 pt-24 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px] space-y-8">
            <header><h1 className="mt-2 text-3xl font-bold text-stone-900">Quản lý banner</h1></header>
            <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 md:p-8">
                <h2 className="mb-6 text-xl font-bold">{editingId ? "Cập nhật nội dung" : "Thêm nội dung"}</h2>
                <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2"><span className="text-sm font-semibold">Vị trí hiển thị</span><select name="placement" value={form.placement} onChange={change} className={inputClass}><option value="HERO">Banner chính (Hero)</option><option value="FEATURED_CATEGORY">Danh mục nổi bật</option></select></label>
                    <label className="space-y-2"><span className="text-sm font-semibold">Thứ tự hiển thị</span><input name="displayOrder" type="number" value={form.displayOrder} onChange={change} className={inputClass} /></label>
                    <label className="space-y-2"><span className="text-sm font-semibold">Tiêu đề</span><input required name="title" value={form.title} onChange={change} className={inputClass} placeholder="Ví dụ: Quần áo" /></label>
                    <label className="space-y-2"><span className="text-sm font-semibold">Mô tả</span><input required name="description" value={form.description} onChange={change} className={inputClass} placeholder="Mô tả ngắn cho nội dung" /></label>
                    <label className="space-y-2 md:col-span-2"><span className="text-sm font-semibold">Tải ảnh lên</span><input required={!editingId} name="image" type="file" accept="image/*" onChange={change} className={inputClass} />{editingId && <span className="block text-xs text-stone-500">Chọn ảnh mới nếu muốn thay ảnh hiện tại.</span>}</label>
                    <label className="space-y-2 md:col-span-2"><span className="text-sm font-semibold">Đường dẫn khi nhấn (mặc định /products)</span><input name="linkUrl" value={form.linkUrl} onChange={change} className={inputClass} placeholder="/products?categoryId=1" /></label>
                </div>
                {(localPreview || form.imageUrl) && <img src={localPreview || resolveBannerImage(form.imageUrl)} alt="Xem trước" className="mt-5 h-36 w-56 rounded-xl object-cover" />}
                {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
                <div className="mt-6 flex gap-3"><button disabled={saving} className="rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm nội dung"}</button>{editingId && <button type="button" onClick={reset} className="rounded-xl border border-stone-300 px-5 py-3 font-semibold">Hủy chỉnh sửa</button>}</div>
            </form>
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 md:p-8">
                <h2 className="mb-5 text-xl font-bold">Danh sách nội dung</h2>
                {loading ? <p className="text-stone-500">Đang tải...</p> : banners.length === 0 ? <p className="text-stone-500">Chưa có banner nào.</p> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {banners.map((banner) => <article key={banner.bannerId} className="overflow-hidden rounded-2xl border border-stone-200">
                        <img src={resolveBannerImage(banner.imageUrl)} alt={banner.description} className="h-44 w-full bg-stone-100 object-cover" />
                        <div className="space-y-2 p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{banner.title}</h3><span className="whitespace-nowrap rounded-full bg-stone-100 px-2.5 py-1 text-xs">#{banner.displayOrder}</span></div><p className="text-sm text-stone-600">{banner.description}</p><p className="text-xs font-semibold uppercase text-stone-500">{banner.placement === "HERO" ? "Banner chính" : "Danh mục nổi bật"}</p><p className="truncate text-sm text-stone-600">{banner.linkUrl}</p><div className="flex gap-2 pt-2"><button onClick={() => edit(banner)} className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold">Sửa</button><button onClick={() => remove(banner.bannerId)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">Xóa</button></div></div>
                    </article>)}
                </div>}
            </section>
        </div>
    </main>;
};

export default BranchAdmin;
