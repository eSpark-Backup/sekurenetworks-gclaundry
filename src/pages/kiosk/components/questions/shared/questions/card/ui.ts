import { Box, styled } from "@mui/material";

export const StyledoptionWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "is_valid",
})(({ theme, is_valid }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: "0.5rem 1rem",
  paddingLeft: "1.5rem",
  marginLeft: "-1rem",
  borderRadius: "0.2rem",

  border: is_valid ? `1px solid ${theme.palette.success.main}` : "none",
  color: is_valid ? theme.palette.success.main : theme.palette.text.main,

  "& > li": {
    fontWeight: is_valid ? 600 : 400,
  },
}));
