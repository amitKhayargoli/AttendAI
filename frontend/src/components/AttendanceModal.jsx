import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, User, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as faceapi from "face-api.js";

const AttendanceModal = ({ isOpen, onClose, subjectName = "Mathematics 101", classId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("initializing");
  const [attendanceState, setAttendanceState] = useState("detecting"); // "detecting", "success", "error"
  const [attendanceMessage, setAttendanceMessage] = useState("Loading Models");
  const [attendanceTimestamp, setAttendanceTimestamp] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [studentFaceDescriptor, setStudentFaceDescriptor] = useState(null);
  const [studentName, setStudentName] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  // Load models from /models folder
  const loadModels = async () => {
    try {
      setIsLoading(true);
      setDetectionStatus("Loading models");
      setAttendanceMessage("Loading Models");
      
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(`${MODEL_URL}/tiny_face_detector`),
        faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_URL}/face_landmark_68`),
        faceapi.nets.faceRecognitionNet.loadFromUri(`${MODEL_URL}/face_recognition`),
        faceapi.nets.faceExpressionNet.loadFromUri(`${MODEL_URL}/face_expression`),
      ]);
      
      setIsModelLoaded(true);
      setIsLoading(false);
      setDetectionStatus("Models loaded successfully. Launching camera");
      setAttendanceMessage("Starting Camera");
      console.log("✅ All models loaded");
      
      // Auto-start camera when models are loaded
      startCamera();
    } catch (err) {
      console.error("❌ Model loading error:", err);
      setError("Failed to load face recognition models");
      setIsLoading(false);
      setDetectionStatus("Model loading failed");
    }
  };

  // Fetch student's face descriptor from database
  const fetchStudentFaceDescriptor = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch('http://localhost:5000/api/student/face-descriptor-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.faceDescriptor) {
          setStudentFaceDescriptor(data.faceDescriptor);
          setStudentName(data.student.name);
          console.log('✅ Face descriptor loaded from database');
        } else {
          setError("No face descriptor found. Please register your face first.");
        }
      } else {
        setError("Failed to fetch face descriptor. Please try again.");
      }
    } catch (error) {
      console.error('Error fetching face descriptor:', error);
      setError("Failed to fetch face descriptor. Please try again.");
    }
  };

  // Load face descriptor when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStudentFaceDescriptor();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setDetectionStatus("Launching camera");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setDetectionStatus("Camera launched. Align your face with the camera.");
        setAttendanceMessage("Detecting Face");
        console.log("✅ Camera started successfully");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access webcam. Please allow camera permissions.");
      setDetectionStatus("Camera access failed");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setFaceDetected(false);
          setDetectionStatus("Camera stopped");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle video load and start detection
  const handleVideoLoad = () => {
    if (isModelLoaded && cameraActive) {
      detectFace();
    }
  };

  // Face detection loop
  useEffect(() => {
    if (isModelLoaded && cameraActive && videoRef.current) {
      detectFace();
    }
  }, [isModelLoaded, cameraActive]);

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !isModelLoaded) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Get the actual video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // Get the actual displayed video dimensions (220x220 for the circular display)
    const displaySize = {
      width: 220,
      height: 220,
    };

    // Set canvas size to match the displayed video size
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    // Match dimensions for face-api.js
    faceapi.matchDimensions(canvas, displaySize);
    
    console.log('Video dimensions:', videoWidth, 'x', videoHeight);
    console.log('Display dimensions:', displaySize.width, 'x', displaySize.height);

    const detect = async () => {
              try {
          // Ensure video is ready
          if (video.readyState < 2) {
            console.log('Video not ready yet');
            return;
          }
          
          const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

//         const rawDetection = await faceapi
//   .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
//   .withFaceLandmarks()
//   .withFaceDescriptor();

//   console.log("🧠 Detection confidence score:", rawDetection?.detection?.score);


// // ✅ Confidence check
// if (!rawDetection || rawDetection.detection.score < 0.1) {
//   setFaceDetected(false);
//   setDetectionStatus("Low confidence face");
//   setAttendanceMessage("Face not clear. Try again.");
//   return;
// }

// const detection = rawDetection;


        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (detection) {
          // Resize detection to match the displayed video size
          const resized = faceapi.resizeResults([detection], displaySize);
          faceapi.draw.drawDetections(canvas, resized);
          faceapi.draw.drawFaceLandmarks(canvas, resized);

          // Draw student name from database instead of localStorage
          const ctx = canvas.getContext("2d");
          
          // Use the student name from state (fetched from database)
          const displayName = studentName || 'Student';
          
          const detectionBox = resized[0].detection.box;
          
          // Set text style
          ctx.font = 'bold 16px Arial';
          ctx.fillStyle = '#00ff00';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          
          // Position text above the detection box
          const textX = detectionBox.x + detectionBox.width / 2;
          const textY = detectionBox.y - 10;
          
          // Draw text with stroke for better visibility
          ctx.strokeText(displayName, textX, textY);
          ctx.fillText(displayName, textX, textY);

          setFaceDetected(true);
          setDetectionStatus("Face detected");
          setAttendanceMessage(""); // Remove spinner when face is detected
          setError(null);
          
          // Don't auto-trigger attendance marking, let user control it
        } else {
          setFaceDetected(false);
          setDetectionStatus("No face detected");
          setAttendanceMessage("Detecting Face");
        }
      } catch (err) {
        console.error("Face detection error:", err);
        setDetectionStatus("Detection error");
      }

      if (cameraActive && isOpen) {
        requestAnimationFrame(detect);
      }
    };

    detect();
  };

  const handleMarkAttendance = async () => {
    setIsProcessing(true);
    setAttendanceState("detecting");
    setAttendanceMessage("Processing attendance...");
    
    if (!videoRef.current) {
      setAttendanceState("error");
      setAttendanceMessage("No video feed available.");
      setIsProcessing(false);
      return;
    }
    
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detection) {
        setAttendanceState("error");
        setAttendanceMessage("No face detected. Please position your face in the circle.");
        setIsProcessing(false);
        return;
      }
      
      // Compare with database face descriptor
      if (studentFaceDescriptor) {
        const distance = faceapi.euclideanDistance(
          detection.descriptor,
          new Float32Array(studentFaceDescriptor)
        );
        
        console.log('Face distance:', distance);
        console.log('Student name:', studentName);
        
        // Threshold for face matching (lower = stricter)
        if (distance < 0.6) {
          setAttendanceState("success");
          setAttendanceMessage(`Face verified! Welcome, ${studentName}.`);
          setAttendanceTimestamp(new Date().toLocaleString());
          
          // Mark attendance in database
          await markAttendanceInDatabase();
          
          // Auto-close modal after 3 seconds
          setTimeout(() => {
            onClose();
            setAttendanceState("detecting");
            setAttendanceMessage("");
            setIsProcessing(false);
          }, 3000);
        } else {
          setAttendanceState("error");
          setAttendanceMessage("Face not recognized. Please try again.");
          setIsProcessing(false);
        }
      } else {
        setAttendanceState("error");
        setAttendanceMessage("No face descriptor found. Please register your face first.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Face matching error:", error);
      setAttendanceState("error");
      setAttendanceMessage("Face matching failed. Try Again.");
      setIsProcessing(false);
    }
  };

  // Mark attendance in database
  const markAttendanceInDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Log the data being sent for debugging
      const attendanceData = {
        classId: classId,
        date: new Date().toISOString().split('T')[0],
        status: 'present'
      };
      
      console.log('Sending attendance data:', attendanceData);
      
      const response = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendanceData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Attendance marked successfully:', result);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to mark attendance:', errorData);
        throw new Error(errorData.error || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  };

  const handleTryAgain = () => {
    setAttendanceState("detecting");
    setAttendanceMessage("Detecting Face");
    setIsProcessing(false);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-lg border-0">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Mark Attendance
              </h2>
              <p className="text-sm text-gray-600">
                Align your face with the camera
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Camera Preview Area */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              {/* Camera Circle with Pulsating Animation */}
              <div className={`w-56 h-56 rounded-full border-2 border-purple-200 bg-gray-50 flex items-center justify-center relative overflow-hidden ${
                isLoading || !cameraActive ? 'animate-pulse-scale' : ''
              }`}>
                {isLoading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <User className="h-12 w-12 text-purple-400" />
                    <p className="text-sm text-gray-500">{detectionStatus}</p>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center relative">
                    {/* Video feed */}
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      width="220"
                      height="220"
                      onLoadedData={handleVideoLoad}
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                        width: '220px',
                        height: '220px',
                        display: cameraActive ? 'block' : 'none'
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '220px',
                        height: '220px',
                        borderRadius: '50%',
                        display: cameraActive ? 'block' : 'none',
                        pointerEvents: 'none',
                        zIndex: 10
                      }}
                    />
                    
                    {/* Face detection indicator border */}
                    {cameraActive && (
                      <div className={`absolute inset-0 rounded-full border-4 animate-pulse ${
                        faceDetected 
                          ? 'border-green-400' 
                          : 'border-red-400'
                      }`}>
                      </div>
                    )}
                    
                    {/* Show placeholder when camera is not active */}
                    {!cameraActive && (
                      <div className="flex flex-col items-center space-y-2">
                        <User className="h-12 w-12 text-purple-400" />
                        <p className="text-sm text-gray-500">{detectionStatus}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Face detection badge - positioned outside the camera circle */}
              {cameraActive && (
                <div className="absolute -top-2 -right-2 z-30 animate-pulse">        
                  <Badge className={`text-white text-xs ${
                    faceDetected 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}>
                    {faceDetected ? 'Face Detected' : 'No Face Detected'}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          <div className="text-center mb-4 min-h-[50px] flex flex-col gap-1">
            {attendanceState === "detecting" && attendanceMessage && (
              <div className="flex items-center justify-center gap-2 text-yellow-600">
                <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">{attendanceMessage}</span>
              </div>
            )}

            {attendanceState === "success" && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{attendanceMessage}</span>
              </div>
            )}

            {attendanceState === "error" && (
              <div className="flex items-center justify-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{attendanceMessage}</span>
              </div>
            )}
          </div>

          {/* Attendance Details */}
          {attendanceState === "success" && attendanceTimestamp && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {subjectName}
              </div>
              <div className="text-sm text-gray-600">
                {attendanceTimestamp}
              </div>
            </div>
          )}

                               {/* Action Buttons - Fixed height to prevent UI glitches */}
          <div className="text-center min-h-[50px] flex items-center justify-center">
            {attendanceState === "detecting" && faceDetected && cameraActive && (
              <Button
                onClick={() => handleMarkAttendance(null)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                disabled={!cameraActive || !faceDetected}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            )}
            
            {attendanceState === "error" && (
              <Button
                onClick={handleTryAgain}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-center space-x-4 mt-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isLoading ? 'bg-yellow-400' : isModelLoaded ? 'bg-green-400' : 'bg-gray-400'
              }`}></div>
              <span className="text-xs text-gray-500">
                {isLoading ? 'Loading Models' : isModelLoaded ? 'Models Ready' : 'Models Loading'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                cameraActive ? 'bg-green-400' : 'bg-gray-400'
              }`}></div>
              <span className="text-xs text-gray-500">
                {cameraActive ? 'Camera Active' : 'Camera Inactive'}
              </span>
            </div>
            {faceDetected && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs text-gray-500">Face Detected</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Custom CSS for scale pulse animation */}
      <style jsx>{`
        @keyframes pulse-scale {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AttendanceModal;
