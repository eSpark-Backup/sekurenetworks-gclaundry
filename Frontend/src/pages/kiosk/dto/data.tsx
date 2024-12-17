import color from "@/constants/color";
import { Customer } from "@/types/customer";
import { KIOSK } from "@/types/kiosk";
import { onSiteContact } from "@/types/onSiteContact";
import {
  EditTwoTone,
  FileTextTwoTone,
  HeartOutlined,
  WarningOutlined
} from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import { Badge, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

export const columns: ColumnDef<KIOSK>[] = [
  {
    accessorKey: "name",
    header: "Kiosk Name",
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
    accessorKey: "onSiteContact",
    header: "Contact",
    cell: ({ getValue }) => {
      const contact = getValue<onSiteContact>();
      return contact ? (
        <Stack direction="column" spacing={0}>
          <span>
            {contact.firstName} {contact.lastName}
          </span>
          <small>{contact.email}</small>
        </Stack>
      ) : (
        <span>N/A</span>
      );
    },
  },
  {
    accessorKey: "scented",
    header: "Scented",
    cell: ({ getValue }) => {
      const sheetCount = getValue<number>();
      const val =
        sheetCount > 100 || sheetCount < 0 ? "ERR" : sheetCount.toFixed() + "%";
      return <Typography>{val}</Typography>;
    },
  },
  {
    accessorKey: "unscented",
    header: "Unscented",
    cell: ({ getValue }) => {
      const sheetCount = getValue<number>();
      const val =
        sheetCount > 100 || sheetCount < 0 ? "ERR" : sheetCount.toFixed() + "%";
      return <Typography>{val}</Typography>;
    },
  },
  {
    accessorKey: "errors",
    header: "Error",
    cell: ({ getValue }) => {
      const errors: string[] = getValue<string[]>();
      return (
        <Tooltip
          title={
            errors.length ? (
              <div style={{ whiteSpace: "pre-line" }}>{errors.join("\n")}</div>
            ) : (
              "No Error"
            )
          }
          arrow
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            {errors.length ? (
              <WarningOutlined
                style={{
                  color: color.error,
                  fontSize: "24px",
                }}
              />
            ) : (
              <HeartOutlined
                style={{
                  color: color.success,
                  fontSize: "24px",
                }}
              />
            )}
          </div>
        </Tooltip>
      );
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ getValue }) => {
      return (
        <Tooltip title={getValue() == "ONLINE" ? "Online" : "Offline"} arrow>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Badge
              color={getValue() == "ONLINE" ? "success" : "error"}
              badgeContent=""
            />
          </div>
        </Tooltip>
      );
    },
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
                navigate(`/kiosk/view/${row.original?.macId}`);
              }}
            >
              <FileTextTwoTone twoToneColor={theme.palette.primary.main} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/kiosk/${row.original?.macId}`);
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
