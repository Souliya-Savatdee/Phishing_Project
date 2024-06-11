import React, { useState, useRef , useMemo} from "react";
import { TextField, MenuItem, Box, IconButton, Alert, AlertTitle, Collapse } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Typography, Card, Divider, Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Button_m from "@mui/material/Button";

import JoditEditor from "jodit-react";
import EnhancedTable from "@/components/data-table/LandingPagesTable";
import DashboardLayout from "@/layouts/DashboardLayout";
import useAxiosInterceptor from "@/middleware/interceptors";

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputType, setInputType] = useState("");
  const [activeButton, setActiveButton] = useState("");
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
      enter: "div",
      // options that we defined in above step.
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
  const [PageNameTouched, setPageNameTouched] = useState(false);


  const [formData, setFormData] = useState({
    page_name: "",
    url: "",
    redirectURL: "",
    html_data: "",
  });

//   const handleInputChange = (event) => {
//     const { name, value } = event.target ;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   let handleJoditEditorChange = (name, newContent)=>{
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: newContent,
//     }));
// }

  // require
  const showPageNameError = PageNameTouched && !formData.page_name;


  const axiosPrivate = useAxiosInterceptor();

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


  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleHtmlChange = (content) => {
    setFormData((prevData) => ({ ...prevData, html_data: content }));
  };


  const access_token = localStorage.getItem("access_token");

  //Create Landging Page
  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosPrivate.post("landing_page/", formData, {
        headers: {
          Authorization: `Bearer ${JSON.parse(access_token)}`,
        },
      });

      setAlertSeverity("success");
      setServerResponse(response.data.msg);
      setShow(true);

      setFormData({
        page_name: "",
        url: "",
        redirectURL: "",
        html_data: "",
      });

      setPageNameTouched(false);

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
              Landing Pages
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
            New Page
          </Button>
          <div style={{ marginTop: "10px" }}>
            <EnhancedTable />
          </div>
        </Card>
        <Modal
          title="New Landing Page"
          width={800}
          style={{ top: 10 }}
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
              "& .MuiTextField-root": { m: 1, width: "98%" },
            }}
            noValidate
            autoComplete="off"
            onSubmit={onSubmit}
          >
            <TextField
            error={showPageNameError}
            helperText={showPageNameError? "Landing Page name is required" : ""}
              label="Name"
              name="page_name"
              variant="outlined"
              value={formData.page_name}
              onBlur={() => setPageNameTouched(true)}
              onChange={handleFormChange}
            />
            <div style={{ display: "flex", gap: 2 }}>
              <TextField
                label="URL"
                name="url"
                variant="outlined"
                sx={{ flex: 1 }}
                value={formData.url}
                onChange={handleFormChange}
              />
              <TextField
                label="Redirect URL"
                name="redirectURL"
                variant="outlined"
                sx={{ flex: 1 }}
                value={formData.redirectURL}
                onChange={handleFormChange}
              />
            </div>
            <div style={{ marginTop: "20px", marginLeft: "7px", gap: 12 }}>
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
      </>
    </DashboardLayout>
  );
}
