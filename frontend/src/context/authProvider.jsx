import { createContext, useState, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});

  const [emailLogin, setEmailLogin] = useState(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decodedToken = jwtDecode(JSON.parse(token));
      return decodedToken.email;
    }
    return "";
  });

  const [decodedToken, setDecodeToken] = useState({});

  const login = (accessToken) => {
    const decodedToken = jwtDecode(accessToken);
    const emailLogin = decodedToken.user_email;

    setAuth({ accessToken: accessToken });
    setDecodeToken({ decode: decodedToken });
    setEmailLogin(emailLogin);
  };

  const logout = () => {
    setAuth({ accessToken: null });
    setEmailLogin("");
    setDecodeToken({ decode: null });

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
          const decodedToken = jwtDecode(JSON.parse(token));
          setAuth({ accessToken: JSON.parse(token) });
          setEmailLogin(decodedToken.email);
        }
      }, []);
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        emailLogin,
        decodedToken,
        logout,
        login,
        setAuth,
        setEmailLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
