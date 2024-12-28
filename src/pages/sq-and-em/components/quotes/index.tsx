import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import apiService from "@/api/apiService";
import ApiLoader from "@/components/api-loader";
import ConfirmationDailog from "@/components/ConfirmDailog";
import CustomFormField from "@/components/CustomFormField";
import MainCard from "@/components/MainCard";
import { IEnviromentalMessage } from "@/types/IEnviromentalMessage";
import { useRequest } from "ahooks";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as yup from "yup";
import KiosksAssigner from "../questions/shared/kiosks-assigner";
import useFetchKiosks from "@/hooks/useFetchKiosks";

const Quotes = () => {
  const { id } = useParams();
  const theme = useTheme();
  const { kiosks, isLoading: kiosksLoading } = useFetchKiosks();

  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));

  const [editDailog, setEditDailog] = useState(false);
  const [deleteDailog, setDeleteDailog] = useState<{
    state: boolean;
    id: string | null;
  }>({ state: false, id: null });

  const [quotes, setQuotes] = useState<IEnviromentalMessage[]>([]);
  const [selectedQuotes, setSelectedQuotes] = useState([]);
  const [openSelectedKioksDialog, setOpenSelectedKioksDialog] = useState(false);
  const [selectedKiosks, setSelectedKiosks] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [openAllKiosksConfirmationDialog, setOpenAllKiosksConfirmationDialog] = useState(false);

  const isQuoteSelected = (id) =>
    selectedQuotes.some((qoutes) => qoutes.id === id);

  // Get EM by mac id
  const {
    runAsync: getQoutes,
    loading,
    refreshAsync,
  } = useRequest(() => apiService.quotes.getAll(), {
    manual: true,
    onSuccess: ({ data }) => {
      setQuotes(data);
      // setQuotes(DummyQoutes);
    },
  });

  // delete EM
  const { runAsync: deleteQoute, loading: isDeleteLoading } = useRequest(
    (id) => apiService.quotes.delete(id),
    {
      manual: true,
      onSuccess: async () => {
        setDeleteDailog({ state: false, id: null });
        await refreshAsync();
        toast("Qoute deleted successfully", { type: "success" });
      },
    }
  );

  // create EM
  const { runAsync: createGeneral } = useRequest(
    (data) => apiService.quotes.createGeneral(data),
    {
      manual: true,
      onSuccess: async () => {
        setEditDailog(false);
        await refreshAsync();
        toast("Qoute create successfully", { type: "success" });
      },
    }
  );

  // update EM
  const { runAsync: updateQoute } = useRequest(
    (id: string, data) => apiService.quotes.update(id, data),
    {
      manual: true,
      onSuccess: async () => {
        setEditDailog(false);
        await refreshAsync();
        toast("Qoute create successfully", { type: "success" });
      },
    }
  );

  // EM schema for formik form
  const quoteSchema = yup.object({
    quote: yup.string().required("quote is required").max(100).trim(),
    id: yup.string().optional(),
    isActive: yup.boolean(),
  });

  const formik = useFormik({
    initialValues: { quote: "", isActive: true },
    validationSchema: quoteSchema,
    onSubmit: async (values: any) => {
      if (values.id) await updateQoute(values.id, values);
      else await createGeneral({ ...values, kioskId: id });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setEditDailog(false);
  };

  const toggleSelectedQuote = (qoute: any) => {
    setSelectedQuotes((prev) => {
      const isAlreadySelected = prev.some((q) => q.id === qoute.id);
      if (isAlreadySelected) {
        return prev.filter((q) => q.id !== qoute.id);
      }
      return [...prev, qoute];
    });
  };



  const { runAsync: assignToKiosk } = useRequest(
    (data) => apiService.kisok.assignToKiosk(data),
    {
      manual: true,
      onSuccess: ({ data }: any) => {
        toast(data.message, { type: "success" });
        setAssignLoading(false);
        setOpenSelectedKioksDialog(false);
        setSelectedKiosks([]);
        setSelectedQuotes([]);
      },
      onError: (error) => {
        console.error(error);
        toast("An error occured while assigning questions", { type: "error" });
        setAssignLoading(false);
      },
    }
  );

  const handleKiosksAssign = async () => {
    setAssignLoading(true);
    await assignToKiosk({
      kioskIds: selectedKiosks.map((k) => k.macId),
      dataIds: selectedQuotes.map((q) => q.id),
      type: "QUOTE",
    });

    await refreshAsync();

  }

  const handleAllKiosksAssign = async () => {
    setAssignLoading(true);
    await assignToKiosk({
      kioskIds: kiosks.map((k) => k.macId),
      dataIds: quotes.map((q) => q.id),
      type: "QUOTE",
    });

    await refreshAsync();
  }

  useEffect(() => {
    (async () => {
      await getQoutes(id);
    })();
  }, [id]);




  return (
    <Box>
      <Stack spacing={3}>
        <Stack
          direction={matchDownSM ? "column" : "row"}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h3">Manage Environmental Messages</Typography>

          <Box sx={{
            display: "flex",
            gap: "1rem",
            flexDirection: { xs: "column", md: "row" },
            mt: { xs: "1rem", md: 0 },
          }}>
            <Button
              variant="contained"
              disabled={!selectedQuotes.length}
              onClick={() => setOpenSelectedKioksDialog(true)}

            >
              Assign EM's
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenAllKiosksConfirmationDialog(true)}
            >
              Assign to All Kiosks
            </Button>
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={() => setEditDailog(true)}
            >
              Add New EM
            </Button>
          </Box>
        </Stack>
      </Stack>

      <ApiLoader mt="1rem" isLoading={loading}>
        <Box mt="2rem">
          {quotes.length > 0 ? (
            <Box>
              {quotes.map((message) => {
                const isSelected = isQuoteSelected(message.id);
                const kioks = message?.kiosks?.map((kiosk) => kiosk.kioskName).join("\n")


                return (
                  <Box my="0.3rem" key={message.id} sx={{ display: "flex", alignItems: "center" }}>
                    <Box>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectedQuote(message)}
                        style={{ marginRight: "1rem", cursor: "pointer", width: "1rem", height: "1rem", accentColor: isSelected ? "red" : "initial", }}
                      />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                      <MainCard>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginBottom: "0.5rem",
                            gap: "0.3rem",
                          }}
                        >
                          {(message?.kiosks?.length ?? 0) > 0 &&
                            <Tooltip title={<div style={{ minWidth: '80px', whiteSpace: 'pre-wrap' }}>
                              {kioks}
                            </div>}
                              placement="top"
                            >
                              <Chip sx={{
                                backgroundColor: "#f3f3f3",
                                color: "#000",
                                fontSize: "0.8rem",
                              }} size="small" label={"Assigned to"} color={"info"} />
                            </Tooltip>

                          }

                          <Chip
                            size="small"
                            label={message.isActive ? "Active" : "inactive"}
                            color={message.isActive ? "success" : "default"}
                          />
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="body1"
                            fontSize="1.3rem"
                            sx={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {message.quote}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              gap: "0.3rem",
                              alignItems: "center",
                            }}
                          >
                            <IconButton
                              disabled={isDeleteLoading}
                              onClick={() => {
                                formik.setValues(message);
                                setEditDailog(true);
                              }}
                            >
                              <EditOutlined />
                            </IconButton>

                            {isDeleteLoading ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  minWidth: "2.4rem",
                                }}
                              >
                                <CircularProgress size="1rem" />
                              </Box>
                            ) : (
                              <IconButton
                                color="error"
                                onClick={() =>
                                  setDeleteDailog({ state: true, id: message.id })
                                }
                              >
                                <DeleteOutlined />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      </MainCard>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box>
              <Typography textAlign="center" component="p">
                No EMs Found
              </Typography>
            </Box>
          )}
          <ConfirmationDailog
            open={deleteDailog.state}
            handleClose={() => setDeleteDailog({ state: false, id: null })}
            handleConfirm={async () => await deleteQoute(deleteDailog.id)}
            okBtnText="Delete"
            text="Are you sure, you want to Delete this Quote?"
          />
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Dialog
            open={editDailog}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: "1rem 1rem",
              }}
            >
              <Typography variant="h4" fontWeight={600}>
                {!formik.values.id ? "Create New" : "Update"} EM
              </Typography>

              <Chip
                onClick={() =>
                  formik.setFieldValue("isActive", !formik.values.isActive)
                }
                size="small"
                label={formik.values.isActive ? "Active" : "inactive"}
                color={formik.values.isActive ? "success" : "default"}
              />
            </Box>

            <DialogContent>
              <CustomFormField
                name={"quote"}
                formik={formik}
                isMultiLine={true}
                label={"EM"}
                accessorName="quote"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>

              <Tooltip
                title={!formik.values.quote ? "Please Fill EM  Field" : ""}
              >
                <div>
                  <Button
                    variant="contained"
                    sx={{ fontWeight: 600 }}
                    onClick={formik.submitForm}
                    disabled={!formik.values.quote}
                  >
                    {!formik.values.id ? "Create" : "Update"}
                  </Button>
                </div>
              </Tooltip>
            </DialogActions>
          </Dialog>
        </form>
      </ApiLoader>


      <KiosksAssigner
        open={openSelectedKioksDialog}
        handleClose={() => setOpenSelectedKioksDialog(false)}
        selectedKiosks={selectedKiosks}
        setSelectedKiosks={setSelectedKiosks}
        onAssign={handleKiosksAssign}
        assignLoading={assignLoading}
        kiosks={kiosks}
        kiosksLoading={kiosksLoading}
      />

      <ConfirmationDailog
        open={openAllKiosksConfirmationDialog}
        handleClose={() => setOpenAllKiosksConfirmationDialog(false)}
        handleConfirm={handleAllKiosksAssign}
        text="Are you sure, you want to Assign below Quotes to All kiosks?"
        okBtnText="Assign"
        assignLoading={assignLoading}

      />

    </Box>
  );
};

export default Quotes;
