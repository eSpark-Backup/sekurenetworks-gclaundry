import apiService from "@/api/apiService";
import MainCard from "@/components/MainCard";
import ScrollX from "@/components/ScrollX";
import GencoTable from "@/components/Table";
import { Customer } from "@/types/customer";
import { IResult } from "@/types/result";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Stack } from "@mui/material";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { columns } from "./dto/columns";
import { Ifilter } from "@/types/IFilter";

const Customers = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Ifilter>({ pageIndex: 0, pageSize: 10 });
  const [data, setData] = useState<{ total: number; list: Customer[] }>({
    total: 0,
    list: [],
  });
  const { loading, runAsync } = useRequest(
    (query) => apiService.customer.get(query),
    { manual: true }
  );

  const fetchKiosks = async ({
    pageIndex,
    pageSize,
  }: Ifilter): Promise<IResult<Customer>> => {
    let query = { skip: pageIndex * pageSize, take: pageSize };
    const { data } = await runAsync(query);
    return {
      total: data.count,
      list: data.data,
    };
  };

  // only used to refresh kiosks list
  useEffect(() => {
    (async () => {
      let data = await fetchKiosks(filter);
      setData(data);
    })();
  }, [filter]);

  return (
    <MainCard key={1} content={false}>
      <ScrollX>
      <Stack
          justifyContent={"flex-end"}
          alignItems="end"
          spacing={1}
          sx={{ p: 3, pb: 3 }}
        >
          <Stack
            direction={"row"}
            alignItems="end"
            spacing={1}
          >
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={()=> navigate("/customer")}
            >
              Add New Customer
            </Button>
          </Stack>
        </Stack>
        <GencoTable
          tableTitle="Customers"
          columns={columns}
          pagination={filter}
          onPageChange={async (e: any) => setFilter(e)}
          count={data.total}
          isLoading={loading}
          data={data.list}
        />
      </ScrollX>
    </MainCard>
  );
};
export default Customers;
