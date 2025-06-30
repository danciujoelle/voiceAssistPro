import { useState } from 'react'
import PropTypes from 'prop-types'
import MapView from './MapView'
import LocationAutocomplete from './LocationAutocomplete'
import GoogleMapsWrapper from './GoogleMapsWrapper'
import './IncidentLocationSection.css'

const IncidentLocationSection = ({ emergencyData }) => {
  const [confirmedLocation, setConfirmedLocation] = useState(null)
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false)

  const handleLocationSelected = (locationData) => {
    console.log('Location selected:', locationData)
    // Update the emergency data with precise coordinates
    setConfirmedLocation(locationData)
  }

  const handleLocationConfirmed = (locationData) => {
    console.log('Location confirmed:', locationData)
    setConfirmedLocation(locationData)
    setIsLocationConfirmed(true)
  }

  // Use confirmed location or fall back to detected location
  const displayLocation = confirmedLocation || (emergencyData?.location ? { 
    address: emergencyData.location 
  } : null)

  return (
    <GoogleMapsWrapper>
      <section className="location-section">
        <div className="section-header">
          <span className="section-icon">📍</span>
          <h2>Incident Location</h2>
        </div>
        
        {emergencyData && emergencyData.location ? (
          <div className="location-info">
            <p className="location-detected">
              🎤 Location from call: <strong>{emergencyData.location}</strong>
            </p>
            {!isLocationConfirmed && (
              <p className="location-help">
                Please confirm or refine the location using the search below:
              </p>
            )}
          </div>
        ) : (
          <div className="no-location-message">
            <p>🗺️ No specific location mentioned in the call.</p>
            <p className="help-text">Please enter the emergency location below:</p>
          </div>
        )}

        {/* Location Autocomplete */}
        <div className="location-autocomplete-section">
          <LocationAutocomplete
            initialLocation={emergencyData?.location}
            onLocationSelected={handleLocationSelected}
            onLocationConfirmed={handleLocationConfirmed}
            placeholder={emergencyData?.location ? 
              "Confirm or refine the location..." : 
              "Enter emergency location..."
            }
          />
        </div>

        {/* Location Status */}
        {isLocationConfirmed && confirmedLocation && (
          <div className="location-confirmed">
            <span className="status-icon">✅</span>
            <span className="status-text">Location confirmed and dispatched</span>
          </div>
        )}
        
        <MapView 
          location={displayLocation?.address}
          coordinates={confirmedLocation?.coordinates}
          emergencyType={emergencyData?.type}
          urgencyLevel={emergencyData?.urgency}
        />
      </section>
    </GoogleMapsWrapper>
  )
}

IncidentLocationSection.propTypes = {
  emergencyData: PropTypes.shape({
    type: PropTypes.string,
    urgency: PropTypes.string,
    location: PropTypes.string,
  }),
}

export default IncidentLocationSection
