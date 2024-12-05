import { IReport } from "@/types/IReports";
import { Grid, Paper, Typography } from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";


const COLORS = ["#0088FE", "#FFBB28"];
export const columns: ColumnDef<IReport>[] = [
  {
    accessorKey: "name",
    header: "Kiosk Name",
    cell: ({ getValue }) => (
      <Typography variant="subtitle2">{getValue<string>()}</Typography>
    ),
  },
  {
    accessorKey: "scented",
    header: "Scented Dispensed",
    cell: ({ getValue }) => <Typography>{getValue<number>()}</Typography>,
  },
  {
    accessorKey: "unscented",
    header: "Unscented Dispensed",
    cell: ({ getValue }) => <Typography>{getValue<number>()}</Typography>,
  },
  {
    accessorKey: "surveys",
    header: "Total Questions Asked",
    cell: ({ getValue }) => {
      const surveys = getValue<{ count: number; question: string }[]>();
      const count = surveys.reduce((sum, item) => sum + item.count, 0);
      return <Typography>{count}</Typography>;
    },
  },
  {
    accessorKey: "env",
    header: "Total Enviromental Message Displayed",
    cell: ({ getValue }) => {
      const qoutes = getValue<{ count: number; qoute: string }[]>();
      const count = qoutes.reduce((sum, item) => sum + item.count, 0);
      return <Typography>{count}</Typography>;
    },
  },
  {
    accessorKey: "success",
    header: "Total Succesfull Transactions",
    cell: ({ getValue }) => <Typography>{getValue<number>()}</Typography>,
  },
  {
    accessorKey: "failed",
    header: "Total Failed Transactions",
    cell: ({ getValue }) => <Typography>{getValue<number>()}</Typography>,
  },
];

export const reportRow = (data: IReport) => {
  const sheetData = [
    { name: "Scented", value: data.scented },
    { name: "Unscented", value: data.unscented },
  ];

  const successData = [
    { name: "Success", value: data.success },
    { name: "Failed", value: data.failed },
  ];
  const surveyChart = data.surveys.map((e) => {
    return {
      title: e.question,
      data: e.answers.map((i) => {
        return { name: i.answer, value: i.count };
      }),
    };
  });

  return (
    <Grid container spacing={3}>
      {/* Top Row - Pie Charts */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 5, height: "330px" }}>
          <Typography variant="h6" gutterBottom sx={{ p: 0 }}>
            Sheets Used (Total: {data.scented + data.unscented})
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sheetData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {sheetData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 5, height: "330px" }}>
          <Typography variant="h6" gutterBottom>
            Status Chart
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={successData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {successData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Bottom Row - Line Charts */}
      {surveyChart.map((_, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              height: "400px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Question: {_.title}
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={_.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};
