import { lazy } from 'react';

// project import
import GuestGuard from '@/utils/route-guard/GuestGuard';
import Loadable from '@/components/Loadable';
import { Outlet } from 'react-router-dom';

// render - login
const AuthLogin = Loadable(lazy(() => import('@/pages/auth/login')));
const AuthForgotPassword = Loadable(lazy(() => import('@/pages/auth/forgot-password')));
const AuthCheckMail = Loadable(lazy(() => import('@/pages/auth/check-mail')));
const AuthResetPassword = Loadable(lazy(() => import('@/pages/auth/reset-password')));
const AuthCodeVerification = Loadable(lazy(() => import('@/pages/auth/code-verification')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <GuestGuard>
          <Outlet />
        </GuestGuard>
      ),
      children: [
        {
          path: '/',
          element: <AuthLogin />
        },
        {
          path: 'login',
          element: <AuthLogin />
        },
        {
          path: 'forgot-password',
          element: <AuthForgotPassword />
        },
        {
          path: 'check-mail',
          element: <AuthCheckMail />
        },
        {
          path: 'reset-password',
          element: <AuthResetPassword />
        },
        {
          path: 'code-verification',
          element: <AuthCodeVerification />
        }
      ]
    }
  ]
};

export default LoginRoutes;
