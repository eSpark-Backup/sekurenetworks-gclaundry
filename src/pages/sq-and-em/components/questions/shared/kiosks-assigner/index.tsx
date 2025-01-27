
import apiService from '@/api/apiService';
import ConfirmationDailog from '@/components/ConfirmDailog';
import { LoadingButton } from '@mui/lab';
import { Autocomplete, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, Divider, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
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
    selectedItems,
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
                const kioskswithCustomer = data?.data.filter(kiosk => kiosk?.customer !== null);

                setKiosksByCustomerId(kioskswithCustomer);
                setLoadingKiosksByCustomerId(false);
            },
            onError: () => {
                setLoadingKiosksByCustomerId(false);
            },
        }
    );

    const handleSelectAll = (isSelectAllChecked) => {
        if (isSelectAllChecked) {
            // setSelectedKiosks(kioksByCustomerId);
            const kiosks = kioksByCustomerId.filter(option => !selectedItems?.every(item => item.kiosks.map(kiosk => kiosk.kioskId).includes(option.macId)));
            setSelectedKiosks(kiosks);
        } else {
            setSelectedKiosks([]);
        }
    };

    const handleDisableOption = (option) => {

        if (option.macId === "all") return areAllOptionsDisabled();

        //FOR SINGLE SELECTION IF MACID is included in the selected item then disable it otherwise not
        if (selectedItems?.length === 1) {
            return selectedItems[0]?.kiosks.map(kiosk => kiosk?.kioskId).includes(option.macId)
        }

        //FOR MULTIPLE SELECTION IF MACID is included in all of the selected items then disable it otherwise not
        if (selectedItems?.length > 1) {
            return selectedItems?.every(item => item.kiosks.map(kiosk => kiosk?.kioskId).includes(option.macId))
        }
    };

    const areAllOptionsDisabled = () => {
        return kioksByCustomerId.every(option => handleDisableOption(option));
    };


    return (
        <>
            <Dialog
                open={open}
                // onClose={handleClose}
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
                        options={[{ id: "all", schoolName: "Select All" }, ...customers]}
                        value={selectedCustomer}
                        getOptionLabel={(option) => option.schoolName}
                        clearIcon={null}
                        onChange={async (_: any, customer) => {
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
                            if (customer.id === "all") {
                                await getKiosks({});
                            }
                            else {
                                await getKiosks({ customerId: customer.id });

                            }
                        }}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Select Customer" />
                        )}
                    />


                    <Autocomplete
                        multiple
                        id="tags-outlined"
                        options={kioksByCustomerId.length > 0
                            ? [{ macId: "all", name: "Select All" }, ...kioksByCustomerId]
                            : []}
                        loading={loadingKioksbyCustomerId}
                        disabled={loadingKioksbyCustomerId || kioksByCustomerId.length === 0}
                        getOptionLabel={(option) => option.name}
                        disableCloseOnSelect
                        // filterSelectedOptions
                        value={selectedKiosks}
                        onChange={(event, newValue) => {
                            const isSelectAllIncluded = newValue?.some((item) => item?.macId === "all");
                            if (isSelectAllIncluded) {
                                handleSelectAll(newValue[0]?.macId === "all");
                            } else {
                                setSelectedKiosks(newValue);
                            }
                        }}
                        renderOption={(props, option, { selected }) => (
                            <MenuItem {...props}>
                                <input
                                    type="checkbox"
                                    checked={option?.macId === "all" ?
                                        kioksByCustomerId.some((kiosk) => !handleDisableOption(kiosk)) &&
                                        selectedKiosks.length === kioksByCustomerId?.filter((kiosk) => !handleDisableOption(kiosk))?.length
                                        : selected}
                                    style={{ marginRight: "1rem", cursor: "pointer", width: "1rem", height: "1rem", accentColor: "red" }}
                                />
                                {option.name}
                            </MenuItem>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                placeholder={loadingKioksbyCustomerId ? "Loading Kiosks" : "Select Kiosks"}
                            />
                        )}
                        renderTags={(value, getTagProps) => {
                            const visibleTags = 3; // Number of tags to show before skipping
                            const totalTags = value.length;

                            const displayedTags = value.slice(0, visibleTags).map((option, index) => (
                                <Chip key={option?.name} {...getTagProps({ index })} label={option.name} />
                            ));
                            if (totalTags > visibleTags) {
                                displayedTags.push(
                                    <Chip
                                        key={`more-${totalTags - visibleTags}`}
                                        {...getTagProps({ index: totalTags - 1 })}
                                        label={`${value[totalTags - 1]?.name} ${totalTags - visibleTags - 1 ? `+${totalTags - visibleTags - 1}` : ""}`}
                                    />
                                );
                            }
                            return displayedTags;
                        }}
                        getOptionDisabled={(option) => handleDisableOption(option)}
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
                                disabled={kioksByCustomerId.length === 0 || assignLoading || !selectedCustomer || selectedKiosks.length === 0}
                            >

                                {buttonLabel}
                            </LoadingButton>
                        </div>
                    </Tooltip>
                </DialogActions>
            </Dialog>


            <ConfirmationDailog
                open={openConfirmationDialog}
                handleClose={() => setOpenConfirmationDialog(false)}
                handleConfirm={() => { onAssign(); setOpenConfirmationDialog(false); }}
                text={confirmText}
                okBtnText="Confirm"
                assignLoading={assignLoading}

            />

        </>
    )
}

export default KiosksAssigner