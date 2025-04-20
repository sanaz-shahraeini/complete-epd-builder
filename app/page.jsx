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
            <Grid
              container
              spacing={1}
              sx={{
                zIndex: 2,
                position: "relative",
                mt: 2,
              }}
            >
              <Grid size={{ xs: 12, sm: 6, md: 12 }}>
                <SearchBar mapRef={mapRef} />
              </Grid>
            </Grid>

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
                    bottom: "50px",
                    right: "90px",
                    zIndex: 2,
                    padding: "20px",
                    maxWidth: "350px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(0, 137, 123, 0.1)",
                    
                    transition: "opacity 0.3s ease-in-out",
                    opacity: showInfoCard ? 1 : 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#00897B",
                      mb: 2,
                      fontSize: "18px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <ViewInArIcon sx={{ fontSize: "24px" }} />
                    Global Product Map
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#555", mb: 2, lineHeight: 1.6 }}
                    >
                      Welcome to the Global Product Map! Here you can explore
                      products and Environmental Product Declarations (EPDs)
                      across different categories and countries.
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#00897B", mb: 1, fontWeight: 600 }}
                    >
                      Current View
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <Chip
                        label={selectedCountry || "All Countries"}
                        size="small"
                        sx={{
                          backgroundColor: "#E0F2F1",
                          color: "#00897B",
                          fontWeight: 500,
                        }}
                      />
                      <Chip
                        label={selectedProduct || "All Products"}
                        size="small"
                        sx={{
                          backgroundColor: "#E0F2F1",
                          color: "#00897B",
                          fontWeight: 500,
                        }}
                      />
                      <Chip
                        label={selectedCategory || "All Categories"}
                        size="small"
                        sx={{
                          backgroundColor: "#E0F2F1",
                          color: "#00897B",
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#00897B", mb: 1, fontWeight: 600 }}
                    >
                      Time Period
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      Showing data from {yearRange[0]} to {yearRange[1]}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#00897B", mb: 1, fontWeight: 600 }}
                    >
                      Quick Tips
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#555", mb: 1, fontSize: "13px" }}
                    >
                      • Click on countries to view specific data
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#555", mb: 1, fontSize: "13px" }}
                    >
                      • Use the sidebar categories to filter products
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#555", mb: 1, fontSize: "13px" }}
                    >
                      • Toggle EPD mode to focus on environmental declarations
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#555", fontSize: "13px" }}
                    >
                      • Use zoom controls to adjust the map view
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#00897B",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
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
