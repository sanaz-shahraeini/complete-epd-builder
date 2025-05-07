import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Modal,
  List,
  ListItem,
  Typography,
  Fab,
  ListItemText,
  IconButton,
  ListItemIcon,
  Tooltip,
  Pagination,
  useMediaQuery,
  useTheme,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from "@mui/icons-material/Public";
import ListIcon from "@mui/icons-material/List";
import DownloadIcon from "@mui/icons-material/Download";
import StarIcon from "@mui/icons-material/Star";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SendIcon from "@mui/icons-material/Send";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useSearch } from "../../useContexts/SearchContext";
import { useProducts } from "../../useContexts/ProductsContext";

const SearchBar = ({ mapRef, filterEpdOnly, selectedCategory }) => {
  const [icon, setIcon] = useState(<PublicIcon sx={{ color: "#384029" }} />);
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [requestSending, setRequestSending] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestProduct, setRequestProduct] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { setSelectedProduct, regularProducts, allProducts } = useProducts();
  const {
    searchResults,
    setSearchQuery: setContextSearchQuery,
    searchQuery: contextSearchQuery,
    isLoading,
    markerSelected,
    clearSearchQuery,
  } = useSearch();

  // Synchronize local state with context
  useEffect(() => {
    setSearchQuery(contextSearchQuery);
    setShowResults(contextSearchQuery.length > 0);
  }, [contextSearchQuery]);

  // Add a prop changes detection - this will run once when props change
  const prevFilterEpdOnly = useRef(filterEpdOnly);
  const prevSelectedCategory = useRef(selectedCategory);
  const isInitialRender = useRef(true);
  
  useEffect(() => {
    // Skip the first render to prevent clearing on component mount
    if (isInitialRender.current) {
      isInitialRender.current = false;
      // Update refs with initial values
      prevFilterEpdOnly.current = filterEpdOnly;
      prevSelectedCategory.current = selectedCategory;
      return;
    }
    
    // Only clear search if these props actually changed from previous values
    if (prevFilterEpdOnly.current !== filterEpdOnly || 
        prevSelectedCategory.current !== selectedCategory) {
      console.log('Filter change detected. Clearing search.', { 
        filterEpdOnly, 
        selectedCategory,
        prevFilterEpdOnly: prevFilterEpdOnly.current,
        prevSelectedCategory: prevSelectedCategory.current
      });
      
      clearSearchQuery();
      setSearchQuery(""); // Ensure local state is also cleared
      setShowResults(false);
      
      // Update refs with current values
      prevFilterEpdOnly.current = filterEpdOnly;
      prevSelectedCategory.current = selectedCategory;
    }
  }, [filterEpdOnly, selectedCategory, clearSearchQuery]);

  const filteredProducts = searchResults || [];

  const handleSearchChange = (e) => {
    const query = e.target.value;
    console.log("Search input changed to:", query);
    
    // Set local state and context state
    setSearchQuery(query);
    setContextSearchQuery(query);

    // Clear the selected product when typing a new search
    setSelectedProduct(null);

    // If user is typing in search box with active filters, reset them
    if ((selectedCategory !== "all" || filterEpdOnly) && query.length > 0) {
      console.log("User typing with active filters, resetting filters");
      const resetEvent = new CustomEvent('resetFilters', { 
        detail: { source: 'searchTyping' } 
      });
      window.dispatchEvent(resetEvent);
    }

    // Show results while typing if query is not empty
    setShowResults(query.length > 0);

    // If the query is empty, close the results
    if (!query.trim()) {
      setShowResults(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowResults(true);
    } else if (e.key === "Escape" && showResults) {
      setShowResults(false);
    }
  };

  const handleIconClick = () => {
    if (icon.type === PublicIcon) {
      setIcon(<ListIcon sx={{ color: "#384029" }} />);
      setOpenModal(true);
    } else {
      setIcon(<PublicIcon sx={{ color: "#384029" }} />);
      setOpenModal(false);
    }
  };

  const handleDownload = (pdf_url) => {
    if (pdf_url) {
      const link = document.createElement("a");
      link.href = pdf_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = pdf_url.split("/").pop();
      link.click();
    }
  };

  const handleProductSelect = (product) => {
    const productName = product.product_name || product.name;
    console.log("Product selected:", product);

    // Set search query and context
    setSearchQuery(productName);
    setContextSearchQuery(productName);

    // Make a deep copy to ensure all properties are passed
    const productToSelect = { ...product };

    // Set the selected product in the context
    setSelectedProduct(productToSelect);

    // Center map on the selected product's location if coordinates are available
    if (productToSelect.lat && productToSelect.lng) {
      console.log(
        "Attempting to center map on:",
        productToSelect.lat,
        productToSelect.lng
      );

      // Center map immediately with animation
      if (mapRef.current && mapRef.current.centerOnLocation) {
        try {
          // Use a higher zoom level (12) for better visibility
          mapRef.current.centerOnLocation(
            parseFloat(productToSelect.lat),
            parseFloat(productToSelect.lng),
            12
          );
          console.log("Successfully centered map");

          // Close the dropdown after a brief delay to ensure smooth transition
          setTimeout(() => {
            setShowResults(false);
            // Add a slight delay before triggering any marker animations
            if (mapRef.current && mapRef.current.highlightMarker) {
              mapRef.current.highlightMarker(productToSelect.id);
            }
          }, 300); // Shorter delay for closing dropdown
        } catch (error) {
          console.error("Error centering map:", error);
          // Still close the dropdown even if there's an error
          setShowResults(false);
        }
      } else {
        // If map ref is not available, still close the dropdown
        setShowResults(false);
      }
    } else {
      console.warn("Unable to center map - missing coordinates:", {
        lat: productToSelect.lat,
        lng: productToSelect.lng,
      });
      // Close the dropdown even if coordinates are missing
      setShowResults(false);
    }
  };

  const handleSearchClick = () => {
    // If search is already showing results, clicking will toggle it off
    if (showResults) {
      setShowResults(false);
      return;
    }

    // If search box is clicked when no results are showing
    console.log("Search box clicked, current query:", searchQuery);
    
    // Always dispatch the event to show all markers when search box is clicked
    const showAllEvent = new CustomEvent('showAllMarkers', { 
      detail: { source: 'searchBoxClick' } 
    });
    window.dispatchEvent(showAllEvent);
    
    // Always clear filters when clicking on search to ensure we see all results
    if (selectedCategory !== "all" || filterEpdOnly) {
      console.log("Resetting filters from search box click");
      const resetEvent = new CustomEvent('resetFilters', { 
        detail: { source: 'searchClick' } 
      });
      window.dispatchEvent(resetEvent);
    }
    
    // Only clear search when specifically performing a new search
    if (searchQuery) {
      console.log("Maintaining current search query:", searchQuery);
      // Show results for current query
      setShowResults(true);
    } else {
      // Empty search box behavior - just show all results
      console.log("Empty search, showing dropdown");
      setShowResults(true);
    }
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside search container and results are showing
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(event.target) && showResults) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showResults) {
        setShowResults(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showResults]);

  // Group products by country for the modal display
  const productsForModal = (() => {
    // Case 1: Search is active - show only search results
    if (searchQuery && filteredProducts && filteredProducts.length > 0) {
      return [...filteredProducts];
    }
    
    // Case 2: EPD filter is active - show only EPD products
    if (filterEpdOnly) {
      // Filter to only show EPD products from the allProducts array
      const epdProducts = allProducts 
        ? allProducts.filter(product => product.type === "EPD" || product.isFromEPDAPI)
        : [];
      console.log(`Filtered to ${epdProducts.length} EPD products for modal`);
      return epdProducts;
    }
    
    // Case 3: Category filter is active - show filtered products for that category
    if (selectedCategory && selectedCategory !== "all") {
      const categoryProducts = [...(regularProducts || []), ...(allProducts || [])].filter(
        product => {
          const productCategory = product.classific || product.category_name || "";
          
          // Check if the product's category includes the selected category
          // Improved to handle partial matches and different formats
          if (typeof productCategory === "string") {
            // For string categories, do a case-insensitive partial match
            return productCategory.toLowerCase().includes(selectedCategory.toLowerCase());
          } else if (Array.isArray(productCategory)) {
            // For array categories, check if any element contains the selected category
            return productCategory.some(cat => 
              typeof cat === "string" && cat.toLowerCase().includes(selectedCategory.toLowerCase())
            );
          }
          
          // If we reach here, there's no category match
          return false;
        }
      );
      
      console.log(`Filtered to ${categoryProducts.length} ${selectedCategory} products for modal`);
      return categoryProducts;
    }
    
    // Default case: No filters active - show all products
    return [...(regularProducts || []), ...(allProducts || [])];
  })();
  
  // Log to verify we're applying the correct filters to modal products
  console.log("Modal products source:", {
    usingSearchResults: !!(searchQuery && filteredProducts && filteredProducts.length > 0),
    filterEpdOnly,
    selectedCategory: selectedCategory || "all",
    searchQuery: searchQuery || "none",
    filteredCount: filteredProducts?.length || 0,
    modalProductsCount: productsForModal.length
  });

  const groupedByCountry = Array.isArray(productsForModal)
    ? productsForModal.reduce((acc, product) => {
        const country = product.country || "Not Specified";
        if (!acc[country]) {
          acc[country] = [];
        }
        // Add a source flag to identify the product type
        const productWithSource = {
          ...product,
          source: product.type === "EPD" ? "EPD" : "Regular",
        };
        acc[country].push(productWithSource);
        return acc;
      }, {})
    : {};

  const countryNames = Object.keys(groupedByCountry);
  const productsForCurrentPage = groupedByCountry[countryNames[page - 1]] || [];

  // Calculate items per page
  const itemsPerPage = 5;
  // const startIndex = (page - 1) * itemsPerPage;
  // const currentProducts = Array.isArray(filteredProducts) &&
  //   filteredProducts.length > 0
  //   ? filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  //   : [];
  // const totalPages = Math.ceil((filteredProducts?.length || 0) / itemsPerPage);

  const handleSendRequest = (product) => {
    console.log("Sending request for product:", product.name);
    setRequestProduct(product);
    setRequestSending(true);

    // Simulate sending a request
    setTimeout(() => {
      setRequestSending(false);
      setRequestSuccess(true);
      console.log("Request success set to:", true);

      // Auto-hide success message after 5 seconds (increased from 3)
      setTimeout(() => {
        setRequestSuccess(false);
        setRequestProduct(null);
      }, 5000);
    }, 1000); // Reduced from 1500ms to make it faster
  };

  const handleCloseSuccess = () => {
    console.log("Closing success notification");
    setRequestSuccess(false);
    setRequestProduct(null);
  };

  // Add a useEffect to log when requestSuccess changes
  useEffect(() => {
    console.log("requestSuccess state changed to:", requestSuccess);
  }, [requestSuccess]);

  return (
    <Box
      sx={{
        display: isLoading ? "none" : "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isMobile ? "5px" : "10px",
        width: "100%",
        position: "fixed",
        top: isMobile ? "30px" : "40px",
        left: 0,
        right: 0,
        zIndex: 999,
        pointerEvents: "auto",
      }}
    >
      <Grid
        container
        sx={{
          display: "flex",
          justifyContent: "center",
          width: isMobile ? "60%" : "40%",
          padding: isMobile ? "0 10px" : 0,
          position: "relative",
          zIndex: 999,
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "nowrap",
          margin: "0 auto",
          gap: 0,
        }}
      >
        <Grid
          item
          xs={isMobile ? 10 : 11}
          className="search-container"
          sx={{
            marginRight: 0,
            position: "relative",
            zIndex: 999,
          }}
        >
          <TextField
            placeholder={isMobile ? "Search..." : "Search for products"}
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyPress}
            onClick={handleSearchClick}
            onFocus={() => {
              // Always dispatch event to show all markers when focusing on search
              const showAllEvent = new CustomEvent('showAllMarkers', { 
                detail: { source: 'searchFocus' } 
              });
              window.dispatchEvent(showAllEvent);
              
              // Only reset filters if:
              // 1. There's no current search query (to avoid clearing results when re-focusing)
              // 2. We're coming from a filtered state
              if ((!searchQuery || searchQuery.length === 0) && (selectedCategory !== "all" || filterEpdOnly)) {
                console.log("Focusing search box from filtered state, resetting filters");
                const resetEvent = new CustomEvent('resetFilters', { 
                  detail: { source: 'searchFocus' } 
                });
                window.dispatchEvent(resetEvent);
              } else {
                console.log("Focusing with existing query, not resetting filters:", searchQuery);
              }
              
              // When focusing on the search box and there's a query, show results
              if (searchQuery && searchQuery.length > 0) {
                setShowResults(true);
              }
            }}
            sx={{
              borderRadius: "30px",
              transition: "all 0.3s ease",
              position: "relative",
              zIndex: 999,
              "& .MuiOutlinedInput-root": {
                height: isMobile ? "40px" : "48px",
                borderRadius: "30px",
                background: "white",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.07)",
                border: "1px solid rgba(43, 190, 183, 0.15)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  transform: "translateY(-2px)",
                  borderColor: "var(--primary-teal)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 10px 25px rgba(0, 124, 119, 0.15)",
                  background: "#ffffff",
                  borderColor: "var(--primary-teal)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                ...(isMobile && {
                  "& .MuiOutlinedInput-input": {
                    fontSize: "14px",
                    padding: "8px 14px",
                    caretColor: "var(--primary-teal)",
                  },
                }),
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon 
                    fontSize={isMobile ? "small" : "medium"} 
                    sx={{ 
                      color: "var(--primary-teal)",
                      ml: 1, 
                    }} 
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconButton
                      sx={{
                        padding: isMobile ? "8px" : "8px",
                        color: "var(--medium-green)",
                        "&:hover": {
                          backgroundColor: "rgba(101, 184, 125, 0.1)",
                        },
                      }}
                    >
                      <HelpOutlineIcon
                        fontSize={isMobile ? "small" : "small"}
                      />
                    </IconButton>
                  </Box>
                </InputAdornment>
              ),
            }}
          />

          {/* Search Results Dropdown */}
          {showResults && (
            <Box
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 998,
                mt: "5px",
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  width: "100%",
                  borderRadius: isMobile ? "8px" : "12px",
                  overflow: "hidden",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                  background: "rgba(255, 255, 255, 0.98)",
                  backdropFilter: "blur(10px)",
                  maxHeight: isMobile ? "calc(100vh - 200px)" : "400px",
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch",
                  animation: "fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "@keyframes fadeIn": {
                    "0%": {
                      opacity: 0,
                      transform: "translateY(-10px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                <Box p={isMobile ? 1 : 2}>
                  {isLoading ? (
                    <Typography
                      color="textSecondary"
                      sx={{
                        py: isMobile ? 1 : 2,
                        textAlign: "center",
                        fontSize: isMobile ? "14px" : "16px",
                      }}
                    >
                      Searching...
                    </Typography>
                  ) : filteredProducts.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {filteredProducts.slice(0, 5).map((product, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            borderBottom:
                              index < filteredProducts.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                            transition: "all 0.2s ease",
                            cursor: "pointer",
                            padding: isMobile ? "8px" : "16px",
                            "&:hover": {
                              backgroundColor: "#E0F2F1",
                            },
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleProductSelect(product);
                          }}
                          button
                        >
                          <ListItemIcon>
                            <Box
                              component="img"
                              src={
                                product.image_url ||
                                "/public/images/images(map).png"
                              }
                              alt={product.product_name}
                              sx={{
                                width: isMobile ? 32 : 40,
                                height: isMobile ? 32 : 40,
                                borderRadius: isMobile ? "6px" : "8px",
                                objectFit: "cover",
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant={isMobile ? "body2" : "subtitle2"}
                                sx={{
                                  color: "#00897B",
                                  fontWeight: 600,
                                  fontSize: isMobile ? "13px" : "inherit",
                                }}
                              >
                                {product.product_name || product.name}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#666",
                                  fontSize: isMobile ? "11px" : "12px",
                                }}
                              >
                                {product.geo || "Location not specified"}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography
                      color="textSecondary"
                      sx={{
                        py: isMobile ? 1 : 2,
                        textAlign: "center",
                        fontSize: isMobile ? "13px" : "14px",
                      }}
                    >
                      No products found. Try a different search.
                      <br />
                      <span
                        style={{
                          fontSize: isMobile ? "11px" : "12px",
                          marginTop: isMobile ? "4px" : "8px",
                          display: "block",
                        }}
                      >
                        For zehnder products, type a letter that appears after
                        "zehnder-".
                        <br />
                        Example: &quot;l&quot; will find &quot;zehnder-luna&quot;
                      </span>
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Box>
          )}
        </Grid>

        <Grid
          item
          xs={2}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            paddingRight: isMobile ? "5px" : 0,
            paddingLeft: 0,
            height: "45px",
            position: "relative",
            zIndex: 999,
          }}
        >
          <Fab
            size={isMobile ? "small" : "medium"}
            aria-label="Icon"
            sx={{
              background: "var(--gradient-teal)",
              boxShadow: "0 6px 15px rgba(43, 190, 183, 0.2)",
              transition: "all 0.3s ease",
              width: isMobile ? "36px" : "48px",
              height: isMobile ? "36px" : "48px",
              minHeight: "unset",
              marginLeft: "5px",
              border: "2px solid white",
              "&:hover": {
                boxShadow: "0 8px 20px rgba(43, 190, 183, 0.3)",
                transform: "translateY(-2px) scale(1.05)",
              },
            }}
            onClick={handleIconClick}
          >
            {React.cloneElement(icon, {
              sx: {
                color: "white",
                fontSize: isMobile ? "18px" : "24px",
              },
            })}
          </Fab>
        </Grid>
      </Grid>

      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setIcon(<PublicIcon sx={{ color: "#384029" }} />);
        }}
        slotProps={{
          backdrop: {
            onClick: () => {
              setOpenModal(false);
              setIcon(<PublicIcon sx={{ color: "#384029" }} />);
            },
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(3px)",
          },
        }}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: isMobile ? "flex-start" : "center",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          margin: 0,
          WebkitOverflowScrolling: "touch",
          p: isMobile ? 0 : 3,
          paddingTop: isMobile ? "70px" : 3,
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            width: isMobile ? "100%" : "90%",
            maxWidth: isMobile ? "100%" : "1400px",
            maxHeight: isMobile ? "calc(100vh - 70px)" : "90vh",
            minHeight: isMobile ? "auto" : "50vh",
            marginTop: isMobile ? 0 : "70px",
            bgcolor: "white",
            padding: 0,
            borderRadius: "24px",
            border: "1px solid rgba(43, 190, 183, 0.1)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            position: "relative",
            transform: "translateZ(0)",
            animation: "fadeIn 0.4s cubic-bezier(0.2, 0, 0.3, 1)",
            "@keyframes fadeIn": {
              "0%": {
                opacity: 0,
                transform: isMobile ? "translateY(50px)" : "scale(0.95) translateY(30px)",
              },
              "100%": {
                opacity: 1,
                transform: isMobile ? "translateY(0)" : "scale(1) translateY(0)",
              },
            },
            "&::-webkit-scrollbar": {
              width: isMobile ? "4px" : "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f5f5f5",
              borderRadius: isMobile ? "4px" : "8px",
              margin: isMobile ? "4px" : "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#80CBC4",
              borderRadius: isMobile ? "4px" : "8px",
              border: "2px solid #f5f5f5",
              "&:hover": {
                background: "#4DB6AC",
              },
            },
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              background: "linear-gradient(135deg, var(--primary-teal) 0%, var(--dark-teal) 100%)",
              padding: isMobile ? "16px" : "24px",
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              color: "white",
              position: "sticky",
              top: 0,
              zIndex: 1010,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              marginBottom: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              overflow: "hidden",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 1 : 2,
                  fontSize: isMobile ? "18px" : "24px",
                  lineHeight: 1.3,
                  paddingRight: "30px",
                }}
              >
                <PublicIcon sx={{ fontSize: isMobile ? 20 : 30 }} />
                {(() => {
                  if (searchQuery && filteredProducts && filteredProducts.length > 0) {
                    return `Search Results for "${searchQuery}"`;
                  }
                  
                  if (filterEpdOnly) {
                    return "Environmental Product Declarations (EPD)";
                  }
                  
                  if (selectedCategory && selectedCategory !== "all") {
                    return `${selectedCategory} Products`;
                  }
                  
                  return countryNames[page - 1] === "Not Specified" 
                    ? "Products with Unspecified Location" 
                    : `Products from ${countryNames[page - 1] || "All Countries"}`;
                })()}
              </Typography>
              
              <IconButton
                onClick={() => {
                  setOpenModal(false);
                  setIcon(<PublicIcon sx={{ color: "#384029" }} />);
                }}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(4px)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                  minHeight: "36px",
                  padding: 0,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.25)",
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: "18px",
                    height: "18px",
                    position: "relative",
                    "&::before, &::after": {
                      content: '""',
                      position: "absolute",
                      width: "2px",
                      height: "18px",
                      backgroundColor: "white",
                      top: 0,
                      left: "8px",
                    },
                    "&::before": {
                      transform: "rotate(45deg)",
                    },
                    "&::after": {
                      transform: "rotate(-45deg)",
                    },
                  }}
                />
              </IconButton>
            </Box>
          </Box>
          
          {/* Country Info & Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              px: isMobile ? 3 : 4,
              py: 2,
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              background: "rgba(224, 242, 241, 0.3)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: "white",
                padding: isMobile ? "8px 16px" : "10px 20px",
                borderRadius: "50px",
                border: "1px solid var(--light-teal)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
                width: isMobile ? "100%" : "auto",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: "var(--dark-teal)",
                  fontWeight: 600,
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                {(() => {
                  if (searchQuery && filteredProducts && filteredProducts.length > 0) {
                    return `${filteredProducts.length} search result${filteredProducts.length !== 1 ? 's' : ''}`;
                  }
                  
                  if (filterEpdOnly) {
                    const epdCount = productsForModal.length;
                    return `${epdCount} EPD product${epdCount !== 1 ? 's' : ''}`;
                  }
                  
                  if (selectedCategory && selectedCategory !== "all") {
                    return `${productsForModal.length} product${productsForModal.length !== 1 ? 's' : ''} in "${selectedCategory}"`;
                  }
                  
                  return `${countryNames.length} ${countryNames.length === 1 ? "Country" : "Countries"}`;
                })()}
              </Typography>
              <Typography
                sx={{
                  mx: 1,
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-teal)",
                  display: "inline-block",
                }}
              ></Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "var(--dark-teal)",
                  fontWeight: 600,
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                {(() => {
                  if (searchQuery && filteredProducts && filteredProducts.length > 0 ||
                      filterEpdOnly || 
                      (selectedCategory && selectedCategory !== "all")) {
                    return `Showing all matches`;
                  }
                  
                  return `Page ${page} of ${countryNames.length || 1}`;
                })()}
              </Typography>
            </Box>
            
            <Pagination
              count={countryNames.length || 1}
              page={page}
              onChange={(event, value) => setPage(value)}
              size={isMobile ? "small" : "medium"}
              color="primary"
              sx={{
                display: searchQuery && filteredProducts && filteredProducts.length > 0 ||
                         filterEpdOnly ||
                         (selectedCategory && selectedCategory !== "all")
                  ? 'none' : 'flex',
                "& .MuiPaginationItem-root": {
                  fontWeight: 500,
                  "&.Mui-selected": {
                    backgroundColor: "var(--primary-teal)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "var(--dark-teal)",
                    },
                  },
                },
              }}
            />
          </Box>

          {/* Products List */}
          <Box sx={{ 
            p: isMobile ? 2 : 3,
            paddingTop: 2,
            paddingBottom: isMobile ? 5 : 4,
          }}>
            <List
              sx={{
                padding: 0,
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fill, minmax(450px, 1fr))",
                gap: isMobile ? 2 : 3,
              }}
            >
              {(() => {
                if (searchQuery && filteredProducts && filteredProducts.length > 0 ||
                    filterEpdOnly || 
                    (selectedCategory && selectedCategory !== "all")) {
                  
                  return productsForModal.length > 0 ? (
                    productsForModal.map((product, index) => (
                      <ListItem
                        key={`Product${index}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "white",
                          padding: 0,
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: product.source === "EPD" || product.type === "EPD"
                            ? "rgba(101, 184, 125, 0.3)" 
                            : "rgba(0, 0, 0, 0.08)",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
                          "&:hover": {
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                            transform: "translateY(-4px)",
                          },
                          "&:active": {
                            transform: isMobile ? "scale(0.98)" : "translateY(-4px)",
                          },
                        }}
                      >
                        {(product.source === "EPD" || product.type === "EPD") && (
                          <Box
                            sx={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: "6px",
                              backgroundColor: "var(--medium-green)",
                              borderTopLeftRadius: "16px",
                              borderBottomLeftRadius: "16px",
                            }}
                          />
                        )}
                        
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            width: "100%",
                            p: isMobile ? 2 : 3,
                          }}
                        >
                          <Box
                            sx={{
                              width: isMobile ? "50px" : "80px",
                              height: isMobile ? "50px" : "80px",
                              marginRight: isMobile ? 2 : 3,
                              position: "relative",
                              flexShrink: 0,
                              borderRadius: "12px",
                              overflow: "hidden",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                            }}
                          >
                            {product.image_url ? (
                              // Use actual image if available
                              <Box
                                component="img"
                                src={product.image_url}
                                alt={product.name || product.product_name || "Product"}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              // Custom EPD placeholder design
                              <Box 
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  background: (product.source === "EPD" || product.type === "EPD")
                                    ? "linear-gradient(135deg, #65B87D 0%, #26A69A 100%)"
                                    : "linear-gradient(135deg, #B2DFDB 0%, #80CBC4 100%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                              >
                                {/* Diagonal pattern in background */}
                                <Box 
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    opacity: 0.1,
                                    backgroundImage: (product.source === "EPD" || product.type === "EPD")
                                      ? "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)"
                                      : "none",
                                    backgroundSize: "8px 8px",
                                  }}
                                />
                                
                                {/* Product type abbreviation or first letter */}
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: "bold",
                                    fontSize: isMobile ? "18px" : "24px",
                                    textTransform: "uppercase",
                                    letterSpacing: "1px",
                                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  {(product.source === "EPD" || product.type === "EPD") 
                                    ? "PDF" 
                                    : (product.name?.charAt(0) || product.product_name?.charAt(0) || "P")
                                  }
                                </Typography>
                              </Box>
                            )}
                            
                            {/* EPD label badge */}
                            {(product.source === "EPD" || product.type === "EPD") && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  backgroundColor: "var(--medium-green)",
                                  color: "white",
                                  fontSize: isMobile ? "10px" : "12px",
                                  fontWeight: "bold",
                                  padding: "2px 6px",
                                  borderBottomLeftRadius: "8px",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  border: "1px solid rgba(255,255,255,0.2)",
                                }}
                              >
                                EPD
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                color: "var(--dark-teal)",
                                fontSize: isMobile ? "16px" : "18px",
                                mb: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {product.name || product.product_name}
                            </Typography>
                            {/* Category/classific field */}
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#388e3c",
                                fontSize: isMobile ? "12px" : "13px",
                                mb: 0.5,
                                fontWeight: 500,
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <span style={{ color: '#00796b', fontWeight: 600 }}>Category:</span>{' '}
                              {(() => {
                                const cat = product.classific || product.category_name || 'No category';
                                if (cat.length > 40) {
                                  return (
                                    <span title={cat}>{cat.slice(0, 40)}...</span>
                                  );
                                }
                                return cat;
                              })()}
                            </Typography>
                            
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                mt: 1,
                              }}
                            >
                              {(product.source === "EPD" || product.type === "EPD") && product.pdf_url && (
                                <IconButton
                                  onClick={() => handleDownload(product.pdf_url)}
                                  size="small"
                                  sx={{
                                    backgroundColor: "var(--light-green)",
                                    p: 1,
                                    "&:hover": {
                                      backgroundColor: "var(--medium-green)",
                                      "& svg": {
                                        color: "white",
                                      },
                                    },
                                  }}
                                >
                                  <DownloadIcon
                                    sx={{
                                      fontSize: isMobile ? "16px" : "18px",
                                      color: "var(--dark-green)",
                                    }}
                                  />
                                </IconButton>
                              )}
                              <IconButton
                                size="small"
                                sx={{
                                  backgroundColor: "var(--light-teal)",
                                  p: 1,
                                  "&:hover": {
                                    backgroundColor: "var(--primary-teal)",
                                    "& svg": {
                                      color: "white",
                                    },
                                  },
                                }}
                              >
                                <InfoOutlinedIcon
                                  sx={{
                                    fontSize: isMobile ? "16px" : "18px",
                                    color: "var(--dark-teal)",
                                  }}
                                />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleSendRequest(product)}
                                disabled={requestSending}
                                sx={{
                                  backgroundColor: "var(--light-teal)",
                                  p: 1,
                                  "&:hover": {
                                    backgroundColor: "var(--primary-teal)",
                                    "& svg": {
                                      color: "white",
                                    },
                                  },
                                  position: "relative",
                                }}
                              >
                                {requestSending &&
                                requestProduct?.name === product.name ? (
                                  <CircularProgress
                                    size={isMobile ? 16 : 18}
                                    thickness={5}
                                    sx={{ color: "var(--dark-teal)" }}
                                  />
                                ) : (
                                  <SendIcon
                                    sx={{
                                      fontSize: isMobile ? "16px" : "18px",
                                      color: "var(--dark-teal)",
                                    }}
                                  />
                                )}
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                    ))
                  ) : (
                    <Box
                      sx={{
                        gridColumn: "1 / -1",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 6,
                        px: 3,
                        textAlign: "center",
                        bgcolor: "rgba(224, 242, 241, 0.3)",
                        borderRadius: "16px",
                        border: "1px dashed var(--light-teal)",
                      }}
                    >
                      <Box
                        sx={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "white",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                          mb: 3,
                        }}
                      >
                        <PublicIcon sx={{ fontSize: 40, color: "var(--primary-teal)" }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          color: "var(--dark-teal)",
                          fontWeight: 600,
                          mb: 1,
                        }}
                      >
                        No Products Available
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#666",
                          maxWidth: "400px",
                        }}
                      >
                        {selectedCategory && selectedCategory !== "all" 
                          ? `There are no products in the "${selectedCategory}" category.`
                          : filterEpdOnly
                            ? "There are no EPD products available."
                            : "There are no products matching your criteria."}
                      </Typography>
                    </Box>
                  );
                } else {
                  return productsForCurrentPage.length > 0 ? (
                    productsForCurrentPage.map((product, index) => (
                      <ListItem
                        key={`Product${index}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "white",
                          padding: 0,
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: product.source === "EPD" 
                            ? "rgba(101, 184, 125, 0.3)" 
                            : "rgba(0, 0, 0, 0.08)",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
                          "&:hover": {
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                            transform: "translateY(-4px)",
                          },
                          "&:active": {
                            transform: isMobile ? "scale(0.98)" : "translateY(-4px)",
                          },
                        }}
                      >
                        {product.source === "EPD" && (
                          <Box
                            sx={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: "6px",
                              backgroundColor: "var(--medium-green)",
                              borderTopLeftRadius: "16px",
                              borderBottomLeftRadius: "16px",
                            }}
                          />
                        )}
                        
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            width: "100%",
                            p: isMobile ? 2 : 3,
                          }}
                        >
                          <Box
                            sx={{
                              width: isMobile ? "50px" : "80px",
                              height: isMobile ? "50px" : "80px",
                              marginRight: isMobile ? 2 : 3,
                              position: "relative",
                              flexShrink: 0,
                              borderRadius: "12px",
                              overflow: "hidden",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                            }}
                          >
                            {product.image_url ? (
                              // Use actual image if available
                              <Box
                                component="img"
                                src={product.image_url}
                                alt={product.name || product.product_name || "Product"}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              // Custom EPD placeholder design
                              <Box 
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  background: (product.source === "EPD" || product.type === "EPD")
                                    ? "linear-gradient(135deg, #65B87D 0%, #26A69A 100%)"
                                    : "linear-gradient(135deg, #B2DFDB 0%, #80CBC4 100%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                              >
                                {/* Diagonal pattern in background */}
                                <Box 
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    opacity: 0.1,
                                    backgroundImage: (product.source === "EPD" || product.type === "EPD")
                                      ? "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)"
                                      : "none",
                                    backgroundSize: "8px 8px",
                                  }}
                                />
                                
                                {/* Product type abbreviation or first letter */}
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: "bold",
                                    fontSize: isMobile ? "18px" : "24px",
                                    textTransform: "uppercase",
                                    letterSpacing: "1px",
                                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  {(product.source === "EPD" || product.type === "EPD") 
                                    ? "PDF" 
                                    : (product.name?.charAt(0) || product.product_name?.charAt(0) || "P")
                                  }
                                </Typography>
                              </Box>
                            )}
                            
                            {/* EPD label badge */}
                            {(product.source === "EPD" || product.type === "EPD") && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  backgroundColor: "var(--medium-green)",
                                  color: "white",
                                  fontSize: isMobile ? "10px" : "12px",
                                  fontWeight: "bold",
                                  padding: "2px 6px",
                                  borderBottomLeftRadius: "8px",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  border: "1px solid rgba(255,255,255,0.2)",
                                }}
                              >
                                EPD
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                color: "var(--dark-teal)",
                                fontSize: isMobile ? "16px" : "18px",
                                mb: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {product.name || product.product_name}
                            </Typography>
                            {/* Category/classific field */}
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#388e3c",
                                fontSize: isMobile ? "12px" : "13px",
                                mb: 0.5,
                                fontWeight: 500,
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <span style={{ color: '#00796b', fontWeight: 600 }}>Category:</span>{' '}
                              {(() => {
                                const cat = product.classific || product.category_name || 'No category';
                                if (cat.length > 40) {
                                  return (
                                    <span title={cat}>{cat.slice(0, 40)}...</span>
                                  );
                                }
                                return cat;
                              })()}
                            </Typography>
                            
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                mt: 1,
                              }}
                            >
                              {product.source === "EPD" && product.pdf_url && (
                                <IconButton
                                  onClick={() => handleDownload(product.pdf_url)}
                                  size="small"
                                  sx={{
                                    backgroundColor: "var(--light-green)",
                                    p: 1,
                                    "&:hover": {
                                      backgroundColor: "var(--medium-green)",
                                      "& svg": {
                                        color: "white",
                                      },
                                    },
                                  }}
                                >
                                  <DownloadIcon
                                    sx={{
                                      fontSize: isMobile ? "16px" : "18px",
                                      color: "var(--dark-green)",
                                    }}
                                  />
                                </IconButton>
                              )}
                              <IconButton
                                size="small"
                                sx={{
                                  backgroundColor: "var(--light-teal)",
                                  p: 1,
                                  "&:hover": {
                                    backgroundColor: "var(--primary-teal)",
                                    "& svg": {
                                      color: "white",
                                    },
                                  },
                                }}
                              >
                                <InfoOutlinedIcon
                                  sx={{
                                    fontSize: isMobile ? "16px" : "18px",
                                    color: "var(--dark-teal)",
                                  }}
                                />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleSendRequest(product)}
                                disabled={requestSending}
                                sx={{
                                  backgroundColor: "var(--light-teal)",
                                  p: 1,
                                  "&:hover": {
                                    backgroundColor: "var(--primary-teal)",
                                    "& svg": {
                                      color: "white",
                                    },
                                  },
                                  position: "relative",
                                }}
                              >
                                {requestSending &&
                                requestProduct?.name === product.name ? (
                                  <CircularProgress
                                    size={isMobile ? 16 : 18}
                                    thickness={5}
                                    sx={{ color: "var(--dark-teal)" }}
                                  />
                                ) : (
                                  <SendIcon
                                    sx={{
                                      fontSize: isMobile ? "16px" : "18px",
                                      color: "var(--dark-teal)",
                                    }}
                                  />
                                )}
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                    ))
                  ) : (
                    <Box
                      sx={{
                        gridColumn: "1 / -1",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 6,
                        px: 3,
                        textAlign: "center",
                        bgcolor: "rgba(224, 242, 241, 0.3)",
                        borderRadius: "16px",
                        border: "1px dashed var(--light-teal)",
                      }}
                    >
                      <Box
                        sx={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "white",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                          mb: 3,
                        }}
                      >
                        <PublicIcon sx={{ fontSize: 40, color: "var(--primary-teal)" }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          color: "var(--dark-teal)",
                          fontWeight: 600,
                          mb: 1,
                        }}
                      >
                        No Products Available
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#666",
                          maxWidth: "400px",
                        }}
                      >
                        There are currently no products available for{" "}
                        <strong>{countryNames[page - 1] || "this country"}</strong>.
                      </Typography>
                    </Box>
                  );
                }
              })()}
            </List>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={requestSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          bottom: isMobile ? 16 : 24,
          zIndex: 9999,
        }}
      >
        <Paper
          elevation={12}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0, 137, 123, 0.4)",
            width: isMobile ? "90%" : "400px",
            animation: "slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            "@keyframes slideUp": {
              "0%": {
                opacity: 0,
                transform: "translateY(50px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
            border: "1px solid #80CBC4",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #00897B 0%, #4DB6AC 100%)",
              animation: "shrink 4s linear forwards",
              "@keyframes shrink": {
                "0%": { width: "100%" },
                "100%": { width: "0%" },
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: isMobile ? "16px" : "20px",
              background: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: isMobile ? "40px" : "50px",
                height: isMobile ? "40px" : "50px",
                borderRadius: "50%",
                backgroundColor: "#00897B",
                marginRight: isMobile ? "12px" : "16px",
                boxShadow: "0 4px 12px rgba(0, 137, 123, 0.2)",
                animation: "pulse 1.5s infinite",
                "@keyframes pulse": {
                  "0%": {
                    boxShadow: "0 0 0 0 rgba(0, 137, 123, 0.4)",
                  },
                  "70%": {
                    boxShadow: "0 0 0 10px rgba(0, 137, 123, 0)",
                  },
                  "100%": {
                    boxShadow: "0 0 0 0 rgba(0, 137, 123, 0)",
                  },
                },
              }}
            >
              <SendIcon
                sx={{ color: "white", fontSize: isMobile ? "20px" : "24px" }}
              />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: "#00695C",
                  fontSize: isMobile ? "14px" : "16px",
                  marginBottom: "4px",
                }}
              >
                Request Sent Successfully!
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#546E7A",
                  fontSize: isMobile ? "12px" : "14px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Your request for{" "}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color: "#00796B",
                    mx: 0.5,
                    maxWidth: isMobile ? "120px" : "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                >
                  {requestProduct?.name}
                </Box>{" "}
                has been submitted
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={handleCloseSuccess}
              sx={{
                color: "#546E7A",
                "&:hover": {
                  backgroundColor: "rgba(0, 137, 123, 0.1)",
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  width: "18px",
                  height: "18px",
                  position: "relative",
                  "&::before, &::after": {
                    content: '""',
                    position: "absolute",
                    width: "2px",
                    height: "18px",
                    backgroundColor: "#546E7A",
                    top: 0,
                    left: "8px",
                  },
                  "&::before": {
                    transform: "rotate(45deg)",
                  },
                  "&::after": {
                    transform: "rotate(-45deg)",
                  },
                }}
              />
            </IconButton>
          </Box>
          <Box
            sx={{
              height: "6px",
              background: "linear-gradient(90deg, #B2DFDB 0%, #E0F2F1 100%)",
            }}
          />
        </Paper>
      </Snackbar>

      {/* Fallback Success Modal */}
      <Modal
        open={requestSuccess}
        onClose={handleCloseSuccess}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}
      >
        <Box
          sx={{
            width: isMobile ? "90%" : "400px",
            bgcolor: "background.paper",
            borderRadius: "16px",
            boxShadow: 24,
            p: 4,
            outline: "none",
            border: "2px solid #00897B",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "#00897B",
                mr: 2,
              }}
            >
              <SendIcon sx={{ color: "white" }} />
            </Box>
            <Typography variant="h6" component="h2" sx={{ color: "#00695C" }}>
              Request Sent!
            </Typography>
          </Box>
          <Typography sx={{ mt: 2, color: "#546E7A" }}>
            Your request for <strong>{requestProduct?.name}</strong> has been
            successfully submitted.
          </Typography>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Fab
              size="small"
              color="primary"
              onClick={handleCloseSuccess}
              sx={{
                backgroundColor: "#00897B",
                "&:hover": {
                  backgroundColor: "#00796B",
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  width: "18px",
                  height: "18px",
                  position: "relative",
                  "&::before, &::after": {
                    content: '""',
                    position: "absolute",
                    width: "2px",
                    height: "18px",
                    backgroundColor: "white",
                    top: 0,
                    left: "8px",
                  },
                  "&::before": {
                    transform: "rotate(45deg)",
                  },
                  "&::after": {
                    transform: "rotate(-45deg)",
                  },
                }}
              />
            </Fab>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default SearchBar;
