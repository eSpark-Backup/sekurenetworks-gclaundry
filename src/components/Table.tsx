import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
  LinearProgress,
  Alert,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";

// Genco type for the data
export type IGencoTable = Record<string, any>;

interface GencoTableProps<TData extends IGencoTable> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  count: number;
  isLoading?: boolean;
  enablePagination?: boolean;
  pagination?: PaginationState;
  enableSorting?: boolean;
  enableExpand?: boolean;
  expandComponent?: (row: TData) => React.ReactNode;
  pageSizeOptions?: number[];
  onPageChange?: (filter: {}) => Promise<void>;
  tableTitle?: string;
  maxHeight?: number | string;
  stickyHeader?: boolean;
}

const mixedSort = (rowA: any, rowB: any, columnId: string): number => {
  const valueA = rowA.getValue(columnId)
  const valueB = rowB.getValue(columnId)

  console.log(valueA, valueB);
  

  // Handle null or undefined values
  if (valueA == null) return valueB == null ? 0 : -1
  if (valueB == null) return 1

  // If both values are numbers, compare them directly
  if (typeof valueA === "number" && typeof valueB === "number") {
    return valueA - valueB
  }

  // If both values are strings, compare them case-insensitively
  if (typeof valueA === "string" && typeof valueB === "string") {
    return valueA.localeCompare(valueB, undefined, { sensitivity: "base" })
  }

  // If types are different, convert to strings and compare
  return String(valueA).localeCompare(String(valueB), undefined, { numeric: true, sensitivity: "base" })
}


function GencoTable<TData extends IGencoTable>({
  columns,
  data,
  isLoading = false,
  enablePagination = true,
  enableSorting = true,
  enableExpand = false,
  expandComponent,
  pagination,
  pageSizeOptions = [5, 10, 25, 50],
  tableTitle,
  onPageChange,
  count,
  maxHeight,
  stickyHeader = false,
}: GencoTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: columns[0]?.accessorKey, desc: false }]);
  const [expandedRows, setExpandedRows] = React.useState<
    Record<string, boolean>
  >({});


    // Apply case-insensitive sorting to string columns
    const columnsWithSorting = React.useMemo(() => {
      return columns.map((column) => ({
        ...column,
        sortingFn: mixedSort
      }))
    }, [columns])

  // Initialize table with either standard or expanded columns
  const tableColumns = React.useMemo(() => {
    if (!enableExpand) return columnsWithSorting;

    const expandColumn: ColumnDef<TData, any> = {
      id: "expander",
      size: 65,
      header: () => "More Details",
      cell: ({ row }) => (
        <Box sx={{ width: 65, padding: "0px 4px" }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleRowExpansion(row.id);
            }}
          >
            {expandedRows[row.id] ? <CaretUpOutlined /> : <CaretDownOutlined />}
          </IconButton>
        </Box>
      ),
    };

    return [...columns,expandColumn];
  }, [columns, enableExpand, expandedRows]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // onSortingChange: setSorting,
    onSortingChange: (updater) => {
      const currentSorting = typeof updater === "function" ? updater(sorting) : updater

      // If trying to clear sorting (which would be an empty array), maintain the column but toggle direction
      if (currentSorting.length === 0 && sorting.length > 0) {
        const currentSort = sorting[0]
        console.log("currentSort", currentSort);
        
        setSorting([{ id: currentSort.id, desc: !currentSort.desc }])
      } else {
        setSorting(currentSorting)
      }
    },
    state: {
      sorting,
      pagination,
    },
    manualPagination: true,
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange!({ ...pagination, pageIndex: newPage });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSize = parseInt(event.target.value, 10);
    onPageChange!({ pageIndex: 0, pageSize: newSize });
  };

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  return (
    <Paper elevation={2}>
      {isLoading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}
      <TableContainer sx={{ maxHeight }}>
        <Table
          stickyHeader={stickyHeader}
          sx={{ minWidth: 650 }}
          aria-label={tableTitle || "generic table"}
        >
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sortDirection={header.column.getIsSorted() || false}
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "background.paper",
                      ...(header.column.columnDef.id === "expander" && {
                        width: 65,
                        padding: "0px 4px",
                      }),
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <TableSortLabel
                        active={!!header.column.getIsSorted()}
                        direction={header.column.getIsSorted() || "asc"}
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={
                          !enableSorting ||
                          header.column.columnDef.id === "expander"
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                <TableRow
                  hover
                  sx={{
                    "& > *": { borderBottom: "unset" },
                    cursor: enableExpand ? "pointer" : "default",
                  }}
                  onClick={() => enableExpand && toggleRowExpansion(row.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      sx={
                        cell.column.columnDef.id === "expander"
                          ? {
                              width: 65,
                              padding: "0px 4px",
                            }
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {enableExpand && expandComponent && (
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length}
                      sx={{
                        py: 0,
                        borderBottom: expandedRows[row.id]
                          ? "1px solid rgba(224, 224, 224, 1)"
                          : "none",
                      }}
                    >
                      <Collapse
                        in={expandedRows[row.id]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ py: 2 }}>
                          {expandComponent(row.original)}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
            {!isLoading && count === 0 && (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Alert color="warning">No Data.</Alert>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {enablePagination && (
        <TablePagination
          rowsPerPageOptions={pageSizeOptions}
          component="div"
          count={count}
          rowsPerPage={pagination!.pageSize}
          page={pagination!.pageIndex}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
}

export default GencoTable;
