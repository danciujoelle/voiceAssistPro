import PropTypes from 'prop-types'
import './CustomerSupportAnalysisSection.css'

const CustomerSupportAnalysisSection = ({ customerSupportData, onActionTaken }) => {
  if (!customerSupportData) {
    return (
      <section className="customer-support-analysis-section">
        <h3>Customer Support Analysis</h3>
        <div className="analysis-placeholder">
          <p>Record a customer call to see AI-powered support analysis</p>
        </div>
      </section>
    )
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return '😊'
      case 'Negative': return '😟'
      case 'Neutral': return '😐'
      default: return '❓'
    }
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return '#22c55e'
      case 'Negative': return '#ef4444'
      case 'Neutral': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getIntentIcon = (intent) => {
    const iconMap = {
      'Product Inquiry': '🔍',
      'Technical Support': '🔧',
      'Billing Issue': '💳',
      'Complaint': '😤',
      'Refund Request': '💰',
      'Account Management': '👤',
      'General Information': 'ℹ️',
      'Feature Request': '💡',
      'Bug Report': '🐛',
      'Other': '❓'
    }
    return iconMap[intent] || '❓'
  }

  const handleTakeAction = () => {
    onActionTaken(customerSupportData.recommended_action)
  }

  return (
    <section className="customer-support-analysis-section">
      <h3>Customer Support Analysis</h3>
      
      <div className="analysis-grid">
        <div className="analysis-item intent-item">
          <div className="analysis-header">
            <span className="analysis-icon">{getIntentIcon(customerSupportData.intent)}</span>
            <span className="analysis-label">Intent</span>
          </div>
          <div className="analysis-value intent-value">
            {customerSupportData.intent}
          </div>
        </div>

        <div className="analysis-item sentiment-item">
          <div className="analysis-header">
            <span className="analysis-icon">{getSentimentIcon(customerSupportData.sentiment)}</span>
            <span className="analysis-label">Sentiment</span>
          </div>
          <div 
            className="analysis-value sentiment-value"
            style={{ color: getSentimentColor(customerSupportData.sentiment) }}
          >
            {customerSupportData.sentiment}
          </div>
        </div>

        <div className="analysis-item action-item">
          <div className="analysis-header">
            <span className="analysis-icon">🎯</span>
            <span className="analysis-label">Recommended Action</span>
          </div>
          <div className="analysis-value action-value">
            {customerSupportData.recommended_action}
          </div>
          <button 
            className="take-action-btn"
            onClick={handleTakeAction}
          >
            Take Action
          </button>
        </div>
      </div>
    </section>
  )
}

CustomerSupportAnalysisSection.propTypes = {
  customerSupportData: PropTypes.shape({
    intent: PropTypes.string,
    sentiment: PropTypes.string,
    recommended_action: PropTypes.string,
    followup_questions: PropTypes.array
  }),
  onActionTaken: PropTypes.func.isRequired
}

export default CustomerSupportAnalysisSection
