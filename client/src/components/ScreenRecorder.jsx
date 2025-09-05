import { useState, useRef, useCallback } from "react";
import {
  HiPlay,
  HiStop,
  HiDownload,
  HiUpload,
  HiRefresh,
  HiClock,
} from "react-icons/hi";
import { toast } from "react-hot-toast";
import VideoPlayer from "./VideoPlayer";

const ScreenRecorder = ({ onUpload }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const MAX_RECORDING_TIME = 180;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= MAX_RECORDING_TIME) {
          stopRecording();
          toast.warning("Maximum recording time reached (3 minutes)");
          return prev;
        }
        return newTime;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: "screen",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      let audioStream = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        });
        toast.success("Screen and microphone access granted");
      } catch {
        console.warn(
          "Microphone access denied, continuing with screen audio only"
        );
        toast.warning("Microphone access denied, using screen audio only");
      }

      let combinedStream;
      if (audioStream) {
        combinedStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...displayStream.getAudioTracks(),
          ...audioStream.getAudioTracks(),
        ]);
      } else {
        combinedStream = displayStream;
      }

      streamRef.current = combinedStream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        toast.success("Recording completed successfully!");
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (audioStream) {
          audioStream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        toast.error("Recording failed: " + event.error.message);
        stopRecording();
      };

      displayStream.getVideoTracks()[0].onended = () => {
        toast.info("Screen sharing ended");
        stopRecording();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);

      setIsRecording(true);
      setRecordingTime(0);
      setRecordedBlob(null);
      startTimer();
      toast.success("Recording started!");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording: " + error.message);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
      toast.info("Recording stopped");
    }
  }, [isRecording, stopTimer]);

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `screen-recording-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-")}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    }
  };

  const uploadRecording = async () => {
    if (!recordedBlob) return;
    try {
      setUploading(true);
      const filename = `screen-recording-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-")}.webm`;
      await onUpload(recordedBlob, filename);
      setRecordedBlob(null);
      setRecordingTime(0);
    } catch {
    } finally {
      setUploading(false);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    toast.info("Ready for new recording");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col items-center space-y-4">
        {isRecording && (
          <div className="flex items-center space-x-2 text-2xl font-mono font-bold text-red-600">
            <HiClock className="w-6 h-6" />
            <span>
              {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          {!isRecording && !recordedBlob && (
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <HiPlay className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <HiStop className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          )}

          {recordedBlob && (
            <>
              <button
                onClick={downloadRecording}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <HiDownload className="w-4 h-4" />
                <span>Download</span>
              </button>

              <button
                onClick={uploadRecording}
                disabled={uploading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiUpload className="w-4 h-4" />
                <span>{uploading ? "Uploading..." : "Upload"}</span>
              </button>

              <button
                onClick={resetRecording}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
              >
                <HiRefresh className="w-4 h-4" />
                <span>New Recording</span>
              </button>
            </>
          )}
        </div>

        <div className="text-sm text-gray-600 text-center max-w-md">
          <p className="mb-1">Maximum recording time: 3 minutes</p>
          <p>
            Click "Start Recording" and select the screen/tab you want to record
          </p>
        </div>
      </div>

      {recordedBlob && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Recording Preview
          </h3>
          <VideoPlayer blob={recordedBlob} />
        </div>
      )}
    </div>
  );
};

export default ScreenRecorder;
