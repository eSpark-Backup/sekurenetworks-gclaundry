import PropTypes from 'prop-types';

// project import
import Theme1 from './theme1';

// ==============================|| PRESET THEME - THEME SELECTOR ||============================== //

const Theme = (colors, presetColor, mode) => {
  return Theme1(colors, mode);
};

Theme.propTypes = {
  colors: PropTypes.object,
  presetColor: PropTypes.any
};

export default Theme;
