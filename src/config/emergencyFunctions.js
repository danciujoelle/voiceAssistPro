/**
 * Emergency Functions Configuration
 *
 * This file contains the function definitions for OpenAI's function calling feature
 * to extract structured emergency information from call transcripts.
 */

export const functions = [
  {
    name: "extract_emergency_data",
    description: "Extract structured emergency info from a call transcript",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        emergency_type: {
          type: "string",
          enum: [
            "Medical",
            "Fire",
            "Accident",
            "Crime",
            "Hazard",
            "Mental Health",
            "Unclear",
          ],
        },
        urgency_level: {
          type: "string",
          enum: ["Critical", "High", "Moderate", "Low", "Unknown"],
        },
        required_response_units: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "Ambulance",
              "Police",
              "Firefighters",
              "Mental Health Team",
              "Hazard Unit",
              "Traffic Police",
            ],
          },
        },
        location_mention: { type: ["string", "null"] },
        followup_questions: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "emergency_type",
        "urgency_level",
        "required_response_units",
        "location_mention",
        "followup_questions",
      ],
      additionalProperties: false,
    },
  },
];

export default functions;
