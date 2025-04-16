
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'teacher') {
        navigate("/teacher-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } else {
      navigate("/home");
    }
  }, [navigate, isAuthenticated, user]);

  return null;
};

export default Index;
