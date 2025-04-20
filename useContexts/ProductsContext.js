"use client";

import { createContext, useState, useEffect, useContext } from "react";
import countryCoordinates from '../public/data/countryCoordinates';

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // For map display
  const [regularProducts, setRegularProducts] = useState([]); // For search functionality
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products data on component mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Starting to fetch all products data...');
        
        // Fetch all pages of regular products
        const allRegularProducts = await fetchAllPages('https://epd-fullstack-project.vercel.app/api/products/');
        console.log(`Fetched ${allRegularProducts.length} regular products`);
        
        // Fetch all pages of EPD products
        const allEpdProducts = await fetchAllPages('https://epd-fullstack-project.vercel.app/api/ibudata/');
        console.log(`Fetched ${allEpdProducts.length} EPD products`);
        
        // Process regular products
        const processedRegularProducts = allRegularProducts.map(product => ({
          ...product,
          id: product.id || `reg-${Math.random().toString(36).substr(2, 9)}`,
          product_name: product.product_name || product.name || 'Unnamed Product',
          name: product.product_name || product.name || 'Unnamed Product',
          isRegularProduct: true,
          isFromRegularAPI: true,
          isFromEPDAPI: false,
          type: 'regular',
          // Ensure geo field exists
          geo: product.geo || 'EU27'
        }));
        
        // Store these separately for search function
        setRegularProducts(processedRegularProducts);
        
        // Process EPD products
        const processedEpdProducts = allEpdProducts.map(product => ({
          ...product,
          id: product.uid || `epd-${Math.random().toString(36).substr(2, 9)}`,
          product_name: product.name || product.product_name || `EPD Product ${product.uid || ''}`,
          name: product.name || product.product_name || `EPD Product ${product.uid || ''}`,
          isEpdProduct: true,
          isFromEPDAPI: true,
          isFromRegularAPI: false,
          type: 'EPD',
          // Ensure geo field exists
          geo: product.geo || 'EU27'
        }));
        
        // Custom mappings for geo codes
        const geoCodeMappings = {
          // Standard country code variants
          'TH2': 'TH', 'TH3': 'TH',
          'FR2': 'FR', 'FR3': 'FR', 'FR4': 'FR',
          'DE2': 'DE', 'DE3': 'DE', 'DE4': 'DE',
          'IT2': 'IT', 'IT3': 'IT',
          'UK2': 'UK', 'UK3': 'UK',
          'RU2': 'RU', 'RU3': 'RU', 'RU4': 'RU',
          
          // Regional indicators
          'EU-27': 'EU27',
          'EU-28': 'EU27',
          'GLO': 'Europe',
          'EPD': 'EU27',
          'IBU': 'DE',
          'RER': 'EU27',
          'WEU': 'EU27',
          'CEE': 'EU27',
          'RoW': 'Europe',
        };
        
        // Combined products
        const combinedProducts = [...processedRegularProducts, ...processedEpdProducts];
        
        console.log(`Total combined products: ${combinedProducts.length}`);
        
        // Log geo field distribution to help with debugging
        const geoDistribution = {};
        combinedProducts.forEach(product => {
          const geo = product.geo || 'undefined';
          geoDistribution[geo] = (geoDistribution[geo] || 0) + 1;
        });
        console.log('Geo field distribution:', geoDistribution);
        
        // Enhanced products with coordinates
        const productsWithLocations = combinedProducts.map(product => {
          let geoCode = product.geo;
          
          // Apply mappings if needed
          if (geoCodeMappings[geoCode]) {
            geoCode = geoCodeMappings[geoCode];
          }
          
          // First try to use the mapped geo code
          if (geoCode && countryCoordinates[geoCode]) {
            const coords = countryCoordinates[geoCode];
            return {
              ...product,
              lat: coords.lat,
              lng: coords.lng,
              country: coords.country,
              geoOriginal: product.geo,
              geoMapped: geoCode
            };
          }
          
          // Try uppercase
          const upperGeo = geoCode ? geoCode.toUpperCase() : '';
          if (upperGeo && countryCoordinates[upperGeo]) {
            const coords = countryCoordinates[upperGeo];
            return {
              ...product,
              lat: coords.lat,
              lng: coords.lng,
              country: coords.country,
              geoOriginal: product.geo,
              geoMapped: upperGeo
            };
          }
          
          // Fallback to Europe
          console.warn(`No coordinates found for geo code "${geoCode}" for product "${product.name}"`);
          return {
            ...product,
            lat: countryCoordinates.Europe.lat,
            lng: countryCoordinates.Europe.lng,
            country: 'Europe (Default)',
            geoOriginal: product.geo,
            geoMapped: 'Europe'
          };
        });
        
        // Log counts
        const withCoords = productsWithLocations.filter(p => 
          p.lat !== undefined && p.lng !== undefined && 
          !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng))
        );
        
        console.log(`Products with valid coordinates: ${withCoords.length}/${productsWithLocations.length}`);
        
        // Update state
        setAllProducts(productsWithLocations);
        setProducts(combinedProducts);
        setIsLoading(false);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    // Function to fetch all pages of data
    const fetchAllPages = async (baseUrl) => {
      let allResults = [];
      let nextUrl = baseUrl;
      
      while (nextUrl) {
        console.log(`Fetching data from: ${nextUrl}`);
        const response = await fetch(nextUrl);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Add results from this page
        if (data.results && Array.isArray(data.results)) {
          allResults = [...allResults, ...data.results];
          console.log(`Added ${data.results.length} results, total now: ${allResults.length}`);
        }
        
        // Check if there's a next page
        nextUrl = data.next;
      }
      
      return allResults;
    };
    
    fetchAllProducts();
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        allProducts,
        regularProducts,
        selectedProduct,
        setSelectedProduct,
        loading: isLoading,
        error,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
