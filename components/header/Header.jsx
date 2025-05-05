"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import GridViewIcon from "@mui/icons-material/GridView";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { useProducts } from "../../useContexts/ProductsContext";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { ROUTES } from "@/i18n/navigation";
import dynamic from 'next/dynamic';
import { useUserStore } from "@/lib/store/user";

// Dynamically import forms with no SSR to avoid translation errors during server rendering
const SignInForm = dynamic(() => import("@/components/sign/SignInForm"), { ssr: false });
const SignUpForm = dynamic(() => import("@/components/sign/SignUpForm"), { ssr: false });

// Define constants outside component to prevent re-creation on each render
const CATEGORIES = [
  { id: "map", label: "Map", icon: MapIcon },
  {
    id: "construction",
    label: "Construction Products",
    icon: ConstructionIcon,
  },
  { id: "building", label: "Building Products", icon: ApartmentIcon },
  { id: "electronic", label: "Electronic Products", icon: DevicesIcon },
];

// Sidebar categories based on the image
const SIDEBAR_CATEGORIES = [
  { id: "all", label: "All", icon: GridViewIcon },
  { id: "norm", label: "Norm...", icon: FormatListBulletedIcon },
  { id: "beton", label: "Beton...", icon: ViewInArIcon },
  { id: "baur", label: "Baur...", icon: ViewInArIcon },
  { id: "o2build", label: "O2 Buil...", icon: ViewInArIcon },
  { id: "epd", label: "EPD", icon: ViewInArIcon },
];

