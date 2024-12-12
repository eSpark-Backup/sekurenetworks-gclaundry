import { Autocomplete, Box, Button, Grid, Stack, TextField, Typography } from "@mui/material";
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
  classYear: yup.string().required("Class Year is required"),
  studentId: yup.string().required("Student ID is required"),
  DOB: yup.string().required("DOB is required"),
  phone: yup.string().required("Phone is required"),
  personalEmail: yup.string().required("Personal Email is required"),
  gender: yup.string().required("Gender is required"),
  uniquePin: yup.string().required("Unique Pin is required"),
  scented: yup.string().required("Scented is required"),
  unscented: yup.string().required("Unscented is required"),
  sheetPreference: yup.string().required("Sheet Preference is required"),
  accountDate: yup.string().required("Account Date is required"),
  accountType: yup.string().required("Account Type is required"),
  accountStatus: yup.string().required("Account Status is required"),

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
      classYear: "",
      studentId: null,
      DOB: "",
      phone: "",
      personalEmail: "",
      gender: "",
      uniquePin: "",
      scented: "",
      unscented: "",
      sheetPreference: "",
      accountDate: "",
      accountType: "",
      accountStatus: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      delete (values as any)?.customer;

      if (isEditMode) await updateClient(user?.id, values);
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


  const classYearOptions = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]
  const SheetPreferenceOptions = ["scented", "unscented"]
  const AccountTypeOptions = ["Paid", "Free"]
  const AccountStatusOptions = ["Active", "Inactive"]
  const GenderOptions = ["Male", "Female", "Other"]

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

                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      fullWidth
                      onInputChange={async (e: any) => {
                        await getCustomers({ name: e.target.value });
                      }}
                      options={customers || []}
                      getOptionLabel={(option) => option.schoolName}
                      onChange={(e: any, newValue) => {
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
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      fullWidth
                      options={classYearOptions}
                      getOptionLabel={(option) => option}
                      onChange={(e: any, newValue) => {
                        formik.setFieldValue("classYear", newValue);
                      }}
                      autoSelect={true}
                      value={formik.values.classYear || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Class Year"
                          label="Class Year *"
                          error={Boolean(formik.touched.classYear && formik.errors.classYear)}
                          helperText={formik.touched.classYear && formik.errors.classYear}
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
                        name="DOB"
                        formik={formik}
                        accessorName="DOB"
                        type="date"
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
                        name="phone"
                        label="Phone *"
                        formik={formik}
                        accessorName="phone"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomFormField
                        name="personalEmail"
                        label="Personal email *"
                        formik={formik}
                        accessorName="personalEmail"
                      />
                    </Grid>
                  </Grid>
                </Box>
                <Box mt={2}>
                  <Grid container spacing={2} >
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        fullWidth
                        options={GenderOptions}
                        getOptionLabel={(option) => option}
                        onChange={(e: any, newValue) => {
                          formik.setFieldValue("gender", newValue);
                        }}
                        autoSelect={true}
                        value={formik.values.gender || null}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Gender"
                            label="Gender *"
                            error={Boolean(formik.touched.gender && formik.errors.gender)}
                            helperText={formik.touched.gender && formik.errors.gender}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomFormField
                        name="uniquePin"
                        label="Unique Pin *"
                        formik={formik}
                        accessorName="uniquePin"
                        type="number"
                      />
                    </Grid>
                  </Grid>
                </Box>


                <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                  Preferences
                </Typography>


                <Box mt={2}>
                  <Grid container spacing={2} >
                    <Grid item xs={12} sm={4}>
                      <CustomFormField
                        name="scented"
                        label="Scented *"
                        formik={formik}
                        accessorName="scented"
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomFormField
                        name="unscented"
                        label="Unscented *"
                        formik={formik}
                        accessorName="unscented"
                        type="number"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Autocomplete
                        fullWidth
                        options={SheetPreferenceOptions}
                        getOptionLabel={(option) => option}
                        onChange={(e: any, newValue) => {
                          formik.setFieldValue("sheetPreference", newValue);
                        }}
                        autoSelect={true}
                        value={formik.values.sheetPreference || null}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Sheet Preference"
                            label="Sheet Preference *"
                            error={Boolean(formik.touched.sheetPreference && formik.errors.sheetPreference)}
                            helperText={formik.touched.sheetPreference && formik.errors.sheetPreference}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box mt={2}>
                  <Grid container spacing={2} >


                  </Grid>
                </Box>


                <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                  Account Information
                </Typography>



                <Box mt={2}>
                  <Grid container spacing={2} >
                    <Grid item xs={12} sm={4}>
                      <CustomFormField
                        name="accountDate"
                        formik={formik}
                        accessorName="accountDate"
                        type="date"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Autocomplete
                        fullWidth
                        options={AccountTypeOptions}
                        getOptionLabel={(option) => option}
                        onChange={(e: any, newValue) => {
                          formik.setFieldValue("accountType", newValue);
                        }}
                        autoSelect={true}
                        value={formik.values.accountType || null}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Account Type"
                            label="Account Type *"
                            error={Boolean(formik.touched.accountType && formik.errors.accountType)}
                            helperText={formik.touched.accountType && formik.errors.accountType}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Autocomplete
                        fullWidth
                        options={AccountStatusOptions}
                        getOptionLabel={(option) => option}
                        onChange={(e: any, newValue) => {
                          formik.setFieldValue("accountStatus", newValue);
                        }}
                        autoSelect={true}
                        value={formik.values.accountStatus || null}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Account Status"
                            label="Account Status *"
                            error={Boolean(formik.touched.accountStatus && formik.errors.accountStatus)}
                            helperText={formik.touched.accountStatus && formik.errors.accountStatus}
                          />
                        )}
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
