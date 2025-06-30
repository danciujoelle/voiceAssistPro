# Unit Dispatch with Route Mapping Feature

## Overview
This feature adds comprehensive route mapping for emergency units dispatched to incident locations. When units are dispatched, each unit will display a dedicated map showing the optimal route from their station to the emergency location.

## How It Works

### 1. Emergency Call Processing
- Record or upload an emergency call
- The system analyzes the call and determines required units
- Location information is extracted from the call

### 2. Location Confirmation
- If a location is mentioned in the call, it appears in the "Incident Location" section
- Use the location autocomplete to confirm or refine the exact location
- The system will get precise coordinates for route calculation

### 3. Unit Dispatch
- Click "Dispatch Units" in the Triage Analysis section
- Confirm the dispatch when prompted
- This triggers the route mapping system

### 4. Route Visualization
- A new "Unit Dispatch & Routes" section appears after dispatch
- Each required unit gets its own map showing:
  - Station location (green marker with unit icon)
  - Incident location (red marker with emergency icon)
  - Optimal driving route between them
  - Distance and estimated travel time (ETA)

## Unit Stations (Mock Data)
The system includes predefined station locations for:

- **Ambulance**: City General Hospital
- **Police**: Police Station 14th Precinct  
- **Firefighters**: Fire Station 24
- **Mental Health Team**: Crisis Response Center
- **Hazard Unit**: Emergency Response HQ
- **Traffic Police**: Traffic Control Center

## Features

### Real-time Route Calculation
- Uses Google Maps Directions API for accurate routing
- Considers current traffic conditions for ETA
- Displays distance and travel time for each unit

### Visual Route Display
- Color-coded route lines on each map
- Custom markers for stations and incident location
- Responsive grid layout for multiple units

### Unit Information
- Each unit card shows:
  - Unit type with appropriate icon
  - Station name and location
  - Real-time distance and ETA
  - Interactive map with zoom/pan capabilities

## Usage Tips

1. **Ensure Location Accuracy**: The more precise the incident location, the more accurate the route calculations will be.

2. **Confirm Location**: Always confirm the incident location using the autocomplete feature for best results.

3. **Multiple Units**: The system efficiently handles multiple units simultaneously, showing all routes in an organized grid.

4. **Mobile Responsive**: Maps and unit cards adapt to different screen sizes for mobile dispatch operations.

## Technical Implementation

- **Maps Integration**: Google Maps JavaScript API
- **Route Calculation**: Google Directions Service
- **Real-time Updates**: Dynamic ETA calculation with traffic data
- **Responsive Design**: CSS Grid for flexible unit layout

This feature significantly enhances dispatch operations by providing visual confirmation of unit locations and optimal routing for faster emergency response times.
