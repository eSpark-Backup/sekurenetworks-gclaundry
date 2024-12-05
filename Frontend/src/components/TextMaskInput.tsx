import { FormHelperText } from '@mui/material';
import { forwardRef } from 'react';
import MaskedInput from 'react-text-mask';

export const TextMaskCustom = forwardRef((props, ref) => (
  <MaskedInput
    {...props}
    mask={[
      '(',
      /[1-9]/,
      /\d/,
      /\d/,
      ')',
      ' ',
      /\d/,
      /\d/,
      /\d/,
      '-',
      /\d/,
      /\d/,
      /\d/,
      /\d/,
    ]}
    placeholderChar={'\u2000'}
    showMask
  />

));
