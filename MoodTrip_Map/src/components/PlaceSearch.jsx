import React, { useRef, useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

const PlaceSearch = ({ onPlaceSelect }) => {
  const placesLibrary = useMapsLibrary('places');
  const containerRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!placesLibrary || !containerRef.current) return;

    console.log('Initializing PlaceAutocompleteElement...');
    const autocomplete = new placesLibrary.PlaceAutocompleteElement();
    autocompleteRef.current = autocomplete;
    
    const handlePlaceSelect = async (event) => {
      console.log(`Event fired: ${event.type}`, event);
      
      let place = event.place;
      
      // Handle newer API version where place is in placePrediction
      if (!place && event.placePrediction) {
        console.log('Using placePrediction.toPlace()');
        place = event.placePrediction.toPlace();
      }
      
      if (!place) {
        console.warn('No place found in event');
        return;
      }

      try {
        console.log('Fetching fields for place:', place.id);
        await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
        console.log('Fields fetched successfully');
        
        const placeData = {
          id: place.id,
          name: place.displayName,
          address: place.formattedAddress,
          location: {
            lat: place.location.lat(),
            lng: place.location.lng(),
          },
        };
        
        console.log('Place data prepared:', placeData);
        onPlaceSelect(placeData);

        // Clear input by recreating the element
        setTimeout(() => {
          if (containerRef.current && autocompleteRef.current) {
            // Remove old element
            autocompleteRef.current.removeEventListener('gmp-placeselect', handlePlaceSelect);
            autocompleteRef.current.removeEventListener('gmp-select', handlePlaceSelect);
            containerRef.current.innerHTML = '';
            
            // Create new element
            const newAutocomplete = new placesLibrary.PlaceAutocompleteElement();
            newAutocomplete.addEventListener('gmp-placeselect', handlePlaceSelect);
            newAutocomplete.addEventListener('gmp-select', handlePlaceSelect);
            containerRef.current.appendChild(newAutocomplete);
            autocompleteRef.current = newAutocomplete;
            
            console.log('✅ Input cleared by recreation');
          }
        }, 100);
        
      } catch (error) {
        console.error('Error processing place:', error);
      }
    };

    // Listen for both events to ensure compatibility
    autocomplete.addEventListener('gmp-placeselect', handlePlaceSelect);
    autocomplete.addEventListener('gmp-select', handlePlaceSelect);
    
    // Ensure container is empty before appending
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(autocomplete);

    return () => {
      console.log('Cleaning up PlaceAutocompleteElement...');
      if (autocompleteRef.current) {
        autocompleteRef.current.removeEventListener('gmp-placeselect', handlePlaceSelect);
        autocompleteRef.current.removeEventListener('gmp-select', handlePlaceSelect);
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [placesLibrary, onPlaceSelect]);

  return (
    <div className="search-container">
      <div className="search-input-wrapper" ref={containerRef}>
        {/* The PlaceAutocompleteElement will be injected here */}
      </div>
    </div>
  );
};

export default PlaceSearch;
