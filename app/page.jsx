"use client";
import { useState, useRef, Suspense, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Fade,
  useMediaQuery,
  useTheme,
  Grid,
} from "@mui/material";
import dynamic from "next/dynamic";
import MainSidebar from "../components/(Slider)/MainSidebar";
import VerticalIcons from "../components/mapDetail/VerticalIcons";
import SearchBar from "../components/mapDetail/SearchBar";
import countryCoordinates from "../public/data/countryCoordinates";
import Header from "../components/header/Header";
import "../styles/css/colors.css";
import { SearchProvider, useSearch } from "../useContexts/SearchContext";
import { ProductsProvider } from "../useContexts/ProductsContext";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import SearchIcon from "@mui/icons-material/Search";

// Dynamic imports for components that need to be client-side only
const VerticalToggleButtons = dynamic(
  () =>
    import("../components/(Map)/VerticalToggleButtons").catch((err) => {
      console.error("Failed to load VerticalToggleButtons component:", err);
      return () => <div>Error loading buttons</div>;
    }),
  {
    ssr: false, // This ensures the component only renders on the client
    loading: () => <div></div>,
  }
);

// Dynamic import for Map component to avoid server-side rendering issues
const Map = dynamic(
  () =>
    import("../components/(Map)/Map").catch((err) => {
      console.error("Failed to load Map component:", err);
      return () => <div>Error loading map</div>;
    }),
  {
    ssr: false,
    loading: () => <div>Loading map...</div>,
  }
);

// Client-side only component to avoid SSR issues
const ClientOnly = ({ children, fallback = <div></div> }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? children : fallback;
};

const IndexPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const mapRef = useRef(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [selectedSidebar, setSelectedSidebar] = useState("Legend");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [yearRange, setYearRange] = useState([2000, 2050]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [mapZoom, setMapZoom] = useState(3);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [filterEpdOnly, setFilterEpdOnly] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    // When sidebar is closed, reset the category to "all" and turn off EPD filter
    // to show all markers on the map
    setSelectedCategory("all");
    setFilterEpdOnly(false);
  };

  const handleSidebarSelect = (tab) => {
    setSelectedSidebar(tab);
    setIsSidebarOpen(true);
  };

  useEffect(() => {
    // Mark as initially loading
    setIsInitialLoading(true);
    
    // On initial load, ensure the info card is hidden
    setShowInfoCard(false);
    
    // Watch for data loading state from the ProductsContext
    const dataLoadingCheckTimer = setInterval(() => {
      // Check if map is ready
      if (mapRef.current) {
        console.log("Map is ready, ensuring info card is hidden");
        setShowInfoCard(true);
        
        // After a delay, mark initial loading as complete
        setTimeout(() => {
          setIsInitialLoading(false);
          console.log("Initial loading complete");
        }, 1000); // Reduce delay to 1 second
        
        clearInterval(dataLoadingCheckTimer);
      }
    }, 1000); // Check every second
    
    // Also set a fallback timeout in case detection fails
    const fallbackTimer = setTimeout(() => {
      console.log("Fallback timer triggered to hide info card");
      setShowInfoCard(false);
      setIsInitialLoading(false);
      clearInterval(dataLoadingCheckTimer);
    }, 3000); // Reduce timeout to 3 seconds
    
    // Add event listener to hide info card when products are loaded
    const handleProductsLoaded = () => {
      console.log("Products loaded, hiding info card");
      setShowInfoCard(false);
      // Make sure to set isInitialLoading to false when products are loaded
      setIsInitialLoading(false);
    };
    
    // Add listener for resetFilters event from SearchBar
    const handleResetFilters = (event) => {
      console.log("Resetting filters from:", event.detail.source);
      
      // Only reset filters if they're actually active
      if (selectedCategory !== "all" || filterEpdOnly) {
        setSelectedCategory("all");
        setFilterEpdOnly(false);
        
        // If this was triggered by a search focus/click, let the UI update before searching
        if (event.detail.source === 'searchFocus' || event.detail.source === 'searchClick') {
          console.log("Search initiated filter reset, allowing UI to update");
        }
      } else {
        console.log("Filters already reset, no action needed");
      }
    };
    
    // Add listener for showAllMarkers event
    const handleShowAllMarkers = (event) => {
      console.log("Showing all markers, triggered by:", event.detail.source);
      
      // Ensure we're showing all markers by setting default states
      setSelectedCategory("all");
      setFilterEpdOnly(false);
      setSelectedCountry("");
      setSelectedProduct("");
      
      // If the map has a reset method, call it
      if (mapRef.current && mapRef.current.resetView) {
        console.log("Calling map resetView method");
        mapRef.current.resetView();
      }
      
      // Hide info card when showing all markers
      setShowInfoCard(false);
    };
    
    // Add listener for the infoCardToggled event from VerticalToggleButtons
    const handleInfoCardToggled = (event) => {
      console.log("Info card toggled from button, setting visibility to:", event.detail.visible);
      // Make sure we're not in initial loading state
      if (!isInitialLoading) {
        setShowInfoCard(event.detail.visible);
      }
    };
    
    window.addEventListener('productsLoaded', handleProductsLoaded);
    window.addEventListener('resetFilters', handleResetFilters);
    window.addEventListener('showAllMarkers', handleShowAllMarkers);
    window.addEventListener('infoCardToggled', handleInfoCardToggled);
    
    // Clean up all timers and event listeners if the component unmounts
    return () => {
      clearInterval(dataLoadingCheckTimer);
      clearTimeout(fallbackTimer);
      window.removeEventListener('productsLoaded', handleProductsLoaded);
      window.removeEventListener('resetFilters', handleResetFilters);
      window.removeEventListener('showAllMarkers', handleShowAllMarkers);
      window.removeEventListener('infoCardToggled', handleInfoCardToggled);
    };
  }, []);
  
  // Add effect to show the InfoCard when a product is selected
  useEffect(() => {
    // Only check if initial loading is complete
    if (isInitialLoading) {
      console.log("Skipping info card update during initial loading");
      return;
    }
    
    if (selectedProduct) {
      console.log(`Product selected: "${selectedProduct}", showing info card`);
      setShowInfoCard(true);
    } else if (selectedCategory && selectedCategory !== "all") {
      // Keep the info card visible for category filters
      console.log(`Category filter active: "${selectedCategory}", showing info card`);
      setShowInfoCard(true);
    } else if (filterEpdOnly) {
      // Keep the info card visible when EPD filter is active
      console.log("EPD filter active, showing info card");
      setShowInfoCard(true);
    } else {
      // Only hide the card if no filters are active
      console.log("No active filters or selected product, hiding info card");
      setShowInfoCard(false);
    }
  }, [selectedProduct, selectedCategory, filterEpdOnly, isInitialLoading]);

  // Make a function to directly control the map zoom
  const controlMapZoom = (direction) => {
    console.log(`Controlling map zoom: ${direction}`);
    
    // Use the global wrapper object if available
    if (typeof window !== 'undefined' && window.mapWrapper) {
      console.log("Using window.mapWrapper");
      if (direction === "in") {
        return window.mapWrapper.zoomIn(1);
      } else {
        return window.mapWrapper.zoomOut(1);
      }
    }
    
    // Use the global controlMapZoom function if available
    if (typeof window !== 'undefined' && typeof window.controlMapZoom === 'function') {
      console.log("Using window.controlMapZoom method");
      return window.controlMapZoom(direction);
    }
    
    // Try to use the window.mapInstance directly
    if (typeof window !== 'undefined' && window.mapInstance) {
      try {
        const map = window.mapInstance;
        console.log("Using window.mapInstance directly");
        
        if (direction === "in") {
          if (typeof map.zoomIn === 'function') {
            map.zoomIn(1);
            return true;
          }
          
          // Fallback to setView
          const currentZoom = map.getZoom ? map.getZoom() : 3;
          map.setView(map.getCenter(), currentZoom + 1);
          return true;
        } else {
          if (typeof map.zoomOut === 'function') {
            map.zoomOut(1);
            return true;
          }
          
          // Fallback to setView
          const currentZoom = map.getZoom ? map.getZoom() : 3;
          map.setView(map.getCenter(), currentZoom - 1);
          return true;
        }
      } catch (error) {
        console.error("Error using window.mapInstance:", error);
      }
    }
    
    // Try Leaflet's DOM controls as a last resort
    if (typeof document !== 'undefined') {
      if (direction === "in") {
        const zoomInButton = document.querySelector(".leaflet-control-zoom-in");
        if (zoomInButton) {
          console.log("Clicking Leaflet's zoom in button");
          zoomInButton.click();
          return true;
        }
      } else {
        const zoomOutButton = document.querySelector(".leaflet-control-zoom-out");
        if (zoomOutButton) {
          console.log("Clicking Leaflet's zoom out button");
          zoomOutButton.click();
          return true;
        }
      }
    }
    
    // Last resort - update the zoom state directly
    console.warn("All zoom methods failed, updating state directly");
    setMapZoom(prev => direction === "in" ? Math.max(1, prev - 1) : Math.min(10, prev + 1));
    return false;
  };

  return (
    <ProductsProvider>
      <SearchProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            backgroundColor: "#fafafa",
          }}
        >
          {/* Header */}
          <Header />

          {/* Main Content */}
          <Box
            sx={{
              flexGrow: 1,
              mt: "64px",
              position: "relative",
              display: "flex",
              overflow: "hidden",
            }}
          >
            {/* Vertical Icons Sidebar */}
            <Box
              sx={{
                position: "relative",
                height: "100%",
                zIndex: 100,
                width: { xs: "70px", sm: "80px" },
              }}
            >
              <VerticalIcons
                toggleSidebar={toggleSidebar}
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                setCategories={setCategories}
                categories={categories}
                setSelectedSidebar={handleSidebarSelect}
                setFilterEpdOnly={setFilterEpdOnly}
                filterEpdOnly={filterEpdOnly}
              />
            </Box>

            {/* Search Bar */}
            <Box
              sx={{
                zIndex: 2,
                position: "absolute",
                top: "0px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%"
              }}
            >
              <SearchBar mapRef={mapRef} filterEpdOnly={filterEpdOnly} selectedCategory={selectedCategory} />
            </Box>

            {/* Main Content */}
            <Grid
              container
              sx={{
                display: "flex",
                flex: 1,
                position: "relative",
                height: "685px",
                zIndex: 1,
              }}
            >
              {/* Sidebar and Icons--- */}
              <Grid container sx={{ display: "flex", flexDirection: "row" }}>
                {/* Main Sidebar */}
                {isSidebarOpen && (
                  <Box
                    sx={{
                      zIndex: 150,
                      width: "250px",
                      position: "relative",
                      top: "0",
                      marginLeft: "0px",
                    }}
                  >
                    <MainSidebar
                      selected={selectedSidebar}
                      onSelect={setSelectedSidebar}
                      yearRange={yearRange}
                      setYearRange={setYearRange}
                      selectedCountry={selectedCountry}
                      setSelectedCountry={setSelectedCountry}
                      selectedProduct={selectedProduct}
                      setSelectedProduct={setSelectedProduct}
                      countryCoordinates={countryCoordinates}
                      selectedCategory={selectedCategory}
                      setIsSidebarOpen={setIsSidebarOpen}
                      filterEpdOnly={filterEpdOnly}
                      setFilterEpdOnly={setFilterEpdOnly}
                    />
                  </Box>
                )}
              </Grid>

              {/* Map */}
              <Grid
                item
                xs={12}
                sx={{
                  position: "absolute",
                  zIndex: 1,
                  top: 0,
                  left: 0,
                  height: "100%",
                }}
              >
                <ClientOnly>
                  <section
                    style={{
                      height: "100vh",
                      width: "100vw",
                      position: "fixed",
                      zIndex: 1,
                      top: 0,
                      left: 0,
                    }}
                  >
                    <Map
                      ref={mapRef}
                      selectedCountry={selectedCountry}
                      selectedProduct={selectedProduct}
                      yearRange={yearRange}
                      selectedCategory={selectedCategory}
                      setCategories={setCategories}
                      categories={categories}
                      zoom={mapZoom}
                      setZoom={setMapZoom}
                      filterEpdOnly={filterEpdOnly}
                    />
                  </section>
                </ClientOnly>
              </Grid>

              {/* Toggle Buttons */}
              <Grid
                item
                sx={{
                  position: "fixed",
                  bottom: "20px",
                  right: "20px",
                  zIndex: 1,
                }}
              >
                <ClientOnly>
                  <Suspense fallback={<div></div>}>
                    <VerticalToggleButtons
                      mapZoom={mapZoom}
                      setMapZoom={setMapZoom}
                      selectedProduct={selectedProduct}
                      setShowInfoCard={setShowInfoCard}
                      showInfoCard={showInfoCard}
                      selectedCountry={selectedCountry}
                      selectedCategory={selectedCategory}
                      yearRange={yearRange}
                      isSidebarOpen={isSidebarOpen}
                      mapRef={mapRef}
                      controlMapZoom={controlMapZoom}
                    />
                  </Suspense>
                </ClientOnly>
              </Grid>

              {/* Info Card */}
              <ClientOnly>
                {showInfoCard && (
                  <InfoCard 
                    showInfoCard={showInfoCard}
                    setShowInfoCard={setShowInfoCard}
                    selectedCountry={selectedCountry}
                    selectedProduct={selectedProduct}
                    selectedCategory={selectedCategory}
                    yearRange={yearRange}
                    filterEpdOnly={filterEpdOnly}
                  />
                )}
              </ClientOnly>
            </Grid>
          </Box>
        </Box>
      </SearchProvider>
    </ProductsProvider>
  );
};

