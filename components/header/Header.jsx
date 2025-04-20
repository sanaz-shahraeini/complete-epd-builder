"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Tooltip,
  Button,
  FormControl,
  Select,
  MenuItem,
  Badge,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";
import ConstructionIcon from "@mui/icons-material/Construction";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DevicesIcon from "@mui/icons-material/Devices";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useProducts } from "../../useContexts/ProductsContext";

const Header = () => {
  const categories = [
    { id: "map", label: "Map", icon: MapIcon },
    {
      id: "construction",
      label: "Construction Products",
      icon: ConstructionIcon,
    },
    { id: "building", label: "Building Products", icon: ApartmentIcon },
    { id: "electronic", label: "Electronic Products", icon: DevicesIcon },
  ];
  const { loading } = useProducts();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedCategory, setSelectedCategory] = useState(categories[2].id);

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        backdropFilter: "blur(10px)",
        borderBottom: '1px solid var(--upload_bg)',
        color: 'var(--text-dark)',
        zIndex: 1100,
        height: "64px",
        display: { xs: "none", sm: "block" },
      }}
    >
      <Toolbar 
        sx={{ 
          justifyContent: "space-between", 
          minHeight: "64px",
          px: 2,
          position: 'relative'
        }}
      >
        {/* Left side - Logo/Brand */}
        <Box sx={{ display: "flex", alignItems: "center", minWidth: '180px' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'var(--dark-teal)',
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              component="span"
              sx={{
                width: 38,
                height: 28,
                background: 'var(--gradient-teal)',
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 1.5,
              }}
            >
              <Typography sx={{ color: "white", fontWeight: 700, fontSize: "14px" }}>
                EPD
              </Typography>
            </Box>
            Map Platform
          </Typography>
        </Box>

        {/* Center - Navigation */}
        {!isMobile && (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: "flex",
              gap: "8px",
              alignItems: 'center',
            }}
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  size="small"
                  onClick={() => setSelectedCategory(category.id)}
                  sx={{
                    color: isSelected ? 'var(--dark-teal)' : 'var(--text-medium)',
                    fontWeight: 500,
                    px: 2,
                    py: 1.5,
                    fontSize: "0.875rem",
                    backgroundColor: "transparent",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    textTransform: 'none',
                    minWidth: 'auto',
                    position: 'relative',
                    "&::after": isSelected ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: 'var(--primary-teal)',
                      borderRadius: '2px'
                    } : {},
                    "&:hover": {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: "20px",
                      color: isSelected ? 'var(--dark-teal)' : 'var(--text-medium)',
                    }}
                  />
                  {category.label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Right side - Actions */}
        <Box sx={{ display: "flex", alignItems: "center", minWidth: '180px', justifyContent: 'flex-end' }}>
          {!loading && (
            <Box sx={{ position: "relative", mr: 1 }}>
              <IconButton
                size="small"
                sx={{
                  backgroundColor: 'var(--upload_bg)',
                  mr: 1,
                  "&:hover": { 
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  },
                }}
              >
                <SearchIcon fontSize="small" sx={{ color: 'var(--text-medium)' }} />
              </IconButton>
            </Box>
          )}

          <Tooltip title="Help">
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'var(--upload_bg)',
                mr: 1,
                "&:hover": { 
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                },
              }}
            >
              <HelpOutlineIcon fontSize="small" sx={{ color: 'var(--text-medium)' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'var(--upload_bg)',
                mr: 2,
                "&:hover": { 
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                },
              }}
            >
              <NotificationsNoneIcon
                fontSize="small"
                sx={{ color: 'var(--text-medium)' }}
              />
            </IconButton>
          </Tooltip>

          <FormControl sx={{ mr: 2 }}>
            <Select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              displayEmpty
              variant="outlined"
              size="small"
              sx={{
                height: 36,
                fontSize: "0.875rem",
                fontWeight: 500,
                color: 'var(--text-medium)',
                backgroundColor: 'var(--upload_bg)',
                borderRadius: "8px",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&:hover": {
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                },
                "& .MuiSelect-icon": {
                  color: 'var(--text-medium)',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 2,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    mt: 0.5,
                  },
                },
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="de">Deutsch</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="es">Español</MenuItem>
            </Select>
          </FormControl>

          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: '#00BFB3',
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: '0 2px 8px rgba(0, 191, 179, 0.25)',
              }
            }}
          >
            <PersonOutlineIcon 
              sx={{ 
                fontSize: 24,
                color: '#FFFFFF',
              }} 
            />
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
