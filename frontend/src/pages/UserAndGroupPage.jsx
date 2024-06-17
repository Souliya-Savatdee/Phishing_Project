import DashboardLayout from "@/layouts/DashboardLayout";
import React, { useState } from "react";
import { Button, Typography, Card, Divider, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  Box,
  TextField,
  Button as Button_m,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import { useNavigate } from "react-router-dom";

import EnhancedTable from "@/components/data-table/UserGroupTable";
import EnhancedTable_m from "@/components/data-table/UserGroupPopupTable";
import useAxiosInterceptor from "@/middleware/interceptors";

export default function UserAndGroupPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [target, setTarget] = useState([]);

  //Alert
  const [show, setShow] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [serverResponse, setServerResponse] = useState("");

  const axiosPrivate = useAxiosInterceptor();
  const access_token = localStorage.getItem("access_token");

  const handleDelete = (id) => {
    setTarget((prevTargets) =>
      prevTargets.filter((target) => target.id !== id)
    );
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddTarget = () => {
    const trimmedFirstname = firstname.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstname) {
      setAlertSeverity("error");
      setServerResponse("Firstname is required");
      setShow(true);

      return;
    }

    if (!trimmedEmail) {
      setAlertSeverity("error");
      setServerResponse("Email is required");
      setShow(true);

      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setAlertSeverity("error");
      setServerResponse("Invalid email address");
      setShow(true);
      return;
    }

    const newTarget = {
      id: target.length + 1,
      first_name: firstname,
      last_name: lastname,
      email: email,
      actions: {
        deleteAction: () => handleDelete(target.length + 1),
      },
    };

    setTarget((prevUsers) => [...prevUsers, newTarget]);
    console.log(target);
    setFirstname("");
    setLastname("");
    setEmail("");
    setShow(false);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setAlertSeverity("error");
      setServerResponse("Group name is required");
      setShow(true);
      return;
    }

    if (target.length === 0) {
      setAlertSeverity("error");
      setServerResponse("At least one target is required in the group target");
      setShow(true);
      return;
    }

    const formattedData = {
      group_name: name,
      target_list: target,
    };

    setShow(false);
    SendData(formattedData);
  };

  //Create Group Target Profile
  const SendData = async (formData) => {
    console.log(formData);

    try {
      const response = await axiosPrivate.post("group/", formData, {
        headers: {
          Authorization: `Bearer ${JSON.parse(access_token)}`,
        },
      });

      if (response) {
        setAlertSeverity("success");
        setServerResponse(response.data.msg);
        setShow(true);

        setName("");
        setFirstname("");
        setLastname("");
        setEmail("");
        setTarget([]);
      }

      setTimeout(() => {
        setShow(false);
        setIsModalOpen(false);
      }, 1500);
    } catch (error) {
      setAlertSeverity("error");
      setServerResponse(error.response.data.msg);
      console.log(serverResponse);
      setShow(true);
      console.log(error);
    }
  };

  const navigate = useNavigate();

  const handleRefresh = () => {
    setRefreshing(true);
    navigate(`/refresh`);
    setTimeout(() => {
      navigate(`/user-and-group`);

      setRefreshing(false);
    });
  };

  return (
    <DashboardLayout>
      <>
        <Card
          title={
            <Typography.Title level={1}>
              Group
              <Divider />
            </Typography.Title>
          }
          bordered={false}
          style={{
            width: "100%",
            borderBottom: "0 2px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <Button
              icon={<PlusOutlined />}
              style={{
                fontSize: "14px",
                width: 140,
                height: 40,
                backgroundColor: "rgb(104,188,131)",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bottom: "25px",
              }}
              onClick={showModal}
            >
              New Group
            </Button>
            <Button
              icon={<AutorenewIcon fontSize="small" />}
              style={{
                fontSize: "14px",
                width: 110,
                height: 40,
                backgroundColor: "#7fa0fb",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bottom: "25px",
              }}
              loading={refreshing}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
          <div style={{ marginTop: "10px" }}>
            <EnhancedTable />
          </div>
        </Card>
        <Modal
          title="New Group"
          width={800}
          centered
          open={isModalOpen}
          onCancel={handleCancel}
          cancelButtonProps={{
            style: {
              backgroundColor: "#bebebe",
              color: "#FFF",
              fontSize: "13px",
              height: "36px",
            },
          }}
          cancelText="CANCEL"
          footer={(_, { CancelBtn }) => (
            <>
              <CancelBtn />
              <Button
                style={{
                  backgroundColor: "rgba(67,190,126,255)",
                  color: "#FFF",
                  fontSize: "13px",
                  height: "36px",
                }}
                onClick={handleSave}
              >
                SAVE
              </Button>
            </>
          )}
        >
          <Divider style={{ borderTopColor: "#d5d5d5" }} />
          {show ? (
            <>
              <Box sx={{ width: "100%" }}>
                <Collapse in={show}>
                  <Alert
                    severity={alertSeverity}
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
                    <AlertTitle>
                      {alertSeverity === "success" ? "Success" : "Error"}
                    </AlertTitle>
                    <span>{serverResponse}</span>
                  </Alert>
                </Collapse>
              </Box>
            </>
          ) : null}
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              "& .MuiTextField-root": { m: 1, width: "98%" },
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div style={{ display: "flex", gap: 2 }}>
              <TextField
                label="Firstname"
                variant="outlined"
                sx={{ flex: 1 }}
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
              <TextField
                label="Lastname"
                variant="outlined"
                sx={{ flex: 1 }}
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
              <TextField
                label="Email"
                variant="outlined"
                sx={{ flex: 1 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: "15px" }}>
              <Button
                icon={<PlusOutlined />}
                style={{
                  fontSize: "14px",
                  width: 130,
                  height: 40,
                  backgroundColor: "#ff5252",
                  color: "#FFF",
                  marginLeft: "7px",
                }}
                onClick={handleAddTarget}
              >
                Add Item
              </Button>
            </div>
            <div style={{ marginTop: "10px" }}>
              <EnhancedTable_m data={target || []} />
            </div>
          </Box>
        </Modal>
      </>
    </DashboardLayout>
  );
}
