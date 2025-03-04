import Mailto from "@/components/Mailto";
import { Customer } from "@/types/customer";
import { User } from "@/types/IUser";
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
    accessorKey: "studentId",
    header: "Student ID",
    cell: ({ row }) => (
      <Typography variant="subtitle2">{row.original.studentId}</Typography>
    ),
  },
  { 
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => (
      <Typography variant="subtitle2">{row.original.firstName} {row.original.lastName}</Typography>
    ),
  },
  {
    accessorKey: "email",
    header: "Contact",
    cell: ({ row }) => (
      <Stack spacing={0}>
        <Typography variant="subtitle1">
          {`+${row.original.phone.slice(0, 1)} (${row.original.phone?.slice(1, 4)}) ${row.original.phone?.slice(4, 7)}-${row.original.phone?.slice(7, 11)}`}
          </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          <Mailto email={row.original.email} />
        </Typography>
      </Stack>
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
            {customer.schoolName}
          </span>
          <small>{customer.email}</small>
        </Stack>
      ) : (
        <span>N/A</span>
      );
    },
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
