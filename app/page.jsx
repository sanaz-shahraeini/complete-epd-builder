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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import dynamic from "next/dynamic";
import MainSidebar from "../components/(Slider)/MainSidebar";
import VerticalIcons from "../components/mapDetail/VerticalIcons";
import SearchBar from "../components/mapDetail/SearchBar";
import countryCoordinates from "../public/data/countryCoordinates";
import Header from "../components/header/Header";
import "../styles/css/colors.css";
import { SearchProvider } from "../useContexts/SearchContext";
import { ProductsProvider } from "../useContexts/ProductsContext";
import ViewInArIcon from "@mui/icons-material/ViewInAr";

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

  const [selectedSidebar, setSelectedSidebar] = useState("Legend");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [yearRange, setYearRange] = useState([2000, 2050]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [mapZoom, setMapZoom] = useState(3);
  const [showInfoCard, setShowInfoCard] = useState(true);
  const [filterEpdOnly, setFilterEpdOnly] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSidebarSelect = (tab) => {
    setSelectedSidebar(tab);
    setIsSidebarOpen(true);
  };

  useEffect(() => {
    // Show the info card when the component mounts
    setShowInfoCard(true);
    
    // Watch for data loading state from the ProductsContext
    const dataLoadingCheckTimer = setInterval(() => {
      // Check if data has loaded in the ProductsContext (allProducts exists and isn't empty)
      if (mapRef.current) {
        // If the map is ready and rendered, hide the info card
        console.log("Map is ready, hiding info card");
        setShowInfoCard(false);
        clearInterval(dataLoadingCheckTimer);
      }
    }, 1000); // Check every second
    
    // Also set a fallback timeout in case detection fails
    const fallbackTimer = setTimeout(() => {
      console.log("Fallback timer triggered to hide info card");
      setShowInfoCard(false);
      clearInterval(dataLoadingCheckTimer);
    }, 8000); // 8 seconds as fallback
    
    // Clean up both timers if the component unmounts
    return () => {
      clearInterval(dataLoadingCheckTimer);
      clearTimeout(fallbackTimer);
    };
  }, []); // Empty dependency array means this runs once on component mount

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
              <SearchBar mapRef={mapRef} />
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
                size={{ xs: 12 }}
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
                    />
                  </Suspense>
                </ClientOnly>
              </Grid>

              {/* Info Card */}
              <Fade in={showInfoCard}>
                <Paper
                  elevation={3}
                  sx={{
                    position: "fixed",
                    top: "180px",
                    right: "120px",
                    zIndex: 2,
                    padding: "15px",
                    maxWidth: "350px",
                    background: "linear-gradient(145deg, rgba(222, 241, 241, 0.97), rgba(247, 247, 247, 0.97))",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(0, 124, 119, 0.15)",
                    border: "1px solid rgba(43, 190, 183, 0.2)",
                    transition: "all 0.3s ease-in-out",
                    opacity: showInfoCard ? 1 : 0,
                    transform: showInfoCard ? "translateY(0)" : "translateY(-20px)",
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
                      <ViewInArIcon sx={{ fontSize: "18px" }} />
                    </Box>
                    Global Product Map
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
                      Welcome to the Global Product Map! Here you can explore
                      products and Environmental Product Declarations (EPDs)
                      across different categories and countries.
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
                      <Chip
                        label={selectedCategory || "All Categories"}
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
                      Time Period
                    </Typography>
                    <Box 
                      sx={{ 
                        backgroundColor: "rgba(101, 184, 125, 0.1)",
                        borderRadius: "8px",
                        px: 1.5,
                        py: 0.75,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "var(--text-dark)", fontWeight: 500, fontSize: "12px" }}>
                        {yearRange[0]} — {yearRange[1]}
                      </Typography>
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
                      Quick Tips
                    </Typography>
                    <Box 
                      sx={{ 
                        backgroundColor: "white",
                        borderRadius: "8px",
                        p: 1,
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                      }}
                    >
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
                    </Box>
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
              </Fade>
            </Grid>
          </Box>
        </Box>
      </SearchProvider>
    </ProductsProvider>
  );
};

export default IndexPage;
