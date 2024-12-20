import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, Divider, TextField, Tooltip } from '@mui/material'

const KiosksAssigner = ({
    open,
    handleClose
}) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
        >

            <DialogContent>
                <Autocomplete 
                    multiple
                    id="tags-outlined"
                    options={
                        [
                            { title: "Kiosk 1" },
                            { title: "Kiosk 2" },
                            { title: "Kiosk 3" },
                            { title: "Kiosk 4" },
                            { title: "Kiosk 5" },
                        ]
                    }
                    getOptionLabel={(option) => option.title}
                    filterSelectedOptions
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label="Select Kiosks"
                            placeholder="Kiosks"
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
                        <Button
                            variant="contained"
                            sx={{ fontWeight: 600 }}
                        //   onClick={onSubmitHandler}
                        //   disabled={!!disabledMessage || isLoading}
                        >
                            {/* {isLoading
                ? isCreate
                  ? "Creating..."
                  : "Updating..."
                : isCreate
                ? "Create"
                : "Update"} */}
                            Assign
                        </Button>
                    </div>
                </Tooltip>
            </DialogActions>
        </Dialog>
    )
}

export default KiosksAssigner