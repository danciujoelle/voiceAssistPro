import { useState, useEffect, useRef } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import PropTypes from "prop-types";
import "./MapView.css";

const MapComponent = ({ center, zoom, markers }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [googleMarkers, setGoogleMarkers] = useState([]);

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
      googleMarkers.forEach(marker => marker.setMap(null));
      
      // Add new markers
      const newMarkers = markers.map(markerData => {
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

      setGoogleMarkers(newMarkers);

      // Adjust map bounds to show all markers
      if (newMarkers.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.position));
        map.fitBounds(bounds);
      }
    }
  }, [map, markers, googleMarkers]);

  return <div ref={mapRef} className="map-container" />;
};

MapComponent.propTypes = {
  center: PropTypes.object.isRequired,
  zoom: PropTypes.number.isRequired,
  markers: PropTypes.array.isRequired,
};

const MapView = ({ location, emergencyType, urgencyLevel }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const geocodeLocation = async () => {
      if (!location) {
        // If no location provided, try to get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCoordinates({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
              setLoading(false);
            },
            (geoError) => {
              console.error("Geolocation error:", geoError);
              // Default to Cluj-Napoca, Romania if geolocation fails
              setCoordinates({ lat: 46.7712, lng: 23.6236 });
              setLoading(false);
            }
          );
        } else {
          setCoordinates({ lat: 46.7712, lng: 23.6236 });
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
          setCoordinates({ lat, lng });
        } else {
          setError("Location not found");
          // Fallback to user's current location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setCoordinates({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                });
              },
              () => {
                setCoordinates({ lat: 46.7712, lng: 23.6236 }); // Cluj-Napoca, Romania
              }
            );
          }
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setError("Failed to geocode location");
        setCoordinates({ lat: 46.7712, lng: 23.6236 }); // Cluj-Napoca, Romania
      } finally {
        setLoading(false);
      }
    };

    geocodeLocation();
  }, [location]);

  const getEmergencyIcon = (type, urgency) => {
    const baseUrl = "https://maps.google.com/mapfiles/ms/icons/";
    
    switch (type?.toLowerCase()) {
      case "medical":
        return urgency === "Critical" ? `${baseUrl}red-dot.png` : `${baseUrl}pink-dot.png`;
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

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return <div className="map-loading">Loading Google Maps...</div>;
      case Status.FAILURE:
        return <div className="map-error">Error loading Google Maps</div>;
      case Status.SUCCESS: {
        if (loading) {
          return <div className="map-loading">Geocoding location...</div>;
        }

        if (error) {
          return <div className="map-error">Error: {error}</div>;
        }

        if (!coordinates) {
          return <div className="map-loading">Getting location...</div>;
        }

        const markers = [
          {
            position: coordinates,
            title: `Emergency Location: ${location || "Current Location"}`,
            icon: getEmergencyIcon(emergencyType, urgencyLevel),
            infoContent: `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0; color: #d32f2f;">Emergency Alert</h3>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${emergencyType}</p>
                <p style="margin: 5px 0;"><strong>Urgency:</strong> ${urgencyLevel}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${location || "Current Location"}</p>
              </div>
            `,
          },
        ];

        return (
          <MapComponent
            center={coordinates}
            zoom={15}
            markers={markers}
          />
        );
      }
      default:
        return <div className="map-error">Unknown status</div>;
    }
  };

  return (
    <div className="map-view">
      <div className="map-header">
        <h3>Emergency Location Map</h3>
        {location && <p className="location-text">Showing: {location}</p>}
      </div>
      <Wrapper
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        render={render}
        libraries={["geometry"]}
      />
    </div>
  );
};

MapView.propTypes = {
  location: PropTypes.string,
  emergencyType: PropTypes.string,
  urgencyLevel: PropTypes.string,
};

export default MapView;
