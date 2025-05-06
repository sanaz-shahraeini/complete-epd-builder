import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Typography,
  Select,
  MenuItem,
  Skeleton,
  Grid,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Sidebar from "./Sidebar";
import FilteredInfoSection from "./FilteredInfoSection";
import ImageIcon from "@mui/icons-material/Image";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import { useSearch } from "../../useContexts/SearchContext";
import { useProducts } from "../../useContexts/ProductsContext";

const MainSidebar = ({
  selected,
  onSelect,
  yearRange,
  setYearRange,
  selectedCountry,
  setSelectedCountry,
  selectedProduct,
  setSelectedProduct,
  countryCoordinates,
  selectedCategory,
  setIsSidebarOpen,
  filterEpdOnly,
  setFilterEpdOnly,
}) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState();
  const [filteredExtraInfo, setFilteredExtraInfo] = useState([]);
  const [showLastProduct, setShowLastProduct] = useState(false);
  const [lastProductImage, setLastProductImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState("Top products");
  const sidebarRef = useRef(null);
  const { setSearchQuery, clearSearchQuery } = useSearch();
  const { allProducts: globalAllProducts } = useProducts();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on any interactive elements
      const isInteractiveElement =
        event.target.closest(".MuiSelect-root") ||
        event.target.closest(".MuiPopover-root") ||
        event.target.closest(".MuiMenuItem-root") ||
        event.target.closest(".MuiButton-root") ||
        event.target.closest("[role='button']") ||
        event.target.closest("[role='tab']") ||
        event.target.closest(".MuiPaper-root");

      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !isInteractiveElement
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsSidebarOpen]);

  // Fetch products data - modified for more direct approach
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching products with filters:", {
          selectedCategory,
          filterEpdOnly,
          selectedPriority
        });
        
        // Debug the exact category value
        if (selectedCategory && selectedCategory.toLowerCase().includes('beton')) {
          console.log("DEBUG - Concrete category detected:", selectedCategory);
          console.log("Lowercase version:", selectedCategory.toLowerCase());
        }
        
        // Approach 1: Try to use products from the global context first
        if (globalAllProducts && globalAllProducts.length > 0) {
          console.log(`Using ${globalAllProducts.length} products from global context`);
          
          // Filter concrete products directly from global context
          if (selectedCategory && selectedCategory.toLowerCase().includes('beton')) {
            const concreteProductsFromContext = globalAllProducts.filter(product => 
              (product.name && product.name.toLowerCase().includes('beton')) || 
              (product.category_name && product.category_name.toLowerCase().includes('beton')) ||
              (product.classific && product.classific.toLowerCase().includes('beton'))
            );
            
            console.log(`Found ${concreteProductsFromContext.length} concrete products from global context`);
            if (concreteProductsFromContext.length > 0) {
              setProducts(concreteProductsFromContext);
              setIsLoading(false);
              return; // Skip the rest of the fetching if we found products
            }
          }
        }
        
        // If we couldn't use global context or didn't find concrete products,
        // continue with direct API fetching
        let epdProducts = [];
        let regularProducts = [];
        
        // 1. Fetch EPD products first - they usually have concrete products
        try {
          const epdResponse = await fetch(
            "https://epd-fullstack-project.vercel.app/api/ibudata/"
          );
          if (epdResponse.ok) {
            const epdData = await epdResponse.json();
            console.log(`EPD API returned ${epdData.results.length} products`);
            
            // Format EPD products
            epdProducts = (epdData.results || []).map((item) => ({
              category_name: item.classific || null,
              name: item.name || "No name specified",
              industry_solution: "EPD Product",
              image_url: null,
              description: null,
              pdf_url: item.pdf_url || null,
              geo: item.geo || null,
              company_name: null,
              created_at: null,
              isFromEPDAPI: true,
              type: "EPD",
              ref_year: item.ref_year,
              uuid: item.uuid,
            }));
          } else {
            console.error("Failed to fetch EPD products:", epdResponse.status);
          }
        } catch (epdErr) {
          console.error("Error fetching EPD products:", epdErr);
        }
        
        // 2. Fetch regular products
        if (!filterEpdOnly) {
          try {
            const productsResponse = await fetch(
              "https://epd-fullstack-project.vercel.app/api/products/"
            );
            if (productsResponse.ok) {
              const productsApiData = await productsResponse.json();
              console.log(`Regular API returned ${productsApiData.results.length} products`);
              
              // Format regular products
              regularProducts = (productsApiData.results || []).map((item) => ({
                id: item.id || `product-${Math.random().toString(36).substr(2, 9)}`,
                category_name: item.category_name || null,
                name: item.product_name || item.name || "No name specified",
                industry_solution: item.industry_solution || "Regular Product",
                image_url: item.image_url || null,
                description: item.description || null,
                pdf_url: item.pdf_url || null,
                geo: item.geo || null,
                company_name: item.company_name || null,
                created_at: item.created_at || null,
                isFromEPDAPI: false,
                type: "Regular",
              }));
            } else {
              console.error("Failed to fetch regular products:", productsResponse.status);
            }
          } catch (regErr) {
            console.error("Error fetching regular products:", regErr);
          }
        }
        
        // Combine all products
        let allProducts = [...epdProducts, ...regularProducts];
        
        // Special handling for concrete categories - be more inclusive
        if (selectedCategory && selectedCategory.toLowerCase().includes('beton')) {
          // Pre-filter to keep only concrete-related products
          const concreteProducts = allProducts.filter(product => 
            (product.name && product.name.toLowerCase().includes('beton')) || 
            (product.category_name && product.category_name.toLowerCase().includes('beton')) ||
            (product.classific && product.classific.toLowerCase().includes('beton'))
          );
          
          console.log(`Found ${concreteProducts.length} concrete-related products`);
          
          // If we found concrete products, use them directly
          if (concreteProducts.length > 0) {
            console.log("Using concrete-specific products");
            allProducts = concreteProducts;
          }
        }
        
        console.log(`Using a total of ${allProducts.length} products for filtering`);
        setProducts(allProducts);
        
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error fetching products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [filterEpdOnly, selectedPriority, selectedCategory, globalAllProducts]);

  // Handle priority change
  const handlePriorityChange = (event) => {
    event.stopPropagation();
    const newPriority = event.target.value;
    
    // Only update if actually changing
    if (newPriority !== selectedPriority) {
      setSelectedPriority(newPriority);
  
      // Reset any filters when changing priority
      if (newPriority === "Top products" && filterEpdOnly) {
        setFilterEpdOnly(false);
      }
  
      // Show loading state while fetching new products
      setIsLoading(true);
  
      // Clear search query when priority changes
      clearSearchQuery();
    }
  };

  // Remove a specific filter
  const handleRemoveInfo = (index) => {
    setFilteredExtraInfo((prevInfo) => prevInfo.filter((_, i) => i !== index));
  };

  // Remove last product
  const handleRemoveLastProduct = () => {
    setShowLastProduct(false);
  };

  // Filter extra info based on selected country, year range, and category
  useEffect(() => {
    const newFilteredInfo = [];
    if (selectedCountry) {
      newFilteredInfo.push(`Filtered by country: ${selectedCountry}`);
    }
    if (yearRange) {
      newFilteredInfo.push(`Year range: ${yearRange[0]} - ${yearRange[1]}`);
    }
    if (selectedCategory && selectedCategory !== "all") {
      newFilteredInfo.push(`Category: ${selectedCategory}`);
    }
    setFilteredExtraInfo(newFilteredInfo);
  }, [selectedCountry, yearRange, selectedCategory]);

  // Update filtered info when a product is selected
  const handleProductClick = (product) => {
    setSelectedProduct(product.name);
    setFilteredExtraInfo((prevInfo) => [
      ...prevInfo,
      `Selected product: ${product.name}`,
      `Industry solution: ${product.industry_solution}`,
    ]);
    // Enable the last product display and set image if available
    setShowLastProduct(true);
    setLastProductImage(product.image_url);
  };

  // Add direct debug API calls
  useEffect(() => {
    // Only run this when a category is selected and no products are shown
    if (selectedCategory !== "all" && selectedCategory.toLowerCase().includes('beton')) {
      console.log("DEBUG: Direct API call to fetch EPD products for concrete category:", selectedCategory);
      
      // Direct fetch to debug
      fetch("https://epd-fullstack-project.vercel.app/api/ibudata/")
        .then(res => res.json())
        .then(data => {
          console.log(`DEBUG: Direct API fetch returned ${data.results.length} products`);
          
          // Check for concrete products for specific categories
          if (selectedCategory.toLowerCase().includes('betonbauteile aus ort')) {
            console.log("Checking for Betonbauteile aus Ort- oder Lieferbeton products");
            
            // Sample basic concrete products - should work for any concrete category
            const concreteProducts = data.results.filter(p => 
              (p.name && p.name.toLowerCase().includes('beton'))
            );
            console.log(`Found ${concreteProducts.length} basic concrete products`);
            
            // Force show EPD concrete products directly as a workaround
            if (concreteProducts.length > 0) {
              // Format the first few concrete products for display
              const formattedProducts = concreteProducts.slice(0, 10).map((item) => ({
                category_name: item.classific || "Concrete Products",
                name: item.name || "Concrete Product",
                industry_solution: "EPD Product",
                image_url: null,
                description: null,
                pdf_url: item.pdf_url || null,
                geo: item.geo || null,
                company_name: null,
                created_at: null,
                isFromEPDAPI: true,
                type: "EPD",
                ref_year: item.ref_year,
                uuid: item.uuid,
              }));
              
              console.log(`DEBUG: Directly setting ${formattedProducts.length} concrete products for display`);
              setProducts(formattedProducts);
              setIsLoading(false);
            }
          } else {
            // Check for concrete products
            if (selectedCategory.toLowerCase().includes('beton')) {
              const concreteProducts = data.results.filter(p => 
                (p.name && p.name.toLowerCase().includes('beton')) || 
                (p.classific && p.classific.toLowerCase().includes('beton'))
              );
              console.log(`DEBUG: Found ${concreteProducts.length} concrete products`);
              if (concreteProducts.length > 0) {
                console.log("DEBUG: Sample concrete product:", concreteProducts[0]);
              }
            }
          }
        })
        .catch(err => console.error("DEBUG: Direct API call failed", err));
    }
  }, [selectedCategory, products.length, setProducts, setIsLoading]);

  // Filter and sort products based on selected category and priority
  const getFilteredAndSortedProducts = () => {
    console.log("Current products count:", products.length);
    console.log("Selected category:", selectedCategory);

    // Special approach for concrete categories
    if (selectedCategory && selectedCategory !== "all" && 
        (selectedCategory.toLowerCase().includes('beton') || 
         selectedCategory.toLowerCase().includes('concrete'))) {
      console.log("DEBUG: Using enhanced concrete product filtering");
      
      // Prepare basic search terms
      let searchTerms = ['beton', 'concrete'];
      let exclusionTerms = [];
      
      // Category-specific search terms 
      if (selectedCategory.toLowerCase().includes('porenbeton')) {
        // For Normal-Leicht-und-Porenbeton category
        console.log("Using Porenbeton-specific filtering");
        searchTerms = ['porenbeton', 'pore', 'poren', 'leicht'];
        // Don't include standard concrete terms for Porenbeton category
        exclusionTerms = ['stahlbeton', 'beton c'];
      } else if (selectedCategory.toLowerCase().includes('betonbauteile')) {
        // For Betonbauteile category
        console.log("Using Betonbauteile-specific filtering");
        // Make search terms more inclusive for Betonbauteile
        searchTerms = ['beton', 'concrete', 'liefer', 'ort', 'fertig'];
        // Don't exclude too much
        exclusionTerms = [];
      }
      
      console.log("Using category-specific search terms:", searchTerms);
      console.log("Excluding terms:", exclusionTerms);
      
      // Multi-approach filtering with category-specific logic
      const concreteProducts = products.filter(product => {
        const productName = (product.name || "").toLowerCase();
        const productCategory = (product.category_name || product.classific || "").toLowerCase();
        
        // Skip products matching exclusion terms
        if (exclusionTerms.some(term => 
            productName.includes(term) || productCategory.includes(term))) {
          return false;
        }
        
        // Special case for Betonbauteile aus Ort- oder Lieferbeton
        if (selectedCategory.toLowerCase().includes('betonbauteile aus ort')) {
          // For this specific category, we'll be very inclusive
          if (productName.includes('beton') || productCategory.includes('beton')) {
            return true;
          }
          
          // Accept any concrete-related product
          if (product.type === "EPD" && (
              productName.includes('c20') || 
              productName.includes('c25') || 
              productName.includes('c30') || 
              productName.includes('concrete'))) {
            return true;
          }
        }
        
        // 1. Direct match by name
        if (product.name && searchTerms.some(term => productName.includes(term))) {
          return true;
        }
        
        // 2. Match by category
        if (productCategory && searchTerms.some(term => productCategory.includes(term))) {
          return true;
        }
        
        // 3. Special case for EPD products when we need to look deeper
        if (product.type === "EPD") {
          // Look for matches in all string properties
          const hasMatch = searchTerms.some(term => 
            Object.values(product).some(val => 
              typeof val === 'string' && val.toLowerCase().includes(term)
            )
          );
          
          // For Normal-Leicht-und-Porenbeton, prioritize products with those terms
          if (selectedCategory.toLowerCase().includes('porenbeton')) {
            // Check if the EPD product contains specific terms
            if (productName.includes('leicht') || productName.includes('poren')) {
              return true;
            }
          }
          
          return hasMatch;
        }
        
        return false;
      });
      
      console.log(`Enhanced concrete filtering found ${concreteProducts.length} products for category: ${selectedCategory}`);
      
      // Sort concretely by specific category
      let sortedProducts = [...concreteProducts];
      
      // For Porenbeton, prioritize those with "poren" or "leicht" in the name
      if (selectedCategory.toLowerCase().includes('porenbeton')) {
        sortedProducts.sort((a, b) => {
          const aName = (a.name || "").toLowerCase();
          const bName = (b.name || "").toLowerCase();
          
          // Products with "poren" in name come first
          const aHasPoren = aName.includes('poren');
          const bHasPoren = bName.includes('poren');
          
          if (aHasPoren && !bHasPoren) return -1;
          if (!aHasPoren && bHasPoren) return 1;
          
          // Then products with "leicht" in name
          const aHasLeicht = aName.includes('leicht');
          const bHasLeicht = bName.includes('leicht');
          
          if (aHasLeicht && !bHasLeicht) return -1;
          if (!aHasLeicht && bHasLeicht) return 1;
          
          return 0;
        });
      }
      
      // For Betonbauteile, prioritize those with "fertig" or "bauteil" in the name
      if (selectedCategory.toLowerCase().includes('betonbauteile')) {
        sortedProducts.sort((a, b) => {
          const aName = (a.name || "").toLowerCase();
          const bName = (b.name || "").toLowerCase();
          
          // Products with "bauteil" in name come first
          const aHasBauteil = aName.includes('bauteil');
          const bHasBauteil = bName.includes('bauteil');
          
          if (aHasBauteil && !bHasBauteil) return -1;
          if (!aHasBauteil && bHasBauteil) return 1;
          
          // Then products with "fertig" in name
          const aHasFertig = aName.includes('fertig');
          const bHasFertig = bName.includes('fertig');
          
          if (aHasFertig && !bHasFertig) return -1;
          if (!aHasFertig && bHasFertig) return 1;
          
          return 0;
        });
      }
      
      // Finally apply priority sort on the pre-sorted list
      sortedProducts = sortByPriority(sortedProducts); 
      
      // Return at most 10 products
      return sortedProducts.slice(0, 10);
    }

    // Standard approach for other categories
    let filtered = products;

    if (selectedCategory && selectedCategory !== "all") {
      console.log("Standard category filtering for:", selectedCategory);
      // Log all product categories to debug what's available
      const allCategories = products.map(p => p.category_name || p.classific || "none").filter(c => c !== "none");
      console.log("Number of products with categories:", allCategories.length);
      console.log("Sample categories:", allCategories.slice(0, 10));
      
      const categoryLower = selectedCategory.toLowerCase();
      console.log("Looking for category containing:", categoryLower);
      
      filtered = filtered.filter((product) => {
        // Look at all possible category fields
        const productCategory = product.category_name || product.classific || "";
        const productName = product.name || "";
        
        // Check name for category matches too
        if (productName.toLowerCase().includes(categoryLower)) {
          return true;
        }
        
        // Handle different formats of category data
        if (typeof productCategory === "string") {
          return productCategory.toLowerCase().includes(categoryLower);
        } else if (Array.isArray(productCategory)) {
          return productCategory.some(cat => 
            typeof cat === "string" && cat.toLowerCase().includes(categoryLower)
          );
        }
        
        return false;
      });
    }
    
    console.log("After category filtering:", filtered.length, "products remain");

    // Helper function to sort by priority
    const sortedProducts = sortByPriority(filtered);
    
    // Apply limits
    if (selectedCategory !== "all" || filterEpdOnly) {
      const beforeLimit = sortedProducts.length;
      const result = sortedProducts.slice(0, 10);
      console.log(`Limited from ${beforeLimit} to ${result.length} products`);
      return result;
    } else {
      // Limit to 15 products for regular view
      const beforeLimit = sortedProducts.length;
      const result = sortedProducts.slice(0, 15);
      console.log(`Limited from ${beforeLimit} to ${result.length} products`);
      return result;
    }
  };
  
  // Helper function to sort products by priority
  const sortByPriority = (products) => {
    if (selectedPriority === "New arrivals") {
      return [...products].sort((a, b) => {
        // First try to sort by created_at timestamp
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }

        // If created_at is not available, fall back to ref_year
        const yearA = a.ref_year || 0;
        const yearB = b.ref_year || 0;
        return yearB - yearA;
      });
    }
    return products; // Default no sort
  };

  const filteredProducts = getFilteredAndSortedProducts();

  // Function to handle image errors
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = "none";
    e.target.parentNode.querySelector(".fallback-icon").style.display = "flex";
  };

  return (
    <>
      <Box
        ref={sidebarRef}
        sx={{
          width: "128%",
          bgcolor: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "68vh",
          marginLeft: { xs: "-1%", md: "9%" },
          marginTop: "5px",
        }}
      >
        {/* Buttons */}
        <Box
          sx={{
            bgcolor: "#ffffff",
            display: "flex",
            justifyContent: "center",
            borderRadius: "20px",
            margin: "15px",
            padding: "4px",
            border: `1px solid var(--light-teal)`,
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={6} md={6}>
              <Button
                variant={selected === "Legend" ? "contained" : "outlined"}
                color="success"
                onClick={() => onSelect("Legend")}
                sx={{
                  width: "100%",
                  height: "40px",
                  border: "none",
                  borderRadius: "20px",
                  background:
                    selected === "Legend"
                      ? "var(--gradient-teal)"
                      : "#ffffff",
                  color: selected === "Legend" ? "white" : "var(--primary-teal)",
                  fontWeight: "bold",
                  boxShadow: "none",
                  "&:hover": {
                    background: selected === "Legend"
                      ? "var(--gradient-mixed)"
                      : "var(--light-teal)",
                    color: selected === "Legend" ? "white" : "var(--dark-teal)",
                  },
                }}
              >
                Legend
              </Button>
            </Grid>

            <Grid item xs={6} md={6}>
              <Button
                variant={selected === "Products" ? "contained" : "outlined"}
                color="success"
                onClick={() => onSelect("Products")}
                sx={{
                  width: "100%",
                  height: "40px",
                  border: "none",
                  borderRadius: "20px",
                  background:
                    selected === "Products"
                      ? "var(--gradient-teal)"
                      : "#ffffff",
                  color: selected === "Products" ? "white" : "var(--primary-teal)",
                  fontWeight: "bold",
                  boxShadow: "none",
                  "&:hover": {
                    background: selected === "Products"
                      ? "var(--gradient-mixed)"
                      : "var(--light-teal)",
                    color: selected === "Products" ? "white" : "var(--dark-teal)",
                  },
                }}
              >
                Products
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Select Priority */}
        {selected === "Products" && (
          <Box
            sx={{
              bgcolor: "white",
              mx: 2,
              my: 1.5,
              p: 1.5,
              borderRadius: "24px",
              border: "1px solid var(--light-teal)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
            }}
          >
            <Grid container alignItems="center" spacing={1}>
              <Grid item xs={5}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: "var(--text-dark)",
                    pl: 1
                  }}
                >
                  Select Priority
                </Typography>
              </Grid>
              <Grid item xs={7}>
                <Select
                  value={selectedPriority}
                  onChange={handlePriorityChange}
                  onClick={(e) => e.stopPropagation()}
                  onClose={(e) => e.stopPropagation()}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    PaperProps: {
                      onClick: (e) => e.stopPropagation(),
                      sx: {
                        bgcolor: "#ffffff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        borderRadius: "10px",
                        mt: 0.5,
                      },
                    },
                  }}
                  variant="outlined"
                  size="small"
                  fullWidth
                  IconComponent={(props) => (
                    <span className={props.className} style={{ right: '8px' }}>
                      ▼
                    </span>
                  )}
                  displayEmpty
                  sx={{
                    bgcolor: "#ffffff",
                    borderRadius: "20px",
                    height: "42px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    "& .MuiSelect-select": {
                      color: "var(--text-dark)",
                      pl: 2,
                      pr: 3,
                      py: 1.2,
                      display: 'flex',
                      alignItems: 'center',
                    },
                    "&:hover": {
                      bgcolor: "var(--light-teal)",
                    },
                    "& fieldset": {
                      border: "1px solid var(--light-teal)",
                      borderRadius: "20px",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--primary-teal)",
                    },
                  }}
                >
                  <MenuItem
                    value="Top products"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ 
                      borderRadius: "8px",
                      mx: 0.5,
                      "&:hover": {
                        bgcolor: "var(--light-teal)",
                      }
                    }}
                  >
                    Top products
                  </MenuItem>
                  <MenuItem
                    value="New arrivals"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ 
                      borderRadius: "8px",
                      mx: 0.5,
                      "&:hover": {
                        bgcolor: "var(--light-teal)",
                      }
                    }}
                  >
                    New arrivals
                  </MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Main Content with Scroll */}
        <Box sx={{ overflowY: "auto", flexGrow: 1, padding: 2 }}>
          {selected === "Products" ? (
            <>
              {error ? (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body1" color="error" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setError(null);
                      setIsLoading(true);
                      // This will trigger a re-fetch due to the dependency array
                      setSelectedPriority(selectedPriority);
                    }}
                  >
                    Retry
                  </Button>
                </Box>
              ) : (
                <List>
                  {isLoading ? (
                    // Display skeletons while loading
                    Array.from(new Array(6)).map((_, index) => (
                      <ListItem key={`skeleton-${index}`} sx={{ py: 1 }}>
                        <Skeleton
                          variant="rectangular"
                          width={64}
                          height={64}
                          sx={{ mr: 2 }}
                        />
                        <Box sx={{ width: "100%" }}>
                          <Skeleton width="70%" height={24} />
                          <Skeleton width="40%" height={20} />
                        </Box>
                      </ListItem>
                    ))
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                      <React.Fragment key={product.id || `Product${index}`}>
                        <ListItem
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#ffffff",
                            px: 2,
                            py: 1.5,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "#f5f5f5",
                              transform: "translateX(2px)",
                            },
                          }}
                          onClick={() => handleProductClick(product)}
                        >
                          <Box
                            sx={{
                              width: "64px",
                              height: "64px",
                              backgroundColor: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "16px",
                              borderRadius: "8px",
                              overflow: "hidden",
                              position: "relative",
                              flexShrink: 0,
                              aspectRatio: "1/1",
                              transition: "all 0.3s ease",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              border: `1px solid var(--light-teal)`,
                              "&:hover": {
                                borderColor: "var(--primary-teal)",
                                transform: "scale(1.05)",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                              },
                              "&::before": {
                                content: '""',
                                display: "block",
                                paddingTop: "100%",
                              },
                            }}
                          >
                            {product.image_url ? (
                              <>
                                <Box
                                  component="img"
                                  src={product.image_url}
                                  alt={product.name}
                                  onError={handleImageError}
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    objectPosition: "center",
                                  }}
                                />
                                <Box
                                  className="fallback-icon"
                                  sx={{
                                    display: "none",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                    height: "100%",
                                    background: "#ffffff",
                                    color: "var(--primary-teal)",
                                    border: `1px solid var(--light-teal)`,
                                  }}
                                >
                                  <ViewInArIcon sx={{ fontSize: "32px" }} />
                                </Box>
                              </>
                            ) : (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "#ffffff",
                                  color: "var(--primary-teal)",
                                  border: `1px solid var(--light-teal)`,
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <ViewInArIcon sx={{ fontSize: "32px" }} />
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <ListItemText
                              primary={product.name}
                              secondary={
                                product.industry_solution ||
                                (product.isFromEPDAPI
                                  ? "EPD Product"
                                  : "Regular Product")
                              }
                              primaryTypographyProps={{
                                sx: {
                                  fontWeight: 500,
                                  color: "var(--text-dark)",
                                  fontSize: "15px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                },
                              }}
                              secondaryTypographyProps={{
                                sx: {
                                  color: "var(--text-medium)",
                                  fontSize: "14px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                },
                              }}
                            />
                          </Box>

                          <IconButton
                            size="small"
                            sx={{
                              ml: "auto",
                              color: "var(--primary-teal)",
                              "&:hover": {
                                backgroundColor: "var(--light-teal)",
                              },
                            }}
                          >
                            <InfoOutlinedIcon />
                          </IconButton>
                        </ListItem>
                        {index < filteredProducts.length - 1 && (
                          <Divider sx={{ width: "100%", bgcolor: "#e0e0e0" }} />
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Typography
                        variant="body1"
                        sx={{ color: "#666", mb: 2 }}
                      >
                        No products found for &quot;{selectedCategory}&quot; category.
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => {
                          // Reset category filter
                          setSelectedCategory("all");
                          // Toggle sidebar to Products view
                          onSelect("Products");
                        }}
                        sx={{
                          borderRadius: "20px",
                          borderColor: "var(--primary-teal)",
                          color: "var(--primary-teal)",
                          "&:hover": {
                            backgroundColor: "var(--light-teal)",
                            borderColor: "var(--dark-teal)",
                          }
                        }}
                      >
                        Reset Filter
                      </Button>
                    </Box>
                  )}
                </List>
              )}
            </>
          ) : (
            <Sidebar
              yearRange={yearRange}
              setYearRange={setYearRange}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              countryCoordinates={countryCoordinates}
              filterEpdOnly={filterEpdOnly}
              setFilterEpdOnly={setFilterEpdOnly}
            />
          )}
        </Box>
      </Box>

      {/* Filtered Info Section */}
      <FilteredInfoSection
        extraInfo={filteredExtraInfo}
        showLastProduct={showLastProduct}
        productImage={lastProductImage}
        handleRemoveInfo={handleRemoveInfo}
        handleRemoveLastProduct={handleRemoveLastProduct}
      />
    </>
  );
};

export default MainSidebar;
