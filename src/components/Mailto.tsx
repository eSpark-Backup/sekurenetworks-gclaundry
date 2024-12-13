import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Mailto = ({ email, label }) => {
  return (
    <Link
      to="#"
      style={{ textDecoration: 'none' }}
      onClick={(e) => {
        window.location.href = `mailto:${email}`;
        e.preventDefault();
      }}
    >
      {label ? label : email}
    </Link>
  );
};

Mailto.propTypes = {
  email: PropTypes.string,
  label: PropTypes.string
};

export default Mailto;
