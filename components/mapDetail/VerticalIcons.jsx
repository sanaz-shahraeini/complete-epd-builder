import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  useMediaQuery,
  useTheme,
  Tooltip,
  Zoom,
  Badge,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { useProducts } from "../../useContexts/ProductsContext";
import { useSearch } from "../../useContexts/SearchContext";
import { styled } from "@mui/material/styles";

// Modern styled category indicator with animation
const CategoryIndicator = styled(Box)(({ selected }) => ({
  width: "3px",
  height: selected ? "32px" : "0",
  background: selected
    ? "var(--sideBar)"
    : "transparent",
  borderRadius: "0 4px 4px 0",
  position: "absolute",
  left: 0,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  opacity: selected ? 1 : 0,
  transform: selected ? "translateX(0)" : "translateX(-3px)",
}));

// Enhanced styled category icon with modern effects
const StyledCategoryIcon = styled(Box)(({ selected }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  borderRadius: "12px",
  backgroundColor: selected
    ? "var(--light-teal)"
    : "var(--bg_color)",
  color: selected ? "var(--dark-teal)" : "var(--text-medium)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  transform: selected ? "scale(1)" : "scale(0.95)",
  boxShadow: selected
    ? "0 2px 8px rgba(0, 137, 123, 0.15)"
    : "none",
  "& .MuiSvgIcon-root": {
    fontSize: "22px",
    transition: "all 0.3s ease",
    color: "inherit",
  },
  "&:hover": {
    backgroundColor: "var(--light-teal)",
    color: "var(--dark-teal)",
  },
  "&:hover .MuiSvgIcon-root": {
    transform: "scale(1.1) rotate(5deg)",
  },
}));

// Enhanced styled category button with glass morphism
const CategoryButton = styled(Box)(({ selected }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 6px",
  margin: "4px 0",
  cursor: "pointer",
  position: "relative",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  borderRadius: "16px",
  backgroundColor: selected ? "var(--light-teal)" : "transparent",
  backdropFilter: selected ? "blur(8px)" : "none",
  boxShadow: selected
    ? "0 4px 12px rgba(0, 137, 123, 0.12)"
    : "none",
  width: "56px",
  height: "64px",
  "&:hover": {
    backgroundColor: "var(--light-teal)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(0, 137, 123, 0.15)",
    "& .category-icon": {
      transform: "scale(1.08)",
    },
    "& .category-label": {
      opacity: 1,
      transform: "translateY(0)",
      color: "var(--dark-teal)",
    },
  },
}));

