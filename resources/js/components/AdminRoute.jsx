export default function AdminRoute({ children }) {
    const token = localStorage.getItem("token");
  
    if (!token) return <Navigate to="/login" />;
  
    try {
      const decoded = jwtDecode(token);
  
      if (decoded.role !== "admin") {
        return <Navigate to="/unauthorized" />;
      }
  
      return children;
    } catch (e) {
      return <Navigate to="/login" />;
    }
  }
  