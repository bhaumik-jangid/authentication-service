"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

function Page() {
  const [user, setUser] = useState({
    email: '',
    password: '',
    username: ''
  })
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({
    msg: '',
    status: 404
  });

  const onSignup = async (e) => {
    e.preventDefault();
    setResponse({msg: '', status: 404});
    try {
      setLoading(true);
      const res = await toast.promise(
        axios.post("/api/dev/signup", user),
        {
          loading:  "Signing up...",
          success: () => (
            <div className="p-4">
              <p className="font-bold">Account Created Successfully!</p>
              <p className="text-sm">Please check your email for verification.</p>
            </div>
          )
        }
      );

      setResponse({msg: res.data.message, status: res.status});

    } catch (error) {
      console.log('signup failed', error);
      if (axios.isAxiosError(error) && error.response) {
        // Extract error message from API response
        setResponse({msg: error.response.data.message, status: error.response.status});
      } else {
        // Handle unexpected errors
        setResponse({msg: "API or Server error", status: 500});
        console.error('An unexpected error happened during signup', error);
      }
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
      console.log(response)
    }
  }

  useEffect(() => {
    setResponse({msg: '', status: 404})
  }, [user])
  

  return (
      <div className="form-container flex justify-center items-center flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <Toaster />
        <form onSubmit={onSignup} className="form bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="form-header text-center font-bold text-3xl text-gray-900 dark:text-white mb-6">
            <h1>Developer Signup</h1>
          </div>
          <div className="form-group mb-4">
            <label htmlFor="username" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter your username"
              className="form-input w-full p-2 text-lg border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 focus:border-blue-500 focus:outline-none focus:bg-white dark:focus:bg-gray-800"
              value={user.username}
              onChange={(e) => setUser({...user, username: e.target.value})}
              required
            />
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
            <label htmlFor="password" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Create Password</label>
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
              {loading ? 'Loading...' : 'Register'}
            </button>
          </div>

          <div className="center-align text-center mt-4">
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Visit login page</Link>
          </div>
        </form>
      </div>

  );
}

export default Page;
