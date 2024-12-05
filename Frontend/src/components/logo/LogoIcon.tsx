// material-ui
import { useTheme } from '@mui/material/styles';

import logoIcon from '@/assets/images/logo-icon.svg';

// ==============================|| LOGO ICON SVG ||============================== //

const LogoIcon = () => {
  const theme = useTheme();

  return <img src={theme.palette.mode === 'dark' ? logoIcon : logoIcon} alt="Generation Conscious" width="100" />;
};

export default LogoIcon;
