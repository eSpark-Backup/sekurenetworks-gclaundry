import { ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import { Card, CardContent, CardHeader, Divider, Typography, SxProps } from '@mui/material';
import Highlighter from './third-party/Highlighter';
import { Link } from 'react-router-dom';

interface MainCardProps {
  border?: boolean;
  boxShadow?: boolean;
  children: ReactNode;
  subheader?: ReactNode;
  content?: boolean;
  contentSX?: SxProps;
  darkTitle?: boolean;
  divider?: boolean;
  elevation?: number;
  secondary?: ReactNode;
  shadow?: string;
  sx?: SxProps;
  title?: ReactNode;
  codeHighlight?: boolean;
  codeString?: string;
  to?: string;
  [key: string]: any; // To accept other props
}

// header style
const headerSX = {
  p: 2.5,
  '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' }
};

// ==============================|| CUSTOM - MAIN CARD ||============================== //
const MainCard = ({
    border = true,
    boxShadow,
    children,
    subheader,
    content = true,
    contentSX = {},
    darkTitle,
    divider = true,
    elevation,
    secondary,
    shadow,
    sx = {},
    title,
    codeHighlight = false,
    codeString,
    to = '',
    ...others
  }: MainCardProps) => {
  const theme:any = useTheme();
  boxShadow = theme.palette.mode === 'dark' ? boxShadow || true : boxShadow;

  const card = (
    <Card
      elevation={elevation || 0}
      {...others}
      sx={{
        position: 'relative',
        border: border ? '1px solid' : 'none',
        borderRadius: 1,
        borderColor: theme.palette.mode === 'dark' ? theme.palette.divider : theme.palette.grey.A800,
        boxShadow: boxShadow && (!border || theme.palette.mode === 'dark') ? shadow || theme.customShadows.z1 : 'inherit',
        ':hover': {
          boxShadow: boxShadow ? shadow || theme.customShadows.z1 : 'inherit'
        },
        '& pre': {
          m: 0,
          p: '12px !important',
          fontFamily: theme.typography.fontFamily,
          fontSize: '0.75rem'
        },
        ...sx
      }}
    >
      {/* card header and action */}
      {!darkTitle && title && (
        <CardHeader
          sx={headerSX}
          titleTypographyProps={{ variant: 'subtitle1' }}
          title={title}
          action={secondary}
          subheader={subheader}
        />
      )}
      {darkTitle && title && <CardHeader sx={headerSX} title={<Typography variant="h3">{title}</Typography>} action={secondary} />}

      {/* content & header divider */}
      {title && divider && <Divider />}

      {/* card content */}
      {content && <CardContent sx={contentSX}>{children}</CardContent>}
      {!content && children}

      {/* card footer - clipboard & highlighter  */}
      {codeString && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Highlighter codeString={codeString} codeHighlight={codeHighlight} />
        </>
      )}
    </Card>
  );

  return to ? (
    <Link to={to} style={{ color: 'inherit', textDecoration: 'none' }}>
      {card}
    </Link>
  ) : (
    card
  );
};

export default MainCard;