const VerticalIcons = ({
  toggleSidebar,
  setSelectedCategory,
  selectedCategory = "all",
  setCategories,
  categories,
  setSelectedSidebar,
  setFilterEpdOnly,
  filterEpdOnly,
}) => {
  const { loading, error, allProducts } = useProducts();
  const { setSearchQuery } = useSearch();
  const [errorState, setErrorState] = useState("");
  const [topCategories, setTopCategories] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [totalProducts, setTotalProducts] = useState(0);

  const findTopCategories = useCallback(
    (categories) => {
      if (!allProducts) return [];

      const frequencyMap = {};
      allProducts.forEach((product) => {
        const categories = (
          product.category_name ||
          product.classific ||
          "Uncategorized"
        )
          .split(" / ")
          .map((category) => category.trim());

        categories.forEach((category) => {
          frequencyMap[category] = (frequencyMap[category] || 0) + 1;
        });
      });

      return Object.entries(frequencyMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([category, count]) => ({ name: category, count }));
    },
    [allProducts]
  );

  useEffect(() => {
    if (!loading && !error) {
      try {
        const allCategories = Array.from(
          new Set(
            allProducts?.flatMap((item) =>
              (item.category_name || item.classific || "Uncategorized")
                .split(" / ")
                .map((category) => category.trim())
            ) || []
          )
        );
        setCategories([...allCategories]);
        setTotalProducts(allProducts?.length || 0);
      } catch (e) {
        console.error("Error processing categories:", e);
        setErrorState("Error processing categories");
      }
    }
  }, [loading, error, allProducts, setCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      const topCategories = findTopCategories(categories);
      setTopCategories(topCategories);
    }
  }, [categories, findTopCategories]);

  const handleCategoryClick = (label) => {
    setSelectedCategory(label);
    if (isMobile) {
      handleDrawerToggle();
    }
    // Force sidebar to show Products view when category is selected
    setSelectedSidebar("Products");
    // Always open sidebar when category is clicked
    toggleSidebar();

    // Clear the search query when a category is selected
    setSearchQuery("");

    // If user clicks on a category, make sure EPD filter is turned off
    // to show all markers from both APIs
    setFilterEpdOnly(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Get first letter of category name for the avatar
  const getCategoryInitial = (name) => {
    if (name === "all") return "A";
    return name.charAt(0).toUpperCase();
  };

  // Get color based on category name (consistent coloring)
  const getCategoryColor = (name) => {
    if (name === "all") return "var(--dark-teal)";

    // Generate consistent colors based on string hashing
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "var(--dark-teal)",      // dark teal
      "var(--primary-teal)",   // primary teal
      "var(--light-teal)",     // light teal
      "var(--primary-teal)",   // primary teal
      "var(--dark-teal)",      // dark teal
      "var(--dark-green)",     // dark green instead of darker-teal
      "var(--dark-teal)",      // dark teal
      "var(--primary-teal)",   // primary teal
    ];

    return colors[hash % colors.length];
  };

  const SidebarContent = () => (
    <Box
      sx={{
        width: { xs: "70px", sm: "100px" },
        height: "100vh",
        backgroundColor: "var(--bg_color)",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        position: "relative",
        borderRight: "1px solid var(--light-teal)",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
        zIndex: 11001,
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "var(--light-teal)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "var(--primary-teal)",
        },
      }}
    >
      {/* Category section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          width: "100%",
          mt: 2,
          position: "relative",
        }}
      >
        {/* Modern Categories Label */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              position: "relative",
              padding: "6px 10px",
              background: "var(--gradient-teal)",
              borderRadius: "16px",
              boxShadow: "0 2px 5px rgba(0, 137, 123, 0.2)",
              maxWidth: "80%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                fontSize: isMobile ? "10px" : "11px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                display: "block",
                textAlign: "center",
              }}
            >
              Categories
            </Typography>
          </Box>
        </Box>

        {/* All Categories button */}
        <Tooltip
          title="All Categories"
          placement="right"
          TransitionComponent={Zoom}
          arrow
          PopperProps={{
            sx: {
              zIndex: 99999,
            },
          }}
        >
          <CategoryButton
            selected={selectedCategory === "all"}
            onClick={() => {
              handleCategoryClick("all");
              setFilterEpdOnly(false);
            }}
          >
            <CategoryIndicator selected={selectedCategory === "all"} />
            <StyledCategoryIcon selected={selectedCategory === "all"}>
              <AutoAwesomeRoundedIcon sx={{ color: "inherit" }} />
            </StyledCategoryIcon>
            <Typography
              className="category-label"
              variant="caption"
              sx={{
                mt: 0.5,
                color: selectedCategory === "all" ? "var(--dark-teal)" : "var(--text-medium)",
                fontWeight: selectedCategory === "all" ? 600 : 500,
                fontSize: isMobile ? "8px" : "10px",
              }}
            >
              All
            </Typography>
          </CategoryButton>
        </Tooltip>

        {/* Category list */}
        {topCategories.map((category) => (
          <Tooltip
            key={category.name}
            title={category.name}
            placement="right"
            TransitionComponent={Zoom}
            arrow
            PopperProps={{
              sx: {
                zIndex: 99999,
              },
            }}
          >
            <CategoryButton
              selected={selectedCategory === category.name}
              onClick={() => handleCategoryClick(category.name)}
              sx={{
                padding: isMobile ? "16px 6px" : "12px 6px",
                margin: isMobile ? "6px 0" : "4px 0",
                minHeight: isMobile ? "72px" : "64px",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
                cursor: "pointer",
                userSelect: "none",
                "&:active": {
                  transform: "scale(0.95)",
                },
                "&:hover": {
                  backgroundColor: "var(--light-teal)",
                },
              }}
            >
              <CategoryIndicator
                selected={selectedCategory === category.name}
              />
              <StyledCategoryIcon
                selected={selectedCategory === category.name}
                sx={{
                  width: isMobile ? "40px" : "36px",
                  height: isMobile ? "40px" : "36px",
                  touchAction: "manipulation",
                }}
              >
                <CategoryRoundedIcon sx={{ color: "inherit" }} />
              </StyledCategoryIcon>
              <Typography
                className="category-label"
                variant="caption"
                sx={{
                  mt: 0.5,
                  color:
                    selectedCategory === category.name
                      ? "var(--dark-teal)"
                      : "var(--text-medium)",
                  fontWeight: selectedCategory === category.name ? 600 : 500,
                  fontSize: isMobile ? "8px" : "10px",
                  maxWidth: "90%",
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                {category.name.length > 8
                  ? `${category.name.substring(0, 7)}...`
                  : category.name}
              </Typography>
            </CategoryButton>
          </Tooltip>
        ))}

        {/* Separator before EPD Explorer */}
        <Box
          sx={{
            width: "40px",
            height: "1px",
            background: "var(--gradient-teal)",
            my: 2,
          }}
        />

        {/* EPD Explorer button */}
        <Tooltip
          title="EPD Explorer"
          placement="right"
          TransitionComponent={Zoom}
          arrow
          PopperProps={{
            sx: {
              zIndex: 99999,
            },
          }}
        >
          <CategoryButton
            selected={filterEpdOnly}
            onClick={() => {
              setFilterEpdOnly(!filterEpdOnly);
              setSearchQuery("");
              setSelectedCategory("all");
              toggleSidebar();
              setSelectedSidebar("Products");
            }}
            sx={{
              background: filterEpdOnly
                ? "var(--light-teal)"
                : "transparent",
              border: filterEpdOnly
                ? `1px solid var(--primary-teal)`
                : "none",
              mt: 0,
            }}
          >
            <CategoryIndicator selected={filterEpdOnly} />
            <StyledCategoryIcon
              selected={filterEpdOnly}
              sx={{
                background: filterEpdOnly
                  ? "var(--light-teal)"
                  : "var(--bg_color)",
                color: filterEpdOnly ? "var(--dark-teal)" : "var(--text-medium)",
              }}
            >
              <TravelExploreIcon sx={{ color: "inherit" }} />
            </StyledCategoryIcon>
            <Typography
              className="category-label"
              variant="caption"
              sx={{
                mt: 0.5,
                color: filterEpdOnly ? "var(--dark-teal)" : "var(--text-medium)",
                fontWeight: filterEpdOnly ? 600 : 500,
                fontSize: isMobile ? "8px" : "10px",
              }}
            >
              EPD
            </Typography>
          </CategoryButton>
        </Tooltip>
      </Box>

      {errorState && (
        <Typography
          color="error"
          sx={{ position: "absolute", bottom: 16, fontSize: "12px" }}
        >
          {errorState}
        </Typography>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile menu button - only visible on small screens */}
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          display: { xs: "flex", sm: "none" },
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 11000,
          backgroundColor: "var(--bg_color)",
          padding: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          "&:hover": {
            backgroundColor: "var(--light-teal)",
          },
          "&:active": {
            transform: "scale(0.95)",
          },
          touchAction: "manipulation",
          color: "var(--dark-teal)",
        }}
      >
        <MenuRoundedIcon sx={{ color: "inherit" }} />
      </IconButton>

      {/* Drawer for mobile view */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        variant="temporary"
        sx={{
          display: { xs: "block", sm: "none" },
          position: "fixed",
          "& .MuiDrawer-paper": {
            width: "70px",
            boxSizing: "border-box",
            zIndex: 11000,
            boxShadow: "4px 0 8px rgba(0, 0, 0, 0.1)",
            position: "fixed",
            top: 0,
            left: 0,
            height: "100%",
            background: "var(--bg_color)"
          },
          "& .MuiBackdrop-root": {
            backgroundColor: "var(--upload_bg)",
            opacity: 0.7,
            zIndex: 10999,
          },
        }}
        ModalProps={{
          keepMounted: true,
          disablePortal: true,
          style: { position: "fixed" },
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            position: "relative",
            zIndex: 11001,
          }}
        >
          <SidebarContent />
        </Box>
      </Drawer>

      {/* Permanent sidebar for desktop view */}
      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          height: "100%",
          "& .MuiTooltip-popper": {
            zIndex: 10001,
          },
        }}
      >
        <SidebarContent />
      </Box>
    </>
  );
};

export default VerticalIcons;
