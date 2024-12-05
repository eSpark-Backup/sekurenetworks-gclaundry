import apiService from "@/api/apiService";
import DatePickerField from "@/components/DatePicker";
import MainCard from "@/components/MainCard";
import ScrollX from "@/components/ScrollX";
import GencoTable from "@/components/Table";
import { Customer } from "@/types/customer";
import { IReport } from "@/types/IReports";
import { KIOSK } from "@/types/kiosk";
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
import { log } from "console";

const ClientsList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [kiosks, setKiosks] = useState<KIOSK[]>([]);
  const [reports, setReports] = useState<IReport[]>([]);
  const [loadingKiskos, setLoadingKiosks] = useState(false);
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

  // only used to refresh kiosks list
  useEffect(() => {
    (async () => {
      await getCustomers({});
      await getReports({});
    })();
  }, []);


  useEffect(() => {
      // i want to refetch the reports when the filters change
      const fetchReports = async () => {
        let kiosks = filters.kiosks.map((e) => e.macId);
        await getReports({
          from: filters.from?.toISOString(),
          to: filters.to?.toISOString(),
          customerId: filters.customer?.id,
          kiosks,
          like: filters.pageIndex,
          skip: filters.pageSize,
        });
      };


      fetchReports();
      
      
  }, [filters.pageIndex, filters.pageSize]);


  return (
    <MainCard content={false}>
      <Box sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} display={"flex"} alignItems={"center"}>
          {/* First Grid Item (Filter Inputs - Responsive 12 columns on mobile, 9 on larger screens) */}
          <Grid item xs={12} md={9}>
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
                    console.log(customer)
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
                  disabled={kiosks.length == 0  || loadingKiskos}
                  options={kiosks}
                  getOptionLabel={(option) => option.name}
                  onChange={(_: any, kiosks) =>
                    setFilters({ ...filters, kiosks })
                  }
                  value={filters.kiosks}
                  limitTags={1}
                  multiple
                  renderInput={(params) => (
                    <TextField {...params} placeholder={"Kiosks"} />
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
          <Grid item xs={12} md={3}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={async () => {
                  let kiosks = filters.kiosks.map((e) => e.macId);
                  await getReports({
                    from: filters.from?.toISOString(),
                    to: filters.to?.toISOString(),
                    customerId: filters.customer?.id,
                    kiosks,
                  });
                }}
              >
                Generate Report
              </Button>
              <Button
                variant="contained"
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
                  setReports([]);
                }}
              >
                Clear Filter
              </Button>
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
          onPageChange={async (e) => setFilters({ ...filters,  ...e })}
          count={reports.length}
          isLoading={loading}
          enableExpand={true}
          expandComponent={reportRow}
          data={reports}
        />
      </ScrollX>
    </MainCard>
  );
};
export default ClientsList;
