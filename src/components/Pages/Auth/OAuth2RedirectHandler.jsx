import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../../../api/api";
import { buildAuthSession, persistAuthSession } from "../../../utils/auth";

const OAuth2RedirectHandler = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
            toast.error("Đăng nhập Google thất bại");
            navigate("/login", { replace: true });
            return;
        }

        if (!token) {
            toast.error("Không nhận được token từ Google");
            navigate("/login", { replace: true });
            return;
        }

        const completeGoogleLogin = async () => {
            try {
                const response = await api.get("/auth/user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const auth = buildAuthSession(token, null, response.data);
                persistAuthSession(auth);
                dispatch({ type: "LOGIN_SUCCESS", payload: auth });

                const roles = auth.role || [];
                toast.success("Đăng nhập Google thành công!");
                navigate(roles.includes("ROLE_ADMIN") ? "/admin" : "/products", { replace: true });
            } catch (error) {
                console.error("Google login error:", error);
                toast.error("Không thể hoàn tất đăng nhập Google");
                navigate("/login", { replace: true });
            }
        };

        completeGoogleLogin();
    }, [dispatch, navigate, searchParams]);

    return (
        <div className="max-w-md mx-auto my-20 bg-white shadow-lg p-6 rounded-xl border text-center">
            <h2 className="text-2xl font-bold text-gray-800">Đang đăng nhập với Google</h2>
            <p className="mt-3 text-gray-600">Vui lòng đợi trong giây lát...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;
