import { useState } from "react";
import {
  Box,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import RootLayout from "@/layouts/RootLayout";
import Logo_ver from "@/assets/Logo/CEIT_ver2.png";
import Logo_hor from "@/assets/Logo/CEIT_hor2.png";

import axios from "@/middleware/axios";
import { useAuth } from "@/context/authProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  //context
  const { login } = useAuth();

  const [loadings, setLoadings] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [show, setShow] = useState(false); //Alerts
  const [serverResponse, setServerResponse] = useState("");

  const [emailTouched, setEmailTouched] = useState(false);
  // const [passwordTouched, setPasswordTouched] = useState(false);

  const showEmailError = emailTouched && !email;

  const navigate = useNavigate();
  const location = useLocation();
  // const admin_from = location.state?.from?.pathname || "/dashboard";
  // const user_from = location.state?.from?.pathname || "/u/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoadings(true);

    try {
      const response = await axios.post(
        "auth/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response) {
        const access_token = response.data.access_token;
        const refresh_token = response.data.refresh_token;

        console.log(access_token);
        const decodeToken = jwtDecode(access_token);
        const role = decodeToken.role;
        const permissions = decodeToken.permissions;

        console.log(role);
        console.log(permissions);

        localStorage.setItem("access_token", `"${access_token}"`);
        localStorage.setItem("refresh_token", `"${refresh_token}"`);

        login(access_token);

        setServerResponse("");
        setShow(false);

        if (role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/u/");
        }
      }
    } catch (error) {
      setServerResponse(error.response.data.msg);
      console.log(serverResponse);
      setShow(true);
    } finally {
      setLoadings(false);
    }
  };

  return (
    <RootLayout>
      <nav className="navbar">
        <img
          src={Logo_hor}
          draggable="false"
          alt="App Logo"
          className="navbar-logo"
          onContextMenu={(e) => e.preventDefault()}
        />
      </nav>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-card">
          {show ? (
            <>
              <Box sx={{ width: "100%" }}>
                <Collapse in={show}>
                  <Alert
                    severity="error"
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setShow(false);
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ mb: 2 }}
                  >
                    <AlertTitle>Error</AlertTitle>
                    <span>{serverResponse}</span>
                  </Alert>
                </Collapse>
              </Box>
            </>
          ) : null}
          <img
            src={Logo_ver}
            draggable="false"
            alt="App Logo"
            className="app-logo_ver"
            onContextMenu={(e) => e.preventDefault()}
          />
          <div className="login_field">
            <TextField
              error={showEmailError}
              helperText={showEmailError ? "Email is Required" : ""}
              className="login-textfield"
              label="Email"
              variant="outlined"
              size="small"
              onBlur={() => setEmailTouched(true)}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              className="login-textfield"
              label="Password"
              variant="outlined"
              size="small"
              type="password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <LoadingButton
            className="login-button"
            onClick={handleSubmit}
            loading={loadings}
            // variant="outlined"

          >
            SIGN IN
          </LoadingButton>
        </div>
      </form>
    </RootLayout>
  );
}
