'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function Map() {
  useEffect(() => {
    const map = L.map('map', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([40.416775, -3.703790], 6)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: 'OpenStreetMap, CartoDB',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map)

    // Add custom styling for map elements
    const style = document.createElement('style')
    style.textContent = `
      .leaflet-control-zoom a {
        background-color: #0D9488 !important;
        color: white !important;
        border: none !important;
      }
      .leaflet-control-zoom a:hover {
        background-color: #0F766E !important;
      }
      .leaflet-control-zoom {
        border: none !important;
      }
      .leaflet-container {
        border-radius: 0.5rem;
      }
    `
    document.head.appendChild(style)

    return () => {
      map.remove()
      style.remove()
    }
  }, [])

  return <div id="map" className="h-full w-full" />
}
