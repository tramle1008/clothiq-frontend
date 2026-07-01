import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />
            <div style={{ flex: 1 }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
