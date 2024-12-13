import { Button, Grid, Stack, Typography } from "@mui/material";
import { useFormik } from "formik";
import MainCard from "../../components/MainCard";

import apiService from "@/api/apiService";
import CustomFormField from "@/components/CustomFormField";
import GencoTable from "@/components/Table";
import CustomAutocomplete from "@/components/ui/Autocomplete";
import { countries } from "@/constants/countries";
import { Customer } from "@/types/customer";
import { Ifilter } from "@/types/IFilter";
import { useRequest } from "ahooks";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import AlertDialog from "../../components/@extended/AlertDialog";
import AnimateButton from "../../components/@extended/AnimateButton";
import { columns } from "../kiosk/dto/data";

const validationSchema = yup.object({
  schoolName: yup.string().required("School/Institution Name is required"),
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  phone: yup.string().required("Phone is required"),
  email: yup.string().email().required("Email is required"),
  address: yup.string().required("Address is required"),
  zip: yup.string().required("Zip is required"),
  country: yup.string().required("Country is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
});

const AddEditCustomer = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [filter, setFilter] = useState<Ifilter>({
    pageIndex: 0,
    pageSize: 10,
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      schoolName: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      zip: "",
      address: "",
      country: "",
      city: "",
      state: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (isEditMode) await updateCustomer(customer?.id, values);
      else await createCustomer(values);
    },
  });

  const { loading, runAsync } = useRequest(
    (id) => apiService.customer.getById(id),
    {
      manual: true,
      onError: () => {
        navigate("/customers");
      },
    }
  );

  const { runAsync: createCustomer } = useRequest(
    (data) => apiService.customer.create(data),
    {
      manual: true,
      onSuccess: ({ data }: any) => toast(data.message, { type: "success" }),
      onFinally: () => navigate("/customers"),
    }
  );

  const { runAsync: updateCustomer } = useRequest(
    (id, data) => apiService.customer.update(id, data),
    {
      manual: true,
      onSuccess: ({ data }: any) => toast(data.message, { type: "success" }),
      onFinally: () => navigate("/customers"),
    }
  );

  const fetchCustomer = async (id: string): Promise<Customer> => {
    const { data } = await runAsync(id);
    setCustomer(data);
    formik.setValues(data);
    return data;
  };

  useEffect(() => {
    setIsEditMode(!!params.id);
    if (params.id) {
      (async () => {
        await fetchCustomer(params.id!);
      })();
    }
  }, [params.id]);

  const states = useMemo(() => {
    const country = formik.values?.country;
    const selectedCountry = countries.find((c) => c.value === country);
    if (!selectedCountry) {
      return [];
    }
    return selectedCountry.states;
  }, [formik.values?.country]);

  const cities = useMemo(() => {
    const country = formik.values?.country;
    const state = formik.values?.state;

    const selectedCountry = countries.find((c) => c.value === country);
    if (!selectedCountry) {
      return [];
    }
    const selectedState = selectedCountry.states.find((s) => s.value === state);
    if (!selectedState) {
      return [];
    }
    return selectedState.cities;
  }, [formik.values?.country, formik.values?.state]);

  const handleChangeCountry = (value: any) => {
    const country = value ? value.value : "";
    formik.setFieldValue("country", country);
    formik.setFieldValue("city", "");
    formik.setFieldValue("state", "");
  };

  const handleChangeState = (value: any) => {
    const state = value ? value.value : "";
    formik.setFieldValue("state", state);
    formik.setFieldValue("city", "");
  };

  const handleChangeCity = (value: any) => {
    const city = value ? value.value : "";
    formik.setFieldValue("city", city);
  };

  return (
    <>
      <AlertDialog
        open={updateDialog}
        setOpen={setUpdateDialog}
        title={"Confirm"}
        content={
          "Are you sure, you want to " +
          `${isEditMode ? "update customer info?" : "add new customer?"}`
        }
        handleClose={() => setUpdateDialog(false)}
        handleConfirm={() => {
          setUpdateDialog(false);
          return formik.submitForm();
        }}
      />
      <MainCard>
        <form onSubmit={formik.handleSubmit} id="validation-forms">
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <MainCard>
                <Grid container spacing={3}>
                  <Grid item sm={5} md={6} lg={6}>
                    <Stack spacing={2} paddingBottom={3} alignItems="start">
                      <CustomFormField
                        formik={formik}
                        name="schoolName"
                        label="School/Institution Name *"
                        accessorName="schoolName"
                      />
                      <CustomFormField
                        formik={formik}
                        name="firstName"
                        label="First Name *"
                        accessorName="firstName"
                      />
                      <CustomFormField
                        formik={formik}
                        name="lastName"
                        label="Last Name *"
                        accessorName="lastName"
                      />
                      <CustomFormField
                        formik={formik}
                        name="phone"
                        label="phone"
                        accessorName="phone"
                      />
                      <CustomFormField
                        name="email"
                        label="Email *"
                        formik={formik}
                        accessorName="email"
                      />
                    </Stack>
                  </Grid>
                  <Grid item sm={5} md={6} lg={6}>
                    <Stack spacing={2} alignItems="start">
                      <CustomFormField
                        name="address"
                        label="Address *"
                        formik={formik}
                        accessorName="address"
                      />

                      <CustomAutocomplete
                        options={countries}
                        handleChange={handleChangeCountry}
                        label="Country *"
                        formik={formik}
                        accessorName="country"
                        value={formik.values.country}
                      />
                      <CustomAutocomplete
                        options={states}
                        handleChange={handleChangeState}
                        label="State *"
                        formik={formik}
                        accessorName="state"
                        value={formik.values.state}
                      />
                      <CustomAutocomplete
                        options={cities}
                        handleChange={handleChangeCity}
                        value={formik.values.city}
                        label="City *"
                        formik={formik}
                        accessorName={"city"}
                      />

                      <CustomFormField
                        name="zip"
                        label="ZIP *"
                        accessorName={"zip"}
                        formik={formik}
                      />
                    </Stack>
                  </Grid>
                </Grid>
                <Grid item xs={12} paddingTop={0}>
                  <Stack direction="row" justifyContent="center">
                    <AnimateButton>
                      <Button
                        variant="contained"
                        sx={{ my: 3, ml: 1 }}
                        type="button"
                        onClick={() => setUpdateDialog(true)}
                      >
                        {isEditMode ? "Update" : "Create"}
                      </Button>
                    </AnimateButton>
                  </Stack>
                </Grid>
              </MainCard>
            </Grid>
            {customer && customer?.kiosks?.length !== 0 && (
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
        </form>
      </MainCard>
    </>
  );
};

export default AddEditCustomer;
