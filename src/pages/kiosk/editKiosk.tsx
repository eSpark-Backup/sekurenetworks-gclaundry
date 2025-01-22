import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { SyntheticEvent, useState } from "react";

import MainCard from "@/components/MainCard";
import AddEditKiosk from "./components/general";
import Questions from "./components/questions";
import Quotes from "./components/quotes";
import Sequence from "./components/sequence";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tab-panel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};
const TabItems = [
  {
    label: "General",
    element: <AddEditKiosk />,
  },
  {
    label: "Questions",
    element: <Questions />,
  },
  {
    label: "Environmental Messages",
    element: <Quotes />,
  },
  {
    label: "Survey Question – Environmental Message",
    element: <Sequence />,
  },
];

const KioskDetails = () => {
  const [tab, setTab] = useState(0);

  return (
    <MainCard sx={{ width: "100%", minHeight: "75vh" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={(event: SyntheticEvent, tabIndex: number) =>
            setTab(tabIndex)
          }
        >
          {TabItems.map(({ label }, i) => (
            <Tab label={label} key={i} />
          ))}
        </Tabs>
      </Box>

      {TabItems.map(({ element }, i) => (
        <TabPanel value={tab} index={i} key={i}>
          {element}
        </TabPanel>
      ))}
    </MainCard>
  );
};

export default KioskDetails;
