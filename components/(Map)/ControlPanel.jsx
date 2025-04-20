import React from 'react';
import { Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const ControlPanel = () => {
  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        right: 16, 
        top: '40%', 
        display: 'flex', 
        flexDirection: 'column',
        zIndex: 300,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        '& .MuiIconButton-root': {
          margin: '2px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#E0F2F1',
            transform: 'scale(1.1)',
          }
        }
      }}
    >
      <IconButton 
        color="primary" 
        aria-label="zoom-in"
        sx={{ color: '#00897B' }}
      >
        <AddIcon />
      </IconButton>
      <IconButton 
        color="primary" 
        aria-label="zoom-out"
        sx={{ color: '#00897B' }}
      >
        <RemoveIcon />
      </IconButton>
      <IconButton 
        color="primary" 
        aria-label="help"
        sx={{ color: '#00897B' }}
      >
        <HelpOutlineIcon />
      </IconButton>
    </Box>
  );
};

export default ControlPanel;
