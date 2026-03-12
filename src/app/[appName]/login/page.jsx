"use client";
import React, { use, useEffect, useState } from 'react';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Loader from "@/components/Loader";

export default function UserLoginPage({ params}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [response, setResponse] = useState({ message: '', status: 0 });
  const [user, setUser] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [resendResponse, setResendResponse] = useState({ message: '', status: 0 });
  const [showResend, setShowResend] = useState(false);
  const path = usePathname();
  const appName = path.split('/')[1];
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    const checkAppExists = async () => {
        try {
            const res = await axios.post("/api/auth/check-app", { appName });
            if (!res.data.exists) {
                router.replace("/404");
            }
        } catch (error) {
            console.error("API Error:", error);
            router.replace("/404");
        } finally {
            setLoader(false);
        }
    };
    checkAppExists();
  }, [appName]);
  

  const onLogin = async (e) => {
    e.preventDefault();
    setShowResend(false);
    try {
      setLoading(true);
      const res = await toast.promise(
        axios.post('/api/user/login', {...user, appName: resolvedParams.appName }),
        {
          loading: "Logging in...",
          success: "User Logged in!",
          error: "Login failed!, Try again later",
        }
      );
      console.log("response: ",res);
      setResponse({ message: res.data.message, status: res.status });
      if(res.data.redirectAfterLogin === "/dashboard"){
        setTimeout(() => router.replace(`/${resolvedParams.appName}/profile`), 500);
      }else{
        setTimeout(() => router.replace(`${res.data.redirectAfterLogin}`), 500);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setResponse({ message: error.response.data.message, status: error.response.status });
        if (error.response.status === 401) {
          setShowResend(true);
        }
      } else {
        setResponse({ message: 'Network or server error. Please try again.', status: 500 });
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setSendLoading(true);
      const res = await axios.post('/api/auth/sendMail', { email: user.email, emailType: "USER_VERIFY", appName: resolvedParams.appName });
      setResendResponse({ message: res.data.message, status: res.status });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setResendResponse({ message: error.response.data.message, status: error.response.status });
        if (error.response.status === 400) {
          setShowResend(false);
          setResponse({ message: 'Already verified. You can now log in.', status: 200 });
        }
      } else {
        setResendResponse({ message: 'Network or server error. Please try again.', status: 500 });
      }
    } finally {
      setSendLoading(false);
    }
  };

  useEffect(() => {
    setShowResend(false);
    setResponse({ message: '', status: 0 });
    setResendResponse({ message: '', status: 0 });
  }, [user.email, user.password]);

  return (
    <div className="relative z-5 min-h-screen dark:bg-gray-900">
          {loader && (
            <div className="fixed inset-0 flex items-center dark:text-white justify-center bg-transparent z-5">
              <Loader />
            </div>
          )}
          {!loader && (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
              <div className="w-full max-w-md space-y-6">
                {/* Solid Header for App Name */}
                <div className=" sticky top-0 left-0 right-0 h-16 flex items-center justify-center text-2xl font-bold text-white dark:text-black bg-gray-900 dark:bg-white rounded-md shadow-md">
                  {appName}
                </div>
                {/* login Form */}
                <div className="w-full max-w-md p-6 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">Login Form</h2>
                  <Toaster />
                  <form onSubmit={onLogin} className="space-y-4">
                    <div>
                      {response.message && (
                        <p className={`text-center ${response.status === 200 ? 'text-green-600' : 'text-red-600'}`}>
                          {response.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring focus:ring-blue-400"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                      <input
                        type="password"
                        placeholder="Enter your password"
                        className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring focus:ring-blue-400"
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Login"}
                    </button>

                    {showResend && (
                      <div className="text-center mt-4">
                        <div className='flex justify-center gap-4 items-center'>
                          <p className="text-yellow-500">Haven't received a verification email?</p>
                          <button
                            type="button"
                            onClick={resendVerificationEmail}
                            className="mt-2 p-2 bg-green-600 text-white rounded-md hover:bg-green-800"
                            disabled={sendLoading}
                          >
                            {sendLoading ? "Sending..." : "Resend Email"}
                          </button>
                        </div>
                        {resendResponse.message && (
                          <p className={`mt-2 ${resendResponse.status === 200 ? 'text-green-600' : 'text-red-600'}`}>
                            {resendResponse.message}
                          </p>
                        )}
                      </div>
                    )}

                    {!showResend && (
                      <div className="text-center mt-4">
                        <a href={`/${resolvedParams.appName}/signup`} className="hover:text-blue-600">Visit Signup Page</a>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
    </div>
  );
}
