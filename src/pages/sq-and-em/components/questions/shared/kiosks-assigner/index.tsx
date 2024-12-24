import { getAllKioskData } from '@/api/kiosk';
import { LoadingButton } from '@mui/lab';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, Divider, TextField, Tooltip, Typography } from '@mui/material'
import { useEffect, useState } from 'react';

const KiosksAssigner = ({
    open,
    handleClose,
    selectedKiosks,
    setSelectedKiosks,
    onAssign,
    assignLoading

}) => {
    const [kioks, setKioks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

  
    const fetchKiosks = async () => {
        try {
            const res = await getAllKioskData();
            setKioks(res || []);
           
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchKiosks();
    }, []);



    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
        >

            <DialogContent>
                <Typography variant="h4" gutterBottom>Select Kiosks to Assign</Typography>
                <br/>
                <Autocomplete
                    multiple
                    id="tags-outlined"
                    options={kioks}
                    loading={isLoading}
                    disabled={isLoading}
                    getOptionLabel={(option) => option.name}
                    filterSelectedOptions
                    value={selectedKiosks} 
                    onChange={(event, newValue) => setSelectedKiosks(newValue)} 
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label="Kiosks"
                            placeholder={"Select Kiosks"}
                        />
                    )}
                />

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
                          onClick={onAssign}
                          disabled={kioks.length === 0 || assignLoading}
                          loading={assignLoading}
                        >
                            
                            Assign
                        </LoadingButton>
                    </div>
                </Tooltip>
            </DialogActions>
        </Dialog>
    )
}

export default KiosksAssigner