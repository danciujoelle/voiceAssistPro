import PropTypes from "prop-types";
import "./GuidanceStepsSection.css";

const GuidanceStepsSection = ({ guidanceSteps }) => {
  if (!guidanceSteps || guidanceSteps.length === 0) {
    return (
      <section className="guidance-steps-section">
        <div className="section-header">
          <span className="section-icon">📋</span>
          <h2>Guidance Steps</h2>
        </div>

        <div className="no-data-message">
          <p>📝 No guidance steps available</p>
          <p className="help-text">
            Guidance steps will appear here after emergency call analysis.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="guidance-steps-section">
      <div className="section-header">
        <span className="section-icon">📋</span>
        <h2>Guidance Steps</h2>
      </div>

      <div className="steps-content">
        <div className="steps-list">
          <ol>
            {guidanceSteps.map((step, index) => (
              <li key={`step-${index}-${step.slice(0, 20)}`} className="step-item">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <span className="step-text">{step}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

GuidanceStepsSection.propTypes = {
  guidanceSteps: PropTypes.arrayOf(PropTypes.string),
};

export default GuidanceStepsSection;
