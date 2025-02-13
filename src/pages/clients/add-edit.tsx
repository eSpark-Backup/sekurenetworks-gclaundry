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
  gender: yup.string().required("Gender is required"),
  ethnicity: yup.string().required("Ethnicity is required"),
  classYear: yup.string().required("Class Year is required"),
  expectedMajor: yup.string().required("Expected Major is required"),
  building: yup.string().optional(),
  floor: yup.string().optional(),
  financialAid: yup.string().required("Financial Aid is required"),
  lowIncome: yup.string().required("Low Income is required"),
  scent: yup.string().required("Scent is required"),
  referred: yup.string().optional(),
  phone: yup
    .string()
    .matches(/^\d{11}$/, "Phone number must be 11 digits")
    .required("Phone number is required"),
});

export const genderOptions = [
  "Male",
  "Female",
  "Trans",
  "Queer",
  "Cisgender",
  "Gender Non-Conforming",
  "Bigender",
  "Non-Binary",
  "Agender",
  "Two-Spirit",
  "I Don't Know",
  "Prefer Not to Answer",
  "Not in List"
];

export const ethnicityOptions = [
  "Indigenous",
  "Asian/Pacific Islander",
  "Black or African American",
  "Hispanic",
  "Latinx",
  "White",
  "I Don't Know",
  "Prefer Not to Answer",
  "Not in List",
];

export const classYearOptions = [
  "2023",
  "2024",
  "2025",
  "2026",
  "2027"
]

export const expectedMajorOptions = [
  "STEM",
  "Business",
  "Marketing",
  "Law",
  "Theatre Arts",
  "English",
  "Ethnic Studies"
];

export const YesAndNoOptions = [
  "YES",
  "NO"
]

export const scentOptions = [
  "scented",
  "unscented",
]

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
      gender: "",
      ethnicity: "",
      classYear: "",
      expectedMajor: "",
      building: "",
      floor: "",
      financialAid: "",
      lowIncome: "",
      scent: "",
      referred: "",
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
    <>
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
                        type="number"
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
                      <Autocomplete
                        fullWidth
                        options={genderOptions}
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
                      <Autocomplete
                        fullWidth
                        options={ethnicityOptions}
                        getOptionLabel={(option) => option}
                        onChange={(e: any, newValue) => {
                          formik.setFieldValue("ethnicity", newValue);
                        }}
                        autoSelect={true}
                        value={formik.values.ethnicity || null}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Ethnicity"
                            label="Ethnicity *"
                            error={Boolean(formik.touched.gender && formik.errors.gender)}
                            helperText={formik.touched.gender && formik.errors.gender}
                          />
                        )}
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
                  <Grid container spacing={2} >
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
                            placeholder="Select Class Year"
                            label="Class Year *"
                            error={Boolean(formik.touched.classYear && formik.errors.classYear)}
                            helperText={formik.touched.classYear && formik.errors.classYear}
                          />
                        )}
                      />
                    </Grid>


                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        fullWidth
                        options={expectedMajorOptions}
                        getOptionLabel={(option) => option}
                        onChange={(e: any, newValue) => {
                          formik.setFieldValue("expectedMajor", newValue);
                        }}
                        autoSelect={true}
                        value={formik.values.expectedMajor || null}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Expected Major"
                            label="Expected Major *"
                            error={Boolean(formik.touched.expectedMajor && formik.errors.expectedMajor)}
                            helperText={formik.touched.expectedMajor && formik.errors.expectedMajor}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box mt={2}>
                  <Grid container spacing={2} >
                    <Grid item xs={12} sm={6}>
                      <CustomFormField
                        name="building"
                        label="Building / Dorm Name *"
                        formik={formik}
                        accessorName="building"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomFormField
                        name="floor"
                        label="Floor Number"
                        formik={formik}
                        accessorName="floor"
                      />
                    </Grid>
                  </Grid>
                </Box>


                <Box mt={2}>
                  <Grid container spacing={2} >
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        fullWidth
                        options={YesAndNoOptions}
                        getOptionLabel={(option) => option}
                        onChange={(e: any, newValue) => {
                          formik.setFieldValue("financialAid", newValue);
                        }}
                        autoSelect={true}
                        value={formik.values.financialAid || null}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Financial Aid"
                            label="Financial Aid *"
                            error={Boolean(formik.touched.financialAid && formik.errors.financialAid)}
                            helperText={formik.touched.financialAid && formik.errors.financialAid}
                          />
                        )}
                      />
                    </Grid>


                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        fullWidth
                        options={YesAndNoOptions}
                        getOptionLabel={(option) => option}
                        onChange={(e: any, newValue) => {
                          formik.setFieldValue("lowIncome", newValue);
                        }}
                        autoSelect={true}
                        value={formik.values.lowIncome || null}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Low Income"
                            label="Low Income *"
                            error={Boolean(formik.touched.lowIncome && formik.errors.lowIncome)}
                            helperText={formik.touched.lowIncome && formik.errors.lowIncome}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>




                <Box mt={2}>
                  <Grid container spacing={2} >
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        fullWidth
                        options={scentOptions}
                        getOptionLabel={(option) => option}
                        onChange={(e: any, newValue) => {
                          formik.setFieldValue("scent", newValue);
                        }}
                        autoSelect={true}
                        value={formik.values.scent || null}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Scent"
                            label="Scent *"
                            error={Boolean(formik.touched.scent && formik.errors.scent)}
                            helperText={formik.touched.scent && formik.errors.scent}
                          />
                        )}
                      />
                    </Grid>


                    <Grid item xs={12} sm={6}>
                    <CustomFormField
                        name="referred"
                        label="Referred"
                        formik={formik}
                        accessorName="referred"
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

    </>
  );
};

export default AddEditUser;
