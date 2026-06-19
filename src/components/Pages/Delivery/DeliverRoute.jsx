import { Navigate } from "react-router-dom";
import { getStoredAuth } from "../../../utils/auth";

const DeliverRoute = ({ children }) => {
    const auth = getStoredAuth();
    const roles = auth?.role || [];

    const isDeliver = roles.includes("ROLE_DELIVER");

    if (!isDeliver) {
        return <Navigate to="/" replace />;
    }

    return children;
}
export default DeliverRoute;
