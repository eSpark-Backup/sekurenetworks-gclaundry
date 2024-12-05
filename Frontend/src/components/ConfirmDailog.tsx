import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface ConfirmationDailogProps {
  open: boolean;
  text: string;
  okBtnText: string;
  handleConfirm: () => any;
  handleClose: () => any;
}

const ConfirmationDailog: React.FC<ConfirmationDailogProps> = ({
  open,
  handleConfirm,
  handleClose,
  text,
  okBtnText,
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
        <Button
          variant="contained"
          sx={{ fontWeight: 600 }}
          onClick={handleConfirm}
          autoFocus
        >
          {okBtnText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDailog;
