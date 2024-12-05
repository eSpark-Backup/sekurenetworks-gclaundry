// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { BarChartOutlined, BookOutlined, LayoutOutlined, NumberOutlined, UserOutlined } from '@ant-design/icons';

// icons
const icons = {
  LayoutOutlined,
  NumberOutlined,
  UserOutlined,
  BookOutlined,
  BarChartOutlined
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const other = {
  id: 'other',
  title: <FormattedMessage id="Admin" />,
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="Dashboard" />,
      type: 'item',
      url: '/dashboard',
      icon: icons.LayoutOutlined
    },
    {
      id: 'kiosk',
      title: <FormattedMessage id="Kiosk" />,
      type: 'item',
      url: '/kiosk',
      icon: icons.NumberOutlined,
      rotate: 180
    },
    {
      id: 'customers',
      title: <FormattedMessage id="Customers" />,
      type: 'item',
      url: '/customers',
      icon: icons.UserOutlined
    },
    {
      id: 'clients',
      title: <FormattedMessage id="Clients" />,
      type: 'item',
      url: '/clients',
      icon: icons.BookOutlined
    },
    {
      id: 'report',
      title: <FormattedMessage id="Kiosk Report" />,
      type: 'item',
      url: '/report',
      icon: icons.BarChartOutlined
    }
  ]
};
export default other;
