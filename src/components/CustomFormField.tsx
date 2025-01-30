import { TextField } from "@mui/material";
import { FormikProps } from "formik";
import React from "react";
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

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
  type,
  ...props
}) => {
  const errorText = formik.touched[accessorName]
    ? (formik.errors[accessorName] as string)
    : undefined;


  if (type === "tel2") {
    return (
      <PhoneInput
        country="us"
        onlyCountries={["us", "ca"]}
        inputProps={{
          name: name,
          required: true,
          autoFocus: true,
        }}
        value={formik.values[accessorName]}
        onChange={(phone) => formik.setFieldValue(accessorName, phone)}
        isValid={(value, country) => {
          if (value.match(/12345/)) {
            return "Invalid value: " + value + ", " + country.name
          } else if (value.match(/1234/)) {
            return false
          } else {
            return true
          }
        }}
        inputStyle={{
          width: "100%",
          height: "42px",
          fontSize: "16px",
          borderColor: formik.touched[accessorName] && formik.errors[accessorName] ? "red" : undefined,
        }}
        buttonStyle={{
          borderColor: formik.touched[accessorName] && formik.errors[accessorName] ? "red" : undefined,
        }}
        containerStyle={{
          marginBottom: "8px",
        }}
      />
    )
  }

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
