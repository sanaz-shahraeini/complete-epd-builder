import React from 'react';
import { Marker } from 'some-map-library'; // Replace with your actual map library

const MapResults = ({ results }) => {
  return (
    <>
      {results.map((result) => (
        <Marker
          key={result.id}
          position={{ lat: result.lat, lng: result.lng }}
          title={result.product_name}
        />
      ))}
    </>
  );
};

export default MapResults;