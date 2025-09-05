import { useState, useEffect } from "react";
import ScreenRecorder from "./components/ScreenRecorder";
import RecordingsList from "./components/RecordingsList";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { HiVideoCamera, HiCollection } from "react-icons/hi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/recordings`);
      setRecordings(response.data);
    } catch (err) {
      console.error("Error fetching recordings:", err);
      toast.error("Failed to load recordings");
    } finally {
      setLoading(false);
    }
  };

  const uploadRecording = async (blob, filename) => {
    const uploadPromise = new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append("video", blob, filename);

        const response = await axios.post(
          `${API_BASE_URL}/api/recordings`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        await fetchRecordings();
        resolve(response.data);
      } catch (err) {
        console.error("Upload error:", err);
        reject(new Error("Failed to upload recording"));
      }
    });

    toast.promise(uploadPromise, {
      loading: "Uploading recording...",
      success: "Recording uploaded successfully!",
      error: "Failed to upload recording",
    });

    return uploadPromise;
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />

      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-10">
          <div className="flex justify-center items-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
              <HiVideoCamera className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Screen Recorder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Capture, record, and manage your screen recordings with professional
            quality and ease
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <HiVideoCamera className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Record New Video
              </h2>
            </div>
            <ScreenRecorder onUpload={uploadRecording} onError={toast.error} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <HiCollection className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Your Recordings
              </h2>
            </div>
            <RecordingsList
              recordings={recordings}
              loading={loading}
              onRefresh={fetchRecordings}
              apiBaseUrl={API_BASE_URL}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
