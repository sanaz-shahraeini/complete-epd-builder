import React from "react";
import { Box, Typography, IconButton, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import ViewInArIcon from "@mui/icons-material/ViewInAr";

const FilteredInfoSection = ({
  extraInfo = [],
  showLastProduct,
  productImage,
  handleRemoveInfo,
  handleRemoveLastProduct,
}) => {
  // Function to handle image errors
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = "none";
    e.target.parentNode.querySelector(".fallback-icon").style.display = "flex";
  };

  return (
    <Paper
      sx={{
        padding: 2,
        bgcolor: "#ffffff",
        mt: 1,
        width: "128%",
        marginLeft: { xs: "-1%", md: "9%" },
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        border: `1px solid var(--light-teal)`,
        maxHeight: "180px",
        overflowY: "auto",
      }}
    >
      <Box sx={{ minHeight: "30px" }}> {/* Add min-height to ensure scrollbar appears when needed */}
        {/* نمایش اطلاعات اضافی */}
        {extraInfo.length > 0 ? (
          extraInfo.map((info, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                borderBottom: `1px solid var(--light-teal)`,
                pb: 1,
                position: "relative",
              }}
            >
              <Typography variant="body2" sx={{ color: 'var(--text-dark)' }}>
                <span
                  style={{
                    fontSize: "20px",
                    color: "var(--primary-teal)",
                    marginRight: "4px",
                  }}
                >
                  •
                </span>
                {info}
              </Typography>

              {/* دایره سبز پشت ضربدر */}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveInfo(index);
                }}
                size="small"
                sx={{
                  ml: "auto",
                  height: "20px",
                  color: "white",
                  backgroundColor: "var(--primary-teal)",
                  borderRadius: "50%",
                  padding: "1px",
                  mt: "4px",
                  "&:hover": {
                    backgroundColor: "var(--dark-teal)",
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{ color: "var(--text-medium)", textAlign: "center", display: "block" }}
          >
            No additional information available.
          </Typography>
        )}

        {/* نمایش آخرین محصول */}
        {showLastProduct && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              pb: 1,
            }}
          >
            <Box
              sx={{
                width: "48px",
                height: "48px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "16px",
                borderRadius: "8px",
                border: `1px solid var(--light-teal)`,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "var(--primary-teal)",
                  transform: "scale(1.05)",
                },
              }}
            >
              {productImage ? (
                <>
                  <Box
                    component="img"
                    src={productImage}
                    alt="Product"
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
                    }}
                  >
                    <ViewInArIcon sx={{ fontSize: "28px" }} />
                  </Box>
                </>
              ) : (
                <ViewInArIcon sx={{ color: "var(--primary-teal)", fontSize: "28px" }} />
              )}
            </Box>

            <IconButton
              size="small"
              sx={{
                ml: "auto",
                color: "white",
                backgroundColor: "var(--primary-teal)",
                borderRadius: "50%",
                padding: "2px",
                "&:hover": {
                  backgroundColor: "var(--dark-teal)",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveLastProduct();
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FilteredInfoSection;
