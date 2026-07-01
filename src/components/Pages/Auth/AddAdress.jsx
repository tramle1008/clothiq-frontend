import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchAddresses } from "../../../store/actions";
import InputField from "../../InputField";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import { getAuthToken } from "../../../utils/auth";

const AddAdress = () => {
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { addresses } = useSelector((state) => state.address);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchAddresses());
    }, [dispatch]);

    const handleAddAdress = async (data) => {
        const token = getAuthToken();

        if (!token) {
            toast.error("Phiên đăng nhập của bạn đã hết hạn");
            navigate("/login");
            return;
        }

        try {
            await api.post("/auth/user/addresses", {
                province: data.province,
                district: data.district,
                ward: data.ward,
                detail: data.detail,
                phoneNumber: data.phoneNumber,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            toast.success("Thêm địa chỉ thành công!");
            dispatch(fetchAddresses());
            navigate(-1);
        } catch (requestError) {
            const message =
                typeof requestError.response?.data === "string"
                    ? requestError.response.data
                    : requestError.response?.data?.message || "Thêm địa chỉ thất bại";

            setError(message);
            toast.error(message);
        }
    };

    return (
        <div className="mx-auto my-10 max-w-md rounded bg-white p-6 shadow-md">
            <h2 className="mb-4 text-center text-2xl font-bold">Thêm địa chỉ</h2>
            <form onSubmit={handleSubmit(handleAddAdress)} className="flex flex-col gap-4">
                <InputField
                    label="Tỉnh/Thành phố"
                    id="province"
                    type="text"
                    placeholder="Cần Thơ"
                    register={register}
                    errors={errors}
                    required
                    message="Không được để trống"
                />
                <InputField
                    label="Quận/Huyện"
                    id="district"
                    type="text"
                    placeholder="Ninh Kiều"
                    register={register}
                    errors={errors}
                    required
                    message="Không được để trống"
                />
                <InputField
                    label="Phường/Xã"
                    id="ward"
                    type="text"
                    placeholder="An Khánh"
                    register={register}
                    errors={errors}
                    required
                    message="Không được để trống"
                />
                <InputField
                    label="Ấp/Số nhà, tên đường"
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
                <button
                    type="submit"
                    className="rounded-lg bg-gray-700 px-4 py-2 text-white transition duration-300 hover:bg-emerald-700"
                >
                    Thêm
                </button>
            </form>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            {addresses && addresses.length > 0 && (
                <div className="mt-6">
                    <h3 className="mb-2 font-semibold">Địa chỉ hiện tại:</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                        {addresses.map((addr) => (
                            <li key={addr.addressId}>
                                - {addr.detail ? `${addr.detail}, ` : ""}{addr.ward}, {addr.district}, {addr.province}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AddAdress;
