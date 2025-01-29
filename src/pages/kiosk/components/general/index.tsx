import apiService from "@/api/apiService";
import AlertDialog from "@/components/@extended/AlertDialog";
import AnimateButton from "@/components/@extended/AnimateButton";
import ApiLoader from "@/components/api-loader";
import MainCard from "@/components/MainCard";
import { countries } from "@/constants/countries";
import { KIOSK } from "@/types/kiosk";

import CustomContactField from "@/components/ContactTestField";
import CustomTextField from "@/components/CustomTextField";
import CustomAutocomplete from "@/components/ui/Autocomplete";
import { Customer } from "@/types/customer";
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useRequest } from "ahooks";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MachineInfo from "../machineInfo";
import { kioskSchema } from "./data";
import { useDispatch } from "@/store";
import { setSelectedKisko } from "@/store/reducers/common";

export default () => {
  const [updateDialog, setUpdateDialog] = useState(false);
  const [kiosk, setKiosk] = useState<KIOSK>();
  const [customers, setCustomers] = useState<Customer[]>();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>();
  const params = useParams();
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      type: "",
      auth_type: "",
      name: "",
      sheets_per_transaction: 0,
      answer_required: false,
      customerId: null,
      location: {
        location: "",
        tag: "",
        country: "",
        state: "",
        city: "",
        address: "",
        zip: "",
      },
      onSiteContact: {
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
      },
    },
    validationSchema: kioskSchema,
    onSubmit: () => { },
  });
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

  const { runAsync: getCustomers } = useRequest(
    (query: any) => apiService.customer.get(query),
    {
      manual: true,
      debounceWait: 1000,
      onSuccess: ({ data }) => {
        setCustomers(data.data);
      },
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
      },
    }
  );

  const fetchKiosk = async (macId: string): Promise<KIOSK> => {
    const { data } = await runAsync(macId);
    return data;
  };

  useEffect(() => {
    (async () => {
      let data = await fetchKiosk(params.id!);
      let { data: customersData } = await getCustomers(params.id!);
      setKiosk(data);
      const {
        type,
        auth_type,
        name,
        sheets_per_transaction,
        answer_required,
        customerId,
        location,
        onSiteContact,
      } = data;

      let selectedCustomer = customersData.data.find((e: any) => e.id === customerId)
      setSelectedCustomer(selectedCustomer);
      formik.setValues({
        type,
        auth_type,
        name,
        sheets_per_transaction,
        answer_required,
        customerId,
        location,
        onSiteContact,
      } as any);

      dispatch(setSelectedKisko({ kisko: { name, customerName: selectedCustomer?.schoolName } }));
      
    })();

    // save kisko name and customers name in localStorage



  }, [params.id]);

  const handleChangeCountry = (value) => {
    const country = value ? value.value : "";
    formik.setFieldValue("location.country", country);
    formik.setFieldValue("location.city", "");
    formik.setFieldValue("location.state", "");
  };

  const handleChangeState = (value) => {
    const state = value ? value.value : "";
    formik.setFieldValue("location.state", state);
    formik.setFieldValue("location.city", "");
  };

  const handleChangeCity = (value) => {
    const city = value ? value.value : "";
    formik.setFieldValue("location.city", city);
  };

  const states = useMemo(() => {
    const country = formik.values?.location.country;
    const selectedCountry = countries.find((c) => c.value === country);
    if (!selectedCountry) {
      return [];
    }
    return selectedCountry.states;
  }, [formik.values?.location.country]);

  const cities = useMemo(() => {
    const country = formik.values?.location.country;
    const state = formik.values?.location.state;

    const selectedCountry = countries.find((c) => c.value === country);
    if (!selectedCountry) {
      return [];
    }
    const selectedState = selectedCountry.states.find((s) => s.value === state);
    if (!selectedState) {
      return [];
    }
    return selectedState.cities;
  }, [formik.values?.location.country, formik.values?.location.state]);
  return (
    <Box>
      <AlertDialog
        open={updateDialog}
        setOpen={setUpdateDialog}
        title={"Confirm"}
        content={"Are you sure, you want to update kiosk info?"}
        handleClose={() => setUpdateDialog(false)}
        handleConfirm={async () => {
          let data: any = formik.values;
          data.customerId = selectedCustomer?.id;
          data.sheets_per_transaction = Number(data.sheets_per_transaction);
          await updateKiosk(params.id, data);
          setUpdateDialog(false);
        }}
      />
      <ApiLoader isLoading={loading}>
        <form onSubmit={formik.handleSubmit} id="validation-forms">
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={5} md={4} lg={3}>
              <MainCard>
                <Grid item xs={12} sm={12}>
                  <Typography variant="h3">Kiosk Info</Typography>
                  <Divider />
                  <Stack spacing={2} paddingY={2}>
                    <CustomTextField
                      name="name"
                      label="Kiosk Name"
                      formik={formik}
                      accessorName="name"
                    />
                    <CustomTextField
                      name="location.location"
                      label="Kiosk Location"
                      formik={formik}
                      accessorName={"location.location"}
                      value={formik.values?.location.location || ""}
                    />
                    <CustomAutocomplete
                      options={countries}
                      handleChange={handleChangeCountry}
                      label="Country"
                      formik={formik}
                      accessorName="country"
                      value={formik.values?.location.country || ""}
                    />
                    <CustomAutocomplete
                      options={states}
                      handleChange={handleChangeState}
                      label="State"
                      formik={formik}
                      accessorName="state"
                      value={formik.values?.location.state || ""}
                    />
                    <CustomAutocomplete
                      options={cities}
                      handleChange={handleChangeCity}
                      label="City"
                      formik={formik}
                      accessorName={"location.city"}
                      value={formik.values?.location.city || ""}
                    />
                    <CustomTextField
                      name="location.tag"
                      label="Kiosk Location Tag"
                      formik={formik}
                      accessorName={"location.tag"}
                      value={formik.values?.location.tag || ""}
                    />
                    <CustomTextField
                      name="location.address"
                      label="Address"
                      formik={formik}
                      value={formik.values?.location.address || ""}
                      accessorName={"location.address"}
                    />
                    <CustomTextField
                      name="location.zip"
                      label="Zip"
                      formik={formik}
                      value={formik.values?.location.zip || ""}
                      accessorName={"location.zip"}
                    />
                  </Stack>
                </Grid>
              </MainCard>
            </Grid>
            <Grid item xs={12} sm={7} md={8} lg={9}>
              <Stack spacing={2.5}>
                <MainCard>
                  <Grid item xs={12} sm={12}>
                    <Typography variant="h3">Kiosk Config</Typography>
                    <Divider />
                    <Stack spacing={2} paddingY={1}>
                      <>
                        <Autocomplete
                          fullWidth
                          disableClearable
                          options={["AUTH", "OPEN"]}
                          getOptionLabel={(option) => option}
                          autoSelect={true}
                          onChange={(e, v) => {
                            formik.setFieldValue("type", v);
                          }}
                          value={formik.values?.type}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              name="type"
                              placeholder="Select Kiosk Type"
                              error={formik?.errors.type ? true : false}
                              helperText={formik.errors.type}
                            />
                          )}
                        />
                      </>
                    </Stack>

                    <Stack spacing={2} paddingY={2}>
                      <Grid container>
                        <Grid item xs={12} sm={6} paddingRight={1}>
                          <CustomContactField
                            value={formik.values?.sheets_per_transaction}
                            name="sheets_per_transaction"
                            label="Sheet per transaction"
                            formik={formik}
                            accessorName={"sheets_per_transaction"}
                            error={
                              formik?.errors.sheets_per_transaction
                                ? true
                                : false
                            }
                            helperText={formik.errors.sheets_per_transaction}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={formik.values.answer_required}
                                onChange={() => {
                                  formik.setFieldValue(
                                    "answer_required",
                                    !formik.values.answer_required
                                  );
                                }}
                                color="primary"
                              />
                            }
                            label={
                              <Typography>
                                {formik.values.answer_required
                                  ? "Answer Required"
                                  : "Answer Not Required"}
                              </Typography>
                            }
                          />
                        </Grid>
                      </Grid>
                    </Stack>

                    <Typography variant="h3">Auth Config</Typography>
                    <Divider />
                    <Stack spacing={2} paddingY={1}>
                      <>
                        <Autocomplete
                          fullWidth
                          disableClearable  
                          options={["Student ID", "Email", "Phone"]}
                          getOptionLabel={(option) => option}
                          autoSelect={true}
                          onChange={(e, v) => {
                            formik.setFieldValue("auth_type", v);
                          }}
                          value={formik.values?.auth_type}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              name="type"
                              placeholder="Select Auth Type"
                              error={formik?.errors.auth_type ? true : false}
                              helperText={formik.errors.auth_type}
                            />
                          )}
                        />
                      </>
                    </Stack>

                    <Typography variant="h3">Customer Info</Typography>
                    <Divider />
                    <Stack spacing={2} paddingY={2}>
                      <>
                        <Autocomplete
                          fullWidth
                          onInputChange={async (e: any) => {
                            await getCustomers({ name: e.target.value });
                          }}
                          options={customers || []}
                          getOptionLabel={(option) => option.schoolName}
                          onChange={(event, newValue) => {
                            setSelectedCustomer(newValue);
                          }}
                          autoSelect={true}
                          value={selectedCustomer ? selectedCustomer : null}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select Customer"
                            />
                          )}
                        />
                      </>
                    </Stack>
                    <Grid item xs={12} padding={2} />
                    <Typography variant="h3">Site Contact - Primary</Typography>
                    <Grid item xs={12} paddingBottom={2}>
                      <Divider />
                    </Grid>
                    <Stack spacing={2} alignItems="start">
                      <Grid container>
                        <Grid item xs={12} sm={6} paddingRight={1}>
                          <CustomContactField
                            value={formik.values?.onSiteContact?.firstName}
                            name="onSiteContact.firstName"
                            label="First Name *"
                            formik={formik}
                            accessorName={"onSiteContact.firstName"}
                            error={
                              formik?.errors.onSiteContact?.firstName
                                ? true
                                : false
                            }
                            helperText={formik.errors.onSiteContact?.firstName}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <CustomContactField
                            value={formik.values?.onSiteContact?.lastName}
                            name="onSiteContact.lastName"
                            label="Last Name *"
                            formik={formik}
                            accessorName={"onSiteContact.lastName"}
                            error={
                              formik?.errors.onSiteContact?.lastName
                                ? true
                                : false
                            }
                            helperText={formik.errors.onSiteContact?.lastName}
                          />
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={12} sm={6} paddingRight={1}>
                          <CustomContactField
                            value={formik.values?.onSiteContact?.phone}
                            name="onSiteContact.phone"
                            label="Phone *"
                            formik={formik}
                            accessorName={"onSiteContact.phone"}
                            error={
                              formik?.errors.onSiteContact?.phone ? true : false
                            }
                            helperText={formik.errors.onSiteContact?.phone}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <CustomTextField
                            value={formik.values?.onSiteContact?.email}
                            name="onSiteContact.email"
                            label="Email *"
                            formik={formik}
                            error={
                              formik?.errors.onSiteContact?.email ? true : false
                            }
                            helperText={formik.errors.onSiteContact?.email}
                            accessorName={"onSiteContact.email"}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                    <Grid item xs={12} padding={3} />
                    <Typography variant="h3">Machine Info</Typography>
                    <Divider />
                    {kiosk?.machineInfo && <MachineInfo machineInfo={kiosk?.machineInfo!} />}
                  </Grid>
                </MainCard>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="center">
                <AnimateButton>
                  <Button
                    variant="contained"
                    sx={{ my: 3, ml: 1 }}
                    type="button"
                    onClick={() => setUpdateDialog(true)}
                  >
                    Update
                  </Button>
                </AnimateButton>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </ApiLoader>
    </Box>
  );
};
