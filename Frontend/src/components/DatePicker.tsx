import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import * as React from "react";

interface DatePickerFieldProps {
  value?: Dayjs|null;
  onChange: (newValue: Dayjs | null) => void;
  label?: string;
  disabled?: boolean;
  [key: string]: any;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  value,
  onChange,
  label = "Select Date",
  disabled = false,
  ...props
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        renderInput={(params) => <TextField {...params} fullWidth />}
        {...props}
      />
    </LocalizationProvider>
  );
};

export default DatePickerField;
