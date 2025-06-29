# Emergency Assist - React Chat Application

Emergency Assist is a React-based web application designed to provide emergency assistance through a chat interface with audio recording capabilities. Built with modern web technologies and accessibility in mind.

## Features

- **Chat Interface**: Clean, accessible chat window for emergency communications
- **Audio Recording**: Record and send audio messages using the Web Audio API
- **Speech-to-Text**: Convert audio messages to text using OpenAI Whisper
- **Emergency Triage**: AI-powered emergency analysis and response unit recommendation
- **Google Maps Integration**: Visual location mapping for emergency situations
- **Emergency-First Design**: UI/UX optimized for emergency and high-stress situations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: Built with WCAG compliance for emergency accessibility

## Technologies Used

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **OpenAI API** - Speech-to-text and AI emergency triage
- **Google Maps API** - Location mapping and geocoding
- **Web Audio API** - Native browser audio recording
- **CSS Modules** - Scoped styling with modern CSS features
- **MediaRecorder API** - Cross-browser audio recording support

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Modern web browser with microphone support
- OpenAI API key (for speech-to-text and AI triage)
- Google Maps API key (for location mapping)

### API Keys Setup

1. **OpenAI API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create an account and generate an API key
   - Make sure you have credits for using the Whisper and GPT models

2. **Google Maps API Key**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Geocoding API
   - Create credentials (API Key)
   - Restrict the key to your domain for security

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd emergency-assist
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your API keys:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

### Running Linting

```bash
npm run lint
```

## Usage

### Text Messages
1. Type your emergency message in the text area
2. Click "Send" or press Enter to send the message

### Audio Recording
1. Click "Start Recording" to begin audio capture
2. Speak your emergency message clearly
3. Use "Pause/Resume" controls as needed
4. Click "Stop" when finished
5. The audio message will be added to the chat

### Browser Permissions
- The application requires microphone permissions for audio recording
- Grant permissions when prompted for full functionality

## Emergency Notice

🚨 **For immediate life-threatening emergencies, call 911 directly.**

This application is designed to supplement emergency communications but should not replace direct emergency services contact in critical situations.

## Development

### Project Structure

```
src/
├── components/
│   ├── AudioRecorder.jsx      # Audio recording component
│   ├── AudioRecorder.css      # Audio recorder styles
│   ├── ChatWindow.jsx         # Main chat interface
│   └── ChatWindow.css         # Chat window styles
├── App.jsx                    # Main application component
├── App.css                    # Application styles
├── index.css                  # Global styles
└── main.jsx                   # Application entry point
```

### Key Components

- **ChatWindow**: Main chat interface with message display and input handling
- **AudioRecorder**: Handles audio recording, playback, and permission management

### Accessibility Features

- ARIA labels for screen readers
- High contrast mode support
- Keyboard navigation support
- Focus management
- Reduced motion preferences

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

*Note: Audio recording requires modern browser support for MediaRecorder API*

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the coding guidelines
4. Test thoroughly, especially emergency scenarios
5. Submit a pull request

## License

[Add your license here]

## Emergency Resources

- **US Emergency Services**: 911
- **Non-Emergency Police**: [Local number]
- **Poison Control**: 1-800-222-1222
- **Crisis Text Line**: Text HOME to 741741
