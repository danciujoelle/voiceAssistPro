import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import "./LocationAutocomplete.css";

const LocationAutocomplete = ({
  initialLocation,
  onLocationSelected,
  onLocationConfirmed,
  placeholder = "Enter or confirm emergency location...",
}) => {
  const [inputValue, setInputValue] = useState(initialLocation || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [geocodeResults, setGeocodeResults] = useState([]);
  const [showGeocodeOptions, setShowGeocodeOptions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const inputRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const geocoderRef = useRef(null);

  // Handle geocoding for manual input or initial location
  const handleGeocodeLocation = useCallback(
    (address) => {
      if (!geocoderRef.current || !address.trim()) return;

      setIsLoading(true);
      setError("");

      geocoderRef.current.geocode({ address: address }, (results, status) => {
        setIsLoading(false);

        if (
          status === window.google.maps.GeocoderStatus.OK &&
          results.length > 0
        ) {
          if (results.length === 1) {
            // Single result - auto-select
            const result = results[0];
            const locationData = {
              address: result.formatted_address,
              coordinates: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng(),
              },
              types: result.types,
              source: "geocode_single",
            };

            setSelectedLocation(locationData);
            onLocationSelected(locationData);
          } else {
            // Multiple results - show options
            setGeocodeResults(results);
            setShowGeocodeOptions(true);
          }
        } else {
          setError(
            "Location not found. Please try a more specific address or use the suggestions."
          );
        }
      });
    },
    [onLocationSelected]
  );

  // Initialize Google Places services
  useEffect(() => {
    if (window.google && window.google.maps) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
      geocoderRef.current = new window.google.maps.Geocoder();

      // Create a dummy div for PlacesService
      const dummyDiv = document.createElement("div");
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        dummyDiv
      );
    }
  }, []);

  // Auto-geocode initial location if provided
  useEffect(() => {
    if (initialLocation && !selectedLocation && geocoderRef.current) {
      handleGeocodeLocation(initialLocation);
    }
  }, [initialLocation, selectedLocation, handleGeocodeLocation]);

  // Handle autocomplete search
  const handleInputChange = (value) => {
    setInputValue(value);
    setError("");
    setShowGeocodeOptions(false);

    if (value.length > 2 && autocompleteServiceRef.current) {
      setIsLoading(true);

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: value,
          types: ["establishment", "geocode"], // Include both places and addresses
          // componentRestrictions: { country: 'us' }, // Remove or adjust based on your service area
        },
        (predictions, status) => {
          setIsLoading(false);

          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle place selection from autocomplete
  const handlePlaceSelect = (place) => {
    setInputValue(place.description);
    setShowSuggestions(false);
    setIsLoading(true);

    // Get place details for precise coordinates
    placesServiceRef.current.getDetails(
      {
        placeId: place.place_id,
        fields: ["geometry", "formatted_address", "name", "types"],
      },
      (placeDetails, status) => {
        setIsLoading(false);

        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const locationData = {
            address: placeDetails.formatted_address,
            name: placeDetails.name,
            coordinates: {
              lat: placeDetails.geometry.location.lat(),
              lng: placeDetails.geometry.location.lng(),
            },
            placeId: place.place_id,
            types: placeDetails.types,
            source: "autocomplete",
          };

          setSelectedLocation(locationData);
          onLocationSelected(locationData);
        } else {
          setError("Failed to get place details");
        }
      }
    );
  };

  // Handle selection from multiple geocode results
  const handleGeocodeResultSelect = (result) => {
    const locationData = {
      address: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
      },
      types: result.types,
      source: "geocode_multiple",
    };

    setSelectedLocation(locationData);
    setInputValue(result.formatted_address);
    setShowGeocodeOptions(false);
    onLocationSelected(locationData);
  };

  // Confirm selected location
  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationConfirmed(selectedLocation);
    }
  };

  // Handle manual geocoding when user presses Enter or clicks search
  const handleManualSearch = () => {
    if (inputValue && !selectedLocation) {
      handleGeocodeLocation(inputValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (showSuggestions && suggestions.length > 0) {
        handlePlaceSelect(suggestions[0]);
      } else {
        handleManualSearch();
      }
    }
  };

  return (
    <div className="location-autocomplete">
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="location-input"
        />

        {selectedLocation && (
          <button onClick={handleConfirmLocation} className="confirm-button">
            Confirm
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              className="suggestion-item"
              onClick={() => handlePlaceSelect(suggestion)}
              type="button"
            >
              <span className="suggestion-main">
                {suggestion.structured_formatting.main_text}
              </span>
              <span className="suggestion-secondary">
                {suggestion.structured_formatting.secondary_text}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Multiple Geocode Results */}
      {showGeocodeOptions && geocodeResults.length > 0 && (
        <div className="geocode-options">
          <div className="options-header">
            <h4>Multiple locations found. Did you mean:</h4>
          </div>
          {geocodeResults.map((result) => (
            <button
              key={result.place_id || result.formatted_address}
              className="geocode-option"
              onClick={() => handleGeocodeResultSelect(result)}
              type="button"
            >
              <span className="option-address">{result.formatted_address}</span>
              <span className="option-types">
                {result.types.slice(0, 2).join(", ")}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="location-info">
          <div className="location-details">
            <div className="location-address">{selectedLocation.address}</div>
            {selectedLocation.name && (
              <div className="location-name">{selectedLocation.name}</div>
            )}
            <div className="location-coords">
              {selectedLocation.coordinates.lat.toFixed(6)},{" "}
              {selectedLocation.coordinates.lng.toFixed(6)}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {/* No Location Prompt */}
      {!selectedLocation && !isLoading && inputValue && (
        <div className="no-location-prompt">
          <p>📍 Can you specify a more precise location?</p>
          <p className="help-text">
            Try adding street number, cross-street, or nearby landmark
          </p>
        </div>
      )}

      {isLoading && (
        <div className="loading-indicator">
          <span>🔄 Finding location...</span>
        </div>
      )}
    </div>
  );
};

LocationAutocomplete.propTypes = {
  initialLocation: PropTypes.string,
  onLocationSelected: PropTypes.func.isRequired,
  onLocationConfirmed: PropTypes.func,
  placeholder: PropTypes.string,
};

export default LocationAutocomplete;
