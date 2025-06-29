import PropTypes from 'prop-types'
import MapView from './MapView'
import './IncidentLocationSection.css'

const IncidentLocationSection = ({ emergencyData }) => {
  return (
    <section className="location-section">
      <div className="section-header">
        <span className="section-icon">📍</span>
        <h2>Incident Location</h2>
      </div>
      
      {emergencyData && emergencyData.location ? (
        <div className="location-info">
          <p className="location-detected">
            📍 Location detected: <strong>{emergencyData.location}</strong>
          </p>
        </div>
      ) : (
        <div className="no-location-message">
          <p>🗺️ No specific location mentioned in the call.</p>
          <p className="help-text">Showing default emergency response area.</p>
        </div>
      )}
      
      <MapView 
        location={emergencyData?.location}
        emergencyType={emergencyData?.type}
        urgencyLevel={emergencyData?.urgency}
      />
    </section>
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
