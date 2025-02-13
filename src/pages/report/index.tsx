import apiService from "@/api/apiService";
import DatePickerField from "@/components/DatePicker";
import MainCard from "@/components/MainCard";
import ScrollX from "@/components/ScrollX";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import GencoTable from "@/components/Table";
import { Customer } from "@/types/customer";
import { IReport } from "@/types/IReports";
import { KIOSK } from "@/types/kiosk";
import { LoadingButton } from '@mui/lab';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  TextField,
} from "@mui/material";
import { useRequest } from "ahooks";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { columns, reportRow } from "./dto/columns";
import { error, log } from "console";

const ClientsList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [kiosks, setKiosks] = useState<KIOSK[]>([]);
  const [reports, setReports] = useState<{ count: number; data: IReport[] }>({ count: 0, data: [] });
  const [loadingKiskos, setLoadingKiosks] = useState(false);
  const [loadingDetailPDF, setLoadingDetailPDF] = useState(false);
  const [filters, setFilters] = useState<{
    kiosks: KIOSK[];
    customer: Customer | null;
    from: Dayjs | null;
    to: Dayjs | null;
    pageIndex: number | null;
    pageSize: number | null;
  }>({ kiosks: [], from: null, to: null, customer: null, pageIndex: 0, pageSize: 10 });

  const { runAsync: getCustomers } = useRequest(
    (query: any) => apiService.customer.get(query),
    {
      manual: true,
      debounceWait: 1000,
      onSuccess: ({ data }) => setCustomers(data.data),
    }
  );

  const { runAsync: getKiosks } = useRequest(
    (query) => apiService.kisok.getKiosks(query),
    {
      manual: true,
      debounceWait: 1000,
      onSuccess: ({ data }) => {
        setKiosks(data.data);
        setLoadingKiosks(false);
      },
      onError: () => {
        setLoadingKiosks(false);
      },
    }
  );

  const { loading, runAsync: getReports } = useRequest(
    (query) => apiService.dashboard.getReports(query),
    {
      manual: true,
      onSuccess: ({ data }) => setReports(data),
    }
  );

  const { runAsync: getReportDetails } = useRequest(
    (query) => apiService.dashboard.getReportdetails(query),
    {
      manual: true,
      onSuccess: ({ data }) => {
        setLoadingDetailPDF(false);
        const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ReportDetails.pdf');
        document.body.appendChild(link);
        link.click();
      },
      onError: () => {
        setLoadingDetailPDF(false);
      }
    }
  );



  useEffect(() => {
    (async () => {
      await getCustomers({});
      await getReports({
        from: filters.from?.toISOString(),
        to: filters.to?.toISOString(),
        customerId: filters.customer?.id,
        kiosks: filters.kiosks.map((e) => e.macId),
        skip: filters.pageIndex,
        take: filters.pageSize,
      });
    })();
  }, []);


  useEffect(() => {
    // i want to refetch the reports when the filters change
    setFilters({ ...filters, pageIndex: 0, pageSize: 10 });


    const fetchReports = async () => {
      let kiosks = filters.kiosks.map((e) => e.macId);
      await getReports({
        from: filters.from?.toISOString(),
        to: filters.to?.toISOString(),
        customerId: filters.customer?.id,
        kiosks,
        skip: filters.pageIndex,
        take: filters.pageSize,
      });
    };
  


    fetchReports();


  }, [filters.from, filters.to, filters.customer, filters.kiosks]);

  useEffect(() => {
    // i want to refetch the reports when the filters change
    const fetchReports = async () => {
      let kiosks = filters.kiosks.map((e) => e.macId);
      await getReports({
        from: filters.from?.toISOString(),
        to: filters.to?.toISOString(),
        customerId: filters.customer?.id,
        kiosks,
        skip: filters.pageIndex,
        take: filters.pageSize,
      });
    };
  


    fetchReports();


  }, [filters.pageIndex, filters.pageSize]);

  // const ApplyFilers = async () => {
  //   let kiosks = filters.kiosks.map((e) => e.macId);

  //   await getReports({
  //     from: filters.from?.toISOString(),
  //     to: filters.to?.toISOString(),
  //     customerId: filters.customer?.id,
  //     kiosks,
  //     skip: filters.pageIndex,
  //     take: filters.pageSize,
  //   });
  // }


  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Add title
    doc.setFontSize(18);
    doc.text("Reports", 14, 20);

    const tableHeaders = [
      "Kiosk Name",
      "Scented Dispensed",
      "Unscented Dispensed",
      "Total Questions Asked",
      "Total Environmental Message Displayed",
      "Total Successful Transactions",
      "Total Failed Transactions",
    ];


    if (filters.from || filters.to) {
      if (filters.to) tableHeaders.unshift("To");
      if (filters.from) tableHeaders.unshift("From");
    }

    tableHeaders.unshift("#");

    // Format the data for the table
    const tableData = reports.data.map((report, index) => {
      const rowData = [
        report.name,
        report.scented,
        report.unscented,
        report.surveys.reduce((sum, item) => sum + item.count, 0),
        report.env.reduce((sum, item) => sum + item.count, 0),
        report.success,
        report.failed,
      ];

      if (filters.from || filters.to) {
        if (filters.to) rowData.unshift(filters.to?.toDate().toLocaleDateString());
        if (filters.from) rowData.unshift(filters.from?.toDate().toLocaleDateString());
      }

      rowData.unshift(index + 1);

      return rowData;
    });


    // Add table
    autoTable(doc, {
      startY: 30,
      head: [tableHeaders],
      body: tableData,
      headStyles: { fillColor: [255, 7, 25] },
    });

    doc.save('Reports.pdf');
  };


  const fetchReportDetails = async () => {
    setLoadingDetailPDF(true);
    let kiosks = filters.kiosks.map((e) => e.macId);
    await getReportDetails({
      from: filters.from?.toISOString(),
      to: filters.to?.toISOString(),
      customerId: filters.customer?.id,
      kiosks,
      skip: filters.pageIndex,
      take: filters.pageSize,
    });


  };



  return (
    <MainCard content={false}>
      <Box sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} display={"flex"} alignItems={"center"}>
          {/* First Grid Item (Filter Inputs - Responsive 12 columns on mobile, 9 on larger screens) */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={2}>
              {/* First Row: 2 Input Boxes */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  // onInputChange={async (e: any) => {
                  //   if (e.target.value)
                  //     await getCustomers({ name: e.target.value });
                  // }}
                  options={customers}
                  value={filters.customer}
                  getOptionLabel={(option) => option.schoolName}
                  clearIcon={null}
                  onChange={async (_: any, customer) => {
                    setFilters((prevFilters) => ({
                      ...prevFilters,
                      customer,
                      kiosks: [],
                    }));
                    if (!customer) {
                      setKiosks([]);
                      return;
                    }
                    setLoadingKiosks(true);
                    await getKiosks({ customerId: customer.id });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Select Customer" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  onInputChange={async (e: any) =>
                    await getKiosks({ name: e.target.value })
                  }
                  disabled={kiosks.length == 0 || loadingKiskos || !filters.customer}
                  options={kiosks}
                  getOptionLabel={(option) => option.name}

                  onChange={(_: any, kiosks) =>
                    setFilters({ ...filters, kiosks })
                  }
                  value={filters.kiosks}
                  limitTags={1}
                  multiple
                  renderInput={(params) => (
                    <TextField {...params} placeholder={
                      loadingKiskos ? "Loading Kiosks..." : "Select Kiosks"
                    }
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value
                      .slice(0, 1)
                      .map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          label={`${option.name}${value.length > 1
                            ? ` & ${value.length - 1 ? `+${value.length - 1}` : ""
                            }`
                            : ""
                            }`}
                        />
                      ))
                  }
                />
              </Grid>
              {/* Second Row: 2 Input Boxes */}
              <Grid item xs={12} sm={6}>
                <DatePickerField
                  label="From"
                  value={filters.from}
                  onChange={(from) => setFilters({ ...filters, from })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePickerField
                  label="To"
                  value={filters.to}
                  onChange={(to) => setFilters({ ...filters, to })}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Second Grid Item (Filter Options - Responsive 12 columns on mobile, 3 on larger screens) */}
          <Grid item xs={12} md={5}>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box display="flex"
                gap={2}>

                {/* <Button
                  variant="contained"
                  onClick={ApplyFilers}
                >
                  Apply
                </Button> */}
                <Button
                  variant="contained"
                  disabled={filters.kiosks.length == 0 && !filters.customer && !filters.from && !filters.to}
                  onClick={async () => {
                    setFilters({
                      kiosks: [],
                      customer: null,
                      from: null,
                      to: null,
                      pageIndex: 0,
                      pageSize: 10,
                    });
                    setKiosks([]);
                    getReports({
                      from: null,
                      to: null,
                      customerId: null,
                      kiosks: [],
                      take: 10,
                      skip: 0,
                    });
                  }}
                >
                  Clear
                </Button>


              </Box>

              <Box sx={{
                display: "flex",
                gap: 2,
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <Box>
                  <Button
                    variant="contained"
                    disabled={reports.data.length == 0 || loading}
                    onClick={exportToPDF}
                  >
                    Export Table
                  </Button>
                </Box>
                <Box>
                  <LoadingButton
                    loading={loadingDetailPDF}
                    variant="contained"
                    disabled={reports.data.length == 0 || loading || filters.customer == null}
                    onClick={fetchReportDetails}
                  >
                    Export Transactions
                  </LoadingButton>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <ScrollX>
        <GencoTable
          tableTitle="Reports"
          columns={columns}
          enablePagination={true}
          pagination={{
            pageIndex: filters.pageIndex || 0,
            pageSize: filters.pageSize || 10,
          }}
          onPageChange={async (e) => setFilters({ ...filters, ...e })}
          count={reports.count}
          isLoading={loading}
          enableExpand={true}
          expandComponent={reportRow}
          data={reports.data}
        />
      </ScrollX>
    </MainCard>
  );
};
export default ClientsList;
