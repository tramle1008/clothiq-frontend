import "./App.css";

import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Pages/Navbar";
import Home from "./components/Pages/Home";
import Product from "./components/Pages/Product/Product";
import ProductDetailPage from "./components/Pages/Product/ProductDetailPage";
import Cart from "./components/Pages/Cart/Cart";
import Login from "./components/Pages/Auth/Login";
import Register from "./components/Pages/Auth/Register";
import OAuth2RedirectHandler from "./components/Pages/Auth/OAuth2RedirectHandler";
import Profile from "./components/Pages/Auth/Profile";
import Logout from "./components/Pages/Auth/Logout";
import OrderView from "./components/Pages/Order/OrderView";
import Checkout from "./components/Pages/Order/Checkout";
import AdminRoute from "./components/Pages/Admin/AdminRoute";
import AdminLayout from "./components/Pages/Admin/AdminLayout";
import PendingOrdersPage from "./components/Pages/Admin/Order_Admin/PendingOrdersPage";
import AdminProductList from "./components/Pages/Admin/Products/AdminProductList";
import DetailOrder from "./components/Pages/Admin/Order_Admin/DetailOrder";
import DeliverRoute from "./components/Pages/Delivery/DeliverRoute";
import Delivery from "./components/Pages/Delivery/Delivery";
import WebFooter from "./components/Pages/WebFooter";
import About from "./components/Pages/About/About";
import AdminAbout from "./components/Pages/Admin/AdminAbout";

import DashBoard from "./components/Pages/Admin/DashBoard";
import Discount from "./components/Pages/Admin/Discounts/Discount";
import Categories from "./components/Pages/Admin/Categories/Categories";
import TicketPage from "./components/Pages/Ticket/TicketPage";
import TicketCreate from "./components/Pages/Ticket/TicketCreate";
import TicketDetail from "./components/Pages/Ticket/TicketDetail";
import AdminTicket from "./components/Pages/Admin/Ticket/AdminTicket";
import AdminTicketDetail from "./components/Pages/Admin/Ticket/AdminTicketDetail";

function AppContent() {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith("/admin");
    const routes = (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<Product />} />
            <Route path="/products" element={<Product />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/user/order" element={<OrderView />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/ticket" element={<TicketPage />} />
            <Route path="/ticket/create" element={<TicketCreate />} />
            <Route path="/ticket/detail/:ticketId" element={<TicketDetail />} />


            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<DashBoard />} />
                <Route path="orders" element={<PendingOrdersPage />} />
                <Route path="products" element={<AdminProductList />} />
                <Route path="detail" element={<DetailOrder />} />
                <Route path="about" element={<AdminAbout />} />
                <Route path="products/categories" element={<Categories />} />
                <Route path="products/discounts" element={<Discount />} />
                <Route path="tickets" element={<AdminTicket />} />
                <Route path="tickets/detail/:ticketId" element={<AdminTicketDetail />} />
            </Route>
            <Route path="/deliver" element={<DeliverRoute><Delivery /></DeliverRoute>} />
        </Routes>
    );

    if (isAdminPage) {
        return (
            <>
                <Toaster position="top-center" />
                {routes}
            </>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Toaster position="top-center" />
            <Navbar />
            <main className="flex-1">
                {routes}
            </main>
            <WebFooter />
        </div>
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

