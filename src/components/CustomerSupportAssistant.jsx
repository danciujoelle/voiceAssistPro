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
    // Reset action completion when a new transcript is generated
    setIsActionTaken(false);
  };

  const handleCustomerSupportDataGenerated = (data) => {
    // Update analysis data and ensure action status resets for new processing
    setCustomerSupportData(data);
    setIsActionTaken(false);
  };

  const handleActionTaken = (action) => {
    console.log("Action taken:", action);
    setIsActionTaken(true);
  };

  return (
    <div className="customer-support-assistant">
      <img
        src="/customer_support.png"
        alt="Customer Support"
        className="customer-support-logo"
      />

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
