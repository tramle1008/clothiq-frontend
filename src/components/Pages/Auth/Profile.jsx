import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";

import api from "../../../api/api";
import { getAuthToken, getStoredAuth } from "../../../utils/auth";
import AddAdress from "./AddAdress";
import ChangePasswd from "./ChangePasswd";

const formatAddress = (addr) =>
    [addr?.detail, addr?.ward, addr?.province].filter(Boolean).join(", ");

const Profile = () => {
    const [addresses, setAddresses] = useState(null);
    const [auth, setAuth] = useState(null);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    const loadProfileData = () => {
        const storedAuth = getStoredAuth();
        const token = getAuthToken();

        setAuth(storedAuth);

        if (!storedAuth) {
            setError("Token khong hop le");
            return;
        }

        if (!token) {
            setError("Chua dang nhap hoac token khong ton tai");
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        api.get("/auth/user", { headers })
            .then((res) => setUser(res.data))
            .catch((err) => {
                console.error(err);
            });

        api.get("/auth/user/addresses", { headers })
            .then((res) => setAddresses(res.data))
            .catch((err) => {
                console.error(err);
            });
    };

    useEffect(() => {
        loadProfileData();
    }, []);

    const handleDelete = async (addressId) => {
        const token = getAuthToken();

        if (!token) {
            setError("Khong tim thay token xac thuc.");
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        try {
            await api.delete(`/auth/user/address/delete/${addressId}`, { headers });
            toast.success("Cap nhat thanh cong");
            setAddresses((prev) => prev.filter((addr) => addr.addressId !== addressId));
        } catch (err) {
            console.error("Lỗi khi xóa địa chỉ:", err);
            toast.error("Bạn không thể xóa tất cả địa chỉ");
        }
    };

    if (error) {
        return <p className="mt-10 text-center text-red-500">{error}</p>;
    }

    if (!auth) {
        return <p className="mt-10 text-center text-gray-600">Dang tai du lieu...</p>;
    }

    return (
        <div className="mx-auto my-16 max-w-4xl rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-center text-2xl font-bold">Hồ sơ người dùng</h2>
            <ul className="mb-6 space-y-2">
                <li><strong>Tên đăng nhập:</strong> {user?.username || auth?.userName || auth?.username}</li>
                <li><strong>Email:</strong> {user?.email || auth?.email}</li>
            </ul>

            {Array.isArray(addresses) && addresses.length > 0 && (
                <>
                    <h3 className="mb-4 mt-8 text-xl font-semibold">Địa chỉ giao hàng</h3>
                    <ul className="mb-6 space-y-2">
                        {addresses.map((addr) => (
                            <li key={addr.addressId} className="flex items-start justify-between rounded border bg-gray-50 p-3">
                                <div className="text-md text-gray-600 leading-relaxed">
                                    <p className="font-medium text-gray-700">
                                        {addr.detail}, {addr.wardName}, {addr.provinceName}
                                    </p>
                                    <p className="mt-1">
                                        <span className="font-medium text-gray-700">SĐT:</span>{" "}
                                        {addr.phoneNumber}
                                    </p>
                                </div>
                                <div className="cursor-pointer text-gray-800 hover:text-rose-600">
                                    <MdDelete size={25} onClick={() => handleDelete(addr.addressId)} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="flex items-center rounded-md border border-b-blue-950 px-4 py-1 font-bold transition-colors duration-200 hover:bg-blue-100"
                >
                    + Thêm địa chỉ
                </button>

                <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(true)}
                    className="flex items-center rounded-md border border-b-blue-950 px-4 py-1 font-bold transition-colors duration-200 hover:bg-amber-100">
                    Đổi mật khẩu
                </button>
            </div>

            <AddAdress
                open={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onAdded={loadProfileData}
            />
            <ChangePasswd
                open={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
                onAdded={loadProfileData}
            />
        </div>
    );
};

export default Profile;
