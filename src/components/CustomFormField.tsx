import { TextField } from "@mui/material";
import { FormikProps } from "formik";
import React from "react";

interface CustomFormFieldProps {
  formik: FormikProps<any>;
  name: string;
  label: string;
  accessorName: string;
  isMultiLine?: boolean;
  disabled?: boolean;
  [key: string]: any;
}

const CustomFormField: React.FC<CustomFormFieldProps> = ({
  formik,
  name,
  label,
  accessorName,
  isMultiLine = false,
  disabled = false,
  ...props
}) => {
  const errorText = formik.touched[accessorName]
    ? (formik.errors[accessorName] as string)
    : undefined;

  return (
    <TextField
      id={name}
      name={name}
      label={label}
      value={formik.values[accessorName]}
      onChange={formik.handleChange}
      error={
        formik.touched[accessorName] && Boolean(formik.errors[accessorName])
      }
      helperText={errorText}
      multiline={isMultiLine}
      fullWidth
      disabled={disabled}
      {...props}
    />
  );
};

export default CustomFormField;
