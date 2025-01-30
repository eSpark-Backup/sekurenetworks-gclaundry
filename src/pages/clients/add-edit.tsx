import { Autocomplete, Button, Grid, Stack, TextField } from "@mui/material";
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
  customerId: yup.string().email().required("Customer is required"),
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
      studentId: "",
      phone: "",
    },
    validationSchema,
    onSubmit: () => { 
      console.log('submit');
      
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
      onSuccess: ({ data }: any) => toast(data.message, { type: "success" }),
      onFinally: () => navigate("/clients"),
    }
  );

  const { runAsync: updateClient } = useRequest(
    (id, data) => apiService.user.update(id, data),
    {
      manual: true,
      onSuccess: ({ data }: any) => toast(data.message, { type: "success" }),
      onFinally: () => navigate("/clients"),
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
          const values = formik.values;
          // @ts-ignore
          // check email is valid if not show toast 
          delete values.customer

          console.log(values);
          

          if (!values.email.includes('@')) {
            toast.error('Invalid Email');
            return;
          }

          if (isEditMode) await updateClient(user?.id, values);
          else await createClient(values);
          setUpdateDialog(false);
        }}
      />
      <MainCard>
        <form onSubmit={formik.handleSubmit} id="validation-forms">
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <MainCard>
                <Stack spacing={2} paddingY={2}>
                  <Autocomplete
                    fullWidth
                    onInputChange={async (e: any) => {
                      // await getCustomers({ name: e.target.value });
                    }}
                    options={customers || []}
                    getOptionLabel={(option) => option.schoolName}
                    onChange={(e: any, newValue) => {
                      formik.setFieldValue("customerId", newValue?.id);
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
                </Stack>
                <Grid container spacing={3}>
                  <Grid item sm={5} md={6} lg={6}>
                    <Stack spacing={2} paddingBottom={3} alignItems="start">
                      <CustomFormField
                        formik={formik}
                        name="firstName"
                        label="First Name *"
                        accessorName="firstName"
                      />
                      <CustomFormField
                        name="studentId"
                        label="Student ID *"
                        formik={formik}
                        accessorName="studentId"
                      />
                      <CustomFormField
                        name="email"
                        label="Email *"
                        formik={formik}
                        accessorName="email"
                        type="email"
                      />
                    </Stack>
                  </Grid>
                  <Grid item sm={5} md={6} lg={6}>
                    <Stack spacing={2} alignItems="start">
                      <CustomFormField
                        formik={formik}
                        name="lastName"
                        label="Last Name *"
                        accessorName="lastName"
                      />
                      <CustomFormField
                        name="password"
                        label="Password *"
                        formik={formik}
                        accessorName="password"
                        type="password"
                      />
                      <CustomFormField
                        name="phone"
                        label="Phone *"
                        formik={formik}
                        accessorName="phone"
                        type="tel2"
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
                        // disable if fields are empty
                        disabled={
                          !formik.values.firstName ||
                          !formik.values.lastName ||
                          !formik.values.email ||
                          !formik.values.studentId ||
                          !formik.values.phone
                        }
                      >
                        {isEditMode ? "Update" : "Create"}
                      </Button>
                    </AnimateButton>
                  </Stack>
                </Grid>
              </MainCard>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    </ApiLoader>
  );
};

export default AddEditUser;
