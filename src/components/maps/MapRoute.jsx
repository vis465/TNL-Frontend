import React, { useEffect, useRef } from "react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const getLatLngFromObject = (obj) => {
  if (!obj) return null;
  const candidates = [obj.coords, obj.location, obj.position, obj.latlng, obj.latLng].filter(
    Boolean
  );
  for (const c of candidates) {
    const lat = Number(c.lat ?? c.latitude);
    const lng = Number(c.lng ?? c.lon ?? c.longitude);
    if (isFinite(lat) && isFinite(lng)) return [lat, lng];
  }
  const lat = Number(obj.lat ?? obj.latitude);
  const lng = Number(obj.lng ?? obj.lon ?? obj.longitude);
  if (isFinite(lat) && isFinite(lng)) return [lat, lng];
  return null;
};

const MapRoute = ({ jobData, routePoints, height = "24rem", className = "" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter = [51.1657, 10.4515];
    const sourceLatLng =
      getLatLngFromObject(jobData?.source?.city) || getLatLngFromObject(jobData?.source);
    const destLatLng =
      getLatLngFromObject(jobData?.destination?.city) ||
      getLatLngFromObject(jobData?.destination);
    const startCenter = sourceLatLng || destLatLng || defaultCenter;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView(startCenter, 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markers = [];
    if (sourceLatLng) {
      markers.push(L.marker(sourceLatLng).addTo(map).bindPopup("Start"));
    }
    if (destLatLng) {
      markers.push(L.marker(destLatLng).addTo(map).bindPopup("Destination"));
    }
    if (markers.length === 2) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { padding: [20, 20] });
    }

    const points =
      routePoints ||
      jobData?.route?.points ||
      jobData?.waypoints ||
      jobData?.routePoints ||
      [];
    if (Array.isArray(points) && points.length > 1) {
      const latlngs = points
        .map((p) => [Number(p.lat ?? p.latitude), Number(p.lng ?? p.lon ?? p.longitude)])
        .filter(([lat, lng]) => isFinite(lat) && isFinite(lng));
      if (latlngs.length > 1) {
        const polyline = L.polyline(latlngs, {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.9,
        }).addTo(map);
        map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
      }
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [jobData, routePoints]);

  return (
    <div className={`w-full rounded-lg ${className}`} style={{ height }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default MapRoute;

