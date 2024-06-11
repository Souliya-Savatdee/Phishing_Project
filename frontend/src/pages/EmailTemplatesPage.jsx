import React, { useState, useRef, useMemo, useEffect } from "react";
import { Divider, Button, Modal, Card, Typography } from "antd";
import {
  Box,
  TextField,
  Button as Button_m,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
} from "@mui/material";
import { PlusOutlined } from "@ant-design/icons";
import CloseIcon from "@mui/icons-material/Close";

import DashboardLayout from "@/layouts/DashboardLayout";
import EnhancedTable from "@/components/data-table/EmailTemplatesTable";
import JoditEditor from "jodit-react";
import useAxiosInterceptor from "@/middleware/interceptors";

export default function EmailTemplatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputType, setInputType] = useState("");
  const [activeButton, setActiveButton] = useState("");
  const [tableData, setTableData] = useState([]);
  const editor = useRef(null);
  const options = [
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "|",
    "align",
    "ul",
    "ol",
    "|",
    "font",
    "fontsize",
    "brush",
    "paragraph",
    "source",
    "|",
    "outdent",
    "indent",
    "align",
    "|",
    "hr",
    "|",
    "fullsize",
    "brush",
    "|",
    "table",
    "link",
    "eraser",
    "|",
    "undo",
    "redo",
  ];
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "",
      defaultActionOnPaste: "insert_as_html",
      defaultLineHeight: 1.5,
      // enter: "div",

      buttons: options,
      buttonsMD: options,
      buttonsSM: options,
      buttonsXS: options,
      statusbar: false,
      sizeLG: 900,
      sizeMD: 700,
      sizeSM: 400,
      toolbarAdaptive: false,
      height: 350,
      toolbarButtonSize: "small",
      toolbar: true,
      showCharsCounter: false,
    }),
    []
  );

  // Alert
  const [show, setShow] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [serverResponse, setServerResponse] = useState("");

  // require
  const [templateNameTouched, setTemplateNameTouched] = useState(false);
  const [subjectTouched, setSubjectTouched] = useState(false);

  const [formData, setFormData] = useState({
    temp_name: "",
    subject: "",
    text_data: "",
    html_data: "",
  });

  const showTemplateNameError = templateNameTouched && !formData.temp_name;
  const showSubjectError = subjectTouched && !formData.subject;

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleInputType = (type) => {
    setInputType(type);
    setActiveButton(type);
  };

  const axiosPrivate = useAxiosInterceptor();
  const access_token = localStorage.getItem("access_token") || " ";

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleHtmlChange = (content) => {
    setFormData((prevData) => ({ ...prevData, html_data: content }));
  };

  //Create Email Template Page
  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosPrivate.post("email_template/", formData, {
        headers: {
          Authorization: `Bearer ${JSON.parse(access_token)}`,
        },
      });

      setAlertSeverity("success");
      setServerResponse(response.data.msg);
      setShow(true);

      setFormData({
        temp_name: "",
        subject: "",
        text_data: "",
        html_data: "",
      });

      setTemplateNameTouched(false);
      setSubjectTouched(false);

      setTimeout(() => {
        setShow(false);
        setIsModalOpen(false);
      }, 1500);

    } catch (error) {
      setAlertSeverity("error");
      setServerResponse(error.response.data.msg);
      console.log(serverResponse);
      setShow(true);
    }
    console.log(formData);

  };
  return (
    <DashboardLayout>
      <>
        <Card
          title={
            <Typography.Title level={1}>
              Email Templates
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
          <Button
            icon={<PlusOutlined />}
            style={{
              fontSize: "14px",
              width: 170,
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
            New Template
          </Button>
          <div style={{ marginTop: "10px" }}>
            <EnhancedTable tableData={tableData}/>
          </div>
          <Modal
            title="New Template"
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
                  onClick={onSubmit}
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
                "& .MuiTextField-root": { m: 1, width: "100%" },
              }}
              noValidate
              autoComplete="off"
            >
              <div>
                <TextField
                  error={showTemplateNameError}
                  helperText={
                    showTemplateNameError ? "Template name is required" : ""
                  }
                  label="Template Name"
                  name="temp_name"
                  value={formData.temp_name || ""}
                  onBlur={() => setTemplateNameTouched(true)}
                  onChange={handleFormChange}
                  variant="outlined"
                />
                <TextField
                  error={showSubjectError}
                  helperText={
                    showSubjectError ? "Subject name is required" : ""
                  }
                  label="Subject"
                  name="subject"
                  onBlur={() => setSubjectTouched(true)}
                  value={formData.subject || ""}
                  onChange={handleFormChange}
                  variant="outlined"
                />
              </div>
              <div style={{ marginLeft: "7px", gap: 12 }}>
                <Button_m
                  variant="text"
                  size="large"
                  style={{
                    borderRadius: activeButton === "text" ? "0px" : "4px",
                    borderBottom: activeButton === "text" ? "solid" : "none",
                  }}
                  onClick={() => handleInputType("text")}
                >
                  Text
                </Button_m>
                <Button_m
                  variant="text"
                  size="large"
                  style={{
                    borderRadius: activeButton === "html" ? "0px" : "4px",
                    borderBottom: activeButton === "html" ? "solid" : "none",
                  }}
                  onClick={() => handleInputType("html")}
                >
                  HTML
                </Button_m>
              </div>
              {inputType === "text" && (
                <TextField
                  style={{
                    minWidth: 500,
                  }}
                  label="Plaintext"
                  name="text_data"
                  value={formData.text_data || ""}
                  onChange={handleFormChange}
                  multiline={true}
                  rows="13.5"
                  // rowsMax="25"
                  variant="outlined"
                  fullWidth={true}
                />
              )}
              {inputType === "html" && (
                <div style={{ marginTop: "10px" }}>
                  <JoditEditor
                    ref={editor}
                    value={formData.html_data || ""}
                    tabIndex={1}
                    config={config}
                    onBlur={handleHtmlChange}
                    onChange={() => {}}
                  />
                </div>
              )}
            </Box>
          </Modal>
        </Card>
      </>
    </DashboardLayout>
  );
}
