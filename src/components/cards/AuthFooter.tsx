// material-ui
import { Container, Link, Stack, Typography } from '@mui/material';

// ==============================|| FOOTER - AUTHENTICATION ||============================== //

const AuthFooter = () => {
  return (
    <Container maxWidth="xl">
      <Stack direction={'column'} justifyContent={'center'} spacing={2} textAlign={'center'}>
        <Typography variant="subtitle2" color="secondary" component="span">
          This site is protected by{' '}
          <Typography component={Link} variant="subtitle2" href="#mantis-privacy" target="_blank" underline="hover">
            Privacy Policy
          </Typography>
        </Typography>
      </Stack>
    </Container>
  );
};

export default AuthFooter;
