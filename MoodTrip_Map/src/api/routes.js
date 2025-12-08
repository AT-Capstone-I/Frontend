// Use Google Maps Routes Library (Route.computeRoutes)
// Implements segmented routing (A->B, B->C) for multi-stop support
// Uses TRANSIT mode as DRIVING is not supported in Korea

export const calculateRoute = async (places) => {
  if (places.length < 2) return null;


  
  try {
    // Import libraries
    const { Route } = await google.maps.importLibrary("routes");
    const { Place } = await google.maps.importLibrary("places");

    const segments = [];
    let totalDistance = 0;
    let totalDuration = 0;

    // Calculate route for each segment (A->B, B->C, etc.)
    for (let i = 0; i < places.length - 1; i++) {
      const origin = places[i];
      const destination = places[i + 1];

      // Create Place instances
      const originPlace = new Place({ id: origin.id });
      const destinationPlace = new Place({ id: destination.id });

      // Build request for this segment
      const request = {
        origin: originPlace,
        destination: destinationPlace,
        travelMode: 'TRANSIT', // Using TRANSIT for Korea
        // Request all fields to avoid InvalidValueError with specific paths
        fields: ['*']
      };

      // Call computeRoutes
      const { routes } = await Route.computeRoutes(request);

      if (!routes || routes.length === 0) {
        console.warn(`⚠️ No route found for segment ${i + 1}`);
        continue;
      }

      const route = routes[0];
      
      // Parse duration (Total Trip Time including wait)
      let durationSeconds = 0;
      if (route.durationMillis) {
        durationSeconds = Math.round(route.durationMillis / 1000);
      } else if (route.staticDurationMillis) {
        durationSeconds = Math.round(route.staticDurationMillis / 1000);
      } else if (route.duration) {
        durationSeconds = parseInt(route.duration.replace('s', ''));
      }

      // Calculate Pure Travel Time (sum of legs)
      let travelDurationSeconds = 0;
      if (route.legs) {
        travelDurationSeconds = route.legs.reduce((acc, leg) => {
          const legDuration = leg.durationMillis 
            ? Math.round(leg.durationMillis / 1000)
            : (leg.duration ? parseInt(leg.duration.replace('s', '')) : 0);
          return acc + legDuration;
        }, 0);
      }
      
      // Fallback if total duration is missing
      if (durationSeconds === 0 && travelDurationSeconds > 0) {
        durationSeconds = travelDurationSeconds;
      }

      // Check polyline/path
      // JS API v2 seems to return 'path' (array of LatLng) instead of 'polyline' object
      let polylineObj = route.polyline;
      if (!polylineObj && route.path) {
        polylineObj = { path: route.path }; // Wrap it to keep structure consistent if possible, or handle in Map
      }

      if (!polylineObj) {
        console.warn(`⚠️ Segment ${i + 1} missing polyline/path`, route);
      }

      segments.push({
        origin: origin,
        destination: destination,
        distanceMeters: route.distanceMeters,
        duration: `${durationSeconds}s`,
        durationSeconds: durationSeconds,
        travelDurationSeconds: travelDurationSeconds, // Pure travel time
        polyline: polylineObj,
        legs: route.legs
      });

      totalDistance += route.distanceMeters;
      totalDuration += durationSeconds;
    }



    // Return combined route data
    return {
      segments: segments,
      distanceMeters: totalDistance,
      duration: `${totalDuration}s`,
      // Combine polylines or keep them separate? 
      // For now, we'll return the segments and let the Map component handle drawing multiple lines
      legs: segments.flatMap(s => s.legs) 
    };

  } catch (error) {
    console.error('❌ Route calculation failed:', error);
    throw error;
  }
};
