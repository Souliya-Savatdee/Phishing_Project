import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import useRefreshToken from "@/hooks/useRefreshToken";
import { useAuth } from "@/context/authProvider";
import { jwtDecode } from "jwt-decode";


const Persist = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refreshToken = useRefreshToken();
  const { auth, setAuth, setEmailLogin  } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        const newAccessToken = await refreshToken();
        const decodedToken = jwtDecode(newAccessToken);
        const emailLogin = decodedToken.email;

        setAuth((prev) => ({
          ...prev,
          accessToken: newAccessToken,
        }));
        setEmailLogin(emailLogin);

      } catch (error) {
        console.log("Error verifying refresh token:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (!auth?.accessToken) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [auth?.accessToken, refreshToken, setAuth, setEmailLogin]);

  useEffect(() => {
    console.log(`isLoading: ${isLoading}`);
    console.log(`Access Token: ${JSON.stringify(auth?.accessToken)}`);
  }, [isLoading, auth?.accessToken]);

  return isLoading ? <p>Loading...</p> : <Outlet />;
};

export default Persist;
