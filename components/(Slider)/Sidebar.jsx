import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Sidebar = ({
  yearRange,
  setYearRange,
  selectedCountry,
  setSelectedCountry,
  countryCoordinates,
  filterEpdOnly,
  setFilterEpdOnly,
}) => {
  const [expanded, setExpanded] = useState(false);

  // No need for local state since we're using the prop directly
  // and the Switch component will update the parent state

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const marks = [
    { value: 2000, label: "2000" },
    { value: 2010, label: "2010" },
    { value: 2015, label: "2015" },
    { value: 2020, label: "2020" },
    { value: 2030, label: "2030" },
  ];

  return (
    <Grid
      container
      sx={{
        width: "100%",
        bgcolor: "#ffffff",
        padding: 3,
      }}
    >
      {/* Year Range Section */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <FormGroup>
            <FormControlLabel 
              control={
                <Switch 
                  checked={filterEpdOnly}
                  onChange={(e) => {
                    if (setFilterEpdOnly) {
                      setFilterEpdOnly(e.target.checked);
                    }
                  }}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'var(--primary-teal)',
                      '&:hover': {
                        backgroundColor: 'var(--light-teal)',
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'var(--dark-teal)',
                    },
                  }}
                />
              } 
              label="EPD API Only" 
              labelPlacement="start"
              sx={{ 
                margin: 0,
                '& .MuiTypography-root': {
                  color: 'var(--text-dark)',
                }
              }}
            />
          </FormGroup>
        </Box>
        <Slider
          value={yearRange}
          onChange={(event, newValue) => setYearRange(newValue)}
          valueLabelDisplay="auto"
          min={2000}
          max={2030}
          marks={marks}
          sx={{ 
            color: "var(--primary-teal)",
            '& .MuiSlider-thumb': {
              backgroundColor: "var(--primary-teal)",
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 8px var(--light-teal)',
              },
            },
            '& .MuiSlider-rail': {
              backgroundColor: 'var(--light-teal)',
            },
            '& .MuiSlider-track': {
              backgroundColor: 'var(--primary-teal)',
            },
            '& .MuiSlider-mark': {
              backgroundColor: 'var(--text-light)',
            },
            '& .MuiSlider-markLabel': {
              color: 'var(--text-medium)',
            },
          }}
        />
        <Typography variant="body2" sx={{ color: "var(--text-medium)", mt: 2 }}>
          Filter EPD markers by their reference year
        </Typography>

        <Divider sx={{ mt: 2, bgcolor: 'var(--light-teal)' }} />

        {/* Country Selection Accordion */}
        <Accordion
          expanded={expanded === "panel1"}
          onChange={handleChange("panel1")}
          sx={{ 
            boxShadow: "none",
            bgcolor: '#ffffff',
            border: `1px solid var(--light-teal)`,
            borderRadius: '12px !important',
            mb: 2,
            '&:before': {
              display: 'none',
            },
            '& .MuiAccordionSummary-root': {
              minHeight: '56px',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'var(--light-teal)',
              },
              '&.Mui-expanded': {
                bgcolor: 'var(--light-teal)',
                borderBottomLeftRadius: expanded === "panel1" ? 0 : '12px',
                borderBottomRightRadius: expanded === "panel1" ? 0 : '12px',
              },
            },
            '& .Mui-expanded': {
              color: 'var(--primary-teal)',
              fontWeight: 600,
            },
          }}
        >
          <AccordionSummary
            expandIcon={
              <ExpandMoreIcon 
                sx={{ 
                  color: expanded === "panel1" ? 'var(--primary-teal)' : 'var(--text-dark)',
                  transition: 'transform 0.3s ease',
                  transform: expanded === "panel1" ? 'rotate(-180deg)' : 'rotate(0)',
                }} 
              />
            }
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography 
              sx={{ 
                color: expanded === "panel1" ? 'var(--primary-teal)' : 'var(--text-dark)',
                fontWeight: expanded === "panel1" ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  bgcolor: expanded === "panel1" ? 'var(--light-teal)' : 'transparent',
                  color: 'var(--primary-teal)',
                }}
              >
                {countryCoordinates ? Object.keys(countryCoordinates).length : 0}
              </Box>
              Countries
            </Typography>
          </AccordionSummary>
          <AccordionDetails 
            sx={{ 
              maxHeight: "200px", 
              overflowY: "auto",
              borderTop: `1px solid var(--light-teal)`,
              p: 0,
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'var(--light-teal)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'var(--primary-teal)',
                borderRadius: '4px',
              },
            }}
          >
            <List sx={{ p: 0 }}>
              {countryCoordinates ? (
                Object.values(countryCoordinates).map((country, index) => (
                  <ListItem
                    button
                    key={index}
                    sx={{ 
                      cursor: "pointer",
                      py: 1,
                      px: 2,
                      transition: 'all 0.2s ease',
                      borderLeft: '3px solid transparent',
                      '&:hover': {
                        bgcolor: 'var(--light-teal)',
                        borderLeftColor: 'var(--primary-teal)',
                      },
                      ...(selectedCountry === country.country && {
                        bgcolor: 'var(--light-teal)',
                        borderLeftColor: 'var(--primary-teal)',
                      }),
                    }}
                    onClick={() => setSelectedCountry(country.country)}
                  >
                    <Typography 
                      sx={{ 
                        color: selectedCountry === country.country ? 'var(--primary-teal)' : 'var(--text-dark)',
                        fontWeight: selectedCountry === country.country ? 600 : 400,
                      }}
                    >
                      {country.country}
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <ListItem sx={{ justifyContent: 'center' }}>
                  <Typography sx={{ color: 'var(--text-medium)', py: 2 }}>
                    No countries available
                  </Typography>
                </ListItem>
              )}
            </List>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ bgcolor: 'var(--light-teal)' }} />

        {/* Additional Options Accordion */}
        <Accordion
          expanded={expanded === "panel2"}
          onChange={handleChange("panel2")}
          sx={{ 
            boxShadow: "none",
            bgcolor: '#ffffff',
            border: `1px solid var(--light-teal)`,
            borderRadius: '12px !important',
            '&:before': {
              display: 'none',
            },
            '& .MuiAccordionSummary-root': {
              minHeight: '56px',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'var(--light-teal)',
              },
              '&.Mui-expanded': {
                bgcolor: 'var(--light-teal)',
                borderBottomLeftRadius: expanded === "panel2" ? 0 : '12px',
                borderBottomRightRadius: expanded === "panel2" ? 0 : '12px',
              },
            },
            '& .Mui-expanded': {
              color: 'var(--primary-teal)',
              fontWeight: 600,
            },
          }}
        >
          <AccordionSummary
            expandIcon={
              <ExpandMoreIcon 
                sx={{ 
                  color: expanded === "panel2" ? 'var(--primary-teal)' : 'var(--text-dark)',
                  transition: 'transform 0.3s ease',
                  transform: expanded === "panel2" ? 'rotate(-180deg)' : 'rotate(0)',
                }} 
              />
            }
            aria-controls="panel2-content"
            id="panel2-header"
          >
            <Typography 
              sx={{ 
                color: expanded === "panel2" ? 'var(--primary-teal)' : 'var(--text-dark)',
                fontWeight: expanded === "panel2" ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  bgcolor: expanded === "panel2" ? 'var(--light-teal)' : 'transparent',
                  color: 'var(--primary-teal)',
                }}
              >
                2
              </Box>
              Additional Options
            </Typography>
          </AccordionSummary>
          <AccordionDetails 
            sx={{ 
              maxHeight: "200px", 
              overflowY: "auto",
              borderTop: `1px solid var(--light-teal)`,
              p: 0,
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'var(--light-teal)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'var(--primary-teal)',
                borderRadius: '4px',
              },
            }}
          >
            <List sx={{ p: 0 }}>
              {["Industry Solutions", "Company"].map((option, index) => (
                <ListItem
                  button
                  key={index}
                  onClick={() => console.log(`${option} clicked`)}
                  sx={{ 
                    py: 1,
                    px: 2,
                    transition: 'all 0.2s ease',
                    borderLeft: '3px solid transparent',
                    '&:hover': {
                      bgcolor: 'var(--light-teal)',
                      borderLeftColor: 'var(--primary-teal)',
                    },
                  }}
                >
                  <Typography sx={{ color: 'var(--text-dark)' }}>
                    {option}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  );
};

export default Sidebar;
