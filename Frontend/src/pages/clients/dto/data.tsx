import { Customer } from "@/types/customer";
import { User } from "@/types/IUser";
import { KIOSK } from "@/types/kiosk";
import { Count } from "@/types/lCount";
import {
  EditTwoTone,
  FileTextTwoTone
} from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

export const columns: ColumnDef<User>[] = [
  {
    header: "Name",
    cell: ({ row }) => (
      <Typography variant="subtitle2">{row.original.firstName} {row.original.lastName}</Typography>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => (
      <Typography variant="subtitle2">{getValue<string>()}</Typography>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ getValue }) => {
      const customer = getValue<Customer>();
      return customer ? (
        <Stack direction="column" spacing={0}>
          <span>
            {customer.firstName} {customer.lastName}
          </span>
          <small>{customer.email}</small>
        </Stack>
      ) : (
        <span>N/A</span>
      );
    },
  },
    {
      header: "Total Kiosk",
      accessorKey: "_count",
      cell: ({ getValue }) => (
        <Typography variant="subtitle1">
          {getValue<Count>()?.kiosks}
        </Typography>
      ),
    },
  {
    header: "Actions",
    cell: ({ row }) => {
      const theme: any = useTheme();
      const navigate = useNavigate();
      return (
        <Stack direction="row" spacing={0}>
          <Tooltip title="Detail">
            <IconButton
              onClick={() => navigate(`/client/view/${row.original.id}`)}
            >
              <FileTextTwoTone twoToneColor={theme.palette.primary.main} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/client/${row.original.id}`);
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
