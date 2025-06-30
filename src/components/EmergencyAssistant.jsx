import { useState } from 'react'
import RecordCallSection from './RecordCallSection'
import TriageAnalysisSection from './TriageAnalysisSection'
import SuggestedQuestionsSection from "./SuggestedQuestionsSection";
import GuidanceStepsSection from "./GuidanceStepsSection";
import IncidentLocationSection from "./IncidentLocationSection";
import UnitDispatchSection from "./UnitDispatchSection";
import "./EmergencyAssistant.css";

const EmergencyAssistant = () => {
  const [emergencyData, setEmergencyData] = useState(null);
  const [isDispatchTriggered, setIsDispatchTriggered] = useState(false);
  const [confirmedLocation, setConfirmedLocation] = useState(null);

  const handleTranscriptGenerated = (newTranscript) => {
    console.log("Transcript generated:", newTranscript);
  };

  const handleEmergencyDataGenerated = (data) => {
    setEmergencyData(data);
  };

  const handleDispatchUnits = (units) => {
    console.log("Units dispatched:", units);
    setIsDispatchTriggered(true);
  };

  const handleLocationConfirmed = (locationData) => {
    console.log("Location confirmed:", locationData);
    setConfirmedLocation(locationData);
  };

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

        <TriageAnalysisSection 
          emergencyData={emergencyData} 
          onDispatchUnits={handleDispatchUnits}
        />

        <SuggestedQuestionsSection
          suggestedQuestions={emergencyData?.suggestedQuestions}
        />

        <GuidanceStepsSection guidanceSteps={emergencyData?.guidanceSteps} />

        <IncidentLocationSection 
          emergencyData={emergencyData}
          onLocationConfirmed={handleLocationConfirmed}
        />

        <UnitDispatchSection
          emergencyData={emergencyData}
          incidentLocation={confirmedLocation?.address || emergencyData?.location}
          incidentCoordinates={confirmedLocation?.coordinates}
          isDispatchTriggered={isDispatchTriggered}
        />
      </main>
    </div>
  );
};

export default EmergencyAssistant
