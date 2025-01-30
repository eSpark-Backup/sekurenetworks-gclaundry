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
      <>
      <PhoneInput
        country="ca"
        onlyCountries={["us", "ca"]}
        countryCodeEditable={false}
        inputProps={{
          name: name,
          required: true,
          autoFocus: true,
        }}
        value={formik.values[accessorName]}
        onChange={(phone) => {
          formik.setFieldValue(accessorName, phone)
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
   
      {errorText && <p style={{ color: "#FF4528", fontSize:"0.75rem" }}>{errorText}</p>}
      </>
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
