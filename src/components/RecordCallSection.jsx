import { useState, useRef, useEffect } from "react";
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
  const [selectedAudioFile, setSelectedAudioFile] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Available audio files from public folder - filtered by mode
  const getAudioFilesByMode = (currentMode) => {
    const allAudioFiles = {
      emergency: [
        { name: "Select an audio file...", value: "" },
        {
          name: "Emergency Call Cluj Napoca",
          value: "emergency_call_cluj_napoca.mp3",
        },
        { name: "Heart Problem 911 Call", value: "heart_problem_911_call.mp3" },
      ],
      order: [
        { name: "Select an audio file...", value: "" },
        { name: "Order Call Cluj Napoca", value: "order_call_cluj_napoca.mp3" },
        {
          name: "Construction Site Request",
          value: "construction_site_request.mp3",
        },
      ],
      "customer-support": [
        { name: "Select an audio file...", value: "" },
        { name: "Billing Concern", value: "billing-concern.mp3" },
        { name: "Internet Connectivity", value: "internet_conectivity.mp3" },
        { name: "Product Return Request", value: "product_return_request.mp3" },
      ],
    };

    return allAudioFiles[currentMode] || allAudioFiles.emergency;
  };

  const audioFiles = getAudioFilesByMode(mode);

  // Reset selected audio file when mode changes
  useEffect(() => {
    setSelectedAudioFile("");
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [mode]);

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
        } else if (mode === "order") {
          await triageOrderCall(translation.text, openai);
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
                  description:
                    "The most specific location mentioned - address, intersection, landmark, or place name where the emergency is occurring",
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
                    "Other",
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
                    "Document Feedback",
                  ],
                },
                followup_questions: {
                  type: "array",
                  items: { type: "string" },
                  maxItems: 2,
                  description:
                    "4 concise questions to clarify the customer's needs",
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

  const triageOrderCall = async (transcriptText, openai) => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a construction order assistant AI. Analyze the customer's order request transcript and extract structured information to create a purchase order. Focus on: the requested delivery date (YYYY-MM-DD), list of products with names and quantities, the delivery address or null if not mentioned, any extra instructions (e.g., confirm silicone quantity) Pay special attention to date formats, unit clarification, and conditional statements like add a few tubes — I'll confirm quantity later. Provide only the JSON output matching this exact schema—no extra commentary.",
          },
          { role: "user", content: transcriptText },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "OrderResponse",
            strict: true,
            schema: {
              type: "object",
              properties: {
                order_date: { type: "string", format: "date" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      quantity: { type: "integer", minimum: 1 },
                    },
                    required: ["name", "quantity"],
                    additionalProperties: false,
                  },
                },
                location: { type: ["string", "null"] },
                additional_notes: { type: ["string", "null"] },
              },
              required: ["order_date", "items", "location", "additional_notes"],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.1,
      });

      const jsonResponse = completion.choices[0].message.content;
      const parsedResponse = JSON.parse(jsonResponse);

      // Transform to expected format
      const orderData = {
        date: parsedResponse.order_date,
        items: parsedResponse.items,
        location: parsedResponse.location,
        additionalNotes: parsedResponse.additional_notes,
      };

      onEmergencyDataGenerated(orderData);
    } catch (err) {
      console.error("Error during order triage:", err);
      setError("Error processing order: " + err.message);
    }
  };

  const handleAudioFileSelect = (event) => {
    const selectedFile = event.target.value;
    setSelectedAudioFile(selectedFile);

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handlePlayAudio = () => {
    if (!selectedAudioFile) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleProcessSelectedAudio = async () => {
    if (!selectedAudioFile) return;

    try {
      // Fetch the audio file from the public folder
      const response = await fetch(`/${selectedAudioFile}`);
      const audioBlob = await response.blob();

      // Convert to File object for OpenAI API
      const audioFile = new File([audioBlob], selectedAudioFile, {
        type: audioBlob.type || "audio/mp3",
      });

      await processAudioWithOpenAI(audioFile);
    } catch (err) {
      console.error("Error processing selected audio file:", err);
      setError("Error processing selected audio file: " + err.message);
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

  // State for tab selection
  const [activeTab, setActiveTab] = useState("prerecorded"); // "record" or "prerecorded"

  return (
    <section className="record-section">
      <div className="section-header">
        <span className="section-icon">🎤</span>
        <h2>Record Audio</h2>
      </div>

      <div className="record-tabs">
        <label
          className={`record-tab ${
            activeTab === "prerecorded" ? "active" : ""
          }`}
        >
          <input
            type="radio"
            name="recordType"
            value="prerecorded"
            checked={activeTab === "prerecorded"}
            onChange={() => setActiveTab("prerecorded")}
            className="record-radio"
          />
          <span className="radio-custom"></span>
          Pre-Recorded
        </label>
        <label
          className={`record-tab ${activeTab === "record" ? "active" : ""}`}
        >
          <input
            type="radio"
            name="recordType"
            value="record"
            checked={activeTab === "record"}
            onChange={() => setActiveTab("record")}
            className="record-radio"
          />
          <span className="radio-custom"></span>
          Record New
        </label>
      </div>

      <div className="record-buttons-container">
        {activeTab === "record" && (
          <>
            <AudioRecorder onAudioRecorded={handleAudioRecorded} />
          </>
        )}

        {activeTab === "prerecorded" && (
          <div className="audio-file-section">
            <select
              value={selectedAudioFile}
              onChange={handleAudioFileSelect}
              className="audio-file-select"
            >
              {audioFiles.map((file) => (
                <option key={file.value} value={file.value}>
                  {file.name}
                </option>
              ))}
            </select>

            {selectedAudioFile && (
              <div className="audio-controls">
                <button
                  onClick={handlePlayAudio}
                  className="play-button"
                  title={isPlaying ? "Pause Audio" : "Play Audio"}
                >
                  {isPlaying ? "Pause" : "Preview"}
                </button>
                <button
                  onClick={handleProcessSelectedAudio}
                  className="process-button"
                  disabled={isProcessing}
                >
                  Process Audio
                </button>
              </div>
            )}

            <audio
              ref={audioRef}
              src={selectedAudioFile ? `/${selectedAudioFile}` : ""}
              onEnded={handleAudioEnded}
              style={{ display: "none" }}
            >
              <track kind="captions" />
            </audio>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="processing-indicator">
          <span>Processing audio...</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>{error}</span>
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
