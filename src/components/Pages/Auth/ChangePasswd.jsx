import { useState } from "react";
import { useDispatch } from "react-redux";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";

import { updateUser } from "../../../store/actions";

const ChangePasswd = ({ open, onClose, onAdded }) => {
    const dispatch = useDispatch();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleClose = () => {
        setPassword("");
        setShowPassword(false);
        onClose?.();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!password) return;

        dispatch(updateUser({ password }));
        toast.success("Cap nhat mat khau thanh cong!");
        onAdded?.();
        handleClose();
    };

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h2 className="text-xl font-bold text-slate-900">Đổi mật khẩu</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        aria-label="Dong"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                            Mật khẩu mới
                        </label>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhap mat khau moi"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-500"
                            minLength={6}
                            required
                        />
                        <div className="mt-1 text-right text-sm">
                            <button
                                type="button"
                                className="font-medium text-emerald-600 hover:underline"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                            </button>
                        </div>
                    </div>

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
                            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswd;
