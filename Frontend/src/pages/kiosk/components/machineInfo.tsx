import { IMachineInfo } from "@/types/kiosk";
import { Grid, Stack, Typography } from "@mui/material";
import React from "react";

interface MachineInfoProps {
  machineInfo: IMachineInfo;
}

const MachineInfo = ({ machineInfo }: MachineInfoProps) => {
  const entries = Object.entries(machineInfo);
  const midIndex = Math.ceil(entries.length / 2);
  const firstColumn = entries.slice(0, midIndex);
  const secondColumn = entries.slice(midIndex);

  return (
    <Grid container>
      <Grid item xs={12} md={6}>
        <Stack spacing={0.5}>
          {firstColumn.map(([key, value]) => (
            <Typography key={key} variant="h5" sx={{ fontWeight: "bold" }}>
              {key.replace(/_/g, " ")}: {value}
            </Typography>
          ))}
        </Stack>
      </Grid>

      {/* Second Column */}

      <Grid item xs={12} md={6}>
        <Stack spacing={0.5}>
          {secondColumn.map(([key, value]) => (
            <Typography key={key} variant="h5" sx={{ fontWeight: "bold" }}>
              {key.replace(/_/g, " ")}: {value}
            </Typography>
          ))}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default React.memo(MachineInfo);
