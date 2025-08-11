import { useState } from 'react'
import PropTypes from 'prop-types'
import MapView from './MapView'
import LocationAutocomplete from './LocationAutocomplete'
import GoogleMapsWrapper from './GoogleMapsWrapper'
import './IncidentLocationSection.css'

const IncidentLocationSection = ({ emergencyData, onLocationConfirmed }) => {
  const [confirmedLocation, setConfirmedLocation] = useState(null)
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false)

  const handleLocationSelected = (locationData) => {
    console.log("Location selected:", locationData);
    setConfirmedLocation(locationData);
  };

  const handleLocationConfirmedInternal = (locationData) => {
    console.log("Location confirmed:", locationData);
    setConfirmedLocation(locationData);
    setIsLocationConfirmed(true);
    if (onLocationConfirmed) {
      onLocationConfirmed(locationData);
    }
  };

  const displayLocation =
    confirmedLocation ||
    (emergencyData?.location
      ? {
          address: emergencyData.location,
        }
      : null);

  const hasLocation = Boolean(displayLocation?.address); // New: determine if we have a location to show

  // If no location yet, render a hidden placeholder section to preserve grid order
  if (!hasLocation) {
    return <section className="location-section location-hidden" aria-hidden="true" />;
  }


  return (
    <GoogleMapsWrapper>
      <section className="location-section">
        <div className="section-header">
          <span className="section-icon">📍</span>
          <h2>Incident Location</h2>
        </div>
        {emergencyData?.location ? (
          
        <div></div>) : (
          <div className="no-location-message">
            <p>🗺️ No specific location mentioned in the call.</p>
            <p className="help-text">Enter the emergency location below</p>
          </div>
        )}
        <div className="location-autocomplete-section">
          <LocationAutocomplete
            initialLocation={emergencyData?.location}
            onLocationSelected={handleLocationSelected}
            onLocationConfirmed={handleLocationConfirmedInternal}
            placeholder={
              emergencyData?.location
                ? "Confirm or refine the location..."
                : "Enter emergency location..."
            }
          />
          {isLocationConfirmed && confirmedLocation && (
            <div className="location-confirmed">
              <span className="status-text">Location Confirmed</span>
            </div>
          )}
        </div>
        <MapView
          location={displayLocation?.address}
          coordinates={confirmedLocation?.coordinates}
          emergencyType={emergencyData?.type}
          urgencyLevel={emergencyData?.urgency}
        />
      </section>
    </GoogleMapsWrapper>
  );
}

IncidentLocationSection.propTypes = {
  emergencyData: PropTypes.shape({
    type: PropTypes.string,
    urgency: PropTypes.string,
    location: PropTypes.string,
  }),
  onLocationConfirmed: PropTypes.func,
}

export default IncidentLocationSection
