import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AddFaceModal from "./AddFaceModal";

export default function Login() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log(API_BASE_URL);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: e.target.email.value,
          password: e.target.password.value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('Login successful');
        localStorage.setItem('token', data.token);
        setUserData(data.user);

        console.log(data);

        // Check if user is a student and if they need face registration
        if (data.user.userType === 'student') {
          // Check if face is already registered (you can add this logic based on your backend)
          const hasFaceRegistered = localStorage.getItem('faceRegistered');
          
          if (!hasFaceRegistered) {
            // Show face registration modal for first-time students
            setShowFaceModal(true);
          } else {
            // Navigate to student dashboard if face is already registered
            navigate('/student-dashboard');
          }
        } else if (data.user.userType === 'admin') {
          navigate('/admin');
        } else if (data.user.userType === 'teacher') {
          navigate('/class-timeline');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceAdded = () => {
    // Mark face as registered
    localStorage.setItem('faceRegistered', 'true');
    setShowFaceModal(false);
    
    // Navigate to student dashboard after face registration
    navigate('/student-dashboard');
  };

  const handleCloseFaceModal = () => {
    setShowFaceModal(false);
    // Navigate to student dashboard even if they skip face registration
    navigate('/student-dashboard');
  };

  return (  
    <div className="flex w-full h-screen justify-center items-center">
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden !py-0 !border-none">
          <CardContent className="grid !p-0 md:grid-cols-2">
            <form className="p-20 md:p-30 w-120 sm:w-140" onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">AttendAI</h1>
                  <p className="text-[#71717A] text-[14px] text-balance">
                    Effortless attendance with just a look
                  </p>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full !bg-[#9886fe]" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
                {error && (
                  <div className="text-red-500 text-center text-sm">{error}</div>
                )}
                {success && (
                  <div className="text-green-600 text-center text-sm">{success}</div>
                )}

                <Link
                  to="/reset-password"
                  className="text-center text-sm underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </Link>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Face Registration Modal */}
      <AddFaceModal
        isOpen={showFaceModal}
        onClose={handleCloseFaceModal}
        onFaceAdded={handleFaceAdded}
      />
    </div>
  );
}
