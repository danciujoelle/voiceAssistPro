import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./MapView.css";

const MapComponent = ({ center, zoom, markers }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const googleMarkersRef = useRef([]);

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });
      setMap(newMap);
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (map && markers.length > 0) {
      // Clear existing markers
      googleMarkersRef.current.forEach((marker) => marker.setMap(null));

      // Add new markers
      const newMarkers = markers.map((markerData) => {
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map: map,
          title: markerData.title,
          icon: markerData.icon || null,
        });

        // Add info window if content is provided
        if (markerData.infoContent) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: markerData.infoContent,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });
        }

        return marker;
      });

      googleMarkersRef.current = newMarkers;

      // Adjust map bounds to show all markers
      if (newMarkers.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach((marker) => bounds.extend(marker.position));
        map.fitBounds(bounds);
      }
    }
  }, [map, markers]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      googleMarkersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, []);

  return <div ref={mapRef} className="map-container" />;
};

MapComponent.propTypes = {
  center: PropTypes.object.isRequired,
  zoom: PropTypes.number.isRequired,
  markers: PropTypes.array.isRequired,
};

const MapView = ({ location, coordinates, emergencyType, urgencyLevel }) => {
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);

  // Check if Google Maps is loaded and update state when it is
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsReady(true);
      } else {
        // Keep checking until Google Maps is loaded
        setTimeout(checkGoogleMaps, 100);
      }
    };

    checkGoogleMaps();
  }, []);

  useEffect(() => {
    const setupCoordinates = async () => {
      // Wait for Google Maps to be loaded before geocoding
      if (!isGoogleMapsReady) {
        return;
      }

      // If we have precise coordinates from autocomplete, use them
      if (coordinates) {
        setMapCoordinates(coordinates);
        setLoading(false);
        return;
      }

      // Otherwise proceed with geocoding
      await geocodeLocation();
    };

    const geocodeLocation = async () => {
      if (!location) {
        // If no location provided, try to get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setMapCoordinates({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
              setLoading(false);
            },
            () => {
              console.error("Geolocation error");
              // Default to Cluj-Napoca, Romania if geolocation fails
              setMapCoordinates({ lat: 46.7712, lng: 23.6236 });
              setLoading(false);
            }
          );
        } else {
          setMapCoordinates({ lat: 46.7712, lng: 23.6236 });
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            location
          )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setMapCoordinates({ lat, lng });
        } else {
          setError("Location not found");
          handleGeolocationFallback();
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setError("Failed to geocode location");
        setMapCoordinates({ lat: 46.7712, lng: 23.6236 }); // Cluj-Napoca, Romania
      } finally {
        setLoading(false);
      }
    };

    const handleGeolocationFallback = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapCoordinates({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            setMapCoordinates({ lat: 46.7712, lng: 23.6236 });
          }
        );
      } else {
        setMapCoordinates({ lat: 46.7712, lng: 23.6236 });
      }
    };

    setupCoordinates();
  }, [location, coordinates, isGoogleMapsReady]);

  const getEmergencyIcon = (type, urgency) => {
    const baseUrl = "https://maps.google.com/mapfiles/ms/icons/";

    switch (type?.toLowerCase()) {
      case "medical":
        return urgency === "Critical"
          ? `${baseUrl}red-dot.png`
          : `${baseUrl}pink-dot.png`;
      case "fire":
        return `${baseUrl}orange-dot.png`;
      case "crime":
        return `${baseUrl}purple-dot.png`;
      case "accident":
        return `${baseUrl}yellow-dot.png`;
      case "hazard":
        return `${baseUrl}brown-dot.png`;
      case "mental health":
        return `${baseUrl}blue-dot.png`;
      default:
        return `${baseUrl}red-dot.png`;
    }
  };

  const render = () => {
    // Check if Google Maps is loaded
    if (!isGoogleMapsReady || !window.google || !window.google.maps) {
      return <div className="map-loading">Loading Google Maps...</div>;
    }

    if (loading) {
      return <div className="map-loading">Geocoding location...</div>;
    }

    if (error) {
      return <div className="map-error">Error: {error}</div>;
    }

    if (!mapCoordinates) {
      return <div className="map-loading">Getting location...</div>;
    }

    const markers = [
      {
        position: mapCoordinates,
        title: `Emergency Location: ${location || "Current Location"}`,
        icon: getEmergencyIcon(emergencyType, urgencyLevel),
        infoContent: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0; color: #d32f2f;">Emergency Alert</h3>
            <p style="margin: 5px 0;"><strong>Type:</strong> ${emergencyType}</p>
            <p style="margin: 5px 0;"><strong>Urgency:</strong> ${urgencyLevel}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${
              location || "Current Location"
            }</p>
          </div>
        `,
      },
    ];

    return <MapComponent center={mapCoordinates} zoom={15} markers={markers} />;
  };

  return (
    <div className="map-view">
      <div className="map-header">
        <h3>Emergency Location Map</h3>
        {location && <p className="location-text">Showing: {location}</p>}
      </div>
      {render()}
    </div>
  );
};

MapView.propTypes = {
  location: PropTypes.string,
  coordinates: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  emergencyType: PropTypes.string,
  urgencyLevel: PropTypes.string,
};

export default MapView;
