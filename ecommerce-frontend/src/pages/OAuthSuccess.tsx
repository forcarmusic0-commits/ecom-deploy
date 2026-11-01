import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";

// Google redirects here with ?accessToken=... after a successful login (see backend googleCallback)
export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const { setUserFromToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setUserFromToken(token)
      .then(() => navigate("/", { replace: true }))
      .catch(() => navigate("/login", { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Loader label="Finishing sign in" />;
}
