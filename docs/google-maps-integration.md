# Google Maps Integration Documentation

## Overview

The Emergency Assist application now includes Google Maps integration that displays after processing emergency calls through OpenAI triage. The map shows the emergency location with appropriate markers based on emergency type and urgency level.

## How It Works

1. **Audio Processing**: User records or uploads audio
2. **Speech-to-Text**: OpenAI Whisper converts audio to text
3. **Emergency Triage**: GPT-4 analyzes the emergency and extracts:
   - Emergency Type (Medical, Fire, Accident, Crime, Hazard, Mental Health, Unclear)
   - Urgency Level (Critical, High, Moderate, Low, Unknown)
   - Required Response Units
   - Location Mention
   - Follow-up Questions
4. **Map Display**: Google Maps shows the emergency location with appropriate markers

## Location Handling

The system handles location in multiple ways:

### 1. Explicit Location Mention
If the AI detects a specific location in the emergency call, it uses Google's Geocoding API to convert the address to coordinates.

### 2. Current Location Fallback
If no specific location is mentioned, the system:
- Requests the user's current location via browser geolocation
- Falls back to a default location (New York City) if geolocation fails

### 3. Error Handling
- If geocoding fails, falls back to current location
- If all location methods fail, uses default coordinates
- Displays appropriate error messages to the user

## Emergency Type Markers

Different emergency types use different colored markers:

- **Medical**: Red (Critical) / Pink (Other urgency levels)
- **Fire**: Orange
- **Crime**: Purple  
- **Accident**: Yellow
- **Hazard**: Brown
- **Mental Health**: Blue
- **Default/Unknown**: Red

## Map Features

- **Info Windows**: Click markers to see emergency details
- **Responsive Design**: Adapts to mobile and desktop
- **Accessibility**: High contrast support and screen reader friendly
- **Auto-centering**: Map automatically centers on emergency location
- **Zoom Control**: Users can zoom in/out for better context

## API Requirements

### Google Maps APIs
The following Google Cloud APIs must be enabled:
- **Maps JavaScript API**: For displaying the map
- **Geocoding API**: For converting addresses to coordinates

### Security Considerations
- API keys should be restricted to your domain
- Consider implementing server-side geocoding for production
- Monitor API usage to avoid unexpected charges

## Configuration

Environment variables required:
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Browser Compatibility

The map integration requires:
- Modern browser with JavaScript support
- Internet connection for map tiles and geocoding
- Geolocation API support (optional, for current location)

## Performance Considerations

- Map only loads after emergency triage is complete
- Lazy loading prevents unnecessary API calls
- Marker clustering can be added for multiple emergencies
- Map tiles are cached by Google for better performance
