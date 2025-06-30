import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./AudioRecorder.css";

const AudioRecorder = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Check for microphone permission on component mount
    checkMicrophonePermission();

    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Audio recording is not supported in this browser");
        setHasPermission(false);
        return;
      }

      const permissionStatus = await navigator.permissions.query({
        name: "microphone",
      });
      setHasPermission(permissionStatus.state === "granted");

      permissionStatus.onchange = () => {
        setHasPermission(permissionStatus.state === "granted");
      };
    } catch {
      console.warn(
        "Permission check not supported, will prompt when recording starts"
      );
      setHasPermission(null);
    }
  };

  const startRecording = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setHasPermission(true);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        onAudioRecorded(audioBlob, audioUrl, recordingTime);

        // Reset recording state
        setRecordingTime(0);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(
        "Failed to start recording. Please check microphone permissions."
      );
      setHasPermission(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const requestPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      setError("");
    } catch {
      setError(
        "Microphone access denied. Please enable microphone permissions."
      );
      setHasPermission(false);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="audio-recorder permission-denied">
        <div className="permission-message">
          <span className="permission-icon">🎙️</span>
          <p>Microphone access is required for audio recording</p>
          <button onClick={requestPermission} className="permission-btn">
            Grant Permission
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  }

  return (
    <div className="audio-recorder">
      {error && <div className="error-message">{error}</div>}

      <div className="recording-controls">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="record-btn start-recording"
            disabled={hasPermission === false}
            aria-label="Start recording"
          >
            <span className="record-icon">🎙️</span> Start Recording
          </button>
        ) : (
          <div className="recording-active">
            <div className="recording-info">
              <div className="recording-indicator">
                <span className="pulse-dot"></span>
                REC {formatTime(recordingTime)}
              </div>
            </div>

            <div className="recording-buttons">
              <button
                onClick={pauseRecording}
                className={`record-btn ${isPaused ? "resume" : "pause"}`}
                aria-label={isPaused ? "Resume recording" : "Pause recording"}
              >
                {isPaused ? "Resume" : "Pause"}
              </button>

              <button
                onClick={stopRecording}
                className="record-btn stop-recording"
                aria-label="Stop recording"
              >
                Stop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

AudioRecorder.propTypes = {
  onAudioRecorded: PropTypes.func.isRequired,
};

export default AudioRecorder;
