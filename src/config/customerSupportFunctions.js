/**
 * Customer Support Functions Configuration
 *
 * This file contains the function definitions for OpenAI's function calling feature
 * to extract structured customer support information from call transcripts.
 */

export const functions = [
  {
    name: "extract_customer_support_data",
    description: "Extract structured customer support info from a call transcript",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          enum: [
            "Product Inquiry",
            "Technical Support",
            "Billing Issue",
            "Complaint",
            "Refund Request",
            "Account Management",
            "General Information",
            "Feature Request",
            "Bug Report",
            "Other"
          ],
        },
        sentiment: {
          type: "string",
          enum: ["Positive", "Neutral", "Negative"],
        },
        recommended_action: {
          type: "string",
          enum: [
            "Escalate to Supervisor",
            "Technical Troubleshooting",
            "Process Refund",
            "Transfer to Billing",
            "Provide Information",
            "Schedule Follow-up",
            "Create Ticket",
            "Apologize and Resolve",
            "Offer Compensation",
            "Document Feedback"
          ],
        },
        followup_questions: {
          type: "array",
          items: { type: "string" },
          maxItems: 4,
          description: "4 concise questions to clarify the customer's needs"
        },
      },
      required: [
        "intent",
        "sentiment", 
        "recommended_action",
        "followup_questions",
      ],
      additionalProperties: false,
    },
  },
];

export default functions;
