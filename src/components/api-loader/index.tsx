import PropTypes from "prop-types";
import { Box, LinearProgress } from "@mui/material";

const ApiLoader = ({ isLoading, children, ...otherProps }) => {
  if (isLoading)
    return (
      <Box {...otherProps}>
        <LinearProgress />
      </Box>
    );

  return children;
};

export default ApiLoader;
ApiLoader.propTypes = {
  isLoading: PropTypes.bool,
  children: PropTypes.node,
};