// Create a separate InfoCard component that can access the search context
const InfoCard = ({ 
  showInfoCard, 
  setShowInfoCard, 
  selectedCountry, 
  selectedProduct, 
  selectedCategory, 
  yearRange,
  filterEpdOnly
}) => {
  const { searchQuery, searchResults } = useSearch();
  // Add ref to store product count
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Effect to update product count based on what's visible on the map
  useEffect(() => {
    // Try to access map markers data from window if available
    const updateFilteredCount = () => {
      try {
        // This assumes there's some global state with marker count
        // We'll fallback to search results length if available
        if (searchResults && searchResults.length > 0) {
          setFilteredCount(searchResults.length);
        }
      } catch (error) {
        console.log("Could not determine filtered count");
      }
    };
    
    // Update count immediately and whenever search results change
    updateFilteredCount();
    
    // Set up event listener for marker updates
    window.addEventListener('markersUpdated', updateFilteredCount);
    
    return () => {
      window.removeEventListener('markersUpdated', updateFilteredCount);
    };
  }, [searchResults]);
  
  if (!showInfoCard) return null;
  
  // Determine card header and content based on filters/search
  const getCardTitle = () => {
    if (searchQuery && searchResults && searchResults.length > 0) {
      return `Search Results (${searchResults.length})`;
    } else if (selectedProduct) {
      return `Product Details`;
    } else if (selectedCategory && selectedCategory !== "all") {
      return `${selectedCategory} Products`;
    } else if (filterEpdOnly) {
      return "EPD Products";
    } else {
      return "Global Product Map";
    }
  };

  // Determine the card description based on current filters
  const getCardDescription = () => {
    if (searchQuery && searchResults && searchResults.length > 0) {
      return `Showing ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}". These are the only products currently displayed on the map.`;
    } else if (selectedProduct) {
      return `Viewing details for "${selectedProduct}". This product is currently highlighted on the map.`;
    } else if (selectedCategory && selectedCategory !== "all") {
      return `Viewing products from the ${selectedCategory} category. Use the sidebar to explore more details.`;
    } else if (filterEpdOnly) {
      return `Showing Environmental Product Declarations (EPDs) with valid period between ${yearRange[0]} — ${yearRange[1]}.`;
    } else {
      return "Welcome to the Global Product Map! Here you can explore products and Environmental Product Declarations (EPDs) across different categories and countries.";
    }
  };

  // Determine icon to use
  const getCardIcon = () => {
    if (searchQuery && searchResults && searchResults.length > 0) {
      return <SearchIcon sx={{ fontSize: "18px" }} />;
    } else if (selectedProduct) {
      return <ViewInArIcon sx={{ fontSize: "18px" }} />;
    } else if (selectedCategory && selectedCategory !== "all" || filterEpdOnly) {
      // Use filter icon for categories or EPD filter
      return <ViewInArIcon sx={{ fontSize: "18px" }} />;
    } else {
      return <ViewInArIcon sx={{ fontSize: "18px" }} />;
    }
  };
  
  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        top: { xs: "150px", sm: "120px" }, // Responsive positioning
        right: { xs: "16px", sm: "80px", md: "120px" }, // Responsive right positioning
        zIndex: 2,
        padding: "15px",
        maxWidth: { xs: "calc(100% - 32px)", sm: "350px" }, // Full width on mobile, fixed on desktop
        background: "linear-gradient(145deg, rgba(222, 241, 241, 0.97), rgba(247, 247, 247, 0.97))",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0, 124, 119, 0.15)",
        border: "1px solid rgba(43, 190, 183, 0.2)",
        transition: "all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0)",
        maxHeight: "calc(100vh - 200px)",
        overflowY: "auto",
        "&:hover": {
          boxShadow: "0 12px 35px rgba(0, 124, 119, 0.25)",
        }
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "var(--dark-teal)",
          mb: 1.5,
          fontSize: "18px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1,
          letterSpacing: "-0.01em",
        }}
      >
        <Box 
          sx={{
            background: "var(--gradient-teal)",
            color: "white",
            borderRadius: "8px",
            p: 0.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0, 124, 119, 0.2)",
          }}
        >
          {getCardIcon()}
        </Box>
        {getCardTitle()}
      </Typography>
      
      <Box 
        sx={{ 
          mb: 1.5,
          p: 1.5,
          borderRadius: "8px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          border: "1px solid rgba(200, 227, 51, 0.2)",
        }}
      >
        <Typography
          variant="body2"
          sx={{ 
            color: "var(--text-dark)", 
            mb: 0,
            lineHeight: 1.4,
            fontSize: "13px",
          }}
        >
          {getCardDescription()}
        </Typography>
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ 
            color: "var(--dark-teal)",
            mb: 1,
            fontWeight: 600,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            "&:before": {
              content: '""',
              display: "block",
              width: "3px",
              height: "16px",
              backgroundColor: "var(--accent-lime)",
              borderRadius: "2px",
              marginRight: "6px",
            },
          }}
        >
          Current View
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {searchQuery ? (
            <Chip
              label={`Search: ${searchQuery}`}
              size="small"
              sx={{
                backgroundColor: "rgba(0, 124, 119, 0.1)",
                color: "var(--dark-teal)",
                fontWeight: 500,
                border: "1px solid var(--dark-teal)",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                borderRadius: "8px",
                height: "24px",
                "& .MuiChip-label": {
                  padding: "0 8px",
                  fontSize: "12px",
                },
              }}
            />
          ) : (
            <>
              {selectedCategory && selectedCategory !== "all" && (
                <Chip
                  label={`Category: ${selectedCategory}`}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(101, 184, 125, 0.15)",
                    color: "var(--medium-green)",
                    fontWeight: 500,
                    border: "1px solid var(--medium-green)",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    borderRadius: "8px",
                    height: "24px",
                    "& .MuiChip-label": {
                      padding: "0 8px",
                      fontSize: "12px",
                    },
                  }}
                />
              )}
              {filterEpdOnly && (
                <Chip
                  label="EPD Filter Active"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(101, 184, 125, 0.15)",
                    color: "var(--medium-green)",
                    fontWeight: 500,
                    border: "1px solid var(--medium-green)",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    borderRadius: "8px",
                    height: "24px",
                    "& .MuiChip-label": {
                      padding: "0 8px",
                      fontSize: "12px",
                    },
                  }}
                />
              )}
              {(!selectedCategory || selectedCategory === "all") && !filterEpdOnly && (
                <>
                  <Chip
                    label={selectedCountry || "All Countries"}
                    size="small"
                    sx={{
                      backgroundColor: "white",
                      color: "var(--dark-teal)",
                      fontWeight: 500,
                      border: "1px solid var(--light-teal)",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                      borderRadius: "8px",
                      height: "24px",
                      "& .MuiChip-label": {
                        padding: "0 8px",
                        fontSize: "12px",
                      },
                      "&:hover": {
                        backgroundColor: "var(--light-teal)",
                      },
                    }}
                  />
                  <Chip
                    label={selectedProduct || "All Products"}
                    size="small"
                    sx={{
                      backgroundColor: "white",
                      color: "var(--dark-teal)",
                      fontWeight: 500,
                      border: "1px solid var(--light-teal)",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                      borderRadius: "8px",
                      height: "24px",
                      "& .MuiChip-label": {
                        padding: "0 8px",
                        fontSize: "12px",
                      },
                      "&:hover": {
                        backgroundColor: "var(--light-teal)",
                      },
                    }}
                  />
                </>
              )}
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ 
            color: "var(--dark-teal)",
            mb: 1,
            fontWeight: 600,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            "&:before": {
              content: '""',
              display: "block",
              width: "3px",
              height: "16px",
              backgroundColor: "var(--primary-teal)",
              borderRadius: "2px",
              marginRight: "6px",
            },
          }}
        >
          {searchQuery ? "Search Tips" : "Quick Tips"}
        </Typography>
        <Box 
          sx={{ 
            backgroundColor: "white",
            borderRadius: "8px",
            p: 1,
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          }}
        >
          {searchQuery ? (
            <>
              <Typography
                variant="body2"
                sx={{ 
                  color: "var(--text-dark)", 
                  mb: 0.5,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  "&:before": {
                    content: '""',
                    display: "block",
                    width: "5px",
                    height: "5px",
                    backgroundColor: "var(--accent-lime)",
                    borderRadius: "50%",
                  },
                }}
              >
                Click on markers to view product details
              </Typography>
              <Typography
                variant="body2"
                sx={{ 
                  color: "var(--text-dark)", 
                  mb: 0.5,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  "&:before": {
                    content: '""',
                    display: "block",
                    width: "5px",
                    height: "5px",
                    backgroundColor: "var(--accent-lime)",
                    borderRadius: "50%",
                  },
                }}
              >
                Clear the search to see all products
              </Typography>
              <Typography
                variant="body2"
                sx={{ 
                  color: "var(--text-dark)", 
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  "&:before": {
                    content: '""',
                    display: "block",
                    width: "5px",
                    height: "5px",
                    backgroundColor: "var(--accent-lime)",
                    borderRadius: "50%",
                  },
                }}
              >
                Use zoom controls to get a better view
              </Typography>
            </>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{ 
                  color: "var(--text-dark)", 
                  mb: 0.5,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  "&:before": {
                    content: '""',
                    display: "block",
                    width: "5px",
                    height: "5px",
                    backgroundColor: "var(--accent-lime)",
                    borderRadius: "50%",
                  },
                }}
              >
                Click on countries to view specific data
              </Typography>
              <Typography
                variant="body2"
                sx={{ 
                  color: "var(--text-dark)", 
                  mb: 0.5,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  "&:before": {
                    content: '""',
                    display: "block",
                    width: "5px",
                    height: "5px",
                    backgroundColor: "var(--accent-lime)",
                    borderRadius: "50%",
                  },
                }}
              >
                Use the sidebar categories to filter products
              </Typography>
              <Typography
                variant="body2"
                sx={{ 
                  color: "var(--text-dark)", 
                  mb: 0.5,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  "&:before": {
                    content: '""',
                    display: "block",
                    width: "5px",
                    height: "5px",
                    backgroundColor: "var(--accent-lime)",
                    borderRadius: "50%",
                  },
                }}
              >
                Toggle EPD mode to focus on environmental declarations
              </Typography>
              <Typography
                variant="body2"
                sx={{ 
                  color: "var(--text-dark)", 
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  "&:before": {
                    content: '""',
                    display: "block",
                    width: "5px",
                    height: "5px",
                    backgroundColor: "var(--accent-lime)",
                    borderRadius: "50%",
                  },
                }}
              >
                Use zoom controls to adjust the map view
              </Typography>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ 
            color: "var(--dark-teal)",
            mb: 1,
            fontWeight: 600,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            "&:before": {
              content: '""',
              display: "block",
              width: "3px",
              height: "16px",
              backgroundColor: "var(--medium-green)",
              borderRadius: "2px",
              marginRight: "6px",
            },
          }}
        >
          {(searchQuery || selectedCategory !== "all" || filterEpdOnly) ? "Filtered Data" : "Time Period"}
        </Typography>
        
        {/* Enhanced Filtered Data display */}
        {(searchQuery || selectedCategory !== "all" || filterEpdOnly) ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Filter summary box */}
            <Box 
              sx={{ 
                backgroundColor: "rgba(101, 184, 125, 0.1)",
                borderRadius: "8px",
                px: 1.5,
                py: 0.75,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(101, 184, 125, 0.2)",
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: "var(--text-dark)", 
                  fontWeight: 500, 
                  fontSize: "12px",
                  textAlign: "center",
                  mb: searchResults && searchResults.length > 0 ? 0.5 : 0
                }}
              >
                {searchResults && searchResults.length > 0 
                  ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`
                  : "Viewing filtered results"}
              </Typography>
              
              {searchQuery && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "var(--dark-teal)", 
                    fontWeight: 600, 
                    fontSize: "11px",
                    textAlign: "center",
                    backgroundColor: "rgba(0, 124, 119, 0.08)",
                    px: 1,
                    py: 0.25,
                    borderRadius: "4px",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  "{searchQuery}"
                </Typography>
              )}
              
              {!searchQuery && filteredCount > 0 && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "var(--dark-teal)", 
                    fontWeight: 600, 
                    fontSize: "11px", 
                  }}
                >
                  {filteredCount} product{filteredCount !== 1 ? 's' : ''} visible
                </Typography>
              )}
            </Box>
            
            {/* Filter details */}
            <Box sx={{ 
              backgroundColor: "white",
              borderRadius: "8px",
              p: 1,
              border: "1px solid rgba(0, 124, 119, 0.1)",
            }}>
              {/* Display country if selected */}
              {selectedCountry && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <Box
                    sx={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "var(--accent-orange)",
                      mr: 1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "var(--text-dark)",
                      fontSize: "11px",
                      fontWeight: 500,
                    }}
                  >
                    Country: <span style={{ fontWeight: 600 }}>{selectedCountry}</span>
                  </Typography>
                </Box>
              )}
              
              {/* Display selected product if any */}
              {selectedProduct && (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Box
                      sx={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "var(--accent-lime)",
                        mr: 1,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "var(--text-dark)",
                        fontSize: "11px",
                        fontWeight: 500,
                      }}
                    >
                      Product: <span style={{ fontWeight: 600 }}>{selectedProduct}</span>
                    </Typography>
                  </Box>
                  
                  {/* Add product details badge if a product is selected */}
                  <Box 
                    sx={{ 
                      backgroundColor: "rgba(200, 227, 51, 0.15)",
                      borderRadius: "6px",
                      p: 0.75,
                      mb: 0.75,
                      border: "1px dashed rgba(200, 227, 51, 0.5)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.25
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "var(--dark-teal)",
                        fontSize: "10px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}
                    >
                      Selected Product Details
                    </Typography>
                    
                    {/* EPD Status Badge */}
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      backgroundColor: filterEpdOnly ? "rgba(101, 184, 125, 0.2)" : "rgba(255, 255, 255, 0.5)",
                      borderRadius: "4px",
                      px: 0.75,
                      py: 0.5,
                      mt: 0.25,
                      mb: 0.5,
                      border: filterEpdOnly ? "1px solid rgba(101, 184, 125, 0.4)" : "1px solid rgba(0, 0, 0, 0.1)",
                    }}>
                      <Box sx={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: filterEpdOnly ? "var(--medium-green)" : "var(--text-medium)",
                        mr: 1
                      }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: filterEpdOnly ? "var(--medium-green)" : "var(--text-medium)",
                          fontSize: "10px",
                          fontWeight: 600
                        }}
                      >
                        {filterEpdOnly ? "EPD VERIFIED" : "EPD STATUS UNKNOWN"}
                      </Typography>
                    </Box>
                    
                    <Typography
                      variant="body2"
                      sx={{
                        color: "var(--text-dark)",
                        fontSize: "11px",
                        lineHeight: 1.4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ 
                        display: "inline-block", 
                        width: "12px", 
                        height: "12px", 
                        borderRadius: "2px",
                        backgroundColor: "var(--primary-teal)",
                        marginRight: "6px",
                        opacity: 0.6
                      }}></span>
                      Click on map marker for detailed information
                    </Typography>
                    
                    {selectedCategory !== "all" && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "var(--text-dark)",
                          fontSize: "11px",
                          lineHeight: 1.4,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ 
                          display: "inline-block", 
                          width: "12px", 
                          height: "12px", 
                          borderRadius: "2px",
                          backgroundColor: "var(--primary-teal)",
                          marginRight: "6px",
                          opacity: 0.6
                        }}></span>
                        Category: {selectedCategory}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              
              {/* Display category if selected */}
              {selectedCategory !== "all" && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <Box
                    sx={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-teal)",
                      mr: 1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "var(--text-dark)",
                      fontSize: "11px",
                      fontWeight: 500,
                    }}
                  >
                    Category: <span style={{ fontWeight: 600 }}>{selectedCategory}</span>
                  </Typography>
                </Box>
              )}
              
              {/* Display if EPD filter is active */}
              {filterEpdOnly && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <Box
                    sx={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-teal)",
                      mr: 1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "var(--text-dark)",
                      fontSize: "11px",
                      fontWeight: 500,
                    }}
                  >
                    EPD Mode: <span style={{ fontWeight: 600 }}>Active</span>
                  </Typography>
                </Box>
              )}
              
              {/* Display year range */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <Box
                  sx={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary-teal)",
                    mr: 1,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "var(--text-dark)",
                    fontSize: "11px",
                    fontWeight: 500,
                  }}
                >
                  Year range: <span style={{ fontWeight: 600 }}>{yearRange[0]} — {yearRange[1]}</span>
                </Typography>
              </Box>
              
              {/* Timestamp */}
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "flex-end",
                mt: 0.5,
                pt: 0.5,
                borderTop: "1px dashed rgba(0, 124, 119, 0.1)"
              }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "var(--text-medium)",
                    fontSize: "10px",
                    fontStyle: "italic"
                  }}
                >
                  Updated at {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box 
            sx={{ 
              backgroundColor: "rgba(0, 124, 119, 0.08)",
              borderRadius: "8px",
              px: 1.5,
              py: 0.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: "var(--text-dark)", 
                fontWeight: 500, 
                fontSize: "12px",
                textAlign: "center" 
              }}
            >
              {`${yearRange[0]} — ${yearRange[1]}`}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Typography
          variant="caption"
          sx={{
            color: "var(--primary-teal)",
            fontWeight: 600,
            cursor: "pointer",
            py: 0.25,
            px: 0.75,
            borderRadius: "4px",
            transition: "all 0.2s ease",
            fontSize: "11px",
            "&:hover": {
              backgroundColor: "rgba(43, 190, 183, 0.1)",
            },
          }}
          onClick={() => setShowInfoCard(false)}
        >
          Hide this card
        </Typography>
      </Box>
    </Paper>
  );
};

export default IndexPage;
