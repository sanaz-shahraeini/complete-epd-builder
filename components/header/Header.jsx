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
        backgroundColor: 'var(--bg_color)',
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
          px: { xs: 2, md: 4 },
          position: 'relative',
          gap: { xs: 2, md: 3, lg: 6 },
          maxWidth: '1800px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        {/* Left side - Logo/Brand */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          minWidth: { xs: '180px', md: '200px' },
          flex: '0 0 auto'
        }}>
          <Typography
            component="div"
            className="header-title"
            sx={{
              fontWeight: 600,
              color: 'var(--dark-teal)',
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              fontSize: "16px !important",
              lineHeight: 1.2,
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
              <Typography 
                component="span"
                sx={{ 
                  color: "white", 
                  fontWeight: 700, 
                  fontSize: "13px !important",
                  lineHeight: 1
                }}
              >
                EPD
              </Typography>
            </Box>
            <span style={{ whiteSpace: 'nowrap' }}>Map Platform</span>
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
              gap: { xs: '12px', sm: '16px', md: '24px' },
              alignItems: 'center',
              justifyContent: 'center',
              flex: '1 1 auto',
              maxWidth: { sm: '600px', md: '800px', lg: '1000px' },
              width: '100%',
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
                    px: 3,
                    py: 1.5,
                    fontSize: "0.875rem",
                    backgroundColor: "transparent",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    textTransform: 'none',
                    minWidth: category.id === 'map' ? '80px' : '160px',
                    width: 'auto',
                    justifyContent: 'center',
                    position: 'relative',
                    whiteSpace: 'nowrap',
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
                      backgroundColor: 'var(--light-teal)',
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
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          minWidth: { xs: '180px', md: '200px' }, 
          justifyContent: 'flex-end',
          gap: { xs: 1, sm: 1.5, md: 2 },
          flex: '0 0 auto'
        }}>
          {!loading && (
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'var(--upload_bg)',
                "&:hover": { 
                  backgroundColor: 'var(--bg_color)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                },
              }}
            >
              <SearchIcon fontSize="small" sx={{ color: 'var(--text-medium)' }} />
            </IconButton>
          )}

          <Tooltip title="Help">
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'var(--upload_bg)',
                "&:hover": { 
                  backgroundColor: 'var(--bg_color)',
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
                "&:hover": { 
                  backgroundColor: 'var(--bg_color)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                },
              }}
            >
              <Badge color="error" variant="dot">
                <NotificationsNoneIcon fontSize="small" sx={{ color: 'var(--text-medium)' }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <FormControl
            size="small"
            sx={{
              minWidth: 100,
              ml: 0.5,
              "& .MuiOutlinedInput-root": {
                backgroundColor: 'var(--upload_bg)',
                borderRadius: "4px",
                "& fieldset": { border: "none" },
                "&:hover": {
                  backgroundColor: 'var(--bg_color)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                },
              },
            }}
          >
            <Select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              sx={{
                "& .MuiSelect-select": {
                  py: 1,
                  pr: 3,
                  pl: 1.5,
                },
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="de">Deutsch</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
            </Select>
          </FormControl>

          <IconButton
            size="small"
            sx={{
              backgroundColor: 'var(--upload_bg)',
              "&:hover": { 
                backgroundColor: 'var(--bg_color)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              },
            }}
          >
            <PersonOutlineIcon fontSize="small" sx={{ color: 'var(--text-medium)' }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
