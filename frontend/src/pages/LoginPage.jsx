import { useState } from "react";
import {Box,IconButton, Alert, AlertTitle, Collapse, TextField} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RootLayout from "@/layouts/RootLayout";
import Logo_ver from "../assets/Logo/CEIT_ver2.png";
import Logo_hor from "../assets/Logo/CEIT_hor2.png";
import axios from "@/middleware/axios";

import { useNavigate , useLocation} from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [show, setShow] = useState(false); //Alerts
  const [serverResponse, setServerResponse] = useState("");

  const [emailTouched, setEmailTouched] = useState(false);
  // const [passwordTouched, setPasswordTouched] = useState(false);

  const showEmailError = emailTouched && !email;

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        "auth/login",
        { email,password },
        {
          headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*'
          },
        }
      );

      if (response){
        const access_token = response.data.access_token;
        const refresh_token = response.data.refresh_token;
        console.log(access_token);

        localStorage.setItem("access_token", `"${access_token}"`);
        localStorage.setItem("refresh_token", `"${refresh_token}"`);

        console.log({ email, password });

        setServerResponse("");
        setShow(false);
        
        navigate(from, { replace: true });
      }

    } catch (error) {
      setServerResponse(error.response.data.msg);
      console.log(serverResponse);
      setShow(true);
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
                    <Box sx={{ width: '100%' }}>
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
          <button type="submit" className="login-button">
            SIGN IN
          </button>
        </div>
      </form>
    </RootLayout>
  );
}
