import React from 'react';
import { TextField } from '@mui/material';
import Dropdown from './common/ui/Dropdown';

const CustomContactField = ({
  formik,
  name,
  label,
  accessorName,
  options = [],
  disabled = false,
  helperText,
  error,
  value,
  ...props
}) => {
  if (accessorName) {
    return (
      <TextField
        id={name}
        name={name}
        label={label}
        onChange={formik.handleChange}
        error={error}
        value = {value}
        helperText={helperText}
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

export default CustomContactField;
