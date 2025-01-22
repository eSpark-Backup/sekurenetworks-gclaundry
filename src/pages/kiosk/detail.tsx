import apiService from "@/api/apiService";
import config from "@/constants/config";
import { KIOSK } from "@/types/kiosk";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useRequest } from "ahooks";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AlertDialog from "../../components/@extended/AlertDialog";
import MainCard from "../../components/MainCard";
import MachineInfo from "./components/machineInfo";

const Detail = () => {
  const params = useParams();
  const navigate = useNavigate();

  const { loading, runAsync } = useRequest(
    (macId) => apiService.kisok.getKiosk(macId),
    {
      manual: true,
      onError: () => {
        navigate("/kiosk");
      },
    }
  );

  const { runAsync: updateKiosk } = useRequest(
    (macId, data) => apiService.kisok.update(macId, data),
    {
      manual: true,
      onSuccess: ({ data }: any) => {
        toast(data.message, { type: "success" });
        setKiosk(data.data);
        setActivateDialog(false);
      },
    }
  );

  const { runAsync: deleteKiosk } = useRequest(
    (macId) => apiService.kisok.delete(macId),
    {
      manual: true,
      onSuccess: ({ data }: any) => {
        toast(data.message, { type: "success" });
        setActivateDialog(false);
        navigate("/kiosk");
      },
    }
  );

  const fetchKiosk = async (macId: string): Promise<KIOSK> => {
    const { data } = await runAsync(macId);
    return data;
  };

  const [kiosk, setKiosk] = useState<KIOSK>();
  // delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  // active dialog
  const [activateDialog, setActivateDialog] = useState(false);

  useEffect(() => {
    (async () => {
      let data = await fetchKiosk(params.id!);
      setKiosk(data);
    })();
  }, [params.id]);
  if (!kiosk) return null;
  return (
    <>
      <AlertDialog
        open={deleteDialog}
        setOpen={setDeleteDialog}
        title={"Confirm"}
        content={"Are you sure, you want to delete kiosk?"}
        handleClose={() => {
          setDeleteDialog(false);
        }}
        handleConfirm={async () => {
          await deleteKiosk(kiosk.macId);
        }}
      />
      <AlertDialog
        open={activateDialog}
        setOpen={setActivateDialog}
        title={"Confirm"}
        content={"Are you sure, you want to proceed?"}
        handleConfirm={async () => {
          await updateKiosk(kiosk.macId, {
            isActive: !kiosk.isActive,
          });
        }}
        handleClose={() => {
          setActivateDialog(false);
        }}
      />
      {loading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}
      <MainCard>
        <Stack
          direction="row-reverse"
          spacing={3}
          alignItems="center"
          justifyContent="end"
          marginBottom={1}
        >
          <Stack spacing={3} alignItems="end">
            <Button
              disabled={!kiosk.isActive}
              variant="contained"
              startIcon={<EditOutlined />}
              onClick={() => navigate(`/kiosk/${params?.id}`)}
            >
              Edit
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="end">
            <Typography>Deactivate</Typography>
            <Switch
              checked={kiosk.isActive}
              onChange={() => setActivateDialog(true)}
            />
            <Typography>Activate</Typography>
          </Stack>
        </Stack>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={5} md={4} lg={3}>
            <MainCard>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={2.5} alignItems="center">
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="h4">{kiosk.name}</Typography>
                      <Typography variant="h5">
                        {kiosk?.location.location}
                      </Typography>
                      <Typography variant="h5">
                        {kiosk?.location.tag}
                      </Typography>
                      {kiosk.location.address ? (
                        <Typography variant="h5" align={"center"}>
                          {kiosk?.location.address +
                            ", " +
                            kiosk?.location?.city +
                            ", " +
                            kiosk?.location?.state +
                            ", " +
                            kiosk?.location?.country +
                            ", " +
                            kiosk?.location?.zip}
                        </Typography>
                      ) : (
                        <Typography variant="h5">
                          No details about location
                        </Typography>
                      )}
                    </Stack>
                    <Chip
                      label={kiosk?.status == "ONLINE" ? "Online" : "Offline"}
                      color={kiosk?.status == "ONLINE" ? "success" : "error"}
                    />
                  </Stack>
                  <Stack spacing={0.5} paddingTop={2} alignItems="center">
                    <Typography variant={"caption"} align={"center"}>
                      {kiosk?.lastSeen
                        ? `Last check-in: ${format(
                            new Date(Date.parse(kiosk?.lastSeen)),
                            config.dateFormat
                          )?.toLocaleString()}`
                        : "No check-in yet"}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Stack
                    direction="row"
                    justifyContent="space-around"
                    alignItems="center"
                  >
                    <Divider orientation="vertical" flexItem />
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="h5">Scented</Typography>
                      <Typography color="secondary" variant="h2">
                        {kiosk.scented < 0 || kiosk.scented > 100
                          ? "ERR"
                          : kiosk.scented + "%"}
                      </Typography>
                    </Stack>
                    <Divider orientation="vertical" flexItem />
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="h5">Unscented</Typography>
                      <Typography color="secondary" variant="h2">
                      {kiosk.unscented < 0 || kiosk.unscented > 100
                          ? "ERR"
                          : kiosk.unscented + "%"}
                      </Typography>
                    </Stack>
                    <Divider orientation="vertical" flexItem />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
              </Grid>
              <Stack alignItems="center" spacing={1} paddingTop={1}>
                <Button
                  variant="contained"
                  startIcon={<DeleteOutlined />}
                  onClick={() => setDeleteDialog(true)}
                >
                  Delete
                </Button>
              </Stack>
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={7} md={8} lg={9}>
            <Stack spacing={2.5}>
              <MainCard>
                <Grid container>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5} alignItems="start" direction="column">
                      <Typography variant="h3">Customer Info</Typography>
                      <Divider />
                      {kiosk.customer ? (
                        <>
                          <Typography variant="h5">
                            {kiosk?.customer?.firstName}{" "}
                            {kiosk?.customer?.lastName}
                          </Typography>
                          <Typography variant="h5">
                            {kiosk?.customer?.email}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h5">
                          No Customer Selected
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5} alignItems="end" direction="column">
                      {kiosk.errors.map((error) => (
                        <Alert
                        sx={{
                          textTransform: "uppercase",
                        }}
                        key={error} severity="warning" color={"error"}>
                          {error}
                        </Alert>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
                <Grid item xs={12} padding={3}>
                  <Divider />
                </Grid>
                <Grid container>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5} alignItems="start" direction="column">
                      <Typography variant="h3">Site Contact</Typography>
                      <Divider />
                      {kiosk.onSiteContact ? (
                        <>
                          <Typography variant="h5">
                            {kiosk?.onSiteContact.firstName}{" "}
                            {kiosk?.onSiteContact.lastName}
                          </Typography>
                          <Typography variant="h5">
                            {kiosk?.onSiteContact?.phone || "N/A"}
                          </Typography>
                          <Typography variant="h5">
                            {kiosk?.onSiteContact?.email || "N/A"}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h5">No Details</Typography>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
            <Stack spacing={2.5}>
              <MainCard>
                <Stack spacing={0.5} alignItems="start">
                  <Typography variant="h3">Machine Info</Typography>
                  <Divider />
                  <MachineInfo machineInfo={kiosk.machineInfo} />
                </Stack>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default Detail;
