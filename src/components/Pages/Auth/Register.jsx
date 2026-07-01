import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import InputField from "../../InputField";
import { getProvincesApi, getWardsByProvinceApi } from "../../../api/addressApi";
import { addUserAddressApi, loginApi, registerApi } from "../../../api/authApi";
import { buildAuthSession, persistAuthSession } from "../../../utils/auth";

const Register = () => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const googleLoginUrl = `${import.meta.env.VITE_BACK_END_URL}/oauth2/authorize/google`;
    const handleRegister = async (data) => {
        try {
            await registerApi({
                username: data.username,
                email: data.email,
                password: data.password,
            });

            const loginResponse = await loginApi({
                username: data.username,
                password: data.password,
            });

            const accessToken =
                loginResponse?.accessToken ||
                loginResponse?.accesstoken ||
                loginResponse?.access_token ||
                loginResponse?.token ||
                loginResponse?.jwtToken;
            const refreshToken =
                loginResponse?.refreshToken ||
                loginResponse?.refreshtoken ||
                loginResponse?.refresh_token ||
                null;

            if (!accessToken) {
                toast.error("Không thể xác thực đăng ký. Vui lòng thử lại sau.");
                return;
            }

            const auth = buildAuthSession(accessToken, refreshToken, {
                userName: loginResponse?.username || data.username,
                email: loginResponse?.email || data.email,
                role: loginResponse?.role || loginResponse?.roles,
            });
            persistAuthSession(auth);
            toast.success("Đăng ký thành công!");
            navigate("/login");
        } catch (error) {
            const message = error.response?.data?.message || "Có lỗi xảy ra!";
            toast.error(message);
            console.error(" lỗi đăng ký:", error);
        }
    };

    return (
        <div className="mx-auto my-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-100 bg-[#f2e4d3] shadow-[0_20px_60px_rgba(95,52,8,0.18)]">
            <div className="grid lg:grid-cols-[0.95fr_1.35fr]">
                <div className="bg-gradient-to-br from-[#8c4a0f] via-[#c57a2a] to-[#f1c27d] px-8 py-10 text-white">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-100">Clothiq</p>
                    <h2 className="mt-4 text-3xl font-bold leading-tight">Tài khoản mới</h2>
                    <p className="mt-4 text-sm leading-6 text-amber-50/90">
                        Điền thông tin cơ bản và địa chỉ giao hàng để bắt đầu mua sắm nhanh hơn.
                    </p>

                    <div className="mt-8 space-y-4 rounded-2xl bg-white/15 p-5 backdrop-blur-sm">
                        <div>
                            <p className="text-sm font-semibold">Đăng ký thường</p>
                        </div>
                        <div className="h-px bg-white/20" />
                        <a href={googleLoginUrl} className="block rounded-xl transition hover:bg-white/10">
                            <p className="text-sm font-semibold">Đăng nhập Google</p>
                            <p className="mt-1 text-sm text-amber-50/85">
                                Bạn có thể sử dụng Google để đăng nhập nhanh.
                            </p>
                        </a>
                    </div>
                </div>

                <div className="bg-[#ead7c0] px-6 py-8 sm:px-8 lg:px-10">
                    <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">Đăng ký</h3>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <InputField
                                label="Tên người dùng"
                                id="username"
                                type="text"
                                placeholder="Nhập tên"
                                register={register}
                                errors={errors}
                                required
                                message="Không được để trống"
                            />

                            <InputField
                                label="Email"
                                id="email"
                                type="email"
                                placeholder="Nhập email"
                                register={register}
                                errors={errors}
                                required
                                message="Không được để trống"
                            />

                            <div className="md:col-span-2">
                                <InputField
                                    label="Mật khẩu"
                                    id="password"
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    register={register}
                                    errors={errors}
                                    required
                                    message="Không được để trống"
                                    min={8}
                                />
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="submit"
                                className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-sm transition duration-300 hover:bg-emerald-700"
                            >
                                Đăng ký
                            </button>

                            <a
                                href={googleLoginUrl}
                                className="flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 transition duration-300 hover:bg-gray-50"
                            >
                                <span className="text-lg font-semibold text-red-500">G</span>
                                <span className="font-medium text-gray-700">Đăng nhập với Google</span>
                            </a>
                        </div>

                        <p className="text-center text-sm text-slate-600">
                            Bạn đã có tài khoản?
                            <Link to="/login" className="ml-1 font-semibold text-cyan-700 transition hover:text-cyan-900 hover:underline">
                                Đăng nhập
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
