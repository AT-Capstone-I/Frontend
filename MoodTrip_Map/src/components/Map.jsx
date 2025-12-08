import React, { useEffect, useRef } from 'react';
import { Map as GoogleMap, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const Map = ({ places, routeSegments, mapId }) => {
  const map = useMap();
  const geometryLibrary = useMapsLibrary('geometry');
  const polylinesRef = useRef([]);

  // Render Route Polylines
  useEffect(() => {
    if (!map || !geometryLibrary) return;

    // Clear existing polylines
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    polylinesRef.current = [];

    if (!routeSegments || routeSegments.length === 0) return;



    routeSegments.forEach((segment, index) => {
      if (!segment.polyline) return;

      try {
        let path = null;
        
        if (segment.polyline.path) {
          // Direct LatLng array from JS API
          path = segment.polyline.path;
        } else if (segment.polyline.encodedPolyline) {
          // Encoded string from REST API
          path = geometryLibrary.encoding.decodePath(segment.polyline.encodedPolyline);
        }

        if (!path) {
          console.warn(`⚠️ Segment ${index} has no valid path data`);
          return;
        }
        
        // Different colors for different segments? Or same color?
        // Let's use a gradient or distinct colors if needed, but for now consistent blue is good
        const polyline = new window.google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: "#3b82f6", // Blue-500
          strokeOpacity: 0.8,
          strokeWeight: 6,
          map: map
        });

        polylinesRef.current.push(polyline);
      } catch (error) {
        console.error('❌ Error rendering polyline for segment', index, error);
      }
    });

    return () => {
      polylinesRef.current.forEach(polyline => polyline.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, geometryLibrary, routeSegments]);

  // Fit Bounds
  useEffect(() => {
    if (map && places.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      places.forEach(place => {
        bounds.extend(place.location);
      });
      map.fitBounds(bounds);
      
      // Adjust zoom if only one place or bounds are too tight
      if (places.length === 1) {
        const listener = map.addListener("idle", () => { 
          map.setZoom(15); 
          window.google.maps.event.removeListener(listener); 
        });
      }
    }
  }, [map, places]);

  const getPinColor = (index, total) => {
    if (index === 0) return { bg: '#22c55e', border: '#14532d' }; // Start: Green
    if (index === total - 1) return { bg: '#ef4444', border: '#7f1d1d' }; // End: Red
    return { bg: '#3b82f6', border: '#1e3a8a' }; // Intermediate: Blue
  };

  return (
    <GoogleMap
      defaultCenter={{ lat: 37.5665, lng: 126.9780 }}
      defaultZoom={10}
      mapId={mapId}
      style={{ width: '100%', height: '100%' }}
      disableDefaultUI={false}
    >
      {places.map((place, index) => {
        const colors = getPinColor(index, places.length);
        return (
          <AdvancedMarker
            key={place.id}
            position={place.location}
          >
            <Pin
              background={colors.bg}
              borderColor={colors.border}
              glyphColor={'white'}
              glyphText={(index + 1).toString()}
              scale={1.1}
            />
          </AdvancedMarker>
        );
      })}
    </GoogleMap>
  );
};

export default Map;
