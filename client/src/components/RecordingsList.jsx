import {
  HiPlay,
  HiDownload,
  HiRefresh,
  HiClock,
  HiDocumentText,
  HiCollection,
  HiExclamation,
} from "react-icons/hi";

const RecordingsList = ({ recordings, loading, onRefresh, apiBaseUrl }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = async (recording) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/recordings/${recording.id}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = recording.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 absolute top-0"></div>
          </div>
          <span className="text-lg font-medium text-gray-600">
            Loading recordings...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HiCollection className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">
              Recordings ({recordings.length})
            </h3>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-200 shadow-sm border"
          >
            <HiRefresh className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {recordings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
              <HiDocumentText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No recordings yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Start recording to see your videos here! Your recordings will
              appear in this list once you create them.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recordings.map((recording, index) => (
              <div
                key={recording.id}
                className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        {recording.filename}
                      </h4>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center space-x-1">
                        <HiDocumentText className="w-4 h-4" />
                        <span>Size: {formatFileSize(recording.filesize)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HiClock className="w-4 h-4" />
                        <span>Created: {recording.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <button
                    onClick={() =>
                      window.open(
                        `${apiBaseUrl}/api/recordings/${recording.id}`,
                        "_blank"
                      )
                    }
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 transform hover:scale-105 shadow-sm"
                  >
                    <HiPlay className="w-4 h-4" />
                    <span>Play</span>
                  </button>

                  <button
                    onClick={() => handleDownload(recording)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-200 transform hover:scale-105 shadow-sm"
                  >
                    <HiDownload className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>

                <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                  <video
                    controls
                    className="w-full max-w-full h-auto"
                    preload="metadata"
                    style={{ maxHeight: "300px" }}
                  >
                    <source
                      src={`${apiBaseUrl}/api/recordings/${recording.id}`}
                      type="video/webm"
                    />
                    <div className="flex items-center justify-center p-8 text-gray-400">
                      <HiExclamation className="w-6 h-6 mr-2" />
                      Your browser does not support the video tag.
                    </div>
                  </video>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingsList;
