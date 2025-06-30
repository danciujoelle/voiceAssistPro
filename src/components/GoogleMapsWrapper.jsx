import { Wrapper, Status } from "@googlemaps/react-wrapper";
import PropTypes from 'prop-types';
import './GoogleMapsWrapper.css';

const GoogleMapsWrapper = ({ children }) => {
  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return <div className="maps-loading">Loading Google Maps...</div>;
      case Status.FAILURE:
        return <div className="maps-error">Error loading Google Maps</div>;
      case Status.SUCCESS:
        return children;
      default:
        return <div className="maps-error">Unknown status</div>;
    }
  };

  return (
    <Wrapper
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      render={render}
      libraries={["places", "geometry"]}
    />
  );
};

GoogleMapsWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GoogleMapsWrapper;
