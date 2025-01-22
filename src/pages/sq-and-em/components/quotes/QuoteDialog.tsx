import React from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Chip,
    Tooltip,
} from "@mui/material";
import CustomFormField from "@/components/CustomFormField";
import { useFormik } from "formik";
import * as yup from "yup";

const QuoteDialog = ({ open, initialValues, handleClose, updateQuote, createGeneral }) => {

    const quoteSchema = yup.object({
        quote: yup.string().required("quote is required").trim().max(200),
        id: yup.string().optional(),
        isActive: yup.boolean(),
      });


    const formik = useFormik({
        initialValues,
        validationSchema: quoteSchema, // Import or define your validation schema
        onSubmit: async (values) => {
            if (values.id) {
                await updateQuote(values.id, values); // Define or import updateQuote
            } else {
                await createGeneral(values); // Define or import createGeneral
            }
            formik.resetForm();
            handleClose();
        },
        enableReinitialize: true, // Ensures form values update when `initialValues` change
    });
    return (
        <form onSubmit={formik.handleSubmit}>
            <Dialog
                open={open}
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
                        label={formik.values.isActive ? "Active" : "Inactive"}
                        color={formik.values.isActive ? "success" : "default"}
                    />
                </Box>

                <DialogContent>
                    <CustomFormField
                        name="quote"
                        formik={formik}
                        isMultiLine={true}
                        label="EM"
                        accessorName="quote"
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>

                    <Tooltip title={!formik.values.quote ? "Please Fill EM Field" : ""}>
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
    );
};

export default QuoteDialog;
