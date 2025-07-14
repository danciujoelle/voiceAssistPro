import { useState } from "react";
import PropTypes from "prop-types";
import "./OrderAssistant.css";
import RecordCallSection from "./RecordCallSection";
import DeliveryLocationSection from "./DeliveryLocationSection";

const OrderSummarySection = ({ orderData }) => {
  if (!orderData?.items) {
    return (
      <section className="record-section">
        <div className="section-header">
          <span className="section-icon">📊</span>
          <h2>Order Summary</h2>
        </div>

        <div className="no-data-message">
          <p>📋 Waiting for order analysis...</p>
        </div>
      </section>
    );
  }

  // Handle items that could be an array or string
  const renderItems = () => {
    if (Array.isArray(orderData.items)) {
      return orderData.items.map((item) => (
        <div key={`${item.name}-${item.quantity}`} className="order-item">
          <span className="item-name">{item.name}</span>
          <span className="item-quantity">Qty: {item.quantity}</span>
        </div>
      ));
    }

    // Fallback for string items
    return <p className="summary-value">{orderData.items}</p>;
  };

  return (
    <section className="record-section">
      <div className="section-header">
        <span className="section-icon">📊</span>
        <h2>Order Summary</h2>
      </div>

      <div className="order-summary">
        <div className="summary-item">
          <h3>📅 Delivery Date:</h3>
          <p className="summary-value">{orderData.date}</p>
        </div>

        <div className="summary-item">
          <h3>📦 Items:</h3>
          <div className="items-list">{renderItems()}</div>
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
        <RecordCallSection
          onTranscriptGenerated={handleTranscriptGenerated}
          onEmergencyDataGenerated={handleOrderDataGenerated}
          mode="order"
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
