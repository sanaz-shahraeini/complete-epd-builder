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
            '& .MuiAccordionSummary-root': {
              '&:hover': {
                bgcolor: 'var(--light-teal)',
              },
            },
            '& .Mui-expanded': {
              color: 'var(--primary-teal)',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text-dark)' }} />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography sx={{ color: 'var(--text-dark)' }}>Countries</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ maxHeight: "90px", overflowY: "auto" }}>
            <List>
              {countryCoordinates ? (
                Object.values(countryCoordinates).map((country, index) => (
                  <ListItem
                    button
                    key={index}
                    sx={{ 
                      cursor: "pointer",
                      '&:hover': {
                        bgcolor: 'var(--light-teal)',
                      },
                    }}
                    onClick={() => setSelectedCountry(country.country)}
                  >
                    <Typography sx={{ color: 'var(--text-dark)' }}>{country.country}</Typography>
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ color: 'var(--text-medium)' }}>No countries available</Typography>
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
            '& .MuiAccordionSummary-root': {
              '&:hover': {
                bgcolor: 'var(--light-teal)',
              },
            },
            '& .Mui-expanded': {
              color: 'var(--primary-teal)',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text-dark)' }} />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
            <Typography sx={{ color: 'var(--text-dark)' }}>Additional Options</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ maxHeight: "60px", overflowY: "auto" }}>
            <List>
              {["Industry Solutions", "Company"].map((option, index) => (
                <ListItem
                  button
                  key={index}
                  onClick={() => console.log(`${option} clicked`)}
                  sx={{ 
                    color: 'var(--primary-teal)',
                    '&:hover': {
                      bgcolor: 'var(--light-teal)',
                    },
                  }}
                >
                  <Typography>{option}</Typography>
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
