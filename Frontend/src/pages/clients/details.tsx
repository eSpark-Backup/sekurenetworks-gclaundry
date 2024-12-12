import apiService from "@/api/apiService";
import ApiLoader from "@/components/api-loader";
import { User } from "@/types/IUser";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Divider, Grid, Stack, Typography } from "@mui/material";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AlertDialog from "../../components/@extended/AlertDialog";
import MainCard from "../../components/MainCard";

const ClientDetail = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState<User>();
  const [openDialog, setOpenDialog] = useState(false);
  
  const { runAsync: deleteClient } = useRequest(
    (id) => apiService.user.delete(id),
    {
      manual: true,
      onSuccess: ({ data }: any) => toast(data.message, { type: "success" }),
      onFinally: () => navigate("/clients"),
    }
  );

  const { loading, runAsync } = useRequest(
    (id) => apiService.user.getById(id),
    {
      manual: true,
      onError: () => {
        navigate("/clients");
      },
    }
  );

  const fetchCustomer = async (id: string): Promise<User> => {
    const { data } = await runAsync(id);
    return data;
  };

  useEffect(() => {
    (async () => {
      let data = await fetchCustomer(params.id!);
      setClient(data);
    })();
  }, [params.id]);
  if (!client) return null;

  return (
    <ApiLoader isLoading={loading}>
      <AlertDialog
        open={openDialog}
        setOpen={setOpenDialog}
        title={"Confirm"}
        content={"Are you sure, you want to delete Client?"}
        handleClose={() => setOpenDialog(false)}
        handleConfirm={async () => await deleteClient(client?.id)}
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
              onClick={() => navigate(`/client/${params?.id}`)}
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
                    <Typography variant="h2">{`${client.firstName} ${client.lastName}`}</Typography>
                    <Typography variant="h5">{client.email}</Typography>
                    <Typography variant="h5">Student ID: {client.studentId}</Typography>
                    <Typography variant="h5">DOB: {client.DOB}</Typography>
                    <Typography variant="h5">Personal Email: {client.personalEmail}</Typography>
                    <Typography variant="h5">Gender: {client.gender}</Typography>
                    <Typography variant="h5">PIN: {client.uniquePin}</Typography>
                    <Typography variant="h5">Class Year: {client.classYear}</Typography>
                    <br/>
                    <Typography variant="h3">Preferences</Typography>
                    <Typography variant="h5">Scented: {client.scented}</Typography>
                    <Typography variant="h5">Unscented: {client.unscented}</Typography>
                    <Typography variant="h5">Sheet Preference: {client.sheetPreference}</Typography>
                   

                    <br/>
                    <Typography variant="h3">Account Details </Typography>
                    <Typography variant="h5">Account Date: {client.accountDate}</Typography>
                    <Typography variant="h5">Account Status: {client.accountStatus}</Typography>
                    <Typography variant="h5">Account Type: {client.accountType}</Typography>
                 
                    


                  </Stack>
                </Grid>
                <Grid item sm={5} md={6} lg={6}>
                  <Typography variant="h4">Customer</Typography>

                  <Divider />
                  {client.customer ? (
                    <Stack spacing={0.5} paddingTop={2} alignItems="start">
                      <Typography variant="h5">{`${client.customer.firstName} ${client.customer.lastName}`}</Typography>
                      <Typography variant="h5">
                        {client.customer.email}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="h5">N/A</Typography>
                  )}
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
      </MainCard>
    </ApiLoader>
  );
};

export default ClientDetail;
