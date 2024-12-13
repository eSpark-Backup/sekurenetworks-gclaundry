import { useEffect } from 'react';
import useAuth from '../../hooks/useAuth';

const events = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress'];

const AppLogout = ({ children }) => {
  const { logout } = useAuth();

  useEffect(() => {
    let timer;

    const fn = () => {
      if (timer) clearTimeout(timer);

      timer = setTimeout(logout, 15 * 60 * 1000); // 15 min.
    };

    // register events to trigger logout
    Object.values(events).forEach((item) => window.addEventListener(item, fn));

    // remove events on component unmount
    return () => Object.values(events).forEach((item) => window.removeEventListener(item, fn));
  }, [logout]);

  return children;
};
export default AppLogout;
