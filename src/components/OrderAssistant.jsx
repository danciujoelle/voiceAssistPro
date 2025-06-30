import { useState } from "react";
import PropTypes from "prop-types";
import "./OrderAssistant.css";
import OpenAI from "openai";
import DeliveryLocationSection from "./DeliveryLocationSection";

const OrderRecordSection = ({
  onTranscriptGenerated,
  onOrderDataGenerated,
}) => {
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleAudioRecorded = () => {
    console.log("Order audio recorded");
    setTranscript(
      "Sample order: I'd like to order a large pizza with pepperoni."
    );
    onTranscriptGenerated("Sample order transcript");
    onOrderDataGenerated({
      items: "Large Pizza with Pepperoni",
      date: "2025-07-01",
      location: "123 Main St, City",
      additionalNotes: "Call before delivery",
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      console.log("Audio file uploaded:", file.name);
      await processAudioWithOpenAI(file);
    }
    // Clear the input
    event.target.value = "";
  };

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

        // Process the transcribed text through emergency triage
        await triageCall(translation.text, openai);
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

      // Transform the data to match our component structure
      const orderData = {
        type: parsedResponse.type,
        items: parsedResponse.items, // Keep as array for better display
        itemsString: parsedResponse.items
          .map((item) => `${item.quantity} ${item.name}`)
          .join(", "), // Keep string version for backwards compatibility
        location: parsedResponse.location,
        additionalNotes: parsedResponse.additional_notes,
        date: parsedResponse.order_date,
      };

      onOrderDataGenerated(orderData);
    } catch (err) {
      console.error("Error during triage call:", err);
      setError("Error processing transcript: " + err.message);
    }
  };

  return (
    <section className="record-section">
      <div className="section-header">
        <span className="section-icon">🎤</span>
        <h2>Record Order</h2>
      </div>

      <div className="record-buttons-container">
        <button
          onClick={handleAudioRecorded}
          className="record-btn start-recording"
          disabled={isProcessing}
        >
          🎤 Start Recording
        </button>

        <div className="upload-section">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="audio-file-input"
            disabled={isProcessing}
          />
          <label
            htmlFor="audio-file-input"
            className={`upload-button ${isProcessing ? "disabled" : ""}`}
          >
            {isProcessing ? "⏳ Processing..." : "📁 Upload Audio File"}
          </label>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p style={{ color: "red" }}>❌ {error}</p>
        </div>
      )}

      {isProcessing && (
        <div className="processing-message">
          <p>⏳ Processing audio file...</p>
        </div>
      )}

      {transcript && (
        <div className="transcript-section">
          <h3>Order Transcript:</h3>
          <p className="transcript-text">{transcript}</p>
        </div>
      )}
    </section>
  );
};

OrderRecordSection.propTypes = {
  onTranscriptGenerated: PropTypes.func.isRequired,
  onOrderDataGenerated: PropTypes.func.isRequired,
};

const OrderSummarySection = ({ orderData }) => {
  if (!orderData || !orderData.items) {
    return (
      <section className="record-section">
        <div className="section-header">
          <span className="section-icon">📊</span>
          <h2>Order Summary</h2>
        </div>

        <div className="no-data-message">
          <p>📋 Waiting for order analysis...</p>
          <p className="help-text">
            Record or upload an audio file to see the order details.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="record-section">
      <div className="section-header">
        <span className="section-icon">📊</span>
        <h2>Order Summary</h2>
      </div>

      <div className="order-summary-content">
        <div className="summary-item">
          <h3>📅 Delivery Date:</h3>
          <p className="summary-value">{orderData.date || "Not specified"}</p>
        </div>

        <div className="summary-item">
          <h3>📦 Items:</h3>
          <div className="items-list">
            {Array.isArray(orderData.items) ? (
              orderData.items.map((item) => (
                <div
                  key={`${item.quantity}-${item.name}`}
                  className="item-entry"
                >
                  <span className="item-quantity">{item.quantity}</span>
                  <span className="item-name">{item.name}</span>
                </div>
              ))
            ) : (
              <p className="summary-value">{orderData.items}</p>
            )}
          </div>
        </div>

        <div className="summary-item">
          <h3>📍 Location:</h3>
          <p className="summary-value">
            {orderData.location || "Not specified"}
          </p>
        </div>

        <div className="summary-item">
          <h3>📝 Notes:</h3>
          <p className="summary-value">{orderData.additionalNotes || "None"}</p>
        </div>

        <div className="order-actions">
          <button className="confirm-order-btn">✅ Confirm Order</button>
        </div>
      </div>
    </section>
  );
};

OrderSummarySection.propTypes = {
  orderData: PropTypes.shape({
    date: PropTypes.string,
    items: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          quantity: PropTypes.number.isRequired,
        })
      ),
    ]),
    itemsString: PropTypes.string,
    location: PropTypes.string,
    additionalNotes: PropTypes.string,
  }),
};

const OrderAssistant = () => {
  const [orderData, setOrderData] = useState(null);

  const handleTranscriptGenerated = (newTranscript) => {
    console.log("Order transcript generated:", newTranscript);
  };

  const handleOrderDataGenerated = (data) => {
    setOrderData(data);
  };

  const handleLocationConfirmed = (locationData) => {
    console.log("Delivery location confirmed in OrderAssistant:", locationData);
    // You can update orderData with confirmed location if needed
    setOrderData((prevData) => ({
      ...prevData,
      confirmedLocation: locationData,
    }));
  };

  return (
    <div className="order-assistant">
      <main className="assistant-main">
        <OrderRecordSection
          onTranscriptGenerated={handleTranscriptGenerated}
          onOrderDataGenerated={handleOrderDataGenerated}
        />

        <OrderSummarySection orderData={orderData} />

        <DeliveryLocationSection
          orderData={{
            ...orderData,
            deliveryAddress: orderData?.location,
            orderType: "construction",
            priority: "standard",
          }}
          onLocationConfirmed={handleLocationConfirmed}
        />
      </main>
    </div>
  );
};

export default OrderAssistant;
