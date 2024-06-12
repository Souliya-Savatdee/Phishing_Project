import React, { useState, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  LinearProgress,
  TextField,
  Button as Button_m,
  MenuItem,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import CloseIcon from "@mui/icons-material/Close";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";

// Ant Design components
import { Button, Modal, Divider } from "antd";

// Jodit Editor
import JoditEditor from "jodit-react";

// Custom hooks
import useAxiosInterceptor from "@/middleware/interceptors";

function createData(
  id,
  name,
  last_modified_date,
  url,
  redirectURL,
  html_data,
  page_id
) {
  return {
    id,
    name,
    last_modified_date,
    url,
    redirectURL,
    html_data,
    page_id,
  };
}

const headCells = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Name",
    sortable: false,
  },
  {
    id: "last_modified_date",
    numeric: true,
    disablePadding: false,
    label: "Last Modified Date",
    sortable: true,
  },
  {
    id: "actions",
    numeric: false,
    disablePadding: false,
    label: "",
    sortable: false,
  },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox"></TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              <Typography variant="subtitle2">{headCell.label}</Typography>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar({ rowsPerPage, onRowsPerPageChange, onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleRowsPerPageChange = (event) => {
    let value = parseInt(event.target.value, 10);
    value = value > 0 ? value : 1;
    onRowsPerPageChange(value);
  };

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 2 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography
        sx={{
          fontSize: "15px",
          marginRight: "8px",
        }}
        id="tableTitle"
        component="div"
      >
        Show
      </Typography>
      <TextField
        type="number"
        size="small"
        style={{ width: 70 }}
        value={rowsPerPage}
        onChange={handleRowsPerPageChange}
      />
      <Typography
        sx={{
          fontSize: "15px",
          marginLeft: "5px",
        }}
        id="tableTitle"
        component="div"
      >
        Columns
      </Typography>
      <div
        style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}
      >
        <Typography
          sx={{
            fontSize: "15px",
            marginRight: "5px",
          }}
          id="tableTitle"
          component="div"
        >
          Search:
        </Typography>

        <TextField
          size="small"
          style={{}}
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: (
              <SearchIcon style={{ marginRight: "8px", color: "gray" }} />
            ),
          }}
        />
      </div>
    </Toolbar>
  );
}
export default function EnhancedTable() {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("last_modified_date");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [setModalOpen, setModalOpen_Delete] = useState(false);

  //   const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [inputType, setInputType] = useState("");
  const [activeButton, setActiveButton] = useState("");
  const editor = useRef(null);

  //Alert
  const [show, setShow] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [serverResponse, setServerResponse] = useState("");

  // require
  const [PageNameTouched, setPageNameTouched] = useState(false);

  const [rows, setUsersData] = useState([]);

  const [selectedID, setSelectedID] = useState(null);
  const [formData, setFormData] = useState({
    page_name: "",
    url: "",
    redirectURL: "",
    html_data: "",
  });

  const showPagNameError = PageNameTouched && !formData.page_name;

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
      height: 350,
      toolbarAdaptive: false,
      toolbarButtonSize: "small",
      toolbar: true,
      showCharsCounter: false,
    }),
    []
  );

  const axiosPrivate = useAxiosInterceptor();
  const access_token = localStorage.getItem("access_token") || " ";

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await axiosPrivate.get("landing_page/", {
        headers: {
          Authorization: `Bearer ${JSON.parse(access_token)}`,
        },
      });
      const data = response.data;
      const formattedData = data.landing_page.map((landing_page, index) =>
        createData(
          index + 1,
          landing_page.page_name,
          landing_page.modified_date || "N/A",
          landing_page.url,
          landing_page.redirectURL,
          landing_page.html_data,
          landing_page.id
        )
      );
      console.log(formattedData);
      setUsersData(formattedData);
    } catch (error) {
      console.error("Error fetching landing page data:", error);
    }
  };

  const handleInputType = (type) => {
    setInputType(type);
    setActiveButton(type);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const filteredRows = rows.filter((row) => {
    return row.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const visibleRows = stableSort(
    filteredRows,
    getComparator(order, orderBy)
  ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // EDIT
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const editAction = (row) => {
    setSelectedID(row.page_id);
    console.log(row);
    console.log(row.name);
    setFormData({
      page_name: row.name,
      url: row.url,
      redirectURL: row.redirectURL,
      html_data: row.html_data,
    });
    showModal();
  };

  const handleEdit = async (event) => {
    event.preventDefault();

    try {
      const response = await axiosPrivate.put(
        `landing_page/${selectedID}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(access_token)}`,
          },
        }
      );

      if (response) {
        setAlertSeverity("success");
        setServerResponse(response.data.msg);
        setShow(true);
        setFormData({
          email: "",
          password: "",
          confirm_password: "",
        });

        setTimeout(() => {
          setShow(false);
          setIsModalOpen(false);
        }, 1500);

        getData();
      }
    } catch (error) {
      setAlertSeverity("error");
      setServerResponse(error.response.data.msg);
      console.log(serverResponse);
      setShow(true);
    }
    console.log(formData);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleHtmlChange = (content) => {
    setFormData((prevData) => ({ ...prevData, html_data: content }));
  };

  // DELETE
  const showModal_Delete = (page_id) => {
    setSelectedID(page_id);
    setModalOpen_Delete(true);
  };
  const Cancel = () => {
    setModalOpen_Delete(false);
  };

  const handleDelete = async () => {
    try {
      const response = await axiosPrivate.delete(`landing_page/${selectedID}`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(access_token)}`,
        },
      });
      if (response) {
        console.log("Delete successful!");

        getData();
        setModalOpen_Delete(false);
      }
    } catch (error) {
      setAlertSeverity("error");
      setServerResponse("This Landing Page is working, can not be deleted");
      setShow(true);
    }
    console.log(selectedID);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          onSearch={setSearchTerm}
        />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.name}
                    </TableCell>
                    <TableCell align="right">
                      {row.last_modified_date}
                    </TableCell>
                    <TableCell align="right">
                      {row.name && (
                        <>
                          <Button
                            icon={<EditIcon />}
                            onClick={() => editAction(row)}
                            style={{
                              fontSize: "16px",
                              width: 70,
                              height: 40,
                              backgroundColor: "#43bf7d",
                              color: "#FFF",
                            }}
                          />
                          <Button
                            icon={<DeleteRoundedIcon />}
                            onClick={() => showModal_Delete(row.page_id)}
                            style={{
                              fontSize: "16px",
                              width: 70,
                              height: 40,
                              backgroundColor: "#e35e5e",
                              color: "#FFF",
                            }}
                          />
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={20} style={{ position: "relative" }}>
                    <LinearProgress
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                      }}
                    />
                    <Typography
                      align="center"
                      sx={{
                        fontSize: "14px",
                        color: "#c9c9c9",
                      }}
                    >
                      This might take a while to complete
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[]}
          sx={{
            "& .MuiTablePagination-displayedRows": { display: "none" },
          }}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Modal
          title="New Landing Page"
          width={800}
          style={{ marginTop: "20px" }}
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
                onClick={handleEdit}
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
          >
            <TextField
              error={showPagNameError}
              helperText={showPagNameError ? "Page name is required" : ""}
              label="Page Name"
              name="page_name"
              value={formData.page_name || ""}
              onBlur={() => setPageNameTouched(true)}
              onChange={handleFormChange}
              variant="outlined"
            />
            <div style={{ display: "flex", gap: 2 }}>
              <TextField
                disabled
                name="url"
                label="URL"
                defaultValue="Not available"
                // value={formData.url || ""}
                // onChange={handleFormChange}
                variant="outlined"
                sx={{ flex: 1 }}
              />
              <TextField
                disabled
                name="redirectURL"
                label="Redirect URL"
                defaultValue="Not available"
                // value={formData.redirectURL || ""}
                // onChange={handleFormChange}
                variant="outlined"
                sx={{ flex: 1 }}
              />
            </div>
            <div style={{ marginTop: "10px", marginLeft: "7px", gap: 12 }}>
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

        <Modal
          title="Delete Item"
          centered
          open={setModalOpen}
          onCancel={Cancel}
          cancelButtonProps={{
            style: {
              backgroundColor: "#ff5252",
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
                onClick={handleDelete}
                style={{
                  borderColor: "rgba(67,190,126,255)",
                  color: "rgba(67,190,126,255)",
                  fontSize: "13px",
                  height: "36px",
                }}
              >
                OK
              </Button>
            </>
          )}
        >
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
          <Typography>Are you sure you want to delete this item?</Typography>
        </Modal>
      </Paper>
    </Box>
  );
}
