import { useState } from 'react'
import RecordCallSection from './RecordCallSection'
import TriageAnalysisSection from './TriageAnalysisSection'
import IncidentLocationSection from './IncidentLocationSection'
import './EmergencyAssistant.css'

const EmergencyAssistant = () => {
  const [emergencyData, setEmergencyData] = useState(null)

  const handleTranscriptGenerated = (newTranscript) => {
    console.log('Transcript generated:', newTranscript)
  }

  const handleEmergencyDataGenerated = (data) => {
    setEmergencyData(data)
  }

  return (
    <div className="emergency-assistant">
      <img 
        src="/dispatcher-copilot.png" 
        alt="Dispatcher Copilot" 
        className="dispatcher-logo"
      />
      
      <main className="assistant-main">
        <RecordCallSection 
          onTranscriptGenerated={handleTranscriptGenerated}
          onEmergencyDataGenerated={handleEmergencyDataGenerated}
        />
        
        <TriageAnalysisSection emergencyData={emergencyData} />
        
        <IncidentLocationSection emergencyData={emergencyData} />
      </main>
    </div>
  )
}

export default EmergencyAssistant
