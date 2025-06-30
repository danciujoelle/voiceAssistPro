import PropTypes from "prop-types";
import "./SuggestedQuestionsSection.css";

const SuggestedQuestionsSection = ({ suggestedQuestions }) => {
  if (!suggestedQuestions || suggestedQuestions.length === 0) {
    return (
      <section className="suggested-questions-section">
        <div className="section-header">
          <span className="section-icon">❓</span>
          <h2>Suggested Questions</h2>
        </div>

        <div className="no-data-message">
          <p>📝 No suggested questions available</p>
          <p className="help-text">
            Questions will appear here after emergency call analysis.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="suggested-questions-section">
      <div className="section-header">
        <span className="section-icon">❓</span>
        <h2>Suggested Questions</h2>
      </div>

      <div className="questions-content">
        <div className="questions-list">
          <ul>
            {suggestedQuestions.map((question, index) => (
              <li key={`question-${index}-${question.slice(0, 20)}`} className="question-item">
                <span className="question-number">{index + 1}</span>
                <span className="question-text">{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

SuggestedQuestionsSection.propTypes = {
  suggestedQuestions: PropTypes.arrayOf(PropTypes.string),
};

export default SuggestedQuestionsSection;
