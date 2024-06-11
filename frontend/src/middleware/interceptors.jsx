

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosPrivate from "@/middleware/axios";
import useRefreshToken from "@/hooks/useRefreshToken";
import { useAuth } from "@/context/authProvider";

const useAxiosInterceptor = () => {
  const refresh = useRefreshToken();
  const { auth } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Request interceptor
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth?.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        // isRefreshing used to prevent loop error 401
        if (error?.response?.status === 401 && !isRefreshing) {
          setIsRefreshing(true);
          // try {
          const newAccessToken = await refresh();
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          localStorage.setItem("access_token", `"${newAccessToken}"`);
          setIsRefreshing(false);
          return axiosPrivate(prevRequest);

          // } catch (err) {
          //   console.error("Token refresh failed", err);
          //   alert("Token expired");

          //   setIsRefreshing(false);
          //   localStorage.removeItem("access_token");
          //   localStorage.removeItem("refresh_token");
          //   navigate("/login", { state: { from: location }, replace: true });
          // }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh, isRefreshing, navigate, location]);

  return axiosPrivate;
};

export default useAxiosInterceptor;
