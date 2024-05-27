import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import { Button, Modal, Divider, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { visuallyHidden } from "@mui/utils";
import LinearProgress from "@mui/material/LinearProgress";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import EnhancedTable_m from "@/components/data-table/UserGroupPopupTable";

function createData(id, name, member, modified_date) {
    return {
        id,
        name,
        member,
        modified_date,
    };
};


const rows = [
    createData(1, "Graphic Branch", " ", "2024-5-10"),
    createData(2, "Sales Branch", " ", "2024-5-10"),
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

const headCells = [

    {
        id: "name",
        numeric: false,
        disablePadding: true,
        label: "Name",
        sortable: false,
    },
    {
        id: "member",
        numeric: false,
        disablePadding: false,
        label: "# of member",
        sortable: true,
    },
    {
        id: "modified_date",
        numeric: false,
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

function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort } =
        props;
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
                                        {order === "desc" ? "sorted descending" : "sorted ascending"}
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
                    marginRight: "8px"
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
                    marginLeft: "5px"
                }}
                id="tableTitle"
                component="div"
            >
                Columns
            </Typography>
            <div style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
                <Typography
                    sx={{
                        fontSize: "15px",
                        marginRight: "5px"
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
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("member");
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [setModalOpen, setIsModalOpen1] = useState(false);


    const showModal1 = () => {
        setIsModalOpen1(true);
    };
    const Cancel = () => {
        setIsModalOpen1(false);
    };


    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // const props = {
    //     action: "https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188",
    //     onChange({ file, fileList }) {
    //         if (file.status !== "uploading") {
    //             console.log(file, fileList);
    //             if (file.type !== "text/csv") {
    //                 message.error("file does not support, please upload .csv file only");
    //                 return false;
    //             }
    //         }
    //         return true;
    //     },
    //     showUploadList: {
    //         showDownloadIcon: true,
    //         downloadIcon: "Download",
    //         showRemoveIcon: true,
    //     },
    //     beforeUpload(file) {
    //         if (file.type !== "text/csv") {
    //             message.error("file does not support, please upload .csv file only");
    //             return false;
    //         }
    //         return true;
    //     },
    // };

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
                selected.slice(selectedIndex + 1),
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

    const filteredRows = rows.filter(row => {
        return (
            row.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });


    const visibleRows = stableSort(filteredRows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
    );

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                <EnhancedTableToolbar
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onSearch={setSearchTerm}
                />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                    >
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
                                        <TableCell padding="checkbox">

                                        </TableCell>
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            padding="none"
                                        >
                                            {row.name}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                        >
                                            {row.member}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.modified_date}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.name && (
                                                <>
                                                    <Button
                                                        icon={<EditIcon />}
                                                        onClick={showModal}
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
                                                        onClick={showModal1}
                                                        style={{
                                                            fontSize: "16px",
                                                            width: 70,
                                                            height: 40,
                                                            backgroundColor: "#e35e5e",
                                                            color: "#FFF",
                                                        }} />
                                                </>
                                            )}
                                        </TableCell>

                                    </TableRow>
                                );
                            })}
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={20} style={{ position: "relative" }}>
                                        <LinearProgress style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
                                        <Typography align="center" sx={{
                                            fontSize: "14px",
                                            color: "#c9c9c9",
                                        }}>
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
                        "& .MuiTablePagination-displayedRows": { display: "none" }
                    }}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
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
                            height: "36px"
                        }
                    }}
                    style={{ width: "600px", height: "400px" }}
                    cancelText="CANCEL"

                    footer={(_, { CancelBtn }) => (
                        <>
                            <CancelBtn

                            />
                            <Button

                                style={{
                                    backgroundColor: "rgba(67,190,126,255)",
                                    color: "#FFF",
                                    fontSize: "13px",
                                    height: "36px"
                                }}
                            >SAVE</Button>
                        </>
                    )}
                >
                    <Divider style={{ borderTopColor: "#d5d5d5" }} />

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
                        />
                        <div style={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Firstname"
                                variant="outlined"
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Lastname"
                                variant="outlined"
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Email"
                                variant="outlined"
                                sx={{ flex: 1 }}
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
                            >Add Item</Button>

                            {/* <Upload {...props} >
                                <Button
                                    style={{
                                        fontSize: "14px",
                                        width: 130,
                                        height: 40,
                                        backgroundColor: "#fb8c00",
                                        color: "#FFF",
                                    }}
                                >Import CSV</Button>
                            </Upload> */}

                        </div>
                        <div style={{ marginTop: "10px" }}>
                            <EnhancedTable_m />
                        </div>
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
                        }
                    }}
                    cancelText="CANCEL"
                    footer={(_, { CancelBtn }) => (
                        <>
                            <CancelBtn
                            />
                            <Button
                                style={{
                                    borderColor: "rgba(67,190,126,255)",
                                    color: "rgba(67,190,126,255)",
                                    fontSize: "13px",
                                    height: "36px",
                                }}
                            >OK</Button>
                        </>
                    )}
                >
                    <Typography>
                        Are you sure you want to delete this item?
                    </Typography>
                </Modal>
            </Paper>


        </Box>
    );
}