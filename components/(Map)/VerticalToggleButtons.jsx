"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShareIcon from "@mui/icons-material/Share";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import InfoIcon from "@mui/icons-material/Info";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useMediaQuery } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { Paper, Fade, Chip, Box, Typography } from "@mui/material";
import { useSearch } from "../../useContexts/SearchContext";
import { formatProductName } from "../../utils/formatProductName";

export default function VerticalToggleButtons({
  mapZoom,
  setMapZoom,
  selectedProduct,
  setShowInfoCard,
  showInfoCard,
  selectedCountry,
  selectedCategory,
  yearRange,
  isSidebarOpen,
  mapRef,
  controlMapZoom
}) {
  const [view, setView] = useState("list");
  const [isClient, setIsClient] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)", {
    // Default to false during server-side rendering
    defaultMatches: false,
    noSsr: true,
  });
  const { searchResults, searchQuery } = useSearch();

  useEffect(() => {
    // This will only run on the client side
    setIsClient(true);
  }, []);

  const handleChange = (event, nextView) => {
    setView(nextView);
  };

  // Updated zoom functions to use controlMapZoom
  const handleZoomIn = () => {
    console.log("ZOOM IN BUTTON CLICKED - DEBUGGING");
    
    let success = false;
    
    // Try using the wrapper object first
    if (typeof window !== 'undefined' && window.mapWrapper) {
      console.log("DEBUG: Using window.mapWrapper.zoomIn");
      try {
        window.mapWrapper.zoomIn(1);
        console.log("DEBUG: window.mapWrapper.zoomIn called successfully");
        success = true;
      } catch (error) {
        console.error("DEBUG: Error using mapWrapper:", error);
      }
    }
    
    // If wrapper failed, try the controlMapZoom function passed from parent
    if (!success && controlMapZoom) {
      console.log("DEBUG: Using controlMapZoom function from parent");
      success = controlMapZoom("in");
      console.log("DEBUG: controlMapZoom returned:", success);
    }
    
    // If that fails, try direct DOM access to native Leaflet controls
    if (!success && typeof document !== 'undefined') {
      console.log("DEBUG: Trying direct DOM access to Leaflet controls");
      const zoomInButton = document.querySelector(".leaflet-control-zoom-in");
      if (zoomInButton) {
        console.log("DEBUG: Found Leaflet's built-in zoom in button, clicking it");
        zoomInButton.click();
        success = true;
      } else {
        console.log("DEBUG: Could not find Leaflet's built-in zoom in button");
      }
    }
    
    // Last resort - if all else failed, update the state directly
    if (!success) {
      console.log("DEBUG: All zoom methods failed, updating state directly");
      setMapZoom(prevZoom => {
        // In the map zoom UI context, lower numbers = more zoomed out (opposite of Leaflet)
        const newZoom = Math.max(1, prevZoom - 1);
        console.log(`DEBUG: State updating from ${prevZoom} to ${newZoom}`);
        return newZoom;
      });
    }
  };

  const handleZoomOut = () => {
    console.log("ZOOM OUT BUTTON CLICKED - DEBUGGING");
    
    let success = false;
    
    // Try using the wrapper object first
    if (typeof window !== 'undefined' && window.mapWrapper) {
      console.log("DEBUG: Using window.mapWrapper.zoomOut");
      try {
        window.mapWrapper.zoomOut(1);
        console.log("DEBUG: window.mapWrapper.zoomOut called successfully");
        success = true;
      } catch (error) {
        console.error("DEBUG: Error using mapWrapper:", error);
      }
    }
    
    // If wrapper failed, try the controlMapZoom function passed from parent
    if (!success && controlMapZoom) {
      console.log("DEBUG: Using controlMapZoom function from parent");
      success = controlMapZoom("out");
      console.log("DEBUG: controlMapZoom returned:", success);
    }
    
    // If that fails, try direct DOM access to native Leaflet controls
    if (!success && typeof document !== 'undefined') {
      console.log("DEBUG: Trying direct DOM access to Leaflet controls");
      const zoomOutButton = document.querySelector(".leaflet-control-zoom-out");
      if (zoomOutButton) {
        console.log("DEBUG: Found Leaflet's built-in zoom out button, clicking it");
        zoomOutButton.click();
        success = true;
      } else {
        console.log("DEBUG: Could not find Leaflet's built-in zoom out button");
      }
    }
    
    // Last resort - if all else failed, update the state directly
    if (!success) {
      console.log("DEBUG: All zoom methods failed, updating state directly");
      setMapZoom(prevZoom => {
        // In the map zoom UI context, higher numbers = more zoomed out (opposite of Leaflet)
        const newZoom = Math.min(10, prevZoom + 1);
        console.log(`DEBUG: State updating from ${prevZoom} to ${newZoom}`);
        return newZoom;
      });
    }
  };

  const handleShareProduct = () => {
    if (!isClient) return;

    if (selectedProduct) {
      const productName = formatProductName(selectedProduct.product_name || selectedProduct.name);
      const subject = `Product Information: ${productName}`;
      const body =
        `Hello,\n\nI am sharing the information of the product I viewed:\n\n` +
        `Product Name: ${productName}\n` +
        `Description: ${selectedProduct.description || ""}\n` +
        `Image Link: ${selectedProduct.image_url || ""}\n\n` +
        `Best regards`;

      // Create a shareable text
      const shareText = `${subject}\n\n${body}`;

      // Try to use the Web Share API if available
      if (isClient && typeof navigator !== "undefined" && navigator.share) {
        navigator
          .share({
            title: subject,
            text: body,
            url: document.location.href, // Include current URL
          })
          .then(() => {
            console.log("Successfully shared");
            setOpenShareDialog(false);
          })
          .catch((error) => {
            console.log("Error sharing:", error);
          });
      } else {
        // If Web Share API not available, leave the dialog open for other options
        alert(
          "Web Share API not supported in your browser. Please use other share options."
        );
      }
    } else {
      alert("No product selected for sharing.");
      setOpenShareDialog(false);
    }
  };

  // Safer implementation of the URL sharing function
  const handleCopyUrl = () => {
    if (!isClient || !selectedProduct) return;

    try {
      // Only execute this code on the client side
      if (typeof document !== "undefined") {
        const currentUrl = document.location.href;
        const baseUrl = new URL(currentUrl);
        const productName = formatProductName(selectedProduct.product_name || selectedProduct.name);
        baseUrl.searchParams.set("product", productName);

        copyToClipboard(baseUrl.toString())
          .then(() => {
            alert("Product URL copied to clipboard!");
            setOpenShareDialog(false);
          })
          .catch((err) => {
            console.error("Failed to copy URL: ", err);
            alert("Unable to copy URL. Please try again.");
          });
      }
    } catch (error) {
      console.error("Error generating URL:", error);
      alert("Failed to generate shareable URL.");
    }
  };

  // Utility function for copying to clipboard
  const copyToClipboard = async (text) => {
    if (!isClient) {
      return Promise.reject(new Error("Not running in client environment"));
    }

    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {
      return navigator.clipboard.writeText(text);
    } else {
      return new Promise((resolve, reject) => {
        try {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();

          const successful = document.execCommand("copy");
          document.body.removeChild(textarea);

          if (successful) {
            resolve();
          } else {
            reject(new Error("execCommand copy failed"));
          }
        } catch (err) {
          reject(err);
        }
      });
    }
  };

  // Helper function to copy text to clipboard
  const fallbackToClipboard = async () => {
    if (!isClient) return;
    if (!selectedProduct) {
      alert("No product selected for sharing.");
      return;
    }

    const productName = formatProductName(selectedProduct.product_name || selectedProduct.name);
    const subject = `Product Information: ${productName}`;
    const body =
      `Hello,\n\nI am sharing the information of the product I viewed:\n\n` +
      `Product Name: ${productName}\n` +
      `Description: ${selectedProduct.description || ""}\n` +
      `Image Link: ${selectedProduct.image_url || ""}\n\n` +
      `Best regards`;

    const shareText = `${subject}\n\n${body}`;

    try {
      // Try to use the modern Clipboard API
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(shareText);
        alert("Product information copied to clipboard!");
        setOpenShareDialog(false);
      } else if (isClient) {
        // Fall back to the older execCommand method
        const textarea = document.createElement("textarea");
        textarea.value = shareText;
        textarea.style.position = "fixed"; // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (successful) {
          alert("Product information copied to clipboard!");
          setOpenShareDialog(false);
        } else {
          alert("Unable to copy to clipboard. Please try again.");
        }
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Unable to copy to clipboard. Please try again.");
    }
  };

  const handleEmailShare = () => {
    if (!isClient) return;

    if (!selectedProduct) {
      alert("No product selected for sharing.");
      return;
    }

    const productName = formatProductName(selectedProduct.product_name || selectedProduct.name);
    const subject = `Product Information: ${productName}`;
    const body =
      `Hello,\n\nI am sharing the information of the product I viewed:\n\n` +
      `Product Name: ${productName}\n` +
      `Description: ${selectedProduct.description || ""}\n` +
      `Image Link: ${selectedProduct.image_url || ""}\n\n` +
      `Best regards`;

    // Use a client-side only approach
    if (typeof document !== "undefined") {
      const mailtoLink = `mailto:?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      // Create a temporary link element and click it
      const link = document.createElement("a");
      link.href = mailtoLink;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setOpenShareDialog(false);
  };

  // Modified info icon action to respect search results and category filters
  const handleInfoButtonClick = () => {
    // Toggle the info card visibility
    setShowInfoCard(!showInfoCard);
    
    // Log detailed information about current filters to help with debugging
    console.log("Info card toggled with current state:", {
      showingInfoCard: !showInfoCard,
      hasSearchResults: !!(searchResults && searchResults.length > 0),
      searchQuery: searchQuery || "none",
      selectedCategory: selectedCategory || "all",
      isSpecificCategory: !!(selectedCategory && selectedCategory !== "all")
    });
    
    // Add a more visible log message
    console.log(`INFO BUTTON CLICKED - ${!showInfoCard ? 'SHOWING' : 'HIDING'} INFO CARD`);
    
    // Dispatch an event that the page component can listen for
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('infoCardToggled', { 
        detail: { 
          visible: !showInfoCard,
          source: 'infoButton',
          timestamp: new Date().getTime()
        } 
      }));
    }
  };

  const buttons = [
    { value: "add", icon: <AddIcon />, action: handleZoomIn },
    { value: "remove", icon: <RemoveIcon />, action: handleZoomOut },
    {
      value: "share",
      icon: <ShareIcon />,
      action: () => setOpenShareDialog(true),
    },
    {
      value: "info",
      icon: <InfoIcon />,
      action: handleInfoButtonClick,
      selected: showInfoCard,
    },
    { value: "settings", icon: <SettingsIcon /> },
    { value: "help", icon: <HelpIcon /> },
  ];

  if (!isClient) return null;

  return (
    <div>
      <ToggleButtonGroup
        orientation="vertical"
        value={view}
        exclusive
        onChange={handleChange}
        sx={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 100,
          backgroundColor: "white",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          borderRadius: "16px",
          overflow: "hidden",
          padding: "8px",
          border: "1px solid rgba(43, 190, 183, 0.15)",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          "& .MuiToggleButton-root": {
            border: "none",
            borderRadius: "12px",
            padding: "10px",
            color: "var(--text-medium)",
            transition: "all 0.2s ease",
            minWidth: "44px",
            minHeight: "44px",
            "&.Mui-selected": {
              background: "var(--gradient-teal)",
              color: "white",
              boxShadow: "0 4px 10px rgba(0, 124, 119, 0.2)",
            },
            "&:hover": {
              backgroundColor: "rgba(43, 190, 183, 0.08)",
              transform: "translateY(-2px)",
              color: "var(--dark-teal)",
            },
          },
        }}
      >
        {buttons.map(({ value, icon, action, selected }) => (
          <ToggleButton
            key={value}
            value={value}
            aria-label={value}
            onClick={action}
            selected={selected}
            sx={{
              ...(isMobile ? { padding: "8px" } : {}),
              transition: "all 0.3s ease",
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                transition: "all 0.2s ease",
                fontSize: isMobile ? "20px" : "24px",
              },
            })}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Dialog
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
        aria-labelledby="share-dialog-title"
        aria-describedby="share-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="share-dialog-title">Share Product</DialogTitle>
        <DialogContent dividers>
          {!selectedProduct ? (
            <p>No product selected for sharing.</p>
          ) : (
            <>
              <p>
                <strong>Share:</strong>{" "}
                {formatProductName(selectedProduct.product_name || selectedProduct.name)}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginTop: "20px",
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  color="primary"
                  onClick={handleShareProduct}
                  fullWidth
                  style={{ marginBottom: "16px", height: "48px" }}
                >
                  Use Device Sharing
                </Button>

                <Button
                  variant="contained"
                  startIcon={<ContentCopyIcon />}
                  color="secondary"
                  onClick={fallbackToClipboard}
                  fullWidth
                  style={{ marginBottom: "16px", height: "48px" }}
                >
                  Copy to Clipboard
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<InfoIcon />}
                  color="primary"
                  onClick={handleEmailShare}
                  fullWidth
                  style={{ height: "48px" }}
                >
                  Share via Email
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleCopyUrl}
                  fullWidth
                  style={{ height: "48px" }}
                >
                  Copy Product URL
                </Button>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
