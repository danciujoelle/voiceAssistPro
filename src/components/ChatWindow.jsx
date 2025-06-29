import { useState, useRef, useEffect } from "react";
import AudioRecorder from "./AudioRecorder";
import MapView from "./MapView";
import "./ChatWindow.css";
import OpenAI from "openai";

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "system",
      content: "Welcome to Emergency Assist. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [emergencyData, setEmergencyData] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type, content, audioUrl = null, duration = null) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      audioUrl,
      duration,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleAudioRecorded = async (audioBlob, audioUrl, duration) => {
    try {
      addMessage("user", "Audio message", audioUrl, duration);

      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      // Convert Blob to File object for OpenAI API
      const audioFile = new File([audioBlob], "audio.webm", {
        type: audioBlob.type || "audio/webm",
      });

      const translation = await openai.audio.translations.create({
        file: audioFile,
        model: "whisper-1",
      });

      // Display transcription
      if (translation.text) {
        addMessage("system", `Transcribed: "${translation.text}"`);
        // Process the transcribed text through emergency triage
        await triageCall(translation.text);
      } else {
        addMessage("error", "Error processing audio file");
      }
    } catch (error) {
      console.error("Error processing audio file:", error);
      addMessage("error", "Error processing audio file: " + error.message);
    }
  };

  const triageCall = async (transcriptText) => {
    addMessage("system", "Processing your message...");

    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an emergency assistance AI. Analyze the emergency call transcript and extract structured information to help dispatch appropriate response units. Provide clear, concise help for emergency situations.",
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
        },
        temperature: 0.1,
      });
      const jsonResponse = completion.choices[0].message.content;

      // Parse the JSON string into an object
      const parsedResponse = JSON.parse(jsonResponse);

      // Now you have each property separately available:
      const emergencyType = parsedResponse.emergency_type;
      const urgencyLevel = parsedResponse.urgency_level;
      const requiredResponseUnits = parsedResponse.required_response_units;
      const locationMention = parsedResponse.location_mention;
      const followupQuestions = parsedResponse.followup_questions;

      addMessage("Emergency Type:", emergencyType);
      addMessage("Urgency Level:", urgencyLevel);
      addMessage("Required Response Units:", requiredResponseUnits);
      addMessage("Location Mention:", locationMention);
      addMessage("Followup Questions:", followupQuestions);

      // Store emergency data and show map
      setEmergencyData({
        emergency_type: emergencyType,
        urgency_level: urgencyLevel,
        required_response_units: requiredResponseUnits,
        location_mention: locationMention,
        followup_questions: followupQuestions,
      });
      setShowMap(true);
    } catch (error) {
      console.error("Error during triage call:", error);
      addMessage("error", "Error processing transcript: " + error.message);
    }
  };

  const handleAudioFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      addMessage("error", "Please select a valid audio file");
      return;
    }

    try {
      // Create URL for the audio file
      const audioUrl = URL.createObjectURL(file);

      // Get duration of the audio file
      const audio = new Audio(audioUrl);
      await new Promise((resolve) => {
        audio.addEventListener("loadedmetadata", resolve);
        audio.load();
      });

      const duration = Math.floor(audio.duration);

      // Add user message with audio
      addMessage("user", "Audio file", audioUrl, duration);

      // Process with OpenAI Whisper
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const translation = await openai.audio.translations.create({
        file: file,
        model: "whisper-1",
      });

      // Display transcription
      if (translation.text) {
        addMessage("system", `Transcribed: "${translation.text}"`);
        // Process the transcribed text through emergency triage
        await triageCall(translation.text);
      } else {
        addMessage("error", "Error processing audio file");
      }
    } catch (error) {
      console.error("Error processing audio file:", error);
      addMessage("error", "Error processing audio file: " + error.message);
    }

    // Clear the input
    event.target.value = "";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const playAudio = (audioUrl) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              {message.audioUrl ? (
                <div className="audio-message">
                  <button
                    onClick={() => playAudio(message.audioUrl)}
                    className="play-audio-btn"
                    aria-label="Play audio message"
                  >
                    ▶ Play Audio ({formatTime(message.duration)})
                  </button>
                  <audio ref={audioRef} style={{ display: "none" }}>
                    <track kind="captions" srcLang="en" label="English" />
                  </audio>
                </div>
              ) : (
                <span className="message-text">{message.content}</span>
              )}
            </div>
            <div className="message-timestamp">
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showMap && emergencyData && (
        <MapView
          location={emergencyData.location_mention}
          emergencyType={emergencyData.emergency_type}
          urgencyLevel={emergencyData.urgency_level}
        />
      )}

      <div className="input-section">
        <div className="audio-section">
          <h3>Add Audio Message</h3>
          <div className="audio-options">
            <div className="upload-option">
              <label htmlFor="audio-upload" className="upload-label">
                Upload Audio File
              </label>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleAudioFileUpload}
                className="audio-upload-input"
                style={{ display: "none" }}
              />
            </div>
            <div className="or-divider">OR</div>
            <div className="record-option">
              <AudioRecorder onAudioRecorded={handleAudioRecorded} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
