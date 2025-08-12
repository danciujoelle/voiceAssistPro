import PropTypes from 'prop-types'
import './CustomerSupportActionsSection.css'

const CustomerSupportActionsSection = ({ customerSupportData, isActionTaken }) => {
  if (!customerSupportData) {
    return (
      <section className="customer-support-actions-section">
        <h3>Support Actions</h3>
        <div className="actions-placeholder">
          <p>Record or process a call to see recommended actions.</p>
        </div>
      </section>
    )
  }

  const getActionDetails = (action) => {
    const actionMap = {
      'Escalate to Supervisor': {
        icon: '📞',
        description: 'Transfer call to supervisor for resolution',
        steps: ['Notify supervisor', 'Brief on customer issue', 'Transfer call']
      },
      'Technical Troubleshooting': {
        icon: '🔧',
        description: 'Guide customer through technical solution steps',
        steps: ['Identify problem', 'Provide step-by-step solution', 'Verify resolution']
      },
      'Process Refund': {
        icon: '💰',
        description: 'Initiate refund process for customer',
        steps: ['Verify eligibility', 'Process refund request', 'Send confirmation']
      },
      'Transfer to Billing': {
        icon: '💳',
        description: 'Route customer to billing department',
        steps: ['Explain transfer reason', 'Warm transfer to billing', 'Follow up if needed']
      },
      'Provide Information': {
        icon: 'ℹ️',
        description: 'Share relevant information with customer',
        steps: ['Gather specific details', 'Provide clear information', 'Confirm understanding']
      },
      'Schedule Follow-up': {
        icon: '📅',
        description: 'Set up future contact with customer',
        steps: ['Agree on timeline', 'Schedule callback', 'Set reminder']
      },
      'Create Ticket': {
        icon: '🎫',
        description: 'Document issue for tracking and resolution',
        steps: ['Create support ticket', 'Document details', 'Assign to team']
      },
      'Apologize and Resolve': {
        icon: '🤝',
        description: 'Acknowledge issue and work toward resolution',
        steps: ['Sincere apology', 'Take ownership', 'Provide solution']
      },
      'Offer Compensation': {
        icon: '🎁',
        description: 'Provide compensation for customer inconvenience',
        steps: ['Assess situation', 'Determine compensation', 'Process offer']
      },
      'Document Feedback': {
        icon: '📝',
        description: 'Record customer feedback for improvement',
        steps: ['Capture feedback', 'Categorize input', 'Share with team']
      }
    }
    
    return actionMap[action] || {
      icon: '❓',
      description: 'Standard customer support action',
      steps: ['Review case', 'Take appropriate action', 'Follow up']
    }
  }

  const actionDetails = getActionDetails(customerSupportData.recommended_action)

  return (
    <section className="customer-support-actions-section">
      <h3>Support Actions</h3>
      
      <div className="action-card">
        <div className="action-header">
          <span className="action-icon">{actionDetails.icon}</span>
          <div className="action-info">
            <h4 className="action-title">{customerSupportData.recommended_action}</h4>
            <p className="action-description">{actionDetails.description}</p>
          </div>
          <div className={`action-status ${isActionTaken ? 'completed' : 'pending'}`}>
            {isActionTaken ? '✅ Completed' : '⏳ Pending'}
          </div>
        </div>
        
        <div className="action-steps">
          <h5>Action Steps:</h5>
          <ol className="steps-list">
            {actionDetails.steps.map((step, index) => (
              <li key={`step-${step.slice(0, 20)}-${index}`} className={`step-item ${isActionTaken ? 'completed' : ''}`}>
                {step}
              </li>
            ))}
          </ol>
        </div>
        
        <div className="customer-context">
          <h5>Customer Context:</h5>
          <div className="context-grid">
            <div className="context-item">
              <span className="context-label">Intent:</span>
              <span className="context-value">{customerSupportData.intent}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Sentiment:</span>
              <span className={`context-value sentiment-${customerSupportData.sentiment.toLowerCase()}`}>
                {customerSupportData.sentiment}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

CustomerSupportActionsSection.propTypes = {
  customerSupportData: PropTypes.shape({
    intent: PropTypes.string,
    sentiment: PropTypes.string,
    recommended_action: PropTypes.string,
    followup_questions: PropTypes.array
  }),
  isActionTaken: PropTypes.bool.isRequired
}

export default CustomerSupportActionsSection
