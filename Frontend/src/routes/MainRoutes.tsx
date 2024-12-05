import { lazy } from "react";

// project import
import MainLayout from "@/layout/MainLayout";
import Loadable from "@/components/Loadable";
import AuthGuard from "@/utils/route-guard/AuthGuard";
import EditKiosk from "@/pages/kiosk/editKiosk";
import AddEditCustomer from "@/pages/customers/add-edit";
import AddEditClient from "@/pages/clients/add-edit"
import AppLogout from "../sections/auth/AppLogout";

const Kiosks = Loadable(lazy(() => import("@/pages/kiosk")));
const KioskDetail = Loadable(lazy(() => import("@/pages/kiosk/detail")));

const CustomerList = Loadable(lazy(() => import("@/pages/customers")));
const CustomerDetail = Loadable(lazy(() => import("@/pages/customers/details")));


const Clients = Loadable(lazy(() => import("@/pages/clients/list")));
const ClientDetail = Loadable(lazy(() => import("@/pages/clients/details")));
const Report = Loadable(lazy(() => import("@/pages/report/index")));
// render - sample page
const DefaultDashboard = Loadable(
  lazy(() => import("@/pages/dashboard/default"))
);

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: "/",
  children: [
    {
      path: "/",
      element: (
        <AuthGuard>
          <AppLogout>
            <MainLayout />
          </AppLogout>
        </AuthGuard>
      ),
      children: [
        {
          path: "dashboard",
          element: <DefaultDashboard />,
        },
        {
          path: "kiosk",
          element: <Kiosks />,
        },
        {
          path: "kiosk/:id",
          element: <EditKiosk />,
        },
        {
          path: "kiosk/view/:id",
          element: <KioskDetail />,
        },
        {
          path: "customers",
          element: <CustomerList />,
        },
        {
          path: "customer",
          element: <AddEditCustomer />,
        },
        {
          path: "customer/:id",
          element: <AddEditCustomer />,
        },
        {
          path: "customer/view/:id",
          element: <CustomerDetail />,
        },
        {
          path: "clients",
          element: <Clients />,
        },
        {
          path: "client",
          element: <AddEditClient />,
        },
        {
          path: "client/:id",
          element: <AddEditClient />,
        },
        {
          path: "client/view/:id",
          element: <ClientDetail />,
        },
        {
          path: "report",
          element: <Report />,
        },
      ],
    },
  ],
};

export default MainRoutes;
