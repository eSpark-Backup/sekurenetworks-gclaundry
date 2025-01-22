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

import KiosksAssigner from "../questions/shared/kiosks-assigner";
import useFetchKiosks from "@/hooks/useFetchKiosks";
import QuoteDialog from "./QuoteDialog";

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
  const [openSelectedUnAssignKioksDialog, setOpenSelectedUnAssignKioksDialog] = useState(false);
  const [selectedKiosks, setSelectedKiosks] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [kioksByCustomerId, setKiosksByCustomerId] = useState([]);
  const [loadingKioksbyCustomerId, setLoadingKiosksByCustomerId] = useState(false);
  const [unassingLoading, setUnassignLoading] = useState(false);

  const [initialValues, setInitialValues] = useState({
    quote: "",
    id: "",
    isActive: true,
    kiosks: [],
  });

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
        setInitialValues({
          quote: "",
          id: "",
          isActive: true,
          kiosks: [],
        });

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
        toast("Qoute update successfully", { type: "success" });
        setInitialValues({
          quote: "",
          id: "",
          isActive: true,
          kiosks: [],
        });
      },
    }
  );

  // EM schema for formik form


  // const formik = useFormik({
  //   initialValues: { quote: "", isActive: true },
  //   validationSchema: quoteSchema,
  //   onSubmit: async (values: any) => {
  //     if (values.id) await updateQoute(values.id, values);
  //     else await createGeneral({ ...values, kioskId: id });
  //   },
  // });

  const handleClose = () => {
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
        setSelectedCustomer(null);
      },
      onError: (error) => {
        console.error(error);
        toast("An error occured while assigning questions", { type: "error" });
        setAssignLoading(false);
      },
    }
  );


  const { runAsync: unassignFromKiosk } = useRequest(
    (data) => apiService.kisok.unassignToKiosk(data),
    {
      manual: true,
      onSuccess: ({ data }: any) => {
        toast(data.message, { type: "success" });
        setUnassignLoading(false);
        setOpenSelectedUnAssignKioksDialog(false);
        setSelectedKiosks([]);
        setSelectedQuotes([]);
        setSelectedCustomer(null);
      },
      onError: (error) => {
        console.error(error);
        toast("An error occured while unassigning quotes", { type: "error" });
        setUnassignLoading(false);
      },
    }
  );

  const handleKiosksAssign = async () => {
    setAssignLoading(true);
    await assignToKiosk({
      kioskIds: selectedKiosks.length > 0 ? selectedKiosks.map((k) => k.macId) : kioksByCustomerId.map((k) => k.macId),
      dataIds: selectedQuotes.map((q) => q.id),
      type: "QUOTE",
    });

    await refreshAsync();

  }


  const handleKiosksUnAssign = async () => {
    const hasNoKiosks = selectedQuotes.some(quotes => quotes.kiosks.length === 0);

    if (hasNoKiosks) {
      toast("Some of the selected quotes are not assigned to any kiosk", { type: "error" });
      return;
    }

    setUnassignLoading(true);
    await unassignFromKiosk({
      kioskIds: selectedKiosks.length > 0 ? selectedKiosks.map((k) => k.macId) : kioksByCustomerId.map((k) => k.macId),
      dataIds: selectedQuotes.map((q) => q.id),
      type: "QUOTE",
    });

    await refreshAsync();
  }

  const { runAsync: getCustomers } = useRequest(
    (query: any) => apiService.customer.get(query),
    {
      manual: true,
      debounceWait: 1000,
      onSuccess: ({ data }) => setCustomers(data.data),
    }
  );

  const selectAllQuotes = () => {
    setSelectedQuotes((prev) => {
      if (prev.length === quotes.length) return [];
      return quotes;
    }
    );
  }



  useEffect(() => {
    (async () => {
      await getQoutes(id);
      await getCustomers({});
    })();
  }, [id]);







  const isAllQuotesSelected = selectedQuotes.length === quotes.length;

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
              disabled={selectedQuotes.length === 0}
              onClick={() => setOpenSelectedKioksDialog(true)}

            >
              Assign To Kiosks
            </Button>

            <Button
              variant="contained"
              onClick={() => setOpenSelectedUnAssignKioksDialog(true)}
              disabled={selectedQuotes.length === 0}

            >
              Unassign To kiosks
            </Button>

            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={() => setEditDailog(true)}
            >
              Add New EM
            </Button>
            <Button
              variant="contained"
              onClick={selectAllQuotes}
            >
              {isAllQuotesSelected ? "Deselect All" : "Select All"}
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
                                setInitialValues({
                                  id: message.id,
                                  quote: message.quote,
                                  isActive: message.isActive,
                                  kiosks: message.kiosks ?? [],
                                });
                                setEditDailog(true);
                              }}
                            >
                              <EditOutlined />
                            </IconButton>

                            {/* {isDeleteLoading ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  minWidth: "2.4rem",
                                }}
                              >
                                <CircularProgress size="1rem" />
                              </Box>
                            ) :  */}
                            {/* ( */}
                              <IconButton
                                color="error"
                                onClick={() =>
                                  setDeleteDailog({ state: true, id: message.id })
                                }
                              >
                                <DeleteOutlined />
                              </IconButton>
                            {/* ) */}
                             {/* } */}
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
        {
          editDailog && (
            <QuoteDialog
              open={editDailog}
              initialValues={initialValues}
              handleClose={handleClose}
              updateQuote={updateQoute}
              createGeneral={createGeneral}
            />)
        }
      </ApiLoader>


      <KiosksAssigner
        open={openSelectedKioksDialog}
        handleClose={() => {
          setOpenSelectedKioksDialog(false);
          setSelectedKiosks([]);
          setSelectedCustomer(null);
          setKiosksByCustomerId([]);
        }
        }
        selectedKiosks={selectedKiosks}
        setSelectedKiosks={setSelectedKiosks}
        onAssign={handleKiosksAssign}
        assignLoading={assignLoading}
        kioksByCustomerId={kioksByCustomerId}
        setKiosksByCustomerId={setKiosksByCustomerId}
        loadingKioksbyCustomerId={loadingKioksbyCustomerId}
        setLoadingKiosksByCustomerId={setLoadingKiosksByCustomerId}
        setSelectedCustomer={setSelectedCustomer}
        customers={customers}
        selectedCustomer={selectedCustomer}
        heading="Assign Quotes to Customer Kiosks"
        // info="Please Note if kiosk not selected, it will be assign to all Customer Kiosks"
        buttonLabel="Assign"
        confirmText="Are you sure, you want to Assign Selected Quotes to Selected kiosks?"
      />

      <KiosksAssigner
        open={openSelectedUnAssignKioksDialog}
        handleClose={() => {
          setOpenSelectedUnAssignKioksDialog(false);
          setSelectedKiosks([]);
          setSelectedCustomer(null);
          setKiosksByCustomerId([]);
        }
        }
        selectedKiosks={selectedKiosks}
        setSelectedKiosks={setSelectedKiosks}
        onAssign={handleKiosksUnAssign}
        assignLoading={unassingLoading}
        kioksByCustomerId={kioksByCustomerId}
        setKiosksByCustomerId={setKiosksByCustomerId}
        loadingKioksbyCustomerId={loadingKioksbyCustomerId}
        setLoadingKiosksByCustomerId={setLoadingKiosksByCustomerId}
        setSelectedCustomer={setSelectedCustomer}
        customers={customers}
        selectedCustomer={selectedCustomer}
        heading="Unassign Quotes to Customer Kiosks"
        // info="Please Note if kiosk not selected, it will be Unassign to all Customer Kiosks"
        buttonLabel="Unassign"
        confirmText="Are you sure, you want to UnAssign Selected Quotes From Selected kiosks?"
      />


    </Box>
  );
};

export default Quotes;
