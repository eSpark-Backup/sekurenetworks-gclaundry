import apiService from "@/api/apiService";
import MainCard from "@/components/MainCard";
import ScrollX from "@/components/ScrollX";
import GencoTable from "@/components/Table";
import { KIOSK } from "@/types/kiosk";
import { IResult } from "@/types/result";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { columns } from "./dto/data";
import { useLocation } from "react-router-dom";
import { Ifilter } from "@/types/IFilter";
import { Autocomplete, Box, Grid, TextField } from "@mui/material";

const Kiosks = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryObject = Object.fromEntries(queryParams.entries());
  const [customers, setCustomers] = useState<any[]>([]);

  const [filter, setFilter] = useState<Ifilter>({
    pageIndex: 0,
    pageSize: 10,
    ...queryObject,
  });
  const [data, setData] = useState<{ total: number; list: KIOSK[] }>({
    total: 0,
    list: [],
  });
  const { loading, runAsync } = useRequest(
    (query) => apiService.kisok.getKiosks(query),
    { manual: true }
  );

  const fetchKiosks = async ({
    pageIndex,
    pageSize,
    ...rest
  }: Ifilter): Promise<IResult<KIOSK>> => {
    let query = { skip: pageIndex * pageSize, take: pageSize, ...rest };
    const { data } = await runAsync(query);
    return {
      total: data.count,
      list: data.data,
    };
  };

  const { loading:customerLoading, runAsync: getCustomers } = useRequest(
    (query: any) => apiService.customer.get(query),
    {
      manual: true,
      debounceWait: 1000,
      onSuccess: ({ data }) => setCustomers(data.data),
      onError: () => setCustomers([]),
    }
  );

  useEffect(() => {
    setFilter((prevFilter) => ({
      pageIndex: prevFilter.pageIndex,
      pageSize: prevFilter.pageSize,
      ...queryObject,
    }));
  }, [location.search]);

  // only used to refresh kiosks list
  useEffect(() => {
    (async () => {
      let data = await fetchKiosks(filter);
      setData(data);
    })();
  }, [filter]);

  useEffect(() => {
    getCustomers({ });
  }, []);



  return (
    <MainCard key={1} content={false}>
      <Box sx={{ p: 2, borderRadius: 2 }}>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            fullWidth
            loading={customerLoading}
            options={customers}
            value={customers.find((c) => c.id === filter.customer)}
            getOptionLabel={(option) => option.schoolName}
            onChange={async (_: any, customer) => {
              setFilter({ ...filter, customerId: customer?.id });
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select Customer" />
            )}
          />
        </Grid>
      </Box>
      <ScrollX>
        <GencoTable
          tableTitle="Kiosks"
          columns={columns}
          pagination={{
            pageSize: filter.pageSize,
            pageIndex: filter.pageIndex,
          }}
          onPageChange={async (e: any) => setFilter({ ...e, name: null, customerId: filter.customerId })}
          count={data.total}
          isLoading={loading}
          data={data.list}
        />
      </ScrollX>
    </MainCard>
  );
};

export default Kiosks;
