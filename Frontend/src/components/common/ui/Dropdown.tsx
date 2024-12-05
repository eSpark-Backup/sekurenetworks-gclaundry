import React from "react";
import { InputLabel, MenuItem, FormControl, Select } from "@mui/material";

const Dropdown = (props) => {
  const { label, options, ...rest } = props;
  return (
    <FormControl fullWidth>
      {label ? (
        <InputLabel>{label}</InputLabel>
      ) : null}
      <Select {...rest}>
        {Array.isArray(options) &&
          options.map((option) => {
            return (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            );
          })}
      </Select>
    </FormControl>
  );
};

export default Dropdown;
