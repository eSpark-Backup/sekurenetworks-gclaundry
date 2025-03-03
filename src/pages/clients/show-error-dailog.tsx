import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface ShowErrorDialogProps {
  open: boolean;
  errors: string[];
  handleClose: () => any;
}

const ShowErrorDialog: React.FC<ShowErrorDialogProps> = ({
  open,
  errors,
  handleClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Errors</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 1.5, color: "red" }}>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}

        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
        sx={{ color: "black" }}
        onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowErrorDialog;
