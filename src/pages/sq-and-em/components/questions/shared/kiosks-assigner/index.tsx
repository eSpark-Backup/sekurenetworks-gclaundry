
import apiService from '@/api/apiService';
import ConfirmationDailog from '@/components/ConfirmDailog';
import { LoadingButton } from '@mui/lab';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, Divider, TextField, Tooltip, Typography } from '@mui/material'
import { useRequest } from 'ahooks';
import { useState } from 'react';

const KiosksAssigner = ({
    open,
    handleClose,
    selectedKiosks,
    setSelectedKiosks,
    onAssign,
    assignLoading,
    customers,
    kioksByCustomerId,
    setKiosksByCustomerId,
    setLoadingKiosksByCustomerId,
    loadingKioksbyCustomerId,
    setSelectedCustomer,
    selectedCustomer,
    heading,
    info,
    buttonLabel,
    confirmText

}) => {

    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);


    const { runAsync: getKiosks } = useRequest(

        (query) => apiService.kisok.getKiosks(query),
        {
            manual: true,
            debounceWait: 1000,
            onSuccess: ({ data }) => {
                setKiosksByCustomerId(data.data);
                setLoadingKiosksByCustomerId(false);
            },
            onError: () => {
                setLoadingKiosksByCustomerId(false);
            },
        }
    );


    return (
        <>
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
        >

            <DialogContent>
                <Typography variant="h4" gutterBottom>{heading}</Typography>
                <br />

                <Autocomplete
                    sx={{ mb: 2 }}
                    fullWidth
                    options={customers}
                    value={selectedCustomer}
                    getOptionLabel={(option) => option.schoolName}
                    clearIcon={null}
                    onChange={async (_: any, customer) => {
                        console.log(customer)
                        setSelectedCustomer(customer);
                        // if (!selectedCustomer) {
                        //     setKiosksByCustomerId([]);
                        //     return;
                        // }
                        if (!customer) {
                            setKiosksByCustomerId([]);
                            return;
                        }
                        setSelectedKiosks([]);
                        setLoadingKiosksByCustomerId(true);
                        await getKiosks({ customerId: customer.id });
                    }}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Select Customer" />
                    )}
                />


                <Autocomplete
                    multiple
                    id="tags-outlined"
                    options={kioksByCustomerId}
                    loading={loadingKioksbyCustomerId}
                    disabled={loadingKioksbyCustomerId}
                    getOptionLabel={(option) => option.name}
                    filterSelectedOptions
                    value={selectedKiosks}
                    onChange={(event, newValue) => setSelectedKiosks(newValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            placeholder={loadingKioksbyCustomerId ? "Loading Kiosks" : "Select Kiosks"}
                        />
                    )}
                />

                <br />

                <Typography color="error">
                    {info}
                </Typography>



                <Box type="A" component="ol">

                    <Box sx={{ mt: "0.5rem" }}>
                        <Divider sx={{ width: "100%" }} />


                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>

                <Tooltip title={"disabledMessage"}>
                    <div>
                        <LoadingButton
                            variant="contained"
                            sx={{ fontWeight: 600 }}
                            onClick={() => setOpenConfirmationDialog(true)}
                            disabled={kioksByCustomerId.length === 0 || assignLoading || !selectedCustomer}
                        >

                            {buttonLabel}
                        </LoadingButton>
                    </div>
                </Tooltip>
            </DialogActions>
        </Dialog>


        <ConfirmationDailog
          open={openConfirmationDialog}
          handleClose={() =>  setOpenConfirmationDialog(false)}
          handleConfirm={() => { onAssign(); setOpenConfirmationDialog(false); }}
          text={confirmText}
          okBtnText="Confirm"
          assignLoading={assignLoading}

        />
        
        </>
    )
}

export default KiosksAssigner