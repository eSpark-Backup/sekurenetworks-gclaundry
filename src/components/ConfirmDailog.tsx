import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

interface ConfirmationDailogProps {
  open: boolean;
  text: string;
  okBtnText: string;
  handleConfirm: () => any;
  handleClose: () => any;
  assignLoading?: boolean;
}

const ConfirmationDailog: React.FC<ConfirmationDailogProps> = ({
  open,
  handleConfirm,
  handleClose,
  text,
  okBtnText,
  assignLoading,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Confirm</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 1.5 }}>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          variant="contained"
          sx={{ fontWeight: 600 }}
          onClick={handleConfirm}
          autoFocus
          loading={assignLoading}
        >
          {okBtnText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDailog;
