import React, { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Input,
    Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Papa from "papaparse"
import { classYearOptions, ethnicityOptions, expectedMajorOptions, genderOptions, scentOptions, YesAndNoOptions } from "./add-edit";
import ShowErrorDialog from "./show-error-dailog";

interface UploadCSVDailogProps {
    open: boolean;
    handleConfirm: (data: any[]) => void;
    handleClose: () => any;
    loading?: boolean;
    csvData: any[];
    setCsvData: (data: any[]) => void;
    errors: string[];
    setErrors: (errors: string[]) => void;
    showErrorsDialog: boolean;
    setShowErrorsDialog: (value: boolean) => void;
}

const UploadCSVDialog: React.FC<UploadCSVDailogProps> = ({
    open,
    handleConfirm,
    handleClose,
    loading,
    csvData,
    setCsvData,
    errors,
    setErrors,
    showErrorsDialog,
    setShowErrorsDialog
}) => {


    const validatePhoneNumber = (phone: string) => {
        const phoneRegex = /^1\d{10}$/
        return phoneRegex.test(phone)
    }


    const validateValue = (value: string, allowedOptions: string[]) => allowedOptions.includes(value)

    const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const checkLocalDuplicates = (data: any[]) => {
            const seen = new Set()
            const duplicates: any[] = []

            const filteredData = data.filter((item) => {
                const key = `${item.studentId}-${item.email}-${item.phone}`
                if (seen.has(key)) {
                    duplicates.push(item)
                    return false
                }
                seen.add(key)
                return true
            })

            if (duplicates.length > 0) {
                setErrors((prev: any) => [...prev, `${duplicates.length} duplicate entries found in CSV.`])
            }
            return filteredData
        }

        const validateCSVData = (data: any[]) => {
            const invalidEntries: string[] = []

            const filteredData = data.filter((item, index) => {
                let isValid = true

                if (!validateValue(item.gender, genderOptions)) {
                    isValid = false
                    invalidEntries.push(`Row ${index + 2}: Invalid Gender - ${item.gender}`)
                }
                if (!validateValue(item.ethnicity, ethnicityOptions)) {
                    isValid = false
                    invalidEntries.push(`Row ${index + 2}: Invalid Ethnicity - ${item.ethnicity}`)
                }
                if (!validateValue(item.classYear, classYearOptions)) {
                    isValid = false
                    invalidEntries.push(`Row ${index + 2}: Invalid Class Year - ${item.classYear}`)
                }
                if (!validateValue(item.expectedMajor, expectedMajorOptions)) {
                    isValid = false
                    invalidEntries.push(`Row ${index + 2}: Invalid Major - ${item.expectedMajor}`)
                }
                if (!validateValue(item.financialAid, YesAndNoOptions)) {
                    isValid = false
                    invalidEntries.push(`Row ${index + 2}: Invalid Financial Aid - ${item.financialAid}`)
                }
                if (!validateValue(item.lowIncome, YesAndNoOptions)) {
                    isValid = false
                    invalidEntries.push(`Row ${index + 2}: Invalid Low Income - ${item.lowIncome}`)
                }
                if (!validateValue(item.scent, scentOptions)) {
                    isValid = false
                    invalidEntries.push(`Row ${index + 2}: Invalid Scent - ${item.scent}`)
                }

                if (!validatePhoneNumber(item.phone)) {
                    isValid = false
                    invalidEntries.push(
                        `Row ${index + 2}: Invalid Phone Number - ${item.phone}. Must be 11 digits starting with 1.`,
                    )
                }

                return isValid
            })


            if (invalidEntries.length > 0) {
                setErrors((prev) => [...prev, ...invalidEntries])
            }

            return filteredData
        }


        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result: any) => {
                setErrors([])
                const cleanedData = checkLocalDuplicates(result.data)
                const validData = validateCSVData(cleanedData)
                setCsvData(validData)
            },
        })
    }


    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Upload CSV</DialogTitle>
                <DialogContent>
                    <Input type="file"
                        inputProps={{ accept: ".csv" }}
                        onChange={handleCSVUpload} />

                    {errors.length > 0 && (
                        <DialogContentText sx={{ mt: 1, itemsAlign: "center" }}>
                            <Typography sx={{ color: "red" }}>CSV not formatted or data is invalid.</Typography>
                            <Typography
                                sx={{
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    color: "red",
                                    textDecoration: "underline",
                                }}
                                onClick={
                                    () => setShowErrorsDialog(true)
                                }
                            >View errors
                            </Typography>
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <LoadingButton
                        variant="contained"
                        sx={{ fontWeight: 600 }}
                        onClick={() => handleConfirm(csvData)}
                        disabled={errors.length > 0 || csvData.length === 0}
                        autoFocus
                        loading={loading}
                    >
                        Upload
                    </LoadingButton>
                </DialogActions>
            </Dialog>
            <ShowErrorDialog
                open={showErrorsDialog}
                errors={errors}
                handleClose={() => setShowErrorsDialog(false)}
            />
        </>
    );
};

export default UploadCSVDialog;
