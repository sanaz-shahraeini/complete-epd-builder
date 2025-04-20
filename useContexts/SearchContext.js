"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useProducts } from "./ProductsContext";

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [markerSelected, setMarkerSelected] = useState(false);
  const { regularProducts, allProducts } = useProducts();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    setIsLoading(true);

    console.log('Searching for:', lowerCaseQuery);
    console.log('Available products:', regularProducts.length);

    const filtered = regularProducts.filter((product) => {
      // Only search in regular API products, not EPD API products
      if (product.isFromEPDAPI) {
        return false;
      }
      
      const productName = (product.product_name || product.name || "").toLowerCase();
      
      // Special case for zehnder-basic-silent-wall-fan
      if (lowerCaseQuery === "zehnder-basic-silent-wall-fan" ||
          lowerCaseQuery === "silent wall fan" ||
          lowerCaseQuery === "wall fan") {
        return productName.includes("zehnder") && 
               (productName.includes("silent") || productName.includes("wall-fan"));
      }
      
      // For zehnder products, check the part after "zehnder-"
      if (productName.includes("zehnder-")) {
        // If searching explicitly for a zehnder product
        if (lowerCaseQuery.includes("zehnder-")) {
          // Compare full product names
          return productName.includes(lowerCaseQuery);
        }
        
        // Otherwise, check if the part after prefix matches
        const zehnderIndex = productName.indexOf("zehnder-") + 8;
        if (zehnderIndex < productName.length) {
          const afterPrefix = productName.substring(zehnderIndex);
          
          // Check for part matches (more flexible matching)
          const queryParts = lowerCaseQuery.split(' ');
          for (const part of queryParts) {
            if (part.length > 2 && afterPrefix.includes(part)) {
              return true;
            }
          }
          
          // Fallback to first character match
          return lowerCaseQuery.length > 0 && afterPrefix.charAt(0) === lowerCaseQuery.charAt(0);
        }
        return false;
      }
      
      // For non-zehnder products, check first character
      return productName.length > 0 && 
             lowerCaseQuery.length > 0 && 
             productName.charAt(0) === lowerCaseQuery.charAt(0);
    });

    console.log('Filtered results:', filtered.length);

    // Enhance search results with coordinates
    const enhancedResults = filtered.map(product => {
      // Find matching product in allProducts
      let fullProduct = allProducts.find(p => 
        (p.id === product.id) || 
        ((p.product_name || p.name || '').toLowerCase() === (product.product_name || product.name || '').toLowerCase())
      );
      
      // If direct match fails, try matching zehnder products with similar names
      if (!fullProduct && (product.product_name || product.name || '').toLowerCase().includes('zehnder-')) {
        const productName = (product.product_name || product.name || '').toLowerCase();
        
        // Special handling for zehnder-basic-silent-wall-fan
        if (productName === 'zehnder-basic-silent-wall-fan') {
          console.log('Looking for match for zehnder-basic-silent-wall-fan');
          
          fullProduct = allProducts.find(p => {
            const pName = (p.product_name || p.name || '').toLowerCase();
            return pName.includes('zehnder') && 
                   (pName.includes('silent-wall') || 
                    pName.includes('basic-silent') ||
                    pName.includes('wall-fan'));
          });
        }
        
        // If still no match, try partial matching for other zehnder products
        if (!fullProduct) {
          const nameWithoutPrefix = productName.split('zehnder-')[1];
          const nameParts = nameWithoutPrefix.split('-');
          
          fullProduct = allProducts.find(p => {
            const pName = (p.product_name || p.name || '').toLowerCase();
            if (!pName.includes('zehnder-')) return false;
            
            const pNameWithoutPrefix = pName.split('zehnder-')[1];
            const pNameParts = pNameWithoutPrefix.split('-');
            
            // Check for at least 50% matching parts
            let matchingParts = 0;
            for (const part of nameParts) {
              if (pNameParts.includes(part)) {
                matchingParts++;
              }
            }
            
            return (matchingParts / nameParts.length) >= 0.5;
          });
        }
      }
      
      if (fullProduct) {
        console.log(`Enhanced product match: "${product.product_name || product.name}" with "${fullProduct.product_name || fullProduct.name}"`);
        return {
          ...product,
          ...fullProduct, // Merge all properties
          product_name: product.product_name || product.name || fullProduct.product_name || fullProduct.name,
        };
      }
      
      return product;
    });

    console.log('Enhanced results:', enhancedResults.length);
    
    setSearchResults(enhancedResults);
    setIsLoading(false);
  }, [searchQuery, regularProducts, allProducts]);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    markerSelected,
    setMarkerSelected,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
