// project import
import "regenerator-runtime/runtime";
import Routes from "@/routes";
import ThemeCustomization from "@/themes";
import Locales from "@/components/Locales";
import ScrollTop from "@/components/ScrollTop";
import Snackbar from "@/components/@extended/Snackbar";
import "./index.css";

// auth provider
import { FirebaseProvider as AuthProvider } from "@/contexts/FirebaseContext";
import { KioskProvider } from "@/contexts/KioskContext";
import { CustomerProvider } from "@/contexts/CustomersContext";
import { ClientProvider } from "@/contexts/ClientsContext";

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => (
  <ThemeCustomization>
    <Locales>
      <ScrollTop>
        <AuthProvider>
          <Routes />
          <Snackbar />
          <ToastContainer theme="colored" position={"top-center"} />
        </AuthProvider>
      </ScrollTop>
    </Locales>
  </ThemeCustomization>
);

export default App;
