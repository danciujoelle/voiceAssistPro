import PropTypes from "prop-types";
import "./TriageAnalysisSection.css";

// Helper function to get icons for different emergency units
const getUnitIcon = (unitName) => {
  const unitIcons = {
    Ambulance: "🚑",
    Police: "👮‍♂️",
    Firefighters: "🚒",
    "Mental Health Team": "🧠",
    "Hazard Unit": "⚠️",
    "Traffic Police": "🚔",
  };

  return unitIcons[unitName] || "🚨";
};

// Helper function to parse and display units with icons in a structured way
const renderUnitsWithIcons = (unitsString) => {
  if (!unitsString) return <span className="no-units">None required</span>;

  const units = unitsString.split(", ").map((unit) => unit.trim());

  return (
    <div className="units-grid">
      {units.map((unit) => (
        <div key={unit} className="unit-card">
          <div className="unit-icon-wrapper">
            <span className="unit-icon">{getUnitIcon(unit)}</span>
          </div>
          <span className="unit-name">{unit}</span>
        </div>
      ))}
    </div>
  );
};

const TriageAnalysisSection = ({ emergencyData, onDispatchUnits }) => {
  const handleDispatchUnits = () => {
    if (!emergencyData || !emergencyData.units) {
      alert("No units available to dispatch");
      return;
    }

    const units = emergencyData.units.split(", ").map((unit) => unit.trim());
    if (onDispatchUnits) {
      onDispatchUnits(units);
    }
  };
  if (!emergencyData?.type) {
    return (
      <section className="triage-section">
        <div className="section-header">
          <span className="section-icon">📊</span>
          <h2>Triage Analysis</h2>
        </div>

        <div className="no-data-message">
          <p>📋 Waiting for emergency call analysis...</p>
          <p className="help-text">
            Record or upload an audio file to see the triage analysis.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="triage-section">
      <div className="section-header">
        <span className="section-icon">📊</span>
        <h2>Triage Analysis</h2>
      </div>

      <div className="triage-card">
        <div className="triage-summary">
          <div className="info-badge emergency">
            <span className="badge-icon">🔴</span>
            <span>Emergency: {emergencyData.type}</span>
          </div>

          <div className="info-badge urgency">
            <span className="badge-icon">🔶</span>
            <span>Urgency: {emergencyData.urgency}</span>
          </div>
        </div>

        <div className="required-units-container">
          <div className="units-header">
            <h3 className="units-title">Required Units:</h3>
          </div>
          {renderUnitsWithIcons(emergencyData.units)}
        </div>
      </div>

      <div className="dispatch-section">
        <button
          className="dispatch-button"
          onClick={handleDispatchUnits}
          disabled={!emergencyData.units}
        >
          <span className="dispatch-icon">🚨</span>
          <span>Dispatch Units</span>
        </button>
      </div>
    </section>
  );
};

TriageAnalysisSection.propTypes = {
  emergencyData: PropTypes.shape({
    type: PropTypes.string,
    urgency: PropTypes.string,
    units: PropTypes.string,
  }),
  onDispatchUnits: PropTypes.func,
};

export default TriageAnalysisSection;
