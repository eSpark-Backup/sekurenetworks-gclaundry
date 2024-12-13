import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { TextField } from '@mui/material';
import config from '@/constants/config';

export default function AlertDialog({ open, setOpen, title, content, handleConfirm, handleClose }) {
  const [hasCorrectPin, setHasCorrectPin] = useState(false);
  const [pin, setPin] = useState("");

  handleClose =
    handleClose ??
    (() => {
      setOpen(false);
    });

  // const handleSetPin = (event) => {
  //   setPin(event.target.value);
  //   setHasCorrectPin(event.target.value == config.actualPin);
  // };

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1.5 }}>{content}</DialogContentText>
          {/* <TextField
            id="address.city"
            name="address.city"
            value={pin}
            label="Enter pin to proceed"
            type="password"
            onChange={handleSetPin}
            // error={formik.touched?.address?.city && Boolean(formik.errors?.address?.city)}
            // helperText={formik.touched?.address?.city && formik?.errors?.address?.city}
            fullWidth
            padding={2}
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
          variant="contained" 
          sx={{ fontWeight: 600 }} 
          // disabled={!hasCorrectPin} 
          onClick={handleConfirm} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
