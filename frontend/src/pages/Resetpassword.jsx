import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, X, Eye, EyeOff } from 'lucide-react';

const Resetpassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch,
  } = useForm();

  const [step, setStep] = useState('email'); // 'email', 'otp', or 'password'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const watchPassword = watch("password", "");

  // Calculate password strength
  React.useEffect(() => {
    const password = watchPassword;
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [watchPassword]);

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setServerError("");
    } else {
      setServerError(message);
      setSuccess("");
    }
  };

  const handleSendOTP = async (data) => {
    setIsLoading(true);
    setServerError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personal_email: data.email.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || "Failed to send OTP", "error");
        return;
      }

      setEmail(data.email.trim());
      setStep('otp');
      showToast("OTP sent successfully! Check your email inbox.", "success");
      reset();
    } catch (err) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      showToast("Please enter the OTP", "error");
      return;
    }

    setIsLoading(true);
    setServerError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personal_email: email,
          otp_code: otp.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || "Invalid OTP", "error");
        return;
      }

      setResetToken(result.reset_token);
      setStep('password');
      showToast("OTP verified successfully! Create your new password.", "success");
    } catch (err) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setServerError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personal_email: email
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || "Failed to resend OTP", "error");
        return;
      }

      showToast("OTP resent successfully! Check your email inbox.", "success");
    } catch (err) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToEmail = () => {
    setStep('email');
    setOtp('');
    setEmail('');
    setResetToken('');
    setServerError("");
    setSuccess("");
  };

  const handleUpdatePassword = async (data) => {
    if (!resetToken) {
      showToast("Invalid reset token. Please request a new OTP.", "error");
      return;
    }

    setIsLoading(true);
    setServerError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: data.password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || "Failed to update password", "error");
        return;
      }

      showToast("Password Updated Successfully");
      reset();
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen justify-center items-center bg-gray-50">
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden !py-0 !border-none shadow-lg">
          <CardContent className="!p-0">
            <form
              className="p-20 w-120 sm:w-140"
              onSubmit={handleSubmit(
                step === 'email' ? handleSendOTP : 
                step === 'otp' ? handleVerifyOTP : 
                handleUpdatePassword
              )}
              noValidate
            >
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold text-gray-900">AttendAI</h1>
                  <h2 className="text-xl font-semibold text-gray-900 mt-4">Reset Password</h2>
                  <p className="text-[#71717A] text-[14px] text-balance mt-2">
                    {step === 'email' 
                      ? "Enter your personal email to receive OTP"
                      : step === 'otp'
                      ? "Enter the OTP sent to your email"
                      : "Create a new password"
                    }
                  </p>
                </div>

                {/* Email Step */}
                {step === 'email' && (
                  <div className="grid gap-3">
                    <Label htmlFor="email">Recovery Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@gmail.com"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        })}
                        className="pl-10 pr-4 py-2"
                      />
                    </div>
                    {errors.email && (
                      <span className="text-red-500 text-xs">{errors.email.message}</span>
                    )}
                  </div>
                )}

                {/* OTP Step */}
                {step === 'otp' && (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <Input
                            key={index}
                            type="text"
                            maxLength={1}
                            className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-[#9886fe] focus:ring-[#9886fe] text-[#7c6cf8]"
                            value={otp[index] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 1) {
                                const newOtp = otp.split('');
                                newOtp[index] = value;
                                setOtp(newOtp.join(''));
                                
                                // Auto-focus to next input
                                if (value && index < 5) {
                                  const nextInput = e.target.parentElement.nextElementSibling?.querySelector('input');
                                  if (nextInput) nextInput.focus();
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              // Handle backspace
                              if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                const prevInput = e.target.parentElement.previousElementSibling?.querySelector('input');
                                if (prevInput) prevInput.focus();
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const pastedData = e.clipboardData.getData('text');
                              const digits = pastedData.replace(/\D/g, '').slice(0, 6);
                              
                              if (digits.length > 0) {
                                setOtp(digits.padEnd(6, ''));
                                
                                // Focus the next empty input or the last one
                                const nextIndex = Math.min(digits.length, 5);
                                const inputs = e.target.parentElement.querySelectorAll('input');
                                if (inputs[nextIndex]) {
                                  inputs[nextIndex].focus();
                                }
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    


                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? "Sending..." : "Resend OTP"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBackToEmail}
                        className="flex-1"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                    </div>
                  </div>
                )}

                {/* Password Step */}
                {step === 'password' && (
                  <>
                    <div className="grid gap-3">
                      <Label htmlFor="password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          {...register("password", {
                            required: "Password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters"
                            }
                          })}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <span className="text-red-500 text-xs">{errors.password.message}</span>
                      )}
                      
                      {/* Password Strength Indicator */}
                      {watchPassword && (
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded ${
                                  level <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-600">
                            Password strength: <span className="font-medium">{getStrengthText()}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) => {
                              if (value !== watchPassword) {
                                return "Passwords do not match";
                              }
                            }
                          })}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>
                      )}
                    </div>
                  </>
                )}

                {/* Action Button */}
                <Button
                  type="submit"
                  className="w-full !bg-[#9886fe] hover:!bg-[#7c6cf8]"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading 
                    ? (step === 'email' ? "Sending OTP..." : step === 'otp' ? "Verifying..." : "Updating Password...") 
                    : (step === 'email' ? "Send OTP" : step === 'otp' ? "Verify OTP" : "Update Password")
                  }
                </Button>

                {/* Error Messages */}
                {serverError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800 text-sm">{serverError}</span>
                  </div>
                )}

                {/* Success Messages */}
                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 text-sm">{success}</span>
                  </div>
                )}

                {/* Back to Login Link */}
                <div className="text-center text-sm">
                  <Link 
                    to="/login" 
                    className="text-[#9886fe] hover:text-[#7c6cf8] underline underline-offset-4"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resetpassword;