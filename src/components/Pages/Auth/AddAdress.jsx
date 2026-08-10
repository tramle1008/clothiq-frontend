import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";

import api from "../../../api/api";
import { getProvincesApi, getWardsByProvinceApi } from "../../../api/addressApi";
import { fetchAddresses } from "../../../store/actions";
import { getAuthToken } from "../../../utils/auth";
import InputField from "../../InputField";

const AddAdress = ({ open, onClose, onAdded }) => {
    const dispatch = useDispatch();
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
    const [error, setError] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const selectedProvinceId = watch("provinceId");

    useEffect(() => {
        if (!open) {
            return;
        }

        const loadProvinces = async () => {
            try {
                setLoadingProvinces(true);
                const data = await getProvincesApi();
                setProvinces(Array.isArray(data) ? data : []);
            } catch (loadError) {
                toast.error("Không thể tải danh sách tỉnh/thành phố");
                console.error(loadError);
            } finally {
                setLoadingProvinces(false);
            }
        };

        loadProvinces();
    }, [open]);

    useEffect(() => {
        const loadWards = async () => {
            if (!selectedProvinceId) {
                setWards([]);
                setValue("wardId", "");
                return;
            }

            try {
                setLoadingWards(true);
                setValue("wardId", "");
                const data = await getWardsByProvinceApi(selectedProvinceId);
                setWards(Array.isArray(data) ? data : []);
            } catch (loadError) {
                toast.error("Không thể tải danh sách phường/xã");
                console.error(loadError);
            } finally {
                setLoadingWards(false);
            }
        };

        loadWards();
    }, [selectedProvinceId, setValue]);

    const handleClose = () => {
        setError(null);
        reset();
        setWards([]);
        onClose?.();
    };

    const handleAddAdress = async (data) => {
        const token = getAuthToken();

        if (!token) {
            toast.error("Phiên đăng nhập của bạn đã hết hạn");
            return;
        }

        const selectedProvince = provinces.find(
            (province) => String(province.provinceId) === String(data.provinceId)
        );
        const selectedWard = wards.find(
            (ward) => String(ward.wardId) === String(data.wardId)
        );

        try {
            setSubmitting(true);
            await api.post("/auth/user/addresses", {
                provinceId: Number(data.provinceId),
                wardId: Number(data.wardId),
                province: selectedProvince?.name || "",
                ward: selectedWard?.name || "",
                detail: data.detail,
                phoneNumber: data.phoneNumber,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            toast.success("Thêm địa chỉ thành công");
            dispatch(fetchAddresses());
            onAdded?.();
            handleClose();
        } catch (requestError) {
            const message =
                typeof requestError.response?.data === "string"
                    ? requestError.response.data
                    : requestError.response?.data?.message || "Thêm địa chỉ thất bại";

            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h2 className="text-xl font-bold text-slate-900">Thêm địa chỉ</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        aria-label="Đóng"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleAddAdress)} className="space-y-4 px-5 py-5">
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-gray-700">
                            Tỉnh/Thành phố
                        </span>
                        <select
                            {...register("provinceId", { required: "Không được để trống" })}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-500"
                            disabled={loadingProvinces}
                        >
                            <option value="">
                                {loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
                            </option>
                            {provinces.map((province) => (
                                <option key={province.provinceId} value={province.provinceId}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                        {errors.provinceId && (
                            <p className="mt-1 text-xs text-red-500">{errors.provinceId.message}</p>
                        )}
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-gray-700">
                            Phường/Xã
                        </span>
                        <select
                            {...register("wardId", { required: "Không được để trống" })}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-500"
                            disabled={!selectedProvinceId || loadingWards}
                        >
                            <option value="">
                                {loadingWards ? "Đang tải..." : "Chọn phường/xã"}
                            </option>
                            {wards.map((ward) => (
                                <option key={ward.wardId} value={ward.wardId}>
                                    {ward.name}
                                </option>
                            ))}
                        </select>
                        {errors.wardId && (
                            <p className="mt-1 text-xs text-red-500">{errors.wardId.message}</p>
                        )}
                    </label>

                    <InputField
                        label="Ấp/Số nhà/Đường"
                        id="detail"
                        type="text"
                        placeholder="Ấp 6/A52, đường số 6"
                        register={register}
                        errors={errors}
                        required
                        message="Không được để trống"
                    />

                    <InputField
                        label="Số điện thoại"
                        id="phoneNumber"
                        type="text"
                        placeholder="0123456789"
                        register={register}
                        errors={errors}
                        required
                        message="Không được để trống"
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? "Đang thêm..." : "Thêm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAdress;
