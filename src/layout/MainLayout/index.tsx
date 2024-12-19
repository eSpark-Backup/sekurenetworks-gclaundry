import { useEffect, useLayoutEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Container, Divider, Grid, Toolbar, Typography, useMediaQuery } from '@mui/material';

// project import
import Drawer from './Drawer';
import Header from './Header';
import Footer from './Footer';
import navigation from '../../menu-items';
import useConfig from '@/hooks/useConfig';
import Breadcrumbs from '@/components/@extended/Breadcrumbs';
import { openDrawer } from '@/store/reducers/menu';
import { setSelectedKisko } from '@/store/reducers/common';

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('xl'));

  const { container, miniDrawer } = useConfig();
  const dispatch = useDispatch();
  const location = useLocation();



  const menu = useSelector((state) => state.menu);
  const common = useSelector((state) => state.common);
  const { drawerOpen } = menu;

  const isKioskPath = /^\/kiosk\/[a-zA-Z0-9:]+$/.test(location.pathname);

  // drawer toggler
  const [open, setOpen] = useState(!miniDrawer || drawerOpen);
  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      setOpen(!matchDownLG);
      dispatch(openDrawer({ drawerOpen: !matchDownLG }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchDownLG]);

  useEffect(() => {
    if (open !== drawerOpen) setOpen(drawerOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  useLayoutEffect(() => {
    dispatch(setSelectedKisko({ kisko: null }));
  }, [location.pathname]);

  const headingSx = { mb: '26px', pt: '8px', mt: '2px' };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      <Drawer open={open} handleDrawerToggle={handleDrawerToggle} />
      <Box component="main" sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar />
        {container && (
          <Container
            maxWidth="lg"
            sx={{ px: { xs: 0, sm: 2 }, position: 'relative', minHeight: 'calc(100vh - 110px)', display: 'flex', flexDirection: 'column' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // Space between left and center items
                width: '100%', // Ensures proper alignment across the container width
                flexDirection: { xs: 'column', md: 'row' }, // Flex direction column on mobile, row on larger screens
              }}
            >
              {/* Left-aligned Component */}
              <Breadcrumbs navigation={navigation} title titleBottom card={false} divider={false} />


              {/* Center-aligned Components */}
              {
                isKioskPath &&
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                  }}
                >

                  <Grid item sx={headingSx}>
                    <Typography variant="h2">{common?.kisko?.customerName}</Typography>
                  </Grid>


                  {
                    common?.kisko?.customerName &&
                    <Grid item sx={headingSx}>
                      <Typography variant="h2" sx={{mx:1}}>{" - "} </Typography>
                    </Grid>
                  }



                  <Grid item sx={headingSx}>
                    <Typography variant="h2">{common?.kisko?.name}</Typography>
                  </Grid>

                </Box>
              }

            </Box>


            <Outlet />
            <Footer />
          </Container>
        )}
        {!container && (
          <Box sx={{ position: 'relative', minHeight: 'calc(100vh - 110px)', display: 'flex', flexDirection: 'column' }}>
            <Breadcrumbs navigation={navigation} title titleBottom card={false} divider={false} />
            <Outlet />
            <Footer />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MainLayout;
