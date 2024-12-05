import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';

// project import
import LogoMain from './LogoMain';
import LogoIcon from './LogoIcon';
import config from '@/constants/config';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = ({ reverse, isIcon, sx, to }: {reverse: boolean,isIcon: boolean,sx: any,to: string }) => (
  <ButtonBase disableRipple component={Link} to={!to ? config.defaultPath : to} sx={sx}>
    {isIcon ? <LogoIcon /> : <LogoMain reverse={reverse} />}
  </ButtonBase>
);

export default LogoSection;
