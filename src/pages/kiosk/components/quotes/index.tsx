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

const Quotes = () => {
  const { id } = useParams();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));

  const [editDailog, setEditDailog] = useState(false);
  const [deleteDailog, setDeleteDailog] = useState<{
    state: boolean;
    id: string | null;
  }>({ state: false, id: null });

  const [quotes, setQuotes] = useState<IEnviromentalMessage[]>([]);

  // Get EM by mac id
  const {
    runAsync: getQoutes,
    loading,
    refreshAsync,
  } = useRequest((macId) => apiService.quotes.get(macId), {
    manual: true,
    onSuccess: ({ data }) => {
      setQuotes(data);
    },
  });

  // delete EM
  const { runAsync: deleteQoute, loading: isDeleteLoading } = useRequest(
    (id) => apiService.kisok.unAssignItem(id),
    {
      manual: true,
      onSuccess: async () => {
        setDeleteDailog({ state: false, id: null });
        await refreshAsync();
        toast("Qoute unassign successfully", { type: "success" });
      },
    }
  );

  // create EM
  const { runAsync: createQoute } = useRequest(
    (data) => apiService.quotes.create(data),
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
      else await createQoute({ ...values, kioskId: id });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setEditDailog(false);
  };

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
          {/* <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={() => setEditDailog(true)}
          >
            Add New EM
          </Button> */}
        </Stack>
      </Stack>

      <ApiLoader mt="1rem" isLoading={loading}>
        <Box mt="2rem">
          {quotes.length > 0 ? (
            <Box>
              {quotes.map((message) => {
                return (
                  <Box my="0.3rem" key={message.id}>
                    <MainCard>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {/* <Chip
                          size="small"
                          label={message.isActive ? "Active" : "inactive"}
                          color={message.isActive ? "success" : "default"}
                        /> */}
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
                            minWidth: "3rem",
                          }}
                        >
                          {/* <IconButton
                            disabled={isDeleteLoading}
                            onClick={() => {
                              formik.setValues(message);
                              setEditDailog(true);
                            }}
                          >
                            <EditOutlined />
                          </IconButton> */}

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
                                setDeleteDailog({ state: true, id: message.relationId })
                              }
                            >
                              <DeleteOutlined />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </MainCard>
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
            text="Are you sure, you want to Remove this Quote?"
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
    </Box>
  );
};

export default Quotes;
