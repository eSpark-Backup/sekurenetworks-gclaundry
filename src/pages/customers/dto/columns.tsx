import Mailto from "@/components/Mailto";
import { Customer } from "@/types/customer";
import { KIOSK } from "@/types/kiosk";
import { EditTwoTone, FileTextTwoTone } from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

export const columns: ColumnDef<Customer>[] = [
  {
    header: "School/Institution",
    accessorKey: "schoolName",
    cell: ({ getValue }) => (
      <Typography variant="body1">{getValue<string>()}</Typography>
    ),
  },
  {
    header: "Location",
    accessorKey: "city",
    cell: ({ getValue, row }) => (
      <Stack spacing={0}>
        <Typography
          sx={{ textTransform: 'capitalize' }}
          variant="subtitle1">{getValue<string>()}</Typography>
        <Typography sx={{ textTransform: 'capitalize' }} variant="subtitle2" color="textSecondary">
          {row.original.state}
        </Typography>
      </Stack>
    ),
  },
  {
    header: "Name",
    accessorKey: "firstName",
    cell: ({ row }) => (
      <Typography variant="subtitle1">
        {row.original.firstName} {row.original.lastName}
      </Typography>
    ),
  },
  {
    header: "Contact",
    accessorKey: "phone",
    cell: ({ row }) => (
      <Stack spacing={0}>
        <Typography variant="subtitle1">{row.original.phone}</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          <Mailto email={row.original.email} />
        </Typography>
      </Stack>
    ),
  },
  {
    header: "Total Kiosk",
    accessorKey: "kiosks",
    cell: ({ getValue }) => (
      <Typography variant="subtitle1">
        {getValue<KIOSK[]>().length}
      </Typography>
    ),
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const theme: any = useTheme();
      const navigate = useNavigate();
      return (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={0}
        >
          <Tooltip title="Detail">
            <IconButton
              onClick={() => {
                navigate(`/customer/view/${row.original.id}`);
              }}
            >
              <FileTextTwoTone twoToneColor={theme.palette.primary.main} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/customer/${row.original.id}`);
              }}
            >
              <EditTwoTone twoToneColor={theme.palette.primary.main} />
            </IconButton>
          </Tooltip>
        </Stack>
      );
    },
  },
];