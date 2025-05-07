"use client";

// Setup Leaflet to work with Next.js and dynamic imports
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import countryCoordinates from "../../public/data/countryCoordinates";
import { useProducts } from "../../useContexts/ProductsContext";
import { useSearch } from "../../useContexts/SearchContext";
import Loading from "../common/Loading";
import { formatProductName } from "../../utils/formatProductName";

// Dynamically import react-leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => <div>Loading map component...</div>,
  }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const useMap = dynamic(
  () => import("react-leaflet").then((mod) => mod.useMap),
  { ssr: false }
);

const useMapEvents = dynamic(
  () => import("react-leaflet").then((mod) => mod.useMapEvents),
  { ssr: false }
);

const MapComponent = forwardRef(
  (
    {
      selectedCountry = "all",
      yearRange,
      selectedProduct = "all",
      selectedCategory,
      zoom,
      setZoom,
      filterEpdOnly = true, // Default to filtering only EPD markers by year
    },
    ref
  ) => {
    // 1. All useState hooks
    const [isBrowser, setIsBrowser] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locations, setLocations] = useState([]);
    const [epdFilterStats, setEpdFilterStats] = useState({
      total: 0,
      filtered: 0,
    });
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [processingData, setProcessingData] = useState(false);

    // 2. All useRef hooks
    const mapRef = useRef(null);
    const prevFilteredProductsRef = useRef(0);

    // 3. All context hooks
    const {
      allProducts,
      loading: productsLoading,
      error: productsError,
      selectedProduct: selectedProductContext,
    } = useProducts();
    const { searchResults: filteredProducts, setMarkerSelected } = useSearch();
    const filteredProductsList = filteredProducts || [];

    // Combined loading state for all data fetching operations
    const isLoading = loading || productsLoading || processingData;
    const loadingMessage = productsLoading
      ? "Loading products..."
      : processingData
      ? "Processing locations..."
      : loading
      ? "Processing locations..."
      : "Loading map...";

    // 4. useImperativeHandle (must be before conditional returns)
    useImperativeHandle(
      ref,
      () => ({
        centerOnLocation: (lat, lng, zoomLevel = 8) => {
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], zoomLevel);
          }
        },
        getLocationByProduct: (productName) => {
          const location = locations.find(
            (loc) =>
              (loc.product || "").toLowerCase() === productName.toLowerCase()
          );
          return location;
        },
        highlightMarker: (productId) => {
          // Function to highlight a specific marker
          console.log("Highlighting marker for product:", productId);
          // Implementation depends on how markers are tracked in this component
        },
        resetView: () => {
          // Reset the map view to default state
          console.log("Resetting map view to default");
          if (mapRef.current) {
            // Default European view
            mapRef.current.setView([50, 10], 4);
            
            // Clear any selected markers or highlights
            setSelectedLocation(null);
          }
        },
        // Add zoom methods that work directly with the Leaflet map
        zoomIn: (zoomLevel = 1) => {
          console.log("Zoom in method called on map ref");
          if (mapRef.current) {
            try {
              // Check if direct zoomIn method exists
              if (typeof mapRef.current.zoomIn === 'function') {
                mapRef.current.zoomIn(zoomLevel);
                console.log("Used zoomIn method");
                return true;
              } 
              // Fallback to setView if zoomIn isn't available
              else if (typeof mapRef.current._zoom === 'number' && typeof mapRef.current.setView === 'function') {
                const currentZoom = mapRef.current._zoom;
                const newZoom = currentZoom + zoomLevel;
                const center = mapRef.current.getCenter();
                
                mapRef.current.setView(center, newZoom);
                console.log("Used setView method with _zoom");
                return true;
              }
            } catch (error) {
              console.error("Error zooming in:", error);
            }
          }
          return false;
        },
        zoomOut: (zoomLevel = 1) => {
          console.log("Zoom out method called on map ref");
          if (mapRef.current) {
            try {
              // Check if direct zoomOut method exists
              if (typeof mapRef.current.zoomOut === 'function') {
                mapRef.current.zoomOut(zoomLevel);
                console.log("Used zoomOut method");
                return true;
              } 
              // Fallback to setView if zoomOut isn't available
              else if (typeof mapRef.current._zoom === 'number' && typeof mapRef.current.setView === 'function') {
                const currentZoom = mapRef.current._zoom;
                const newZoom = currentZoom - zoomLevel;
                const center = mapRef.current.getCenter();
                
                mapRef.current.setView(center, newZoom);
                console.log("Used setView method with _zoom");
                return true;
              }
            } catch (error) {
              console.error("Error zooming out:", error);
            }
          }
          return false;
        },
        getZoom: () => {
          if (mapRef.current) {
            if (typeof mapRef.current.getZoom === 'function') {
              return mapRef.current.getZoom();
            }
            if (typeof mapRef.current._zoom === 'number') {
              return mapRef.current._zoom;
            }
          }
          return null;
        },
        // Add this debug method to help diagnose issues
        getMapInfo: () => {
          if (!mapRef.current) return { error: "No map instance available" };
          
          try {
            return {
              hasZoomIn: typeof mapRef.current.zoomIn === 'function',
              hasZoomOut: typeof mapRef.current.zoomOut === 'function',
              hasGetZoom: typeof mapRef.current.getZoom === 'function',
              hasSetZoom: typeof mapRef.current.setZoom === 'function',
              hasSetView: typeof mapRef.current.setView === 'function',
              hasGetCenter: typeof mapRef.current.getCenter === 'function',
              _zoom: typeof mapRef.current._zoom === 'number' ? mapRef.current._zoom : 'NA',
              actualZoom: typeof mapRef.current.getZoom === 'function' ? mapRef.current.getZoom() : 'NA',
              mapType: mapRef.current.constructor ? mapRef.current.constructor.name : 'unknown'
            };
          } catch (error) {
            return { error: error.message };
          }
        }
      }),
      [locations]
    );

    // 5. All useEffect hooks - MUST be before any conditional returns
    useEffect(() => {
      setIsBrowser(true);
    }, []);

    useEffect(() => {
      // Set loading state to true when starting to process locations, but only if we're not already loading products
      if (!productsLoading) {
        setLoading(true);
        setProcessingData(true);
      }

      if (!productsLoading && !productsError) {
        console.log("Processing product data for map...");

        // Decide which products to display
        const productsToShow =
          filteredProductsList && filteredProductsList.length > 0
            ? filteredProductsList
            : allProducts || [];

        console.log(`Map preparing to show ${productsToShow.length} products`);
        
        // Detailed logging about the current filter state
        console.log("MAP: Current filter status:", {
          searchActive: filteredProductsList && filteredProductsList.length > 0,
          filteredCount: filteredProductsList?.length || 0,
          categoryFilter: selectedCategory !== "all" ? selectedCategory : "none",
          epdOnlyFilter: filterEpdOnly,
          totalProductsCount: allProducts?.length || 0,
          visibleProductsCount: productsToShow.length,
          yearRangeFilter: yearRange ? `${yearRange[0]}-${yearRange[1]}` : "none"
        });

        // Log geo distribution for debugging
        if (productsToShow.length > 0) {
          const geoDistribution = {};
          productsToShow.forEach((product) => {
            const geo = product.geo || "undefined";
            geoDistribution[geo] = (geoDistribution[geo] || 0) + 1;
          });
          console.log("Map geo distribution:", geoDistribution);
        }

        if (productsToShow.length > 0) {
          // For performance, if there are too many products, let's set a reasonable limit
          // to avoid overwhelming the map rendering
          const maxProducts = 1000;
          let productsToProcess = productsToShow;

          if (productsToShow.length > maxProducts) {
            console.warn(
              `Too many products (${productsToShow.length}), limiting to ${maxProducts} for performance`
            );
            productsToProcess = productsToShow.slice(0, maxProducts);
          }

          // Format products for map display
          const formattedLocations = productsToProcess
            .map((product) => {
              // Ensure we have valid coordinates
              if (
                !product.lat ||
                !product.lng ||
                isNaN(parseFloat(product.lat)) ||
                isNaN(parseFloat(product.lng))
              ) {
                console.warn(
                  `Product missing valid coordinates: ${product.name}`
                );
                return null;
              }

              // Create a properly formatted location object
              return {
                lat: parseFloat(product.lat),
                lng: parseFloat(product.lng),
                country: product.country || "Unknown",
                refYear: product.ref_year || product.refYear || "all",
                validUntil: product.valid_until || product.validUntil || "all",
                product:
                  product.product_name || product.name || "Unnamed Product",
                description: product.description || "",
                isEpd: product.type === "EPD" ? "EPD" : null,
                isFromEPDAPI: product.isFromEPDAPI || false,
                isFromRegularAPI: product.isFromRegularAPI || false,
                categories: product.classific || product.category_name || "",
                // Additional debugging info
                geo: product.geo,
                geoMapped: product.geoMapped,
                productId: product.id || product.uid,
                pdf_url: product.pdf_url || null,
                company_name: product.company_name || "",
              };
            })
            .filter((location) => location !== null);

          console.log(
            `Map has ${formattedLocations.length} valid locations to display`
          );

          // Sample of the locations we're displaying
          if (formattedLocations.length > 0) {
            console.log("Sample location:", formattedLocations[0]);
          }

          setLocations(formattedLocations);
        } else {
          console.warn("No products to display on map");
          setLocations([]);
        }
      }

      // Always ensure loading is set to false after processing
      // Use a small timeout to ensure state updates have processed
      const timer = setTimeout(() => {
        setLoading(false);
        setProcessingData(false);
        console.log("Map loading complete, displaying markers");
      }, 500);

      return () => clearTimeout(timer);
    }, [allProducts, filteredProductsList, productsLoading, productsError]);

    useEffect(() => {
      // Debug log all products to help identify issues
      if (!productsLoading && allProducts) {
        console.log(`Total products available: ${allProducts.length}`);

        // Analyze geo field distribution
        const geoStats = {};
        allProducts.forEach((p) => {
          const geo = p.geo || "undefined";
          geoStats[geo] = (geoStats[geo] || 0) + 1;
        });
        console.log("Geo field distribution:", geoStats);

        // Log products with coordinates
        const withCoords = allProducts.filter((p) => p.lat && p.lng);
        console.log(
          `Products with coordinates: ${withCoords.length}/${allProducts.length}`
        );

        // Sample of products with coordinates
        if (withCoords.length > 0) {
          console.log(
            "Sample products with coordinates:",
            withCoords.slice(0, 3)
          );
        }

        // Sample of products without coordinates
        const withoutCoords = allProducts.filter((p) => !p.lat || !p.lng);
        if (withoutCoords.length > 0) {
          console.log(
            "Sample products without coordinates:",
            withoutCoords.slice(0, 3)
          );
        }
        
        // Dispatch event to notify that products are loaded
        if (typeof window !== 'undefined') {
          // Add a delay to ensure the page has time to stabilize before showing/hiding UI elements
          setTimeout(() => {
            console.log("Dispatching productsLoaded event");
            window.dispatchEvent(new CustomEvent('productsLoaded', { 
              detail: { 
                count: allProducts.length,
                timestamp: new Date().getTime()
              } 
            }));
          }, 1000); // 1 second delay
        }
      }
    }, [allProducts, productsLoading]);

    // Log the loading state for debugging
    useEffect(() => {
      console.log("Loading state:", {
        componentLoading: loading,
        productsLoading,
        processingData,
        isLoading,
      });
    }, [loading, productsLoading, processingData, isLoading]);

    const ZoomControl = ({ setZoom, zoom, getCircleRadius }) => {
      // 1. All useState hooks
      const [isMounted, setIsMounted] = useState(false);

      // 2. Get map instance
      const map = useMap();

      // 3. All useEffect hooks
      useEffect(() => {
        setIsMounted(true);
      }, []);

      useEffect(() => {
        if (!isMounted || !map) return;

        // Ensure map is properly initialized
        if (
          typeof map.getCenter === "function" &&
          typeof map.setView === "function"
        ) {
          mapRef.current = map;
          
          // Store map instance in window for global access
          if (typeof window !== 'undefined') {
            window.mapInstance = map;
            console.log("Map instance stored in window.mapInstance");
            // Log some methods to verify it's the correct Leaflet instance
            console.log("Available map methods:", {
              zoomIn: typeof map.zoomIn === 'function',
              zoomOut: typeof map.zoomOut === 'function',
              setView: typeof map.setView === 'function',
              getZoom: typeof map.getZoom === 'function',
              setZoom: typeof map.setZoom === 'function'
            });
            
            // Add custom methods for easier access
            if (typeof map.setZoom !== 'function' && typeof map.setView === 'function' && typeof map.getCenter === 'function') {
              console.log("Adding custom setZoom method to map instance");
              map.setZoom = function(newZoom) {
                const center = this.getCenter();
                this.setView(center, newZoom);
                console.log("Custom setZoom called with zoom level:", newZoom);
                return this;
              };
            }
          }
          
          try {
            const center = map.getCenter();
            if (center) {
              map.setView(center, zoom);
            }
          } catch (error) {
            console.warn("Map not ready yet:", error);
          }
        }
      }, [zoom, map, isMounted]);

      useEffect(() => {
        if (!isMounted || !map) return;

        // Ensure map is properly initialized
        if (typeof map.on === "function" && typeof map.getZoom === "function") {
          const updateZoom = () => {
            try {
              const currentZoom = map.getZoom();
              if (typeof currentZoom === "number") {
                setZoom(currentZoom);
                console.log(
                  `Zoom changed to: ${currentZoom}, circle radius: ${getCircleRadius(
                    currentZoom
                  )}`
                );
              }
            } catch (error) {
              console.warn("Error updating zoom:", error);
            }
          };

          map.on("zoomend", updateZoom);
          return () => {
            map.off("zoomend", updateZoom);
          };
        }
      }, [map, setZoom, isMounted]);

      // Early return if not mounted or no map
      if (!isMounted || !map) return null;

      return null;
    };

    const groupByCountry = (locations) => {
      return locations.reduce((acc, location) => {
        if (!acc[location.country]) {
          acc[location.country] = [];
        }
        acc[location.country].push(location);
        return acc;
      }, {});
    };

    const distributeCircles = (lat, lng, count) => {
      // Use a fixed radius that doesn't depend on zoom
      const maxRadius = 2;
      const angleStep = (2 * Math.PI) / count; //angular distance

      return Array.from({ length: count }, (_, i) => {
        const angle = i * angleStep;
        const distance = Math.random() * maxRadius;

        const latOffset = distance * Math.cos(angle);
        const lngOffset = distance * Math.sin(angle);

        return {
          lat: lat + latOffset,
          lng: lng + lngOffset,
        };
      });
    };

    const getDistributedLocations = (locations, zoom) => {
      const groupedLocations = groupByCountry(locations);

      return Object.values(groupedLocations).flatMap((group) => {
        return group.map((item, index) => {
          const centralLocation = group[0];
          const distributedCoords = distributeCircles(
            centralLocation.lat,
            centralLocation.lng,
            group.length
          );

          return {
            ...item,
            lat: distributedCoords[index].lat,
            lng: distributedCoords[index].lng,
          };
        });
      });
    };

    const getFilteredLocations = useCallback(() => {
      console.log("Total locations before filtering:", locations.length);
      console.log(
        "Filtered products from search:",
        filteredProductsList.length
      );
      console.log("Selected Product:", selectedProductContext);
      console.log("Year Range:", yearRange, "EPD Only:", filterEpdOnly);

      // Show loading state when filtering a large number of locations
      if (locations.length > 500) {
        setProcessingData(true);
      }

      // Early return if no locations
      if (!locations || locations.length === 0) {
        console.log("No locations available");
        setProcessingData(false);
        return { filtered: [], epdStats: { total: 0, filtered: 0 } };
      }

      // Counters for filtering statistics
      let totalEpdMarkers = 0;
      let epdMarkersFilteredByYear = 0;

      const filtered = locations.filter((location) => {
        // Count EPD markers from the EPD API only
        if (location && location.isEpd && location.isFromEPDAPI) {
          totalEpdMarkers++;
        }

        // Skip undefined or null locations
        if (!location || !location.product) {
          return false;
        }

        // If filterEpdOnly is true, only show EPD markers from the specific API
        if (filterEpdOnly) {
          // Only show markers from the EPD API when EPD Explorer is active
          if (!location.isFromEPDAPI) {
            return false;
          }
        }
        // When filterEpdOnly is false (All icon clicked), show all markers from both APIs
        // No additional filtering needed here as we want to show everything

        // If we have filtered products from search, use those
        if (filteredProductsList && filteredProductsList.length > 0) {
          return filteredProductsList.some((product) => {
            // Only show regular API products in search results, not EPD API products
            if (product.isFromEPDAPI) {
              return false;
            }

            const productName = product.product_name || product.name || "";
            const locationProduct = location.product || "";

            // Direct match
            if (productName === locationProduct) {
              console.log(
                `Product match found: "${productName}" === "${locationProduct}"`
              );
              return true;
            }

            // Special case for zehnder-basic-silent-wall-fan
            if (productName === "zehnder-basic-silent-wall-fan") {
              // Look for related names
              if (
                locationProduct.includes("silent-wall") ||
                locationProduct.includes("basic-silent") ||
                locationProduct.includes("wall-fan")
              ) {
                console.log(
                  `Special match found for zehnder-basic-silent-wall-fan: "${locationProduct}"`
                );
                return true;
              }
            }

            // Handle Zehnder products
            if (
              productName.toLowerCase().includes("zehnder-") &&
              locationProduct.toLowerCase().includes("zehnder-")
            ) {
              const productNameWithoutPrefix = productName
                .toLowerCase()
                .split("zehnder-")[1];
              const locationNameWithoutPrefix = locationProduct
                .toLowerCase()
                .split("zehnder-")[1];

              // Check if product name parts match the location product name parts
              const productNameParts = productNameWithoutPrefix.split("-");
              const locationNameParts = locationNameWithoutPrefix.split("-");

              // Check for at least 50% matching parts
              let matchingParts = 0;
              for (const part of productNameParts) {
                if (locationNameParts.includes(part)) {
                  matchingParts++;
                }
              }

              const matchRatio = matchingParts / productNameParts.length;
              if (matchRatio >= 0.5) {
                console.log(
                  `Zehnder partial match found: "${productName}" ~= "${locationProduct}" (${Math.round(
                    matchRatio * 100
                  )}% match)`
                );
                return true;
              }

              if (productNameWithoutPrefix === locationNameWithoutPrefix) {
                console.log(
                  `Zehnder exact match found: "${productName}" === "${locationProduct}" (without prefix)`
                );
                return true;
              }
            }

            return false;
          });
        }

        // If no filtered products, apply other filters
        const countryMatch =
          selectedCountry === "all" ||
          !selectedCountry ||
          location.country === selectedCountry;

        // Year filtering logic
        let yearMatch = true;
        if (yearRange[0] !== "all" && yearRange[1] !== "all") {
          // This should only apply to EPD markers from the EPD API if filterEpdOnly is true
          if (filterEpdOnly) {
            if (location.isEpd && location.isFromEPDAPI) {
              const refYearNum =
                location.refYear && location.refYear !== "all"
                  ? parseInt(location.refYear)
                  : null;
              yearMatch =
                location.refYear === "all" ||
                (refYearNum &&
                  refYearNum >= yearRange[0] &&
                  refYearNum <= yearRange[1]);

              // Debug EPD year filtering
              if (!yearMatch && location.refYear) {
                console.log(
                  `EPD Year filter excluded: ${location.product}, year: ${location.refYear}, range: [${yearRange[0]}, ${yearRange[1]}]`
                );
                epdMarkersFilteredByYear++;
              }
            }
            // Non-EPD markers and non-EPD API markers are not filtered by year when filterEpdOnly is true
          } else {
            // If filterEpdOnly is false, apply year filtering to all markers
            const refYearNum =
              location.refYear && location.refYear !== "all"
                ? parseInt(location.refYear)
                : null;
            yearMatch =
              location.refYear === "all" ||
              (refYearNum &&
                refYearNum >= yearRange[0] &&
                refYearNum <= yearRange[1]);
          }
        }

        const productMatch =
          selectedProduct === "all" ||
          !selectedProduct ||
          location.product === selectedProduct;

        const categoryMatch =
          selectedCategory === "all" ||
          !selectedCategory ||
          (location.categories && (
            // Improved category matching with case-insensitive partial matching
            typeof location.categories === "string"
              ? location.categories.toLowerCase().includes(selectedCategory.toLowerCase())
              : Array.isArray(location.categories) &&
                location.categories.some(cat => 
                  typeof cat === "string" && cat.toLowerCase().includes(selectedCategory.toLowerCase())
                )
          ));

        return countryMatch && yearMatch && productMatch && categoryMatch;
      });

      console.log("Filtered locations:", filtered.length);
      if (filtered.length === 0) {
        console.log("No locations matched the filters");
      } else {
        console.log("Sample filtered location:", filtered[0]);
      }

      // Log EPD filtering statistics
      if (filterEpdOnly && yearRange[0] !== "all" && yearRange[1] !== "all") {
        console.log(
          `EPD filtering statistics: ${
            totalEpdMarkers - epdMarkersFilteredByYear
          }/${totalEpdMarkers} EPD markers within year range [${
            yearRange[0]
          }, ${yearRange[1]}]`
        );
      }

      // Clear loading state
      setProcessingData(false);

      return {
        filtered,
        epdStats: {
          total: totalEpdMarkers,
          filtered: totalEpdMarkers - epdMarkersFilteredByYear,
        },
      };
    }, [
      locations,
      filteredProductsList,
      selectedProductContext,
      yearRange,
      filterEpdOnly,
      selectedCountry,
      selectedProduct,
      selectedCategory,
    ]);

    const { filtered: filteredLocations, epdStats } = useMemo(
      () => getFilteredLocations(),
      [getFilteredLocations]
    );

    // Update EPD filter stats state using useEffect to avoid render loops
    useEffect(() => {
      // Only update if the values are actually different to avoid render loops
      if (
        epdStats.total !== epdFilterStats.total ||
        epdStats.filtered !== epdFilterStats.filtered
      ) {
        setEpdFilterStats(epdStats);
      }
    }, [epdStats, epdFilterStats]);

    const distributedLocations = useMemo(
      () => getDistributedLocations(filteredLocations, zoom),
      [filteredLocations, zoom]
    );

    const getCircleRadius = (zoom) => {
      // Return fixed size circles regardless of zoom level
      return 10000; // A fixed size that works well at all zoom levels
    };

    useEffect(() => {
      if (selectedProductContext && locations.length > 0) {
        const selectedName =
          selectedProductContext.product_name || selectedProductContext.name;
        console.log("Selected product:", selectedName, selectedProductContext);

        // Try to find matching location
        let matchedLocation = null;

        // Special handling for zehnder-basic-silent-wall-fan
        if (selectedName === "zehnder-basic-silent-wall-fan") {
          console.log("Special handling for zehnder-basic-silent-wall-fan");

          // Try to find any locations with similar names
          matchedLocation = locations.find(
            (loc) =>
              loc.product &&
              (loc.product.includes("silent-wall") ||
                loc.product.includes("basic-silent") ||
                loc.product.includes("wall-fan"))
          );

          if (matchedLocation) {
            console.log("Found similar product:", matchedLocation.product);
          }
        }

        // If no special match found, try normal matching
        if (!matchedLocation) {
          matchedLocation = locations.find(
            (loc) => loc.product === selectedName
          );
        }

        // If still no match, try case-insensitive
        if (!matchedLocation) {
          if (typeof selectedName === 'string') {
            const lowerName = selectedName.toLowerCase();
            matchedLocation = locations.find(
              (loc) => (loc.product || "").toLowerCase() === lowerName
            );
          }
        }

        if (matchedLocation) {
          console.log("Found matching location:", matchedLocation);
          setSelectedLocation(matchedLocation);

          // Center map on the location
          if (mapRef.current) {
            console.log("mapRef.current at setView:", mapRef.current);
            if (typeof mapRef.current.setView === "function") {
              mapRef.current.setView(
                [matchedLocation.lat, matchedLocation.lng],
                8 // Zoom level
              );
            } else {
              console.error("mapRef.current does not have setView! It is:", mapRef.current);
            }
          }
        } else {
          console.warn("No matching location found for:", selectedName);

          // Use product's own coordinates if available
          if (selectedProductContext.lat && selectedProductContext.lng) {
            const newLocation = {
              lat: parseFloat(selectedProductContext.lat),
              lng: parseFloat(selectedProductContext.lng),
              product: selectedName,
              country: selectedProductContext.country || "Unknown",
              description: selectedProductContext.description || "",
            };

            setSelectedLocation(newLocation);

            if (mapRef.current) {
              console.log("mapRef.current at setView (newLocation):", mapRef.current);
              if (typeof mapRef.current.setView === "function") {
                mapRef.current.setView([newLocation.lat, newLocation.lng], 8);
              } else {
                console.error("mapRef.current does not have setView! It is:", mapRef.current);
              }
            }
          } else {
            setSelectedLocation(null);
          }
        }
      } else {
        setSelectedLocation(null);
      }
    }, [selectedProductContext, locations]);

    useEffect(() => {
      // If filteredProducts becomes empty and we had filtered products before
      if (
        filteredProductsList.length === 0 &&
        prevFilteredProductsRef.current > 0
      ) {
        console.log("Search results cleared, resetting map display");

        // No need to select a specific product when clearing search
        setSelectedLocation(null);

        // This will force a recalculation of locations
        if (mapRef.current) {
          console.log("mapRef.current at setView (reset):", mapRef.current);
          if (typeof mapRef.current.setView === "function") {
            mapRef.current.setView([30, -10], 3);
          } else {
            console.error("mapRef.current does not have setView! It is:", mapRef.current);
          }
        }
      }

      // Keep track of previous filteredProducts length
      prevFilteredProductsRef.current = filteredProductsList.length;
    }, [filteredProductsList]);

    useEffect(() => {
      setMarkerSelected(!!selectedLocation);
    }, [selectedLocation, setMarkerSelected]);

    // Early return with loading state if we're not in a browser environment or still loading products
    if (!isBrowser || isLoading) {
      return (
        <div style={{ position: "relative", height: "100vh", width: "100%" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 500,
              filter: "blur(2px)", // Remove blur completely
              WebkitFilter: "blur(2px)",
            }}
          >
            <MapContainer
              center={[30, -10]}
              zoom={3}
              style={{ height: "100vh", width: "100%" }}
              maxBounds={[
                [-90, -180],
                [90, 180],
              ]}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            </MapContainer>
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.2)",
              zIndex: 8000,
            }}
          >
            <Loading message={loadingMessage} fullScreen={false} />
          </div>
        </div>
      );
    }

    // This function will directly manipulate the Leaflet map
    const handleDirectZoom = (direction) => {
      if (!mapRef.current) return;
      
      console.log("Direct zoom called:", direction);
      try {
        if (direction === "in") {
          if (typeof mapRef.current.zoomIn === 'function') {
            mapRef.current.zoomIn(1);
          } else {
            // Get the internal Leaflet map object
            const leafletMap = mapRef.current._zoom !== undefined ? mapRef.current : null;
            if (leafletMap && typeof leafletMap.setView === 'function') {
              const currentZoom = leafletMap._zoom;
              const center = leafletMap.getCenter();
              leafletMap.setView(center, currentZoom + 1);
            }
          }
        } else if (direction === "out") {
          if (typeof mapRef.current.zoomOut === 'function') {
            mapRef.current.zoomOut(1);
          } else {
            // Get the internal Leaflet map object
            const leafletMap = mapRef.current._zoom !== undefined ? mapRef.current : null;
            if (leafletMap && typeof leafletMap.setView === 'function') {
              const currentZoom = leafletMap._zoom;
              const center = leafletMap.getCenter();
              leafletMap.setView(center, currentZoom - 1);
            }
          }
        }
      } catch (error) {
        console.error("Error in direct zoom:", error);
      }
    };

    const MapEvents = () => {
      console.log("MapEvents component initializing");
      
      const leafletMap = useMapEvents({
        load: () => {
          console.log("Map load event fired");
          // Store the map instance in window object and ref
          if (typeof window !== 'undefined') {
            // Store the actual map instance
            window.mapInstance = leafletMap;
            mapRef.current = leafletMap;
            console.log("Map instance stored globally on load event");
            
            // Create a wrapper object with zoom methods instead of extending the map object
            window.mapWrapper = {
              map: leafletMap,
              zoomIn: function(delta) {
                try {
                  if (typeof this.map.getZoom === 'function' && typeof this.map.setView === 'function') {
                    const newZoom = this.map.getZoom() + (delta || 1);
                    this.map.setView(this.map.getCenter(), newZoom);
                    console.log("Wrapper zoomIn called, new zoom:", newZoom);
                    return true;
                  } else if (typeof this.map._zoom === 'number' && typeof this.map.setView === 'function') {
                    // Fallback using internal _zoom property
                    const newZoom = this.map._zoom + (delta || 1);
                    this.map.setView(this.map.getCenter(), newZoom);
                    console.log("Wrapper zoomIn called using _zoom, new zoom:", newZoom);
                    return true;
                  } else if (typeof this.map.zoomIn === 'function') {
                    // Use native zoomIn if available
                    this.map.zoomIn(delta || 1);
                    console.log("Wrapper used native zoomIn");
                    return true;
                  }
                  
                  // Last resort: try to click the Leaflet control button
                  const zoomInBtn = document.querySelector('.leaflet-control-zoom-in');
                  if (zoomInBtn) {
                    console.log("Clicking native Leaflet zoom-in button");
                    zoomInBtn.click();
                    return true;
                  }
                  
                  return false;
                } catch (error) {
                  console.error("Error in wrapper zoomIn:", error);
                  return false;
                }
              },
              zoomOut: function(delta) {
                try {
                  if (typeof this.map.getZoom === 'function' && typeof this.map.setView === 'function') {
                    const newZoom = this.map.getZoom() - (delta || 1);
                    this.map.setView(this.map.getCenter(), newZoom);
                    console.log("Wrapper zoomOut called, new zoom:", newZoom);
                    return true;
                  } else if (typeof this.map._zoom === 'number' && typeof this.map.setView === 'function') {
                    // Fallback using internal _zoom property
                    const newZoom = this.map._zoom - (delta || 1);
                    this.map.setView(this.map.getCenter(), newZoom);
                    console.log("Wrapper zoomOut called using _zoom, new zoom:", newZoom);
                    return true;
                  } else if (typeof this.map.zoomOut === 'function') {
                    // Use native zoomOut if available
                    this.map.zoomOut(delta || 1);
                    console.log("Wrapper used native zoomOut");
                    return true;
                  }
                  
                  // Last resort: try to click the Leaflet control button
                  const zoomOutBtn = document.querySelector('.leaflet-control-zoom-out');
                  if (zoomOutBtn) {
                    console.log("Clicking native Leaflet zoom-out button");
                    zoomOutBtn.click();
                    return true;
                  }
                  
                  return false;
                } catch (error) {
                  console.error("Error in wrapper zoomOut:", error);
                  return false;
                }
              },
              getZoom: function() {
                try {
                  if (typeof this.map.getZoom === 'function') {
                    return this.map.getZoom();
                  } else if (typeof this.map._zoom === 'number') {
                    return this.map._zoom;
                  }
                  return 3; // Default zoom level
                } catch (error) {
                  console.error("Error in wrapper getZoom:", error);
                  return 3;
                }
              },
              setView: function(center, zoom) {
                try {
                  if (typeof this.map.setView === 'function') {
                    return this.map.setView(center, zoom);
                  }
                  return false;
                } catch (error) {
                  console.error("Error in wrapper setView:", error);
                  return false;
                }
              },
              getCenter: function() {
                try {
                  if (typeof this.map.getCenter === 'function') {
                    return this.map.getCenter();
                  }
                  return [30, -10]; // Default center
                } catch (error) {
                  console.error("Error in wrapper getCenter:", error);
                  return [30, -10];
                }
              }
            };
            
            // Create a global control function if it doesn't exist yet
            if (typeof window.controlMapZoom !== 'function') {
              window.controlMapZoom = function(direction) {
                console.log("Window controlMapZoom called:", direction);
                try {
                  if (window.mapWrapper) {
                    if (direction === "in") {
                      return window.mapWrapper.zoomIn(1);
                    } else {
                      return window.mapWrapper.zoomOut(1);
                    }
                  } else if (leafletMap) {
                    // Direct leafletMap manipulation
                    if (direction === "in") {
                      if (typeof leafletMap.zoomIn === 'function') {
                        leafletMap.zoomIn(1);
                        return true;
                      } else if (typeof leafletMap.getZoom === 'function' && typeof leafletMap.setView === 'function') {
                        const currentZoom = leafletMap.getZoom();
                        leafletMap.setView(leafletMap.getCenter(), currentZoom + 1);
                        return true;
                      }
                    } else {
                      if (typeof leafletMap.zoomOut === 'function') {
                        leafletMap.zoomOut(1);
                        return true;
                      } else if (typeof leafletMap.getZoom === 'function' && typeof leafletMap.setView === 'function') {
                        const currentZoom = leafletMap.getZoom();
                        leafletMap.setView(leafletMap.getCenter(), currentZoom - 1);
                        return true;
                      }
                    }
                  }
                  return false;
                } catch (error) {
                  console.error("Error in controlMapZoom:", error);
                  return false;
                }
              };
            }
            
            // Debug - log available methods
            console.log("Available methods:", {
              setView: typeof leafletMap.setView === 'function',
              getCenter: typeof leafletMap.getCenter === 'function',
              setZoom: typeof leafletMap.setZoom === 'function',
              getZoom: typeof leafletMap.getZoom === 'function',
              zoomIn: typeof leafletMap.zoomIn === 'function',
              zoomOut: typeof leafletMap.zoomOut === 'function',
              _zoom: typeof leafletMap._zoom === 'number' ? leafletMap._zoom : 'not available'
            });
          }
        },
        click: (e) => {
          console.log("Map clicked at:", e.latlng);
        },
        zoom: () => {
          console.log("Map zoom event fired");
          
          try {
            const currentZoom = leafletMap.getZoom();
            console.log("Map zoomed to level:", currentZoom);
            
            // Update the zoom in parent component state 
            setZoom(currentZoom);
            
            // Dispatch a custom event that we can listen for
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('mapZoomed', { 
                detail: { 
                  zoom: currentZoom,
                  timestamp: new Date().getTime()
                } 
              }));
            }
          } catch (error) {
            console.error("Error in zoom event handler:", error);
          }
        },
      });
      
      // Make map available globally for direct access by zoom buttons
      useEffect(() => {
        if (leafletMap) {
          console.log("MapEvents useEffect - map available");
          
          // Store the actual Leaflet map instance
          mapRef.current = leafletMap;
          
          // Also expose to window for debugging
          if (typeof window !== 'undefined') {
            window.mapInstance = leafletMap;
            
            // Create wrapper object with zoom methods if it doesn't exist yet
            if (!window.mapWrapper) {
              console.log("Creating mapWrapper in useEffect");
              window.mapWrapper = {
                map: leafletMap,
                zoomIn: function(delta) {
                  try {
                    if (typeof this.map.getZoom === 'function' && typeof this.map.setView === 'function') {
                      const newZoom = this.map.getZoom() + (delta || 1);
                      this.map.setView(this.map.getCenter(), newZoom);
                      console.log("Wrapper zoomIn called, new zoom:", newZoom);
                      return true;
                    } else if (typeof this.map._zoom === 'number' && typeof this.map.setView === 'function') {
                      // Fallback using internal _zoom property
                      const newZoom = this.map._zoom + (delta || 1);
                      this.map.setView(this.map.getCenter(), newZoom);
                      console.log("Wrapper zoomIn called using _zoom, new zoom:", newZoom);
                      return true;
                    } else if (typeof this.map.zoomIn === 'function') {
                      // Use native zoomIn if available
                      this.map.zoomIn(delta || 1);
                      console.log("Wrapper used native zoomIn");
                      return true;
                    }
                    
                    // Last resort: try to click the Leaflet control button
                    const zoomInBtn = document.querySelector('.leaflet-control-zoom-in');
                    if (zoomInBtn) {
                      console.log("Clicking native Leaflet zoom-in button");
                      zoomInBtn.click();
                      return true;
                    }
                    
                    return false;
                  } catch (error) {
                    console.error("Error in wrapper zoomIn:", error);
                    return false;
                  }
                },
                zoomOut: function(delta) {
                  try {
                    if (typeof this.map.getZoom === 'function' && typeof this.map.setView === 'function') {
                      const newZoom = this.map.getZoom() - (delta || 1);
                      this.map.setView(this.map.getCenter(), newZoom);
                      console.log("Wrapper zoomOut called, new zoom:", newZoom);
                      return true;
                    } else if (typeof this.map._zoom === 'number' && typeof this.map.setView === 'function') {
                      // Fallback using internal _zoom property
                      const newZoom = this.map._zoom - (delta || 1);
                      this.map.setView(this.map.getCenter(), newZoom);
                      console.log("Wrapper zoomOut called using _zoom, new zoom:", newZoom);
                      return true;
                    } else if (typeof this.map.zoomOut === 'function') {
                      // Use native zoomOut if available
                      this.map.zoomOut(delta || 1);
                      console.log("Wrapper used native zoomOut");
                      return true;
                    }
                    
                    // Last resort: try to click the Leaflet control button
                    const zoomOutBtn = document.querySelector('.leaflet-control-zoom-out');
                    if (zoomOutBtn) {
                      console.log("Clicking native Leaflet zoom-out button");
                      zoomOutBtn.click();
                      return true;
                    }
                    
                    return false;
                  } catch (error) {
                    console.error("Error in wrapper zoomOut:", error);
                    return false;
                  }
                },
                getZoom: function() {
                  try {
                    if (typeof this.map.getZoom === 'function') {
                      return this.map.getZoom();
                    } else if (typeof this.map._zoom === 'number') {
                      return this.map._zoom;
                    }
                    return 3; // Default zoom level
                  } catch (error) {
                    console.error("Error in wrapper getZoom:", error);
                    return 3;
                  }
                },
                setView: function(center, zoom) {
                  try {
                    if (typeof this.map.setView === 'function') {
                      return this.map.setView(center, zoom);
                    }
                    return false;
                  } catch (error) {
                    console.error("Error in wrapper setView:", error);
                    return false;
                  }
                },
                getCenter: function() {
                  try {
                    if (typeof this.map.getCenter === 'function') {
                      return this.map.getCenter();
                    }
                    return [30, -10]; // Default center
                  } catch (error) {
                    console.error("Error in wrapper getCenter:", error);
                    return [30, -10];
                  }
                }
              };
            } else {
              // Update the map reference in the existing wrapper
              console.log("Updating existing mapWrapper with new map reference");
              window.mapWrapper.map = leafletMap;
            }
            
            // Create a global control function if it doesn't exist yet
            if (typeof window.controlMapZoom !== 'function') {
              window.controlMapZoom = function(direction) {
                console.log("Window controlMapZoom called:", direction);
                try {
                  if (window.mapWrapper) {
                    if (direction === "in") {
                      return window.mapWrapper.zoomIn(1);
                    } else {
                      return window.mapWrapper.zoomOut(1);
                    }
                  } else if (leafletMap) {
                    // Direct leafletMap manipulation
                    if (direction === "in") {
                      if (typeof leafletMap.zoomIn === 'function') {
                        leafletMap.zoomIn(1);
                        return true;
                      } else if (typeof leafletMap.getZoom === 'function' && typeof leafletMap.setView === 'function') {
                        const currentZoom = leafletMap.getZoom();
                        leafletMap.setView(leafletMap.getCenter(), currentZoom + 1);
                        return true;
                      }
                    } else {
                      if (typeof leafletMap.zoomOut === 'function') {
                        leafletMap.zoomOut(1);
                        return true;
                      } else if (typeof leafletMap.getZoom === 'function' && typeof leafletMap.setView === 'function') {
                        const currentZoom = leafletMap.getZoom();
                        leafletMap.setView(leafletMap.getCenter(), currentZoom - 1);
                        return true;
                      }
                    }
                  }
                  return false;
                } catch (error) {
                  console.error("Error in controlMapZoom:", error);
                  return false;
                }
              };
            }
            
            console.log("Map instance stored in MapEvents useEffect");
            
            // Log detailed information about the map instance - safely
            try {
              const baseZoom = typeof leafletMap.getZoom === 'function' 
                ? leafletMap.getZoom() 
                : (typeof leafletMap._zoom === 'number' ? leafletMap._zoom : 'unknown');
              console.log("Base zoom level:", baseZoom);
            } catch (error) {
              console.warn("Could not get zoom level:", error.message);
            }
          }
        } else {
          console.warn("Map instance not available in MapEvents useEffect");
        }
        
        // Cleanup function
        return () => {
          console.log("MapEvents cleanup");
          if (typeof window !== 'undefined') {
            window.controlMapZoom = null;
            window.mapWrapper = null;
          }
        };
      }, [leafletMap]);
      
      return null;
    };

    function MapController({ mapRef }) {
      const map = useMap();
      useEffect(() => {
        if (map && mapRef) {
          mapRef.current = map;
        }
      }, [map, mapRef]);
      return null;
    }

    return (
      <>
        <MapContainer
          center={[30, -10]}
          zoom={3}
          style={{ height: "100vh", width: "100%" }}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
        >
          <MapController mapRef={mapRef} />
          <MapEvents />
          <ZoomControl
            setZoom={setZoom}
            zoom={zoom}
            getCircleRadius={getCircleRadius}
          />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

          {distributedLocations.length === 0 && !isLoading && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 600,
                background: "rgba(255,255,255,0.8)",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              No markers to display. Check console for details.
            </div>
          )}
          {distributedLocations.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 500,
                background: "rgba(255,255,255,0.8)",
                padding: "5px",
                borderRadius: "5px",
                fontSize: "12px",
              }}
            >
              Showing {distributedLocations.length} markers
            </div>
          )}
          {distributedLocations.map((location, index) => {
            // Determine if this is the selected location
            const isSelected =
              selectedLocation &&
              location.lat === selectedLocation.lat &&
              location.lng === selectedLocation.lng;

            // Different style for selected marker
            const circleOptions = isSelected
              ? {
                  fillColor: "#FF9800", // Orange for selected
                  color: "#D84315", // Deep orange border
                  weight: 4,
                  fillOpacity: 0.95,
                  className: "selected-marker-pulse", // Add a class for animation
                }
              : {
                  fillColor: location.isEpd ? "#4DB6AC" : "#00695C", // Teal 300 vs Teal 800 (light vs dark)
                  color: location.isEpd ? "#26A69A" : "#004D40", // Teal 400 vs Teal 900 border
                  weight: 1,
                  fillOpacity: 0.6,
                };

            // Make selected marker much larger
            const markerRadius = isSelected ? 60000 : getCircleRadius(zoom);

            return (
              <Circle
                key={`${location.lat}-${location.lng}-${index}-zoom-${zoom}`}
                center={[location.lat, location.lng]}
                radius={markerRadius}
                pathOptions={circleOptions}
              >
                <Popup>
                  <div className="map-popup-content">
                    <h3 className="popup-title">{formatProductName(location.product)}</h3>
                    <p>
                      <strong>Country:</strong> {location.country}
                      {location.company_name && (
                        <><br /><strong>Company:</strong> {location.company_name}</>
                      )}
                      {isSelected && (
                        <span style={{ color: "red" }}> ★ Selected</span>
                      )}
                    </p>
                    {location.isEpd && (
                      <>
                        <p>
                          <strong>Type:</strong> {location.isEpd}
                        </p>
                        {location.refYear && location.refYear !== "all" && (
                          <p>
                            <strong>EPD Year:</strong> {location.refYear}
                          </p>
                        )}
                        {location.pdf_url && (
                          <p>
                            <strong>EPD Document:</strong>{" "}
                            <a 
                              href={location.pdf_url} 
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ 
                                color: '#00796b', 
                                textDecoration: 'underline',
                                fontWeight: 'bold'
                              }}
                            >
                              Download PDF
                            </a>
                          </p>
                        )}
                      </>
                    )}
                    {location.description && (
                      <p>
                        <strong>Description:</strong>{" "}
                        {location.description.substring(0, 100)}
                        {location.description.length > 100 ? "..." : ""}
                      </p>
                    )}
                  </div>
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>

        {/* Loading overlay for when data is being processed but map is already shown */}
        {processingData && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.2)",
              zIndex: 8000, // Lower than popup z-index (9000)
              pointerEvents: "none", // Allow clicking through the overlay
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: "12px",
                padding: "15px 25px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Loading message="Processing data..." />
            </div>
          </div>
        )}

        <style jsx global>{`
          .leaflet-popup {
            z-index: 12000 !important;
            position: relative;
          }
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(2px);
            padding: 8px 12px;
            max-width: 300px;
            position: relative;
            z-index: 12500 !important;
          }
          .leaflet-popup-content {
            margin: 8px;
            position: relative;
            z-index: 12600 !important;
          }
          .leaflet-popup-tip {
            background: rgba(255, 255, 255, 0.95);
            z-index: 12400 !important;
            position: relative;
          }
          .map-popup-content {
            font-family: "Arial", sans-serif;
            color: #333;
            padding: 5px;
            position: relative;
            z-index: 12700 !important;
          }
          .popup-title {
            color: #00695c;
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 600;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 5px;
          }
          .map-popup-content p {
            margin: 5px 0;
            font-size: 14px;
            line-height: 1.4;
          }
          .map-popup-content strong {
            font-weight: 600;
            color: #00796b;
          }
          /* Ensure popup container is above everything */
          .leaflet-pane {
            z-index: 400 !important;
          }
          .leaflet-popup-pane {
            z-index: 12000 !important;
          }
          .leaflet-overlay-pane {
            z-index: 300 !important;
          }
          /* Fix for markers being hidden behind map tiles */
          .leaflet-map-pane {
            z-index: 100 !important;
          }
          .leaflet-tile-pane {
            z-index: 200 !important;
          }
          .leaflet-marker-pane {
            z-index: 600 !important;
          }
          .leaflet-shadow-pane {
            z-index: 500 !important;
          }
          /* Ensure SVG layers (where circles are rendered) appear above tiles */
          .leaflet-objects-pane {
            z-index: 400 !important;
          }
          .leaflet-svg-pane {
            z-index: 700 !important;
          }
          /* Make sure popups are always on top */
          .leaflet-tooltip-pane {
            z-index: 800 !important;
          }
          .leaflet-popup-pane {
            z-index: 12000 !important;
          }
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(255,152,0, 0.9);
            }
            70% {
              transform: scale(1.35);
              box-shadow: 0 0 40px 20px rgba(255,152,0, 0.5);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(255,152,0, 0.0);
            }
          }
          .selected-marker-pulse {
            animation: pulse 1.2s infinite;
            stroke-width: 6px !important;
            filter: drop-shadow(0 0 16px #FF9800);
          }
        `}</style>
      </>
    );
  }
);

MapComponent.displayName = "MapComponent";
export default MapComponent;