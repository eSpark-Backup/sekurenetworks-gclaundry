import apiService from "@/api/apiService";
import MainCard from "@/components/MainCard";
import ScrollX from "@/components/ScrollX";
import GencoTable from "@/components/Table";
import { Ifilter } from "@/types/IFilter";
import { User } from "@/types/IUser";
import { IResult } from "@/types/result";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Stack } from "@mui/material";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { columns } from "./dto/data";

const ClientsList = () => {

  const navigate = useNavigate();
  const [filter, setFilter] = useState<Ifilter>({pageIndex: 0,pageSize: 10});
  const [data, setData] = useState<{ total: number; list: User[] }>({total: 0,list: []});

  const { loading, runAsync } = useRequest((query) => apiService.user.get(query),{ manual: true });

  const fetchUsers = async ({
    pageIndex,
    pageSize,
    ...rest
  }: Ifilter): Promise<IResult<User>> => {
    let query = { skip: pageIndex * pageSize, take: pageSize, ...rest };
    const { data } = await runAsync(query);
    return {
      total: data.count,
      list: data.data,
    };
  };

  // only used to refresh kiosks list
  useEffect(() => {
    (async () => {
      let data = await fetchUsers(filter);
      setData(data);
    })();
  }, [filter]);


  return (
    <MainCard content={false}>
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
              onClick={()=> navigate("/client")}
            >
              Add New Client
            </Button>
          </Stack>
        </Stack>
      <ScrollX>
        <GencoTable
          tableTitle="Client"
          columns={columns}
          pagination={{pageSize: 10,pageIndex: 0}}
          onPageChange={async (e: any) => setFilter(e)}
          count={data.total}
          isLoading={loading}
          data={data.list}
        />
      </ScrollX>
    </MainCard>
  );
};
export default ClientsList;
