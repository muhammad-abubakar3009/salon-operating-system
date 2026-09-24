import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

function OwnerRoute({ children }) {
  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== "owner") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default OwnerRoute;