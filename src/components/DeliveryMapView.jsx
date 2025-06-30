import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./MapView.css";

// Default location: Cluj-Napoca, Romania (city center)
const DEFAULT_LOCATION = {
  lat: 46.7712,
  lng: 23.6236,
  address: "Cluj-Napoca, Romania"
};

const MapComponent = ({ center, zoom, markers }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const googleMarkersRef = useRef([]);

  useEffect(() => {
    if (mapRef.current && !map && window.google && window.google.maps) {
      console.log("MapComponent: Creating Google Map with center:", center);
      // Add a small delay to ensure everything is ready
      setTimeout(() => {
        try {
          const newMap = new window.google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
          });
          console.log("MapComponent: Google Map created successfully");
          setMap(newMap);
        } catch (error) {
          console.error("MapComponent: Error creating Google Map:", error);
        }
      }, 100);
    } else {
      console.log("MapComponent: Not ready to create map:", {
        hasMapRef: !!mapRef.current,
        hasMap: !!map,
        hasGoogle: !!(window.google && window.google.maps)
      });
    }
  }, [center, zoom, map]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map && center) {
      map.panTo(center); // Use panTo for smooth animation instead of setCenter
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

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
          animation: window.google.maps.Animation.DROP, // Add drop animation
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

      // If multiple markers, adjust bounds to show all markers
      if (markers.length > 1) {
        // Adjust map bounds to show all markers
        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach((marker) => bounds.extend(marker.position));
        map.fitBounds(bounds);
      }
    } else if (map && markers.length === 0) {
      // Clear all markers if no markers provided
      googleMarkersRef.current.forEach((marker) => marker.setMap(null));
      googleMarkersRef.current = [];
    }
  }, [map, markers, zoom]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      googleMarkersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, []);

  return <div ref={mapRef} className="map-container" style={{ height: '400px', width: '100%', backgroundColor: '#f0f0f0' }} />;
};

MapComponent.propTypes = {
  center: PropTypes.object.isRequired,
  zoom: PropTypes.number.isRequired,
  markers: PropTypes.array.isRequired,
};

const DeliveryMapView = ({ location, coordinates, orderType, priority, customerName }) => {
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

      setLoading(true);
      setError(null);

      // If we have precise coordinates from autocomplete, use them
      if (coordinates) {
        setMapCoordinates(coordinates);
        setError(null); // Clear any previous errors
        setLoading(false);
        return;
      }

      // Otherwise proceed with geocoding
      await geocodeLocation();
    };

    const geocodeLocation = async () => {
      if (!location) {
        // If no location provided, immediately use default location
        console.log("No location provided - using default Cluj-Napoca location");
        setMapCoordinates(DEFAULT_LOCATION);
        setLoading(false);
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
        setMapCoordinates(DEFAULT_LOCATION); // Cluj-Napoca, Romania
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
            setMapCoordinates(DEFAULT_LOCATION);
          }
        );
      } else {
        setMapCoordinates(DEFAULT_LOCATION);
      }
    };

    setupCoordinates();
  }, [location, coordinates, isGoogleMapsReady]);

  const getDeliveryIcon = (orderType, priority) => {
    const baseUrl = "https://maps.google.com/mapfiles/ms/icons/";

    // Use different icons based on order type and priority
    switch (orderType?.toLowerCase()) {
      case "construction":
        return priority === "urgent" || priority === "high"
          ? `${baseUrl}orange-dot.png`
          : `${baseUrl}yellow-dot.png`;
      case "office":
        return `${baseUrl}blue-dot.png`;
      case "residential":
        return `${baseUrl}green-dot.png`;
      case "commercial":
        return `${baseUrl}purple-dot.png`;
      case "industrial":
        return `${baseUrl}brown-dot.png`;
      default:
        // Default delivery icon based on priority
        return priority === "urgent" || priority === "high"
          ? `${baseUrl}red-dot.png`
          : `${baseUrl}green-dot.png`;
    }
  };

  const render = () => {
    // Check if Google Maps is loaded
    if (!isGoogleMapsReady || !window.google || !window.google.maps) {
      console.log("DeliveryMapView: Google Maps not ready");
      return <div className="map-loading">Loading Google Maps...</div>;
    }

    if (loading) {
      console.log("DeliveryMapView: Loading location...");
      return <div className="map-loading">Geocoding location...</div>;
    }

    if (error) {
      console.error("DeliveryMapView: Error:", error);
      return <div className="map-error">Error: {error}</div>;
    }

    if (!mapCoordinates) {
      console.log("DeliveryMapView: No coordinates available");
      return <div className="map-loading">Getting location...</div>;
    }

    console.log("DeliveryMapView: Rendering map with coordinates:", mapCoordinates);

    const markers = [
      {
        position: mapCoordinates,
        title: `Delivery Location: ${location || DEFAULT_LOCATION.address}`,
        icon: getDeliveryIcon(orderType, priority),
        infoContent: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0; color: #28a745;">📦 Delivery Details</h3>
            <p style="margin: 5px 0;"><strong>Order Type:</strong> ${orderType || "Standard delivery"}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> ${priority || "Standard"}</p>
            ${customerName ? `<p style="margin: 5px 0;"><strong>Customer:</strong> ${customerName}</p>` : ""}
            <p style="margin: 5px 0;"><strong>Location:</strong> ${
              location || DEFAULT_LOCATION.address
            }</p>
            ${!location ? `<p style="margin: 5px 0; color: #6c757d; font-style: italic;">📍 Default location shown</p>` : ""}
          </div>
        `,
      },
    ];

    return <MapComponent center={mapCoordinates} zoom={15} markers={markers} />;
  };

  // Debug coordinates changes
  useEffect(() => {
    console.log("DeliveryMapView: Coordinates changed:", mapCoordinates);
    console.log("DeliveryMapView: Loading state:", loading);
    console.log("DeliveryMapView: Error state:", error);
    console.log("DeliveryMapView: Google Maps ready:", isGoogleMapsReady);
  }, [mapCoordinates, loading, error, isGoogleMapsReady]);

  return (
    <div className="map-view" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      <div className="map-header">
        <h3>📍 Delivery Location Map</h3>
        {location ? (
          <p className="location-text">Delivery to: {location}</p>
        ) : (
          <p className="location-text">📍 Default location: {DEFAULT_LOCATION.address}</p>
        )}
      </div>
      <div style={{ flex: 1, minHeight: '400px' }}>
        {render()}
      </div>
    </div>
  );
};

DeliveryMapView.propTypes = {
  location: PropTypes.string,
  coordinates: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  orderType: PropTypes.string,
  priority: PropTypes.string,
  customerName: PropTypes.string,
};

export default DeliveryMapView;
