import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import GoogleMapsWrapper from './GoogleMapsWrapper'
import './UnitDispatchSection.css'

// Emergency unit station locations in Cluj-Napoca, Romania
const UNIT_STATIONS = {
  'Ambulance': {
    name: 'Spitalul Clinic Județean de Urgență Cluj',
    coordinates: { lat: 46.7719, lng: 23.6236 },
    address: 'Strada Clinicilor 3-5, Cluj-Napoca 400006, Romania'
  },
  'Police': {
    name: 'Inspectoratul de Poliție Județean Cluj',
    coordinates: { lat: 46.7712, lng: 23.6058 },
    address: 'Strada Dorobantilor 71, Cluj-Napoca 400609, Romania'
  },
  'Firefighters': {
    name: 'Detașamentul de Pompieri Cluj-Napoca',
    coordinates: { lat: 46.7663, lng: 23.5998 },
    address: 'Strada Câmpul Pâinii 1, Cluj-Napoca 400394, Romania'
  },
  'Mental Health Team': {
    name: 'Spitalul Clinic de Psihiatrie Cluj',
    coordinates: { lat: 46.7581, lng: 23.6174 },
    address: 'Strada Alexandru Odobescu 1, Cluj-Napoca 400058, Romania'
  },
  'Hazard Unit': {
    name: 'Inspectoratul pentru Situații de Urgență Cluj',
    coordinates: { lat: 46.7689, lng: 23.5889 },
    address: 'Strada Fabricii 1, Cluj-Napoca 400275, Romania'
  },
  'Traffic Police': {
    name: 'Poliția Rutieră Cluj-Napoca',
    coordinates: { lat: 46.7677, lng: 23.6128 },
    address: 'Strada Ion I. C. Brătianu 2, Cluj-Napoca 400079, Romania'
  }
}

// Helper function to get icons for different emergency units
const getUnitIcon = (unitName) => {
  const unitIcons = {
    Ambulance: "🚑",
    Police: "👮‍♂️",
    Firefighters: "🚒",
    "Mental Health Team": "🧠",
    "Hazard Unit": "⚠️",
    "Traffic Police": "🚔",
  };
  return unitIcons[unitName] || "🚨";
};

const UnitRouteMap = ({ unit, stationInfo, incidentCoordinates }) => {
  const [routeInfo, setRouteInfo] = useState(null)

  useEffect(() => {
    if (!window.google || !incidentCoordinates) return

    const mapInstance = new window.google.maps.Map(
      document.getElementById(`map-${unit.replace(/\s+/g, '-')}`),
      {
        zoom: 13,
        center: stationInfo.coordinates,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }
    )

    const directionsServiceInstance = new window.google.maps.DirectionsService()
    const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#FF4444',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    })

    directionsRendererInstance.setMap(mapInstance)

    // Calculate route
    const request = {
      origin: stationInfo.coordinates,
      destination: incidentCoordinates,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }

    directionsServiceInstance.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRendererInstance.setDirections(result)
        const route = result.routes[0]
        const leg = route.legs[0]
        setRouteInfo({
          distance: leg.distance.text,
          duration: leg.duration.text,
          duration_in_traffic: leg.duration_in_traffic?.text || leg.duration.text
        })
      } else {
        console.error('Directions request failed due to ' + status)
      }
    })

    // Add custom markers
    const stationIconSvg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="#4CAF50" stroke="#fff" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">${getUnitIcon(unit)}</text>
      </svg>
    `
    
    const incidentIconSvg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="#FF4444" stroke="#fff" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">🚨</text>
      </svg>
    `

    // Create markers for visualization
    const stationMarker = new window.google.maps.Marker({
      position: stationInfo.coordinates,
      map: mapInstance,
      title: `${unit} Station`,
      icon: {
        url: `data:image/svg+xml,${encodeURIComponent(stationIconSvg)}`,
        scaledSize: new window.google.maps.Size(32, 32)
      }
    })

    const incidentMarker = new window.google.maps.Marker({
      position: incidentCoordinates,
      map: mapInstance,
      title: 'Incident Location',
      icon: {
        url: `data:image/svg+xml,${encodeURIComponent(incidentIconSvg)}`,
        scaledSize: new window.google.maps.Size(32, 32)
      }
    })

    // Store markers for potential cleanup
    console.log('Markers created:', { stationMarker, incidentMarker })

  }, [unit, stationInfo, incidentCoordinates])

  return (
    <div className="unit-route-container">
      <div className="unit-header">
        <div className="unit-info">
          <span className="unit-icon">{getUnitIcon(unit)}</span>
          <div className="unit-details">
            <h4 className="unit-name">{unit}</h4>
            <p className="station-name">{stationInfo.name}</p>
          </div>
        </div>
        {routeInfo && (
          <div className="route-info">
            <div className="route-stat">
              <span className="route-label">Distance:</span>
              <span className="route-value">{routeInfo.distance}</span>
            </div>
            <div className="route-stat">
              <span className="route-label">ETA:</span>
              <span className="route-value">{routeInfo.duration_in_traffic}</span>
            </div>
          </div>
        )}
      </div>
      <div className="map-container">
        <div id={`map-${unit.replace(/\s+/g, '-')}`} className="route-map"></div>
      </div>
    </div>
  )
}

const UnitDispatchSection = ({ emergencyData, incidentLocation, incidentCoordinates, isDispatchTriggered }) => {
  const [dispatchedUnits, setDispatchedUnits] = useState([])

  useEffect(() => {
    if (isDispatchTriggered && emergencyData?.units) {
      const units = emergencyData.units.split(", ").map((unit) => unit.trim())
      setDispatchedUnits(units)
    }
  }, [isDispatchTriggered, emergencyData?.units])

  if (!isDispatchTriggered || !dispatchedUnits.length || !incidentCoordinates) {
    return null
  }

  return (
    <GoogleMapsWrapper>
      <section className="unit-dispatch-section">
        <div className="section-header">
          <span className="section-icon">🗺️</span>
          <h2>Unit Dispatch & Routes</h2>
        </div>
        
        <div className="dispatch-info">
          <p className="incident-location">
            📍 <strong>Incident Location:</strong> {incidentLocation}
          </p>
          <p className="units-count">
            🚨 <strong>{dispatchedUnits.length}</strong> unit{dispatchedUnits.length !== 1 ? 's' : ''} dispatched
          </p>
        </div>

        <div className="units-routes-grid">
          {dispatchedUnits.map((unit) => {
            const stationInfo = UNIT_STATIONS[unit]
            if (!stationInfo) return null

            return (
              <UnitRouteMap
                key={unit}
                unit={unit}
                stationInfo={stationInfo}
                incidentCoordinates={incidentCoordinates}
              />
            )
          })}
        </div>
      </section>
    </GoogleMapsWrapper>
  )
}

UnitRouteMap.propTypes = {
  unit: PropTypes.string.isRequired,
  stationInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    coordinates: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired
    }).isRequired,
    address: PropTypes.string.isRequired
  }).isRequired,
  incidentCoordinates: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }).isRequired
}

UnitDispatchSection.propTypes = {
  emergencyData: PropTypes.shape({
    type: PropTypes.string,
    urgency: PropTypes.string,
    units: PropTypes.string,
  }),
  incidentLocation: PropTypes.string,
  incidentCoordinates: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),
  isDispatchTriggered: PropTypes.bool.isRequired
}

export default UnitDispatchSection
