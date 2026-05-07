'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [otpStatusLoaded, setOtpStatusLoaded] = useState(false);

  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!email) {
      router.push('/auth/register');
    }
  }, [email, router]);

  // Fetch OTP status to get accurate timer
  useEffect(() => {
    if (!email || otpStatusLoaded) return;

    const fetchOtpStatus = async () => {
      try {
        const response = await fetch(`/api/auth/otp-status?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
          setTimeLeft(data.timeLeft);
          setCanResend(data.canResend);
        }
      } catch (error) {
        console.error('Failed to fetch OTP status:', error);
      } finally {
        setOtpStatusLoaded(true);
      }
    };

    fetchOtpStatus();
  }, [email, otpStatusLoaded]);

  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setMessage('New OTP sent to your email');
      setTimeLeft(120);
      setCanResend(false);
      setOtp(['', '', '', '']);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setIsVerified(true);
      setMessage('Email verified successfully!');
      
      // Redirect to home after successful verification
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setVerifying(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-status-success-50 via-brand-primary-50 to-neutral-0 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-status-success-200">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-status-success-500 to-status-success-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-status-success-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-status-success-300 rounded-full animate-ping animation-delay-200"></div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-status-success-700">Email Verified!</h1>
                <p className="text-lg text-neutral-600 font-medium">Welcome to Krishna Plastics</p>
                <p className="text-neutral-500">Your email has been successfully verified and your account is now active.</p>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-center gap-3 text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-status-success-500 rounded-full"></div>
                  <span>Verification Complete</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-status-success-500 rounded-full"></div>
                  <span>Account Activated</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-status-success-500 rounded-full"></div>
                  <span>Redirecting to Homepage...</span>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-status-success-50 rounded-full text-status-success-700 text-sm font-medium">
                  <CheckCircle2 size={16} />
                  Successfully Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary-50 via-neutral-0 to-brand-accent-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back button */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-brand-primary-600 hover:text-brand-primary-800 transition"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        <div className="space-y-6 border border-brand-primary-200 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md mx-auto mt-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary-500 to-brand-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-brand-primary-900 mb-2">Verify Email</h1>
            <p className="text-neutral-600">
              We've sent a 4-digit OTP to <strong>{email}</strong>
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              Enter the code below to verify your email address
            </p>
          </div>

          {/* OTP Input Fields */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Enter Verification Code
            </label>
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-xl font-bold border-2 border-brand-primary-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary-500 focus:border-brand-primary-500 bg-white shadow-sm transition-all duration-200"
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOtp}
            disabled={verifying || otp.join('').length !== 4}
            className="w-full bg-gradient-to-r from-brand-primary-600 to-brand-primary-500 text-white py-3 rounded-xl font-semibold hover:from-brand-primary-700 hover:to-brand-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {verifying ? 'Verifying...' : 'Verify Email'}
          </button>

          {/* Resend OTP */}
          <div className="text-center pt-2">
            <p className="text-sm text-neutral-600 mb-3">Didn't receive the OTP?</p>
            <button
              onClick={handleResendOtp}
              disabled={!canResend || loading}
              className="inline-flex items-center gap-2 text-sm text-brand-primary-600 hover:text-brand-primary-700 font-medium py-2 px-4 rounded-lg border border-brand-primary-200 hover:border-brand-primary-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-brand-primary-50 hover:bg-brand-primary-100"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Sending...' : canResend ? 'Resend OTP' : `Resend in ${formatTime(timeLeft)}`}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-status-danger-50 p-4 text-sm text-status-danger-700 border border-status-danger-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-status-danger-500 rounded-full"></div>
                {error}
              </div>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="rounded-lg bg-status-success-50 p-4 text-sm text-status-success-700 border border-status-success-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-status-success-500 rounded-full"></div>
                {message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
