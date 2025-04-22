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
  Tooltip,
  Button,
  FormControl,
  Select,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";
import ConstructionIcon from "@mui/icons-material/Construction";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DevicesIcon from "@mui/icons-material/Devices";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
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
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedCategory, setSelectedCategory] = useState(categories[2].id);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setMobileDrawerOpen(false);
  };

  // Custom mobile drawer
  const mobileDrawer = (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={toggleMobileDrawer}
      sx={{
        "& .MuiDrawer-paper": {
          width: "280px",
          backgroundColor: "var(--bg_color)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          borderRight: "1px solid var(--upload_bg)",
        },
      }}
    >
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            component="span"
            sx={{
              width: 32,
              height: 24,
              background: 'var(--gradient-teal)',
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography 
              component="span"
              sx={{ 
                color: "white", 
                fontWeight: 700, 
                fontSize: "12px !important",
                lineHeight: 1
              }}
            >
              EPD
            </Typography>
          </Box>
          <Typography 
            sx={{ 
              fontWeight: 600, 
              color: 'var(--dark-teal)', 
              fontSize: '16px' 
            }}
          >
            Map Platform
          </Typography>
        </Box>
        <IconButton
          onClick={toggleMobileDrawer}
          sx={{ color: 'var(--text-medium)' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ borderColor: 'var(--upload_bg)' }} />
      
      {/* Category list */}
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 600, color: 'var(--text-medium)', fontSize: '12px', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Categories
        </Typography>
        
        <List sx={{ p: 0 }}>
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <ListItem 
                button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                sx={{ 
                  borderRadius: '8px',
                  mb: 0.5,
                  backgroundColor: isSelected ? 'var(--light-teal)' : 'transparent',
                  '&:hover': { backgroundColor: 'var(--light-teal)' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon sx={{ color: isSelected ? 'var(--dark-teal)' : 'var(--text-medium)' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={category.label} 
                  primaryTypographyProps={{ 
                    fontWeight: isSelected ? 600 : 500, 
                    color: isSelected ? 'var(--dark-teal)' : 'var(--text-dark)',
                    fontSize: '14px'
                  }} 
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
      
      <Divider sx={{ borderColor: 'var(--upload_bg)' }} />
      
      {/* Options */}
      <List sx={{ p: 2 }}>
        <ListItem 
          button
          sx={{ 
            borderRadius: '8px',
            mb: 0.5,
            '&:hover': { backgroundColor: 'var(--light-teal)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <AccountCircleIcon sx={{ color: 'var(--text-medium)' }} />
          </ListItemIcon>
          <ListItemText 
            primary="My Account" 
            primaryTypographyProps={{ 
              fontWeight: 500, 
              color: 'var(--text-dark)',
              fontSize: '14px'
            }}
          />
        </ListItem>
        
        <ListItem 
          button
          sx={{ 
            borderRadius: '8px',
            mb: 0.5,
            '&:hover': { backgroundColor: 'var(--light-teal)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SearchIcon sx={{ color: 'var(--text-medium)' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Search" 
            primaryTypographyProps={{ 
              fontWeight: 500, 
              color: 'var(--text-dark)',
              fontSize: '14px'
            }}
          />
        </ListItem>
      </List>
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Button 
          variant="outlined"
          fullWidth
          sx={{
            borderColor: 'var(--light-teal)',
            color: 'var(--dark-teal)',
            textTransform: 'none',
            '&:hover': {
              borderColor: 'var(--primary-teal)',
              backgroundColor: 'var(--light-teal)'
            }
          }}
        >
          Language: {selectedLanguage === 'en' ? 'English' : selectedLanguage === 'de' ? 'Deutsch' : 'Français'}
        </Button>
      </Box>
    </Drawer>
  );
  
  return (
    <>
      {mobileDrawer}
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
        }}
      >
        <Toolbar 
          sx={{ 
            justifyContent: "space-between", 
            minHeight: "64px",
            px: { xs: 1, sm: 2, md: 4 },
            position: 'relative',
            gap: { xs: 1, md: 2, lg: 6 },
            maxWidth: '1800px',
            margin: '0 auto',
            width: '100%'
          }}
        >
          {/* Left side - Logo/Brand and menu button */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            minWidth: { xs: 'auto', md: '200px' },
            flex: '0 0 auto',
            gap: 1
          }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleMobileDrawer}
              sx={{ 
                mr: 1, 
                display: { lg: 'none' } 
              }}
            >
              <MenuIcon />
            </IconButton>
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

          {/* Center - Navigation (large screens only) */}
          {isLargeScreen && (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                display: "flex",
                gap: { md: '12px', lg: '24px' },
                alignItems: 'center',
                justifyContent: 'center',
                flex: '1 1 auto',
                maxWidth: { md: '800px', lg: '1000px' },
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
                      px: { md: 2, lg: 3 },
                      py: 1.5,
                      fontSize: { md: "0.875rem" },
                      backgroundColor: "transparent",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: { md: "8px" },
                      textTransform: 'none',
                      minWidth: 'auto',
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

          {/* For tablet screens - Simplified nav */}
          {!isLargeScreen && !isMobile && (
            <Box sx={{ 
              display: "flex", 
              alignItems: "center",
              justifyContent: "center",
              flex: '1 1 auto',
            }}>
              <Button
                size="small"
                variant={selectedCategory === "map" ? "contained" : "text"}
                onClick={() => setSelectedCategory("map")}
                sx={{
                  mr: 1,
                  color: selectedCategory === "map" ? '#fff' : 'var(--text-medium)',
                  backgroundColor: selectedCategory === "map" ? 'var(--primary-teal)' : 'transparent',
                  '&:hover': {
                    backgroundColor: selectedCategory === "map" ? 'var(--dark-teal)' : 'var(--light-teal)',
                  }
                }}
              >
                <MapIcon sx={{ fontSize: 20, mr: 0.5 }} />
                Map
              </Button>
              <Button
                size="small"
                variant={selectedCategory !== "map" ? "contained" : "text"}
                onClick={toggleMobileDrawer}
                sx={{
                  color: selectedCategory !== "map" ? '#fff' : 'var(--text-medium)',
                  backgroundColor: selectedCategory !== "map" ? 'var(--primary-teal)' : 'transparent',
                  '&:hover': {
                    backgroundColor: selectedCategory !== "map" ? 'var(--dark-teal)' : 'var(--light-teal)',
                  }
                }}
              >
                Products
              </Button>
            </Box>
          )}

          {/* Right side - Actions */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            minWidth: { xs: 'auto', md: '200px' }, 
            justifyContent: 'flex-end',
            gap: { xs: 1, sm: 1.5, md: 2 },
            flex: '0 0 auto'
          }}>
            {!loading && !isMobile && (
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

            {!isMobile && (
              <Tooltip title="Help">
                <IconButton
                  size="small"
                  sx={{
                    backgroundColor: 'var(--upload_bg)',
                    "&:hover": { 
                      backgroundColor: 'var(--bg_color)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    },
                    display: { xs: 'none', sm: 'flex' }
                  }}
                >
                  <HelpOutlineIcon fontSize="small" sx={{ color: 'var(--text-medium)' }} />
                </IconButton>
              </Tooltip>
            )}

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

            {!isMobile && (
              <FormControl
                size="small"
                sx={{
                  minWidth: 100,
                  ml: 0.5,
                  display: { xs: 'none', md: 'block' },
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
            )}

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
    </>
  );
};

export default Header;
