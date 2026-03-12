"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function Page() {
  const router = useRouter();
  const [response, setResponse] = useState({
    message: '',
    status: 0,
  });
  const [user, setUser] = useState({
    email: '',
    password: '',
    isDev: true,
  })
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [resendResponse, setResendResponse] = useState({
    message: '',
    status: 0,
  });;
  const [showResend, setShowResend] = useState(false);

  const onLogin = async (e) => {
    e.preventDefault();
    setShowResend(false);
    try {
      setLoading(true);
      const res = await toast.promise(
        axios.post('/api/dev/login', user),
        {
          loading: "Logging up...",
          success: "User Logged in!",
        }
      );
      setResponse({ message: res.data.message, status: res.status });
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Extract error message from API response
        setResponse({ message: error.response.data.message, status: error.response.status });
        if (error.response.status === 401) {
          setShowResend(true);
        }
      } else {
        // Handle unexpected errors
        setResponse({ message: 'An unexpected error occurred. Please check your network and try again.', status: 500 });
      }
    } finally {
      setLoading(false);
      console.log(response.status);
    }
  }

  const resendVerificationEmail = async () => {
    try {
      setSendLoading(true);

      const res = await axios.post('/api/auth/sendMail', { email: user.email, emailType: "DEV_VERIFY" });
      setResendResponse({ message: res.data.message, status: res.status });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Extract error message from API response
        setResendResponse({ message: error.response.data.message, status: error.response.status });
        if (error.response.status === 400) {
          setShowResend(false);
          setResponse({ message: 'Already verified, You can now login', status: 200 });
        }
      } else {
        // Handle unexpected errors
        setResendResponse({ message: 'An unexpected error occurred. Please check your network and try again.', status: 500 });
      }
    } finally {
      setSendLoading(false);
    }
  }

  useEffect(() => {
    setShowResend(false);
    setResponse({ message: '', status: 0 });
    setResendResponse({ message: '', status: 0 });
  }, [user.email, user.password]);

  useEffect(() => {
    if(sendLoading){
      setResendResponse({ message: '', status: 0 });
    }
  }, [sendLoading]);

  return (
      <div className="form-container flex justify-center items-center flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <Toaster />
        <form onSubmit={onLogin} className="form bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="form-header text-center mb-6">
            <h1 className="font-bold text-3xl text-gray-900 dark:text-white">Developer Login</h1>
          </div>
          <div className='flex flex-col items-center'>
            {(response.status === 401 || response.status === 200) && (
              <p className="response success text-green-600 dark:text-green-400">{response.message}</p>
            )}
            {(response.status === 400 || response.status === 500) && (
              <p className="response error text-red-600 dark:text-red-400">{response.message}</p>
            )}
          </div>
          <div className="form-group mb-4">
            <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              className="form-input w-full p-2 text-lg border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 focus:border-blue-500 focus:outline-none focus:bg-white dark:focus:bg-gray-800"
              value={user.email}
              onChange={(e) => setUser({...user, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="password" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              className="form-input w-full p-2 text-lg border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 focus:border-blue-500 focus:outline-none focus:bg-white dark:focus:bg-gray-800"
              value={user.password}
              onChange={(e) => setUser({...user, password: e.target.value})}
              required
            />
          </div>
          <div className="form-footer">
            <button type="submit" className="submit-button w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-lg transition-all duration-300 disabled:opacity-50" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>
          {showResend && (
            <>
              <div className="resend-container flex justify-center items-center mt-4">
                <p className="response text-gray-700 dark:text-gray-300">Haven't received a verification email? Send a new one.</p>
                <button
                  type="button"
                  className="resend-button w-1/2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-lg transition-all duration-300 disabled:opacity-50"
                  onClick={resendVerificationEmail}
                  disabled={sendLoading}
                >
                  {sendLoading ? "Sending..." : "Send"}
                </button>
              </div>
              <div>
                {(resendResponse.status === 401 || resendResponse.status === 200) && (
                  <p className="response success text-green-600 dark:text-green-400">{resendResponse.message}</p>
                )}
                {(resendResponse.status === 400 || resendResponse.status === 500) && (
                  <p className="response error text-red-600 dark:text-red-400">{resendResponse.message}</p>
                )}
              </div>
            </>
          )}
          {!showResend && (
            <div className="form-footer padding text-center mt-4">
              <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">Visit signup page</Link>
            </div>
          )}
        </form>
      </div>

  );
}
