import { useState } from 'react'
import RecordCallSection from './RecordCallSection'
import CustomerSupportAnalysisSection from './CustomerSupportAnalysisSection'
import SuggestedQuestionsSection from "./SuggestedQuestionsSection";
import CustomerSupportActionsSection from "./CustomerSupportActionsSection";
import "./CustomerSupportAssistant.css";

const CustomerSupportAssistant = () => {
  const [customerSupportData, setCustomerSupportData] = useState(null);
  const [isActionTaken, setIsActionTaken] = useState(false);

  const handleTranscriptGenerated = (newTranscript) => {
    console.log("Customer support transcript generated:", newTranscript);
  };

  const handleCustomerSupportDataGenerated = (data) => {
    setCustomerSupportData(data);
  };

  const handleActionTaken = (action) => {
    console.log("Action taken:", action);
    setIsActionTaken(true);
  };

  return (
    <div className="customer-support-assistant">
      <div className="assistant-header">
        <h2>Customer Support Copilot</h2>
        <p>AI-powered customer support assistant for call analysis and recommendations</p>
      </div>

      <main className="assistant-main">
        <RecordCallSection
          onTranscriptGenerated={handleTranscriptGenerated}
          onEmergencyDataGenerated={handleCustomerSupportDataGenerated}
          mode="customer-support"
        />

        <CustomerSupportAnalysisSection 
          customerSupportData={customerSupportData} 
          onActionTaken={handleActionTaken}
        />

        <SuggestedQuestionsSection
          suggestedQuestions={customerSupportData?.followup_questions}
          title="Follow-up Questions"
        />

        <CustomerSupportActionsSection
          customerSupportData={customerSupportData}
          isActionTaken={isActionTaken}
        />
      </main>
    </div>
  );
};

export default CustomerSupportAssistant
