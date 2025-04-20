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
    ? "linear-gradient(180deg, #00897B 0%, #4DB6AC 100%)"
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
    ? "rgba(0, 137, 123, 0.15)"
    : "rgba(178, 223, 219, 0.08)",
  color: selected ? "#00897B" : "#26A69A",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  transform: selected ? "scale(1)" : "scale(0.95)",
  boxShadow: selected
    ? "0 2px 8px rgba(0, 137, 123, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
    : "none",
  "& .MuiSvgIcon-root": {
    fontSize: "22px",
    transition: "all 0.3s ease",
    filter: selected ? "drop-shadow(0 2px 3px rgba(0, 137, 123, 0.2))" : "none",
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
  backgroundColor: selected ? "rgba(0, 137, 123, 0.08)" : "transparent",
  backdropFilter: selected ? "blur(8px)" : "none",
  boxShadow: selected
    ? "0 4px 12px rgba(0, 137, 123, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
    : "none",
  width: "56px",
  height: "64px",
  "&:hover": {
    backgroundColor: "rgba(0, 137, 123, 0.05)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(0, 137, 123, 0.15)",
    "& .category-icon": {
      transform: "scale(1.08)",
    },
    "& .category-label": {
      opacity: 1,
      transform: "translateY(0)",
      color: "#00796B",
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
    if (name === "all") return "#00796B";

    // Generate consistent colors based on string hashing
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "#00796B", // teal 700
      "#00897B", // teal 600
      "#009688", // teal 500
      "#00897B", // teal 600
      "#00796B", // teal 700
      "#00695C", // teal 800
      "#00796B", // teal 700
      "#00897B", // teal 600
    ];

    return colors[hash % colors.length];
  };

  const SidebarContent = () => (
    <Box
      sx={{
        width: { xs: "70px", sm: "100px" },
        height: "100vh",
        backgroundColor: "#ffffff",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        position: "relative",
        borderRight: "1px solid rgba(0, 0, 0, 0.06)",
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
          background: "rgba(0, 137, 123, 0.2)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(0, 137, 123, 0.4)",
        },
      }}
    >
      {/* Logo/Profile area at top */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Tooltip
          title="Profile"
          placement="right"
          TransitionComponent={Zoom}
          arrow
          PopperProps={{
            sx: {
              zIndex: 99999,
            },
          }}
        >
          <Avatar
            sx={{
              width: "48px",
              height: "48px",
              backgroundColor: "#00897B",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(0, 137, 123, 0.25)",
              "&:hover": {
                transform: "scale(1.15)",
                boxShadow: "0 6px 16px rgba(0, 137, 123, 0.3)",
              },
            }}
          >
            <AccountCircleOutlinedIcon
              sx={{ color: "#ffffff", fontSize: "28px" }}
            />
          </Avatar>
        </Tooltip>

        {/* App name/brand below avatar */}
        <Typography
          variant="subtitle2"
          sx={{
            mt: 1.5,
            fontSize: isMobile ? "9px" : "11px",
            color: "#00897B",
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          USER
        </Typography>
      </Box>

      {/* Category section */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "40px",
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, rgba(0, 137, 123, 0.2), transparent)",
          },
        }}
      >
        {/* "Categories" Label */}
        <Typography
          variant="caption"
          sx={{
            color: "#00796B",
            fontWeight: 700,
            fontSize: isMobile ? "8px" : "12px",
            textTransform: "uppercase",
            letterSpacing: isMobile ? "0.5px" : "1px",
            textAlign: "center",
            display: "block",
            mb: 2,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-6px",
              left: "50%",
              transform: "translateX(-50%)",
              width: isMobile ? "12px" : "16px",
              height: "2px",
              backgroundColor: "#00897B",
              borderRadius: "2px",
            },
          }}
        >
          Categories
        </Typography>

        <List
          sx={{
            width: "100%",
            p: 0,
            mt: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
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
                <AutoAwesomeRoundedIcon />
              </StyledCategoryIcon>
              <Typography
                className="category-label"
                variant="caption"
                sx={{
                  mt: 0.5,
                  color: selectedCategory === "all" ? "#00796B" : "#26A69A",
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
                    backgroundColor: "rgba(0, 137, 123, 0.05)",
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
                  <CategoryRoundedIcon />
                </StyledCategoryIcon>
                <Typography
                  className="category-label"
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    color:
                      selectedCategory === category.name
                        ? "#00796B"
                        : "#26A69A",
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
        </List>

        {/* Separator before EPD Explorer */}
        <Box
          sx={{
            width: "40px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(0, 137, 123, 0.2), transparent)",
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
                ? "linear-gradient(135deg, rgba(0, 121, 107, 0.08), rgba(0, 150, 136, 0.05))"
                : "transparent",
              border: filterEpdOnly
                ? "1px solid rgba(0, 137, 123, 0.08)"
                : "none",
              mt: 0,
            }}
          >
            <CategoryIndicator selected={filterEpdOnly} />
            <StyledCategoryIcon
              selected={filterEpdOnly}
              sx={{
                background: filterEpdOnly
                  ? "rgba(0, 137, 123, 0.12)"
                  : "rgba(178, 223, 219, 0.08)",
                color: filterEpdOnly ? "#4DB6AC" : "#26A69A",
              }}
            >
              <TravelExploreIcon />
            </StyledCategoryIcon>
            <Typography
              className="category-label"
              variant="caption"
              sx={{
                mt: 0.5,
                color: filterEpdOnly ? "#00796B" : "#26A69A",
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
          backgroundColor: "white",
          padding: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          "&:hover": {
            backgroundColor: "white",
          },
          "&:active": {
            transform: "scale(0.95)",
          },
          touchAction: "manipulation",
        }}
      >
        <MenuRoundedIcon />
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
          },
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
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
