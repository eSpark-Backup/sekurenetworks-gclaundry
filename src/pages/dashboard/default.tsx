import { useEffect, useState } from "react";
// material-ui
import { Grid, LinearProgress } from "@mui/material";

// project import
import apiService from "@/api/apiService";
import ApiLoader from "@/components/api-loader";
import AnalyticEcommerce from "@/components/cards/statistics/AnalyticEcommerce";
import { useRequest } from "ahooks";

interface KioskStatus {
  kiosk: {
    total: number;
    online: number;
    offline: number;
  };
  totalClients: number;
  totalCustomers: number;
  totalLowInventoryKiosk: number;
  totalSheetsUsed: number;
  totalWaterSaved: number;
  totalCarbonDioxideAvoided: number;
  totalPlasticSheetsEliminated: number;
}

const DashboardDefault = () => {
  const { loading, runAsync } = useRequest(apiService.dashboard.get, {
    manual: true,
  });
  const [data, setData] = useState<KioskStatus>();

  useEffect(() => {
    (async () => {
      let { data } = await runAsync();
      setData(data);
    })();
  }, [setData]);

  if (!data) return <LinearProgress />;

  return (
    <ApiLoader isLoading={loading}>
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>

      <Grid item xs={12} sm={6} md={4} lg={4}>
          <AnalyticEcommerce
            title="Low Inventory Kiosks"
            to="/kiosk?error=LowInventory"
            count={`${data.totalLowInventoryKiosk}`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={4}>
          <AnalyticEcommerce
            title="Offline Kiosks"
            to="/kiosk?status=offline"
            count={`${data.kiosk.offline}`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={4}>
          <AnalyticEcommerce
            title="Online Kiosks"
            to="/kiosk?status=online"
            count={`${data.kiosk.online}`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={4}>
          <AnalyticEcommerce
            title="Total Sheets Used (SUCCESS)"
            // to="/clients"
            count={`${data.totalSheetsUsed}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <AnalyticEcommerce
            title="Total Water Saved (grams)"
            // to="/clients"
            count={`${data.totalWaterSaved.toFixed(2)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <AnalyticEcommerce
            title="Total Carbon Dioxide Avoided (kilograms)"
            // to="/clients"
            count={`${data.totalCarbonDioxideAvoided.toFixed(2)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <AnalyticEcommerce
            title="Total Plastic Eliminated"
            // to="/clients"
            count={`${data.totalPlasticSheetsEliminated.toFixed(2)}`}
          />
        </Grid>
      </Grid>
    </ApiLoader>
  );
};

export default DashboardDefault;
