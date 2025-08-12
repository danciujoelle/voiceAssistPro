import { useState } from 'react'
import PropTypes from 'prop-types'
import MapView from "./MapView";
import LocationAutocomplete from "./LocationAutocomplete";
import GoogleMapsWrapper from "./GoogleMapsWrapper";

const DeliveryLocationSection = ({ orderData, onLocationConfirmed }) => {
  const [confirmedLocation, setConfirmedLocation] = useState(null);

  const handleLocationSelected = (locationData) => {
    console.log("Delivery location selected:", locationData);
    // Update the order data with precise coordinates
    setConfirmedLocation(locationData);
  };

  const handleLocationConfirmedInternal = (locationData) => {
    console.log("Delivery location confirmed:", locationData);
    setConfirmedLocation(locationData);
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
