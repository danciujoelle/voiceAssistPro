import { useState } from "react";
import AudioRecorder from "./AudioRecorder";
import OpenAI from "openai";
import PropTypes from "prop-types";
import "./RecordCallSection.css";

const RecordCallSection = ({
  onTranscriptGenerated,
  onEmergencyDataGenerated,
  mode = "emergency", // "emergency" or "customer-support"
}) => {
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const processAudioWithOpenAI = async (audioFile) => {
    setIsProcessing(true);
    setError("");

    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      // Transcribe audio
      const translation = await openai.audio.translations.create({
        file: audioFile,
        model: "whisper-1",
      });

      if (translation.text) {
        setTranscript(translation.text);
        onTranscriptGenerated(translation.text);

        // Process the transcribed text through appropriate triage
        if (mode === "customer-support") {
          await triageCustomerSupportCall(translation.text, openai);
        } else {
          await triageCall(translation.text, openai);
        }
      } else {
        setError("Error processing audio file");
      }
    } catch (err) {
      console.error("Error processing audio file:", err);
      setError("Error processing audio file: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const triageCall = async (transcriptText, openai) => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an emergency assistance AI. Analyze the emergency call transcript and extract structured information to help dispatch appropriate response units. Pay special attention to location mentions - extract the most specific address, intersection, landmark, or place name mentioned. If multiple locations are mentioned, prioritize the emergency incident location. Provide clear, concise help for emergency situations.",
          },
          { role: "user", content: transcriptText },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "EmergencyResponse",
            strict: true,
            schema: {
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
                location_mention: { 
                  type: ["string", "null"],
                  description: "The most specific location mentioned - address, intersection, landmark, or place name where the emergency is occurring"
                },
                followup_questions: {
                  type: "array",
                  items: { type: "string" },
                },
                guidance_steps: { type: "array", items: { type: "string" } },
              },
              required: [
                "emergency_type",
                "urgency_level",
                "required_response_units",
                "location_mention",
                "followup_questions",
                "guidance_steps",
              ],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.1,
      });

      const jsonResponse = completion.choices[0].message.content;
      const parsedResponse = JSON.parse(jsonResponse);

      // Transform the data to match our component structure
      const emergencyData = {
        type: parsedResponse.emergency_type,
        urgency: parsedResponse.urgency_level,
        units: parsedResponse.required_response_units.join(", "),
        suggestedQuestions: parsedResponse.followup_questions,
        location: parsedResponse.location_mention,
        guidanceSteps: parsedResponse.guidance_steps,
      };

      onEmergencyDataGenerated(emergencyData);
    } catch (err) {
      console.error("Error during triage call:", err);
      setError("Error processing transcript: " + err.message);
    }
  };

  const triageCustomerSupportCall = async (transcriptText, openai) => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a customer support assistant AI. From the transcript, extract: intent (user's request category), sentiment (Positive, Neutral, or Negative), recommended_action (what the agent should do next), and followup_questions (2 concise questions to clarify). Return only valid JSON in the exact schema.",
          },
          { role: "user", content: transcriptText },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "CustomerSupportResponse",
            strict: true,
            schema: {
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
                  maxItems: 2,
                  description: "2 concise questions to clarify the customer's needs"
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
        },
        temperature: 0.1,
      });

      const jsonResponse = completion.choices[0].message.content;
      const parsedResponse = JSON.parse(jsonResponse);

      onEmergencyDataGenerated(parsedResponse);
    } catch (err) {
      console.error("Error during customer support triage:", err);
      setError("Error processing transcript: " + err.message);
    }
  };

  const handleAudioRecorded = async (audioBlob, audioUrl, duration) => {
    console.log("Audio recorded:", { audioBlob, audioUrl, duration });

    // Convert Blob to File object for OpenAI API
    const audioFile = new File([audioBlob], "audio.webm", {
      type: audioBlob.type || "audio/webm",
    });

    await processAudioWithOpenAI(audioFile);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file?.type?.startsWith("audio/")) {
      console.log("Audio file uploaded:", file.name);
      await processAudioWithOpenAI(file);
    }
    // Clear the input
    event.target.value = "";
  };

  return (
    <section className="record-section">
      <div className="section-header">
        <span className="section-icon">🎤</span>
        <h2>{mode === "customer-support" ? "Record Customer Call" : "Record Call"}</h2>
      </div>

      <div className="record-buttons-container">
        <AudioRecorder onAudioRecorded={handleAudioRecorded} />

        <div className="upload-section">
          <label htmlFor="audio-upload" className="upload-button">
            � Upload Audio File
          </label>
          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {isProcessing && (
        <div className="processing-indicator">
          <span>🔄 Processing audio...</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      {transcript && (
        <div className="transcript-section">
          <h3>Transcript:</h3>
          <p className="transcript-text">{transcript}</p>
        </div>
      )}
    </section>
  );
};

RecordCallSection.propTypes = {
  onTranscriptGenerated: PropTypes.func.isRequired,
  onEmergencyDataGenerated: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["emergency", "customer-support"]),
};

export default RecordCallSection;
