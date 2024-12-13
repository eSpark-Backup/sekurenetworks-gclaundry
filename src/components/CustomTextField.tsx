import React from 'react';
import { TextField } from '@mui/material';
import Dropdown from './common/ui/Dropdown';

const CustomTextField = ({
  formik,
  name,
  label,
  accessorName,
  type,
  options = [],
  disabled = false,
  ...props
}) => {
  if (accessorName) {
    if (type === 'DROPDOWN') {
      return (
        <Dropdown
          id={name}
          name={name}
          label={label}
          value={formik.values[accessorName]}
          onChange={formik.handleChange}
          error={
            formik.touched[accessorName] && Boolean(formik.errors[accessorName])
          }
          helperText={
            formik.touched[accessorName] && formik?.errors[accessorName]
          }
          options={options}
          fullWidth
          autoComplete="given-name"
          padding={2}
          disabled={disabled}
          {...props}
        />
      );
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
        helperText={
          formik.touched[accessorName] && formik?.errors[accessorName]
        }
        fullWidth
        autoComplete="given-name"
        padding={2}
        disabled={disabled}
        {...props}
      />
    );
  }

  return null;
};

export default CustomTextField;
