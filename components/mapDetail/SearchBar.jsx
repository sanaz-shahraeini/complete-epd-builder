import React, { useState, useEffect } from "react";
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

const SearchBar = ({ mapRef }) => {
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
  } = useSearch();

  // Synchronize local state with context
  useEffect(() => {
    setSearchQuery(contextSearchQuery);
    setShowResults(contextSearchQuery.length > 0);
  }, [contextSearchQuery]);

  const filteredProducts = searchResults || [];

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setContextSearchQuery(query);

    // Clear the selected product when typing a new search
    setSelectedProduct(null);

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
    if (showResults) {
      // If results are shown, clicking will close them
      setShowResults(false);
    } else {
      // If results are hidden, clear search and show results
      setSearchQuery("");
      setContextSearchQuery("");
      setSelectedProduct(null);
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
  const productsForModal = [...(regularProducts || []), ...(allProducts || [])];

  const groupedByCountry = Array.isArray(productsForModal)
    ? productsForModal.reduce((acc, product) => {
        const country = product.country || "Unknown";
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
        top: isMobile ? "70px" : "100px",
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
          width: isMobile ? "85%" : "70%",
          padding: isMobile ? "0 10px" : 0,
          position: "relative",
          zIndex: 999,
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "nowrap",
          margin: "0 auto",
        }}
      >
        <Grid
          item
          xs={isMobile ? 10 : 10}
          className="search-container"
          sx={{
            marginRight: isMobile ? "5px" : "10px",
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
            sx={{
              borderRadius: "25px",
              transition: "all 0.3s ease",
              position: "relative",
              zIndex: 999,
              "& .MuiOutlinedInput-root": {
                height: isMobile ? "40px" : "45px",
                borderRadius: "25px",
                background: "rgba(251, 251, 251, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                  transform: "translateY(-2px)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 8px 20px rgba(0, 137, 123, 0.15)",
                  background: "#ffffff",
                },
                ...(isMobile && {
                  "& .MuiOutlinedInput-input": {
                    fontSize: "14px",
                    padding: "8px 14px",
                    caretColor: "#00897B",
                  },
                }),
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      sx={{
                        padding: isMobile ? "8px" : "4px",
                        color: "#00897B",
                      }}
                    >
                      <HelpOutlineIcon
                        fontSize={isMobile ? "small" : "medium"}
                      />
                    </IconButton>
                    <IconButton
                      onClick={() => setShowResults(true)}
                      sx={{
                        padding: isMobile ? "8px" : "4px",
                        color: "#00897B",
                        "&:active": {
                          transform: "scale(0.95)",
                        },
                      }}
                    >
                      <SearchIcon fontSize={isMobile ? "small" : "medium"} />
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
            justifyContent: "center",
            paddingRight: isMobile ? "5px" : 0,
            paddingLeft: isMobile ? "0px" : "5px",
            height: "45px",
            position: "relative",
            zIndex: 999,
          }}
        >
          <Fab
            size={isMobile ? "small" : "medium"}
            aria-label="Icon"
            sx={{
              background: "white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease",
              width: isMobile ? "32px" : "40px",
              height: isMobile ? "32px" : "40px",
              minHeight: "unset",
              marginLeft: 0,
              "&:hover": {
                background: "#E0F2F1",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                transform: "translateY(-2px)",
              },
            }}
            onClick={handleIconClick}
          >
            {React.cloneElement(icon, {
              sx: {
                color: "#384029",
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
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          },
        }}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: isMobile ? "flex-end" : "center",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1003,
          margin: 0,
          WebkitOverflowScrolling: "touch",
          p: isMobile ? 0 : 3,
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            width: isMobile ? "100%" : "90%",
            maxWidth: isMobile ? "100%" : "1400px",
            maxHeight: isMobile ? "85vh" : "90vh",
            minHeight: isMobile ? "auto" : "50vh",
            bgcolor: "white",
            padding: isMobile ? "16px" : "32px",
            borderRadius: isMobile ? "20px 20px 0 0" : "24px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            position: "relative",
            animation: "fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "@keyframes fadeIn": {
              "0%": {
                opacity: 0,
                transform: isMobile ? "translateY(100%)" : "scale(0.95)",
              },
              "100%": {
                opacity: 1,
                transform: isMobile ? "translateY(0)" : "scale(1)",
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: isMobile ? 2 : 4,
              borderBottom: "2px solid #E0F2F1",
              paddingBottom: isMobile ? 2 : 3,
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 2 : 3,
            }}
          >
            <Typography
              variant={isMobile ? "body2" : "h6"}
              sx={{
                color: "#00897B",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 1 : 2,
                fontSize: isMobile ? "14px" : "1.25rem",
              }}
            >
              <PublicIcon sx={{ fontSize: isMobile ? 18 : 28 }} />
              Products from {countryNames[page - 0] || "All Countries"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 1 : 2,
                backgroundColor: "#E0F2F1",
                padding: isMobile ? "6px 12px" : "12px 24px",
                borderRadius: "12px",
                width: isMobile ? "100%" : "auto",
                justifyContent: isMobile ? "center" : "flex-start",
              }}
            >
              <Typography
                variant={isMobile ? "body2" : "body1"}
                sx={{
                  color: "#00897B",
                  fontWeight: 600,
                  fontSize: isMobile ? "12px" : "1rem",
                }}
              >
                {countryNames.length} Countries
              </Typography>
              <Typography variant="body2" sx={{ color: "#00897B" }}>
                •
              </Typography>
              <Typography
                variant={isMobile ? "body2" : "body1"}
                sx={{
                  color: "#00897B",
                  fontWeight: 600,
                  fontSize: isMobile ? "12px" : "1rem",
                }}
              >
                Page {page} of {countryNames.length}
              </Typography>
            </Box>
          </Box>

          <List
            sx={{
              padding: 0,
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fill, minmax(600px, 1fr))",
              gap: isMobile ? 2 : 3,
              mt: isMobile ? 2 : 4,
            }}
          >
            {productsForCurrentPage.length > 0 ? (
              productsForCurrentPage.map((product, index) => (
                <ListItem
                  key={`Product${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor:
                      product.source === "EPD" ? "#E8F5E9" : "#ffffff",
                    height: "auto",
                    padding: isMobile ? 2 : 4,
                    borderRadius: isMobile ? "12px" : "20px",
                    border: "1px solid",
                    borderColor:
                      product.source === "EPD" ? "#A5D6A7" : "#E0E0E0",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                      transform: "translateY(-4px)",
                      backgroundColor:
                        product.source === "EPD" ? "#C8E6C9" : "#F5F5F5",
                    },
                    "&:active": {
                      transform: isMobile ? "scale(0.98)" : "translateY(-4px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: isMobile ? "40px" : "80px",
                      height: isMobile ? "40px" : "80px",
                      marginRight: isMobile ? 1.5 : 3,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={
                        product.image_url || "/public/images/images(map).png"
                      }
                      alt={"No image"}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: isMobile ? "8px" : "16px",
                      }}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant={isMobile ? "body2" : "h6"}
                      sx={{
                        fontWeight: 500,
                        color: "#424242",
                        fontSize: isMobile ? "13px" : "1.1rem",
                        mb: isMobile ? 0.5 : 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontSize: isMobile ? "11px" : "0.9rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.industry_solution || "No category"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: isMobile ? 1 : 2,
                      ml: isMobile ? 1 : 3,
                    }}
                  >
                    {product.source === "EPD" && product.pdf_url && (
                      <IconButton
                        onClick={() => handleDownload(product.pdf_url)}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          backgroundColor: "#C8E6C9",
                          padding: isMobile ? "6px" : "12px",
                          "&:hover": {
                            backgroundColor: "#A5D6A7",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <DownloadIcon
                          sx={{
                            fontSize: isMobile ? "16px" : "24px",
                            color: "#2E7D32",
                          }}
                        />
                      </IconButton>
                    )}
                    <IconButton
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        backgroundColor: "#E0F2F1",
                        padding: isMobile ? "6px" : "12px",
                        "&:hover": {
                          backgroundColor: "#B2DFDB",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <InfoOutlinedIcon
                        sx={{
                          fontSize: isMobile ? "16px" : "24px",
                          color: "#00897B",
                        }}
                      />
                    </IconButton>
                    <Tooltip title="Send product request" arrow>
                      <IconButton
                        size={isMobile ? "small" : "medium"}
                        onClick={() => handleSendRequest(product)}
                        disabled={requestSending}
                        sx={{
                          backgroundColor: "#B2DFDB",
                          padding: isMobile ? "6px" : "12px",
                          "&:hover": {
                            backgroundColor: "#80CBC4",
                            transform: "scale(1.1)",
                          },
                          position: "relative",
                        }}
                      >
                        {requestSending &&
                        requestProduct?.name === product.name ? (
                          <CircularProgress
                            size={isMobile ? 16 : 24}
                            thickness={5}
                            sx={{ color: "#00796B" }}
                          />
                        ) : (
                          <SendIcon
                            sx={{
                              fontSize: isMobile ? "16px" : "24px",
                              color: "#00796B",
                            }}
                          />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  textAlign: "center",
                  py: isMobile ? 6 : 8,
                  color: "#666",
                  gridColumn: "1 / -1",
                  fontSize: isMobile ? "16px" : "24px",
                }}
              >
                No products available for{" "}
                {countryNames[page - 1] || "this country"}.
              </Typography>
            )}
          </List>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: isMobile ? 4 : 6,
              borderTop: "2px solid #E0F2F1",
              paddingTop: isMobile ? 2 : 4,
            }}
          >
            <Pagination
              count={countryNames.length}
              page={page}
              onChange={(event, value) => setPage(value)}
              size={isMobile ? "small" : "large"}
              sx={{
                "& .MuiPaginationItem-root": {
                  fontSize: isMobile ? "0.9rem" : "1.1rem",
                  minWidth: isMobile ? "30px" : "40px",
                  height: isMobile ? "30px" : "40px",
                  "&.Mui-selected": {
                    backgroundColor: "#00897B",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#00796B",
                    },
                  },
                },
              }}
            />
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