const Header = () => {
  const { loading } = useProducts();
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Move all media queries inside useEffect to prevent hydration mismatch
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isTabletScreen, setIsTabletScreen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  
  // State initialization
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[2].id);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [selectedSidebarCategory, setSelectedSidebarCategory] = useState("all");
  const [showSignInForm, setShowSignInForm] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [formsLoaded, setFormsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Get showSignInModal from user store - only after mounting
  const showSignInModal = useUserStore((state) => state.showSignInModal);
  const setShowSignInModal = useUserStore((state) => state.setShowSignInModal);

  // Handle media queries after mount
  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      setIsSmallScreen(window.matchMedia(theme.breakpoints.down("sm").replace("@media ", "")).matches);
      setIsTabletScreen(window.matchMedia(theme.breakpoints.between("sm", "md").replace("@media ", "")).matches);
      setIsLargeScreen(window.matchMedia(theme.breakpoints.up("lg").replace("@media ", "")).matches);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme.breakpoints]);
  
  // Monitor authentication status
  useEffect(() => {
    // Check and set the authentication status based on NextAuth session
    const checkAuthentication = async () => {
      if (status === "authenticated" && session && session.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkAuthentication();
  }, [session, status]);
  
  useEffect(() => {
    // Pre-load the forms
    Promise.all([
      import("@/components/sign/SignInForm"),
      import("@/components/sign/SignUpForm")
    ]).then(() => {
      setFormsLoaded(true);
    });
    
    // Check for authentication tokens in local storage
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      // Only update state if needed to avoid infinite loop
      if (!accessToken && isAuthenticated) {
        setIsAuthenticated(false);
      }
    }
    
    // Fix: Empty dependency array to run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Add separate effect for authentication changes
  useEffect(() => {
    // Check for authentication tokens in local storage
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      // Only update state if needed to avoid infinite loop
      if (!accessToken && isAuthenticated) {
        setIsAuthenticated(false);
      }
    }
  }, [isAuthenticated]);

  // Add effect to sync showSignInModal from store with local showSignInForm state
  useEffect(() => {
    if (showSignInModal) {
      // When the global showSignInModal is set to true, set the local state as well
      console.log('showSignInModal is true, setting showSignInForm to true');
      setShowSignInForm(true);
      
      // Reset the global state to avoid future side effects
      setShowSignInModal(false);
    }
  }, [showSignInModal, setShowSignInModal]);

  const handleLanguageChange = useCallback((event) => {
    const newLocale = event.target.value;
    
    // Get the current path
    const pathname = window.location.pathname;
    
    // Extract segments after /epd/[locale]/
    const segments = pathname.split('/');
    
    // Find the current locale index
    const localeIndex = segments.findIndex((segment, index) => 
      index > 0 && (segment === 'en' || segment === 'de' || segment === 'fr')
    );
    
    if (localeIndex !== -1) {
      // Replace the locale segment
      segments[localeIndex] = newLocale;
      
      // Reconstruct the path
      const newPath = segments.join('/');
      
      // Navigate to the new path
      router.push(newPath);
    } else {
      // If locale not found in the path, go to the homepage with new locale
      router.push(`/epd/${newLocale}`);
    }
  }, [router]);

  const toggleMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(prev => !prev);
  }, []);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setMobileDrawerOpen(false);
  }, []);
  
  const handleSidebarCategorySelect = useCallback((category) => {
    setSelectedSidebarCategory(category);
  }, []);

  const handleAvatarClick = useCallback((event) => {
    event.preventDefault(); // Prevent default navigation
    
    // Check authentication status
    if (status === "authenticated" && session?.user) {
      // User is authenticated, navigate to profile
      console.log('User is authenticated, navigating to profile');
      
      // Direct browser to profile page using window.location to avoid React rendering issues
      // This bypasses the Next.js Router which might cause the rendering loop
      window.location.href = `/epd/${locale}/dashboard/profile`;
    } else {
      // User is not authenticated, show sign-in modal
      console.log('User is not authenticated, showing sign-in modal');
      setShowSignInForm(true);
      
      // Also set global sign-in modal state
      setShowSignInModal(true);
    }
  }, [status, session, locale, setShowSignInModal]);
  
  const handleCloseSignInForm = useCallback(() => {
    setShowSignInForm(false);
  }, []);
  
  const handleCloseSignUpForm = useCallback(() => {
    setShowSignUpForm(false);
  }, []);

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
        <Typography sx={{ fontWeight: 600, color: 'var(--text-medium)', fontSize: '14px', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          CATEGORIES
        </Typography>
        
        <List sx={{ p: 0 }}>
          {SIDEBAR_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedSidebarCategory === category.id;
            
            return (
              <ListItem 
                button
                key={category.id}
                onClick={() => handleSidebarCategorySelect(category.id)}
                sx={{ 
                  borderRadius: '8px',
                  mb: 0.5,
                  backgroundColor: isSelected ? 'var(--light-teal)' : 'transparent',
                  '&:hover': { backgroundColor: 'var(--light-teal)' },
                  height: "48px",
                  padding: "6px 8px",
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'white' : 'var(--light-teal)',
                    color: 'var(--dark-teal)',
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>
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
      
      <Divider sx={{ borderColor: 'var(--upload_bg)', mt: 1 }} />
      
      {/* Standard categories */}
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 600, color: 'var(--text-medium)', fontSize: '12px', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Navigation
        </Typography>
        
        <List sx={{ p: 0 }}>
          {CATEGORIES.map((category) => {
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
          onClick={handleAvatarClick}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <AccountCircleIcon sx={{ color: 'var(--text-medium)' }} />
          </ListItemIcon>
          <ListItemText 
            primary={status === "authenticated" ? "My Account" : "Sign In"} 
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
        <div style={{
          border: "1px solid var(--light-teal)",
          borderRadius: "4px",
          padding: "8px 16px",
          width: "100%",
          position: "relative"
        }}>
          <select
            value={locale}
            onChange={handleLanguageChange}
            name="mobile-language"
            style={{
              backgroundColor: "transparent",
              border: "none",
              width: "100%",
              fontSize: "14px",
              color: "var(--dark-teal)",
              padding: "4px 0",
              outline: "none",
              appearance: "none",
              cursor: "pointer"
            }}
          >
            <option value="en">Language: English</option>
            <option value="de">Language: Deutsch</option>
            <option value="fr">Language: Français</option>
          </select>
          <div style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none"
          }}>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </Box>
    </Drawer>
  );
  
  // Only render content after mounting to prevent hydration mismatch
  if (!mounted) {
    return null; // or a loading skeleton that matches server-side render
  }

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
              {CATEGORIES.map((category) => {
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
          {!isLargeScreen && !isSmallScreen && (
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
            {!loading && !isSmallScreen && (
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

            {!isSmallScreen && (
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

            {!isSmallScreen && (
              <div
                style={{
                  minWidth: 100,
                  marginLeft: 8,
                  display: 'block',
                  position: 'relative'
                }}
              >
                <select
                  value={locale}
                  onChange={handleLanguageChange}
                  name="language"
                  style={{
                    backgroundColor: 'var(--upload_bg)',
                    borderRadius: "4px",
                    border: "none",
                    padding: "8px 28px 8px 12px",
                    appearance: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "var(--text-medium)",
                    width: "100%"
                  }}
                >
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                </select>
                <div style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none"
                }}>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            )}

            <Tooltip title={isAuthenticated ? "My Account" : "Sign In"}>
              <IconButton
                size="small"
                onClick={handleAvatarClick}
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
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {mounted && (
        <>
          <div style={{ display: 'none' }}>
            <SignInForm open={false} onClose={() => {}} setShowSignUp={() => {}} />
            <SignUpForm open={false} onClose={() => {}} setShowSignIn={() => {}} setShowSignUp={() => {}} />
          </div>
          
          <SignInForm
            open={showSignInForm && formsLoaded}
            onClose={handleCloseSignInForm}
            setShowSignUp={(show) => {
              setShowSignInForm(false);
              setShowSignUpForm(show);
            }}
            callbackUrl={ROUTES.DASHBOARD_ROUTES.PROFILE}
          />
          
          <SignUpForm
            open={showSignUpForm && formsLoaded}
            onClose={handleCloseSignUpForm}
            setShowSignIn={(show) => {
              setShowSignUpForm(false);
              setShowSignInForm(show);
            }}
            setShowSignUp={setShowSignUpForm}
          />
        </>
      )}
    </>
  );
};

// Export with improved memoization 
export default React.memo(Header);
