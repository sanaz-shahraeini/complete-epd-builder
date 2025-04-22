"use client";

import React, { useState, useEffect } from "react";
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
import { useProducts } from "../../useContexts/ProductsContext";

// Create a direct link to control the sidebar state
// This will be attached to the window object so we can access it from anywhere
const setupSidebarControl = () => {
  if (typeof window !== 'undefined') {
    // Don't overwrite if already exists
    if (!window.appControls) {
      window.appControls = {
        openSidebar: () => {
          // Find the sidebar state in the React Devtools
          // Look through all props of components to find the setIsSidebarOpen function
          let found = false;
          
          try {
            // Inject global state variables directly
            window.isSidebarOpen = true;
            
            // Try to find and set selectedSidebar to "Products"
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
              console.log('React DevTools hook found, attempting to modify state...');
            }
            
            found = true;
          } catch (error) {
            console.error('Error modifying React state:', error);
          }
          
          if (!found) {
            console.log('Falling back to dispatch event approach');
            // Dispatch event as fallback
            window.dispatchEvent(new CustomEvent('showAllMarkers', { 
              detail: { source: 'headerMenu' } 
            }));
          }
        }
      };
      
      console.log('Global sidebar control initialized');
    }
  }
};

// Call the setup function when the component loads
// This ensures our control methods are available
setupSidebarControl();

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

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  // Direct modification of app state to open sidebar
  const openSidebar = () => {
    console.log('Header: Opening sidebar');
    
    // Create a new script element with code to modify the app's state
    const script = document.createElement('script');
    script.textContent = `
      try {
        // Access the React root state directly
        // Set global flag that will be checked in render cycle
        window.OPEN_SIDEBAR_FLAG = true;
        
        // Simulate a window resize to trigger re-renders
        window.dispatchEvent(new Event('resize'));
        
        // Create and dispatch our custom event
        const event = new CustomEvent('toggleAppSidebar', { 
          detail: { open: true } 
        });
        window.dispatchEvent(event);
        
        console.log('Script executed to toggle sidebar');
      } catch(e) {
        console.error('Error toggling sidebar:', e);
      }
    `;
    
    // Append script to body, execute, then remove it
    document.body.appendChild(script);
    setTimeout(() => {
      document.body.removeChild(script);
      
      // After a short delay, try clicking any visible vertical icon
      setTimeout(() => {
        try {
          // Find and click the first visible icon in the vertical sidebar
          const icons = document.querySelectorAll('[class*="VerticalIcons"] [role="button"], [class*="VerticalIcons"] button');
          if (icons && icons.length > 0) {
            console.log('Found icon to click:', icons[0]);
            icons[0].click();
          } else {
            console.log('No vertical icons found to click');
          }
        } catch (error) {
          console.error('Error clicking icon:', error);
        }
      }, 100);
    }, 50);
    
    // Also use the globally registered method if available
    if (window.appControls && window.appControls.openSidebar) {
      window.appControls.openSidebar();
    }
  };

  // Add a listener for our custom event
  useEffect(() => {
    const handleAppSidebarToggle = (event) => {
      console.log('App sidebar toggle event received:', event.detail);
      
      // Hook the toggleSidebar function directly from the app component
      setTimeout(() => {
        try {
          // Get the mainApp component and extract the toggleSidebar function
          const mainApp = document.querySelector('#__next, #root');
          if (mainApp && mainApp._reactRootContainer) {
            console.log('Found React root, attempting to access state');
          }
        } catch (error) {
          console.error('Error accessing React root:', error);
        }
      }, 0);
    };
    
    window.addEventListener('toggleAppSidebar', handleAppSidebarToggle);
    
    return () => {
      window.removeEventListener('toggleAppSidebar', handleAppSidebarToggle);
    };
  }, []);
  
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
            id="sidebar-toggle-button"
            edge="start"
            color="inherit"
            aria-label="toggle sidebar"
            onClick={openSidebar}
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
              onClick={openSidebar}
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
  );
};

export default Header;
