import { useState } from 'react'
import './OrderAssistant.css'

const OrderRecordSection = ({ onTranscriptGenerated, onOrderDataGenerated }) => {
  const [transcript, setTranscript] = useState("")
  
  // Placeholder functions - will be implemented later
  const handleAudioRecorded = () => {
    console.log('Order audio recorded')
    setTranscript("Sample order: I'd like to order a large pizza with pepperoni.")
    onTranscriptGenerated("Sample order transcript")
    onOrderDataGenerated({
      type: "Food Order",
      items: "Large Pizza with Pepperoni",
      estimatedTime: "25-30 minutes",
      total: "$18.99"
    })
  }

  const handleFileUpload = () => {
    console.log('Order audio file uploaded')
  }

  return (
    <section className="record-section">
      <div className="section-header">
        <span className="section-icon">🎤</span>
        <h2>Record Order</h2>
      </div>
      
      <div className="record-buttons-container">
        <button onClick={handleAudioRecorded} className="record-btn start-recording">
          🎤 Start Recording
        </button>
        
        <div className="upload-section">
          <button onClick={handleFileUpload} className="upload-button">
            📁 Upload Audio File
          </button>
        </div>
      </div>
      
      {transcript && (
        <div className="transcript-section">
          <h3>Order Transcript:</h3>
          <p className="transcript-text">{transcript}</p>
        </div>
      )}
    </section>
  )
}

const OrderAnalysisSection = ({ orderData }) => {
  if (!orderData || !orderData.type) {
    return (
      <section className="triage-section">
        <div className="section-header">
          <span className="section-icon">📊</span>
          <h2>Order Analysis</h2>
        </div>
        
        <div className="no-data-message">
          <p>📋 Waiting for order analysis...</p>
          <p className="help-text">Record or upload an audio file to see the order details.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="triage-section">
      <div className="section-header">
        <span className="section-icon">📊</span>
        <h2>Order Analysis</h2>
      </div>
      
      <div className="emergency-info">
        <div className="info-item emergency">
          <span className="status-dot order-type"></span>
          <span>Type: {orderData.type}</span>
        </div>
        <div className="info-item urgency">
          <span className="status-dot order-items"></span>
          <span>Items: {orderData.items}</span>
        </div>
        <div className="info-item units">
          <span className="status-dot order-time"></span>
          <span>Time: {orderData.estimatedTime}</span>
        </div>
        <div className="info-item total">
          <span className="status-dot order-total"></span>
          <span>Total: {orderData.total}</span>
        </div>
      </div>
    </section>
  )
}

const OrderLocationSection = ({ orderData }) => {
  return (
    <section className="location-section">
      <div className="section-header">
        <span className="section-icon">📍</span>
        <h2>Delivery Location</h2>
      </div>
      
      <div className="no-location-message">
        <p>🏠 Default delivery address will be used.</p>
        <p className="help-text">Update your delivery preferences in settings.</p>
      </div>
      
      <div className="order-summary">
        <h3>📦 Order Summary</h3>
        {orderData ? (
          <div className="summary-content">
            <p><strong>Order Type:</strong> {orderData.type}</p>
            <p><strong>Items:</strong> {orderData.items}</p>
            <p><strong>Estimated Time:</strong> {orderData.estimatedTime}</p>
            <p><strong>Total:</strong> {orderData.total}</p>
            <button className="confirm-order-btn">✅ Confirm Order</button>
          </div>
        ) : (
          <p className="help-text">No order details available yet.</p>
        )}
      </div>
    </section>
  )
}

const OrderAssistant = () => {
  const [orderData, setOrderData] = useState(null)

  const handleTranscriptGenerated = (newTranscript) => {
    console.log('Order transcript generated:', newTranscript)
  }

  const handleOrderDataGenerated = (data) => {
    setOrderData(data)
  }

  return (
    <div className="order-assistant">
      <main className="assistant-main">
        <OrderRecordSection 
          onTranscriptGenerated={handleTranscriptGenerated}
          onOrderDataGenerated={handleOrderDataGenerated}
        />
        
        <OrderAnalysisSection orderData={orderData} />
        
        <OrderLocationSection orderData={orderData} />
      </main>
    </div>
  )
}

export default OrderAssistant
