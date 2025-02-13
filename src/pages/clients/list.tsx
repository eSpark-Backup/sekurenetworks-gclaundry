import apiService from "@/api/apiService";
import MainCard from "@/components/MainCard";
import ScrollX from "@/components/ScrollX";
import GencoTable from "@/components/Table";
import { Ifilter } from "@/types/IFilter";
import { User } from "@/types/IUser";
import { IResult } from "@/types/result";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Stack } from "@mui/material";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { columns } from "./dto/data";
import UploadCSVDialog from "./upload-via-csv-dialog";
import { toast } from "react-toastify";
import ShowErrorDialog from "./show-error-dailog";

const ClientsList = () => {

  const navigate = useNavigate();
  const [filter, setFilter] = useState<Ifilter>({ pageIndex: 0, pageSize: 10 });
  const [data, setData] = useState<{ total: number; list: User[] }>({ total: 0, list: [] });
  const [showUploadCsvDialog, setShowUploadCsvDialog] = useState(false);
  const [showErrorsDialog, setShowErrorsDialog] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const { loading, runAsync } = useRequest((query) => apiService.user.get(query), { manual: true });

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

  const { runAsync: createManyClient, loadingCreatManyClient } = useRequest(
    (data) => apiService.user.createMany(data),
    {
      manual: true,
      onSuccess: ({ data }: any) => {
        if (data.statusCode === 400) {
          toast(data.message, { type: "error" });
        } else {
          toast(data.message, { type: "success" });
          setShowUploadCsvDialog(false);
          fetchUsers(filter).then((updatedData) => {
            setData(updatedData);
          });
          // refetch 

        }
      },
      // onFinally: () => navigate("/clients"),
    }
  );



  const handleBulkUpload = async (csvData) => {
    // convert studentId to number
    const updatedcsvData = csvData.map((item) => {
      return { ...item, studentId: parseInt(item.studentId) };
    });
    await createManyClient(updatedcsvData);

  };


  // only used to refresh kiosks list
  useEffect(() => {
    (async () => {
      let data = await fetchUsers(filter);
      setData(data);
    })();
  }, [filter]);


  return (
    <>
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
              startIcon={<UploadOutlined />}
              onClick={() => setShowUploadCsvDialog(true)}
            >
              Import Clients
            </Button>
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={() => navigate("/client")}
            >
              Add New Client
            </Button>
          </Stack>
        </Stack>
        <ScrollX>
          <GencoTable
            tableTitle="Client"
            columns={columns}
            pagination={{ pageSize: 10, pageIndex: 0 }}
            onPageChange={async (e: any) => setFilter(e)}
            count={data.total}
            isLoading={loading}
            data={data.list}
          />
        </ScrollX>
      </MainCard>
      <UploadCSVDialog
        open={showUploadCsvDialog}
        handleConfirm={handleBulkUpload}
        handleClose={() => {
          setShowUploadCsvDialog(false)
          setCsvData([])
          setErrors([])
        }}
        loading={loadingCreatManyClient}
        csvData={csvData}
        setCsvData={setCsvData}
        errors={errors}
        setErrors={setErrors}
        showErrorsDialog={showErrorsDialog}
        setShowErrorsDialog={setShowErrorsDialog}
      />




    </>
  );
};
export default ClientsList;
