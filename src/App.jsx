import "./App.css";

import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Pages/Navbar";
import Home from "./components/Pages/Home";
import Product from "./components/Pages/Product/Product";
import Cart from "./components/Pages/Cart/Cart";
import Login from "./components/Pages/Auth/Login";
import Register from "./components/Pages/Auth/Register";
import OAuth2RedirectHandler from "./components/Pages/Auth/OAuth2RedirectHandler";
import Profile from "./components/Pages/Auth/Profile";
import Logout from "./components/Pages/Auth/Logout";
import OrderView from "./components/Pages/Order/OrderView";
import Checkout from "./components/Pages/Order/Checkout";
import AddAdress from "./components/Pages/Auth/AddAdress";
import ChangePasswd from "./components/Pages/Auth/ChangePasswd";
import AdminRoute from "./components/Pages/Admin/AdminRoute";
import AdminLayout from "./components/Pages/Admin/AdminLayout";
import HandleOrder from "./components/Pages/Admin/HandleOrder";
import OrderShipped from "./components/Pages/Admin/DetailOrder";
import AdminProductList from "./components/Pages/Admin/AdminProductList";
import DetailOrder from "./components/Pages/Admin/DetailOrder";
import DeliverRoute from "./components/Pages/Delivery/DeliverRoute";
import Delivery from "./components/Pages/Delivery/Delivery";
import UpdateProduct from "./components/Pages/Admin/UpdateProduct";
import WebFooter from "./components/Pages/WebFooter";
import About from "./components/Pages/About/About";
import AdminAbout from "./components/Pages/Admin/AdminAbout";
import Categories from "./components/Pages/Admin/Categories";

function AppContent() {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith("/admin");

    return (
        <>
            <Toaster position="top-center" />
            {!isAdminPage && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Product />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
                <Route path="/user/profile" element={<Profile />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/user/order" element={<OrderView />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/user/update/address" element={<AddAdress />} />
                <Route path="/user/update/password" element={<ChangePasswd />} />

                <Route path="/about" element={<About />} />
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>} />
                <Route path="/admin/orders" element={<HandleOrder />} />
                <Route path="/admin/orders/ships" element={<OrderShipped />} />
                <Route path="/admin/products" element={<AdminProductList />} />
                <Route path="/admin/detail" element={<DetailOrder />} />
                <Route path="/deliver" element={<DeliverRoute><Delivery /></DeliverRoute>} />
                <Route path="/admin/product/update/:productId" element={<UpdateProduct />} />
                <Route path="/admin/about" element={<AdminRoute><AdminAbout /></AdminRoute>} />
                <Route path="/admin/products/categories" element={<AdminRoute><Categories /></AdminRoute>} />
            </Routes>
            {!isAdminPage && <WebFooter />}
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
