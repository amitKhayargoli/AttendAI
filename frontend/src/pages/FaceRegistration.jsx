import React, { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import StudentSidebar from "./StudentSidebar";
import AddFaceModal from "./AddFaceModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Shield, Camera, CheckCircle } from 'lucide-react';

const FaceRegistration = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if face is already registered
  useEffect(() => {
    checkFaceRegistration();
  }, []);

  const checkFaceRegistration = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/student/face-descriptor', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFaceRegistered(data.hasFaceDescriptor);
      }
    } catch (error) {
      console.error('Error checking face registration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFaceAdded = () => {
    setFaceRegistered(true);
    console.log('Face registered successfully');
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen">
          <StudentSidebar />
          <div className="flex-1 overflow-auto w-full h-full flex justify-center">
            <div className="p-8">
              <div className="max-w-2xl mx-auto">
                <Card className="bg-white rounded-2xl shadow-lg border-0">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="h-10 w-10 text-purple-600" />
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Checking Face Registration...
                      </h2>
                      <p className="text-gray-600">Please wait while we check your registration status.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <StudentSidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto w-full h-full flex justify-center">
          <div className="p-8">
            {/* Content */}
            <div className="max-w-2xl mx-auto">
              {!faceRegistered ? (
                <Card className="bg-white rounded-2xl shadow-lg border-0">
                  <CardContent className="p-8">
                    <div className="text-center">
                      {/* Icon */}
                      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="h-10 w-10 text-purple-600" />
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Register Your Face
                      </h2>

                      {/* Description */}
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Add your face to enable secure attendance tracking. This will allow you to mark attendance automatically using facial recognition.
                      </p>

                      {/* Benefits */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="flex flex-col items-center text-center p-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                            <Shield className="h-6 w-6 text-blue-600" />
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">Secure</h3>
                          <p className="text-sm text-gray-500">Your data is encrypted and secure</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <Camera className="h-6 w-6 text-green-600" />
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">Fast</h3>
                          <p className="text-sm text-gray-500">Quick and easy registration process</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle className="h-6 w-6 text-purple-600" />
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">Reliable</h3>
                          <p className="text-sm text-gray-500">Accurate facial recognition technology</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={handleOpenModal}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium text-base"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Start Face Registration
                      </Button>

                      {/* Additional Info */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Position your face within the circle</li>
                          <li>• Ensure good lighting conditions</li>
                          <li>• Look directly at the camera</li>
                          <li>• Stay still during the process</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white rounded-2xl shadow-lg border-0">
                  <CardContent className="p-8">
                    <div className="text-center">
                      {/* Success Icon */}
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>

                      {/* Success Title */}
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Face Registration Complete!
                      </h2>

                      {/* Success Description */}
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Your face has been successfully registered. You can now use facial recognition for attendance tracking.
                      </p>

                      {/* Next Steps */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-green-900 mb-2">What's next?</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Visit your classes page to mark attendance</li>
                          <li>• Your face will be used for automatic recognition</li>
                          <li>• You can update your face data anytime</li>
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={() => setFaceRegistered(false)}
                          variant="outline"
                          className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          Register Again
                        </Button>
                        <Button
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Go to Classes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Face Registration Modal */}
      <AddFaceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFaceAdded={handleFaceAdded}
      />
    </SidebarProvider>
  );
};

export default FaceRegistration; 