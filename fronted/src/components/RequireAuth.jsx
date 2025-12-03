import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const auth = localStorage.getItem("auth");

  if (auth !== "true") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
