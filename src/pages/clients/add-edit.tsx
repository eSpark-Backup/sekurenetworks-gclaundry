import { Autocomplete, Box, Button, Chip, Grid, Stack, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import MainCard from "../../components/MainCard";

import apiService from "@/api/apiService";
import ApiLoader from "@/components/api-loader";
import CustomFormField from "@/components/CustomFormField";
import { Customer } from "@/types/customer";
import { User } from "@/types/IUser";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import AlertDialog from "../../components/@extended/AlertDialog";
import AnimateButton from "../../components/@extended/AnimateButton";

const validationSchema = yup.object({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  email: yup.string().email().required("Email is required"),
  customerId: yup.string().required("Customer is required"),
  studentId: yup.string().required("Student ID is required"),
  phone: yup
    .string()
    .matches(/^\d{11}$/, "Phone number must be 11 digits")
    .required("Phone number is required"),
});

const AddEditUser = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>();
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      customerId: null,
      firstName: "",
      lastName: "",
      email: "",
      studentId: null,
      phone: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      delete (values as any)?.customer;

      if (isEditMode) {
        await updateClient(user?.id, values)
      }
      else await createClient(values);

    },
  });

  const { loading, runAsync } = useRequest(
    (id) => apiService.user.getById(id),
    {
      manual: true,
      onError: () => navigate("/clients"),
    }
  );

  const { runAsync: createClient } = useRequest(
    (data) => apiService.user.create(data),
    {
      manual: true,
      onSuccess: ({ data }: any) => {
        if (data.statusCode === 400) {
          toast(data.message, { type: "error" });
        } else {
          toast(data.message, { type: "success" });
          navigate("/clients");
        }
      },
      // onFinally: () => navigate("/clients"),
    }
  );

  const { runAsync: updateClient } = useRequest(
    (id, data) => apiService.user.update(id, data),
    {
      manual: true,
        onSuccess: ({ data }: any) => {
          if (data.statusCode === 400) {
            toast(data.message, { type: "error" });
          } else {
            toast(data.message, { type: "success" });
            navigate("/clients");
          }
        },
      // onFinally: () => navigate("/clients"),
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
        navigate("/clients");
      },
    }
  );



  const fetchClient = async (id: string): Promise<User> => {
    const { data } = await runAsync(id);
    setUser(data);
    formik.setValues(data);
    return data;
  };

  useEffect(() => {
    setIsEditMode(!!params.id);
    (async () => {
      const { data } = await getCustomers({ name: null });
      if (params.id) {
        const client = await fetchClient(params.id!);

        formik.setValues({
          ...client,
          customerId: client.customerId,
        });
        setSelectedCustomer(
          data.data.find((e: any) => e.id === client.customerId)
        );

      }
    })();
  }, [params.id]);


  return (
    <ApiLoader isLoading={loading}>
      <AlertDialog
        open={updateDialog}
        setOpen={setUpdateDialog}
        title={"Confirm"}
        content={
          "Are you sure, you want to " +
          `${isEditMode ? "update customer info?" : "add new customer?"}`
        }
        handleClose={() => setUpdateDialog(false)}
        handleConfirm={async () => {
          setUpdateDialog(false);

          return formik.submitForm();
        }}
      />
      <MainCard>
        <form onSubmit={formik.handleSubmit} id="validation-forms">
          <Grid container spacing={2.5}>


            <Grid item xs={12} >


              <MainCard>

                <Grid container spacing={2} >

                  <Grid item xs={12} sm={12}>
                    <Autocomplete
                      fullWidth
                      // onInputChange={async (e: any) => {
                      //   await getCustomers({ name: e.target.value });
                      // }}
                      options={customers || []}
                      getOptionLabel={(option) => option.schoolName}
                      onChange={async (e: any, newValue) => {
                        formik.setFieldValue("customerId", newValue?.id);

                        setSelectedCustomer(newValue);
                      }}
                      autoSelect={true}
                      value={selectedCustomer || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Customer"
                          label="Customer *"
                          error={Boolean(formik.touched.customerId && formik.errors.customerId)}
                          helperText={formik.touched.customerId && formik.errors.customerId}

                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Box mt={2}>
                  <Grid container spacing={2} >
                    <Grid item xs={12} sm={6}>
                      <CustomFormField
                        formik={formik}
                        name="firstName"
                        label="First Name *"
                        accessorName="firstName"
                      />

                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomFormField
                        formik={formik}
                        name="lastName"
                        label="Last Name *"
                        accessorName="lastName"
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box mt={2}>
                  <Grid container spacing={2} >
                    <Grid item xs={12} sm={6}>
                      <CustomFormField
                        name="studentId"
                        label="ID *"
                        formik={formik}
                        accessorName="studentId"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomFormField
                        name="password"
                        label="Password *"
                        formik={formik}
                        accessorName="password"
                        type="password"
                      />
                    </Grid>
                  </Grid>
                </Box>
                <Box mt={2}>
                  <Grid container spacing={2} >
                    <Grid item xs={12} sm={6}>
                      <CustomFormField
                        name="email"
                        label="Email *"
                        formik={formik}
                        accessorName="email"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomFormField
                        name="phone"
                        label="Phone *"
                        formik={formik}
                        accessorName="phone"
                        isValid
                        type="tel2"
                      />
                    </Grid>
                  </Grid>
                </Box>


                <Box mt={2}>
                  <Grid item xs={12} paddingTop={0}>
                    <Stack direction="row" justifyContent="center">
                      <AnimateButton>
                        <Button
                          variant="contained"
                          sx={{ my: 3, ml: 1 }}
                          type="button"
                          disabled={!selectedCustomer}
                          onClick={() => setUpdateDialog(true)}
                        >
                          {isEditMode ? "Update" : "Create"}
                        </Button>
                      </AnimateButton>
                    </Stack>
                  </Grid>
                </Box>
              </MainCard>
            </Grid>
          </Grid>
        </form>
      </MainCard >
    </ApiLoader >
  );
};

export default AddEditUser;
