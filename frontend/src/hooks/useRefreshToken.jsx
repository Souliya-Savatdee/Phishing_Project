import { useAuth } from "@/context/authProvider";
import axiosPrivate from "@/middleware/axios";
import { jwtDecode } from "jwt-decode";

const useRefreshToken = () => {
  const { setAuth, setEmailLogin, logout } = useAuth();
  const refreshToken = localStorage.getItem("refresh_token");

  const refresh = async () => {
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axiosPrivate.get("auth/token/refresh", {
        headers: {
          Authorization: `Bearer ${JSON.parse(refreshToken)}`,
        },
      });

      const newAccessToken = response.data.access_token;
      const decodedToken = jwtDecode(newAccessToken);
      const emailLogin = decodedToken.email;

      setAuth((prev) => ({
        ...prev,
        accessToken: newAccessToken,
      }));
      setEmailLogin(emailLogin);

      return newAccessToken;
    } catch (error) {
      if (error.response.data.msg === "Token has expired") {
        console.log("Token refresh failed. Redirecting to login...");

        alert("Token expired"); 

        //reset all localstorage and context
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        logout();

        console.clear();
        navigate("/login", { state: { from: location }, replace: true }); 
        return;
      }
    }
  };

  return refresh;
};

export default useRefreshToken;
