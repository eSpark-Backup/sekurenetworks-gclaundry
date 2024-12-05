import apiService from "@/api/apiService";
import ApiLoader from "@/components/api-loader";
import GencoTable from "@/components/Table";
import { Customer } from "@/types/customer";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Divider, Grid, Stack, Typography } from "@mui/material";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AlertDialog from "../../components/@extended/AlertDialog";
import MainCard from "../../components/MainCard";
import { columns } from "../kiosk/dto/data";
import { Ifilter } from "@/types/IFilter";

const CustomerDetail = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer>();
  const [openDialog, setOpenDialog] = useState(false);
  const [filter, setFilter] = useState<Ifilter>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { runAsync: deleteCustomer } = useRequest(
    (id) => apiService.customer.delete(id),
    {
      manual: true,
      onSuccess: ({ data }: any) => {
        toast(data.message, { type: "success" });
        setOpenDialog(false);
        navigate("/customers");
      },
    }
  );

  const { loading, runAsync } = useRequest(
    (id) => apiService.customer.getById(id),
    {
      manual: true,
      onError: () => {
        navigate("/customers");
      },
    }
  );

  const fetchCustomer = async (id: string): Promise<Customer> => {
    const { data } = await runAsync(id);
    return data;
  };

  useEffect(() => {
    (async () => {
      let data = await fetchCustomer(params.id!);
      setCustomer(data);
    })();
  }, [params.id]);
  if (!customer) return null;

  return (
    <ApiLoader isLoading={loading}>
      <AlertDialog
        open={openDialog}
        setOpen={setOpenDialog}
        title={"Confirm"}
        content={"Are you sure, you want to delete Customer?"}
        handleClose={() => setOpenDialog(false)}
        handleConfirm={async () => await deleteCustomer(customer?.id)}
      />
      <MainCard>
        <Stack alignItems="end" paddingBottom={1}>
          <Stack direction={"row"} spacing={1}>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteOutlined />}
              onClick={() => setOpenDialog(true)}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              startIcon={<EditOutlined />}
              onClick={() => navigate(`/customer/${params?.id}`)}
            >
              Edit
            </Button>
          </Stack>
        </Stack>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <MainCard>
              <Grid container spacing={3}>
                <Grid item sm={5} md={6} lg={6}>
                  <Stack spacing={0.5} paddingBottom={3} alignItems="start">
                    <Typography variant="h2">{customer.schoolName}</Typography>
                    <Typography variant="h5">{`${customer.firstName} ${customer.lastName}`}</Typography>
                    <Typography variant="h5">{customer.phone}</Typography>
                    <Typography variant="h5">{customer.email}</Typography>
                  </Stack>
                </Grid>
                <Grid item sm={5} md={6} lg={6}>
                  <Typography variant="h4">Address</Typography>

                  <Divider />
                  <Stack spacing={0.5} paddingTop={2} alignItems="start">
                    <Typography variant="h5">{customer.address}</Typography>
                    <Typography variant="h5">{`${customer.city}, ${customer.state}`}</Typography>
                    <Typography variant="h5">{`${customer.country}, ${customer.zip}`}</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>

          <Grid item xs={12}>
            {customer.kiosks?.length !== 0 && (
              <Grid xs={12} item>
                <Stack spacing={2.5}>
                  <MainCard>
                    <Grid item xs={12}>
                      <Typography variant="h3" paddingTop={2} paddingBottom={2}>
                        Total Kiosks: {customer.kiosks.length}
                      </Typography>
                      <Stack spacing={2.5}>
                        <GencoTable
                          tableTitle="Kiosks"
                          columns={columns}
                          pagination={{
                            pageSize: filter.pageSize,
                            pageIndex: filter.pageIndex,
                          }}
                          onPageChange={async (e: any) =>
                            setFilter({ ...e, name: null })
                          }
                          count={customer.kiosks.length}
                          isLoading={loading}
                          data={customer.kiosks}
                        />
                      </Stack>
                    </Grid>
                  </MainCard>
                </Stack>
              </Grid>
            )}
          </Grid>
        </Grid>
      </MainCard>
    </ApiLoader>
  );
};

export default CustomerDetail;
