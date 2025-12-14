import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { ImCompass2 } from 'react-icons/im';

// NOVATRIP Logo Component (React + MUI)
// Color: #20B2AA
// Layout: Compass icon (left) + Text (NOVATRIP)

export default function NovatripLogo({ size = 48, color = '#20B2AA', fontWeight = 700 }) {
  const iconSize = Math.round(size * 0.5);
  const textSize = Math.round(size * 0.5);

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      {/* Compass Icon */}
      <ImCompass2 size={iconSize} color={color} />

      {/* NOVATRIP Text */}
      <Typography
        component="span"
        sx={{
          fontFamily: 'Playfair Display,Arial, sans-serif',
          fontWeight: fontWeight,
          lineHeight: 1,
          letterSpacing: '0.02em',
          fontSize: `${textSize}px`,
          color: color,
          display: 'inline-block',
        }}
      >
        NOVATRIP
      </Typography>
    </Box>
  );
}

NovatripLogo.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  fontWeight: PropTypes.number,
};