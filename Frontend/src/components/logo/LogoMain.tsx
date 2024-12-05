import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';

import logo from '@/assets/images/logo.svg';

// ==============================|| LOGO SVG ||============================== //

const LogoMain = () => {
  const theme = useTheme();
  return <img src={theme.palette.mode === 'dark' ? logo : logo} alt="GC Logo" width="100" />;
};

LogoMain.propTypes = {
  reverse: PropTypes.bool
};

export default LogoMain;
