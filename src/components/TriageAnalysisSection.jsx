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
          <span className="unit-icon">{getUnitIcon(unit)}</span>
          <span className="unit-name">{unit}</span>
        </div>
      ))}
    </div>
  );
};

const TriageAnalysisSection = ({ emergencyData }) => {
  if (!emergencyData || !emergencyData.type) {
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

      <div className="emergency-info">
        <div className="info-item emergency">
          <span className="status-dot emergency"></span>
          <span>Emergency: {emergencyData.type}</span>
        </div>
        <div className="info-item urgency">
          <span className="status-dot urgency"></span>
          <span>Urgency: {emergencyData.urgency}</span>
        </div>
        <div className="info-item units">
          <div className="units-header">
            <span className="status-dot units"></span>
            <span className="units-label">Required Units:</span>
          </div>
          {renderUnitsWithIcons(emergencyData.units)}
        </div>
      </div>

      {(emergencyData.suggestedQuestions &&
        emergencyData.suggestedQuestions.length > 0) ||
      (emergencyData.guidanceSteps &&
        emergencyData.guidanceSteps.length > 0) ? (
        <div className="questions-and-guidance">
          {emergencyData.suggestedQuestions &&
            emergencyData.suggestedQuestions.length > 0 && (
              <div className="suggested-questions">
                <h3>❓ Suggested Questions</h3>
                <ul>
                  {emergencyData.suggestedQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
            )}

          {emergencyData.guidanceSteps &&
            emergencyData.guidanceSteps.length > 0 && (
              <div className="guidance-steps">
                <h3>❓ Guidance Steps</h3>
                <ul>
                  {emergencyData.guidanceSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      ) : null}
    </section>
  );
};

TriageAnalysisSection.propTypes = {
  emergencyData: PropTypes.shape({
    type: PropTypes.string,
    urgency: PropTypes.string,
    units: PropTypes.string,
    suggestedQuestions: PropTypes.arrayOf(PropTypes.string),
    guidanceSteps: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default TriageAnalysisSection;
