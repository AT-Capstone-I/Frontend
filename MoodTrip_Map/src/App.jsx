import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import PlaceSearch from './components/PlaceSearch';
import PlaceList from './components/PlaceList';
import Map from './components/Map';
import { calculateRoute } from './api/routes';
import './components/Autocomplete.css';

function App() {
  
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID; 

  const [places, setPlaces] = useState([]);
  const [routeData, setRouteData] = useState(null);

  const handlePlaceSelect = useCallback((place) => {
    setPlaces(prev => {
      if (prev.some(p => p.id === place.id)) return prev;
      return [...prev, place];
    });
  }, []);

  const handleRemovePlace = useCallback((id) => {
    setPlaces(prev => prev.filter(place => place.id !== id));
  }, []);

  const handleReorder = useCallback((startIndex, endIndex) => {
    setPlaces(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // Calculate route whenever places change
  useEffect(() => {
    const fetchRoute = async () => {
      if (places.length > 1) {
        console.log('🔄 Calculating route for', places.length, 'places');
        try {
          const route = await calculateRoute(places);
          if (route) {
            console.log('✅ Route calculated successfully');
            setRouteData(route);
          } else {
            console.warn('⚠️ No route returned');
            setRouteData(null);
          }
        } catch (error) {
          console.error('❌ Route calculation failed:', error);
          setRouteData(null);
        }
      } else {
        setRouteData(null);
      }
    };

    fetchRoute();
  }, [places]);

  // Extract legs for the list view from segments
  const routeLegs = routeData?.segments?.flatMap(segment => segment.legs) || [];

  // Calculate totals from route data
  const totalDistance = routeData?.distanceMeters || 0;
  // Parse duration string (e.g. "3600s") to integer seconds
  const totalDurationSeconds = routeData?.duration ? parseInt(routeData.duration.replace('s', '')) : 0;
  
  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours} hr ${minutes} min`;
    return `${minutes} min`;
  };

  // Helper to format leg duration/distance for the list
  // Use segments directly. Display pure travel time (sum of legs) for the list items.
  const formattedLegs = (routeData?.segments || []).map(segment => {
    return {
      duration: { text: formatDuration(segment.travelDurationSeconds || 0) },
      distance: { text: formatDistance(segment.distanceMeters || 0) }
    };
  });

  // Calculate total travel time (pure movement)
  const totalTravelTimeSeconds = (routeData?.segments || []).reduce((acc, seg) => acc + (seg.travelDurationSeconds || 0), 0);

  return (
    <APIProvider apiKey={API_KEY} libraries={['places', 'marker', 'geometry', 'routes']}>
      <div className="app-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h1 className="sidebar-title">Route Planner</h1>
          </div>
          
          <PlaceSearch onPlaceSelect={handlePlaceSelect} />
          
          <PlaceList 
            places={places} 
            onRemovePlace={handleRemovePlace} 
            onReorder={handleReorder}
            routeLegs={formattedLegs}
          />

          {places.length > 1 && routeData && (
            <div className="total-stats">
              <div className="stat-row">
                <span>Total Distance</span>
                <span className="stat-value">{formatDistance(totalDistance)}</span>
              </div>
              <div className="stat-row">
                <span>Travel Time</span>
                <span className="stat-value">{formatDuration(totalTravelTimeSeconds)}</span>
              </div>
              <div className="stat-row">
                <span>Total Duration (inc. wait)</span>
                <span className="stat-value">{formatDuration(totalDurationSeconds)}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="map-container">
          <Map 
            places={places} 
            routeSegments={routeData?.segments}
            mapId={MAP_ID}
          />
        </div>
      </div>
    </APIProvider>
  );
}

export default App;
