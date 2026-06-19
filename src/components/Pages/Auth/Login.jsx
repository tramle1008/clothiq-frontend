import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import InputField from "../../InputField";
import { loginApi } from "../../../api/authApi";
import { buildAuthSession, persistAuthSession } from "../../../utils/auth";

const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const googleLoginUrl = `${import.meta.env.VITE_BACK_END_URL}/oauth2/authorize/google`;

    const handleLogin = async (data) => {
        try {
            const response = await loginApi({
                username: data.username,
                password: data.password,
            });

            const accessToken = response?.accessToken || response?.accesstoken || response?.access_token || response?.token;
            const refreshToken = response?.refreshToken || response?.refreshtoken || response?.refresh_token || null;
            const roles = response?.roles ?? response?.role;

            if (!accessToken) {
                toast.error("Dang nhap that bai.");
                return;
            }

            const auth = buildAuthSession(accessToken, refreshToken, {
                id: response?.id,
                userName: response?.username,
                email: response?.email,
                role: roles,
            });

            persistAuthSession(auth);
            dispatch({ type: "LOGIN_SUCCESS", payload: auth });

            toast.success("Dang nhap thanh cong!");

            const normalizedRoles = auth.role || [];
            navigate(normalizedRoles.includes("ROLE_ADMIN") ? "/admin" : "/products");
        } catch (error) {
            toast.error("Dang nhap loi: " + (error.response?.data?.message || "Loi ket noi"));
        }
    };

    return (
        <div className="mx-auto my-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-100 bg-[#f2e4d3] shadow-[0_20px_60px_rgba(95,52,8,0.18)]">
            <div className="grid lg:grid-cols-[0.95fr_1.35fr]">
                <div className="bg-gradient-to-br from-[#8c4a0f] via-[#c57a2a] to-[#f1c27d] px-8 py-10 text-white">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-100">Clothiq</p>
                    <h2 className="mt-4 text-3xl font-bold leading-tight">Chao mung quay lai</h2>
                    <p className="mt-4 text-sm leading-6 text-amber-50/90">
                        Dang nhap de theo doi don hang, quan ly ho so va tiep tuc mua sam nhanh hon.
                    </p>

                    <div className="mt-8 space-y-4 rounded-2xl bg-white/15 p-5 backdrop-blur-sm">
                        <div>
                            <p className="text-sm font-semibold">Dang nhap thuong</p>
                            <p className="mt-1 text-sm text-amber-50/85">
                                Dung ten dang nhap va mat khau neu ban da co tai khoan Clothiq.
                            </p>
                        </div>
                        <div className="h-px bg-white/20" />
                        <a href={googleLoginUrl} className="block rounded-xl transition hover:bg-white/10">
                            <p className="text-sm font-semibold">Dang nhap Google</p>
                            <p className="mt-1 text-sm text-amber-50/85">
                                Ban co the dung Google de vao nhanh ma khong can nhap lai mat khau.
                            </p>
                        </a>
                    </div>
                </div>

                <div className="bg-[#ead7c0] px-6 py-8 sm:px-8 lg:px-10">
                    <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">Dang nhap</h3>
                        </div>

                        <div className="space-y-4">
                            <InputField
                                label="Ten dang nhap"
                                id="username"
                                type="text"
                                placeholder="Nhap username"
                                register={register}
                                errors={errors}
                                required
                                message="Khong duoc de trong"
                            />

                            <InputField
                                label="Mat khau"
                                id="password"
                                type="password"
                                placeholder="Nhap mat khau"
                                register={register}
                                errors={errors}
                                required
                                message="Khong duoc de trong"
                                min={6}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-sm transition duration-300 hover:bg-emerald-700"
                            >
                                Dang nhap
                            </button>

                            <a
                                href={googleLoginUrl}
                                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 transition duration-300 hover:bg-gray-50"
                            >
                                <span className="text-lg font-semibold text-red-500">G</span>
                                <span className="font-medium text-gray-700">Dang nhap voi Google</span>
                            </a>
                        </div>

                        <p className="text-center text-sm text-slate-600">
                            Ban chua co tai khoan?
                            <Link
                                to="/register"
                                className="ml-1 font-semibold text-cyan-700 transition hover:text-cyan-900 hover:underline"
                            >
                                Dang ky
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
