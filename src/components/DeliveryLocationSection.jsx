import { useState } from 'react'
import PropTypes from 'prop-types'
import MapView from "./MapView";
import LocationAutocomplete from "./LocationAutocomplete";
import GoogleMapsWrapper from "./GoogleMapsWrapper";

const DeliveryLocationSection = ({ orderData, onLocationConfirmed }) => {
  const [confirmedLocation, setConfirmedLocation] = useState(null);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

  const handleLocationSelected = (locationData) => {
    console.log("Delivery location selected:", locationData);
    // Update the order data with precise coordinates
    setConfirmedLocation(locationData);
  };

  const handleLocationConfirmedInternal = (locationData) => {
    console.log("Delivery location confirmed:", locationData);
    setConfirmedLocation(locationData);
    setIsLocationConfirmed(true);
    // Notify parent component
    if (onLocationConfirmed) {
      onLocationConfirmed(locationData);
    }
  };

  // Use confirmed location or fall back to detected delivery address
  const displayLocation =
    confirmedLocation ||
    (orderData?.deliveryAddress
      ? {
          address: orderData.deliveryAddress,
        }
      : null);

  return (
    <GoogleMapsWrapper>
      <section className="location-section">
        <div className="section-header">
          <span className="section-icon">🚚</span>
          <h2>Delivery Location</h2>
        </div>

        <div className="location-content">
          <div className="address-info">
            {orderData && orderData.deliveryAddress ? (
              <div className="location-info">
                <p className="location-detected">
                  📦 Delivery address from order:{" "}
                  <strong>{orderData.deliveryAddress}</strong>
                </p>
                {!isLocationConfirmed && (
                  <p className="location-help">
                    Please confirm or refine the delivery location:
                  </p>
                )}
              </div>
            ) : (
              <div className="no-location-message">
                <p>🏠 No specific delivery address provided in the order.</p>
                <p className="help-text">
                  Please enter the delivery location below:
                </p>
              </div>
            )}
          </div>

          {/* Location Autocomplete */}
          <div className="location-autocomplete-section">
            <LocationAutocomplete
              initialLocation={orderData?.deliveryAddress}
              onLocationSelected={handleLocationSelected}
              onLocationConfirmed={handleLocationConfirmedInternal}
              placeholder={
                orderData?.deliveryAddress
                  ? "Confirm or refine delivery location..."
                  : "Enter delivery address..."
              }
            />
          </div>

          {/* Location Status */}
          {isLocationConfirmed && confirmedLocation && (
            <div className="location-confirmed">
              <span className="status-icon">✅</span>
              <span className="status-text">Delivery location confirmed</span>
            </div>
          )}

          {/* Map Only - No Headers */}
          <MapView
            location={displayLocation?.address}
            coordinates={confirmedLocation?.coordinates}
            emergencyType="delivery"
            urgencyLevel={orderData?.priority || "standard"}
            hideHeader={true}
          />
        </div>
      </section>
    </GoogleMapsWrapper>
  );
};

DeliveryLocationSection.propTypes = {
  orderData: PropTypes.shape({
    orderType: PropTypes.string,
    priority: PropTypes.string,
    deliveryAddress: PropTypes.string,
    customerName: PropTypes.string,
    orderItems: PropTypes.array,
  }),
  onLocationConfirmed: PropTypes.func,
}

export default DeliveryLocationSection
