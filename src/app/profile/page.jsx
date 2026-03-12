'use client';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import { useEffect, useState, use } from 'react';
import Loader from "@/components/Loader";

export default function ProfilePage({ params }) {
  const router = useRouter();
  const [response, setResponse] = useState({ status: 999, message: "" });
  const [data, setData] = useState("Nothing");
  const [loading, setLoading] = useState(true);

  const getUserDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/dev/profile');
      setData(res.data.data);
    } catch (error) {
      if (error.response?.status === 400) {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push(`/login`);
      } else {
        console.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await axios.post('/api/dev/logout');
      router.push(`/login`);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    try {
      if (!data) {
        setResponse({ status: 400, message: "Invalid user ID" });
        return;
      }
      setLoading(true);
      const res = await axios.post("/api/dev/delete", { id: data._id });
      setResponse({ message: res.data.message, status: res.status });
      if (res.status === 200) {
        setTimeout(() => router.push(`/login`), 500);
      }
    } catch (error) {
      console.error("Unexpected Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        setResponse({
          message: error.response.data.error || "An error occurred. Please try again.",
          status: error.response.status,
        });
      } else {
        setResponse({ message: "Server error", status: 500 });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  const dashboard = () => {
    router.push(`/dashboard`);
  };

  return (
    <div className="relative z-5 min-h-screen dark:bg-gray-900">
      {loading && (
        <div className="fixed inset-0 flex items-center dark:text-white justify-center bg-transparent z-5">
          <Loader />
        </div>
      )}
      {!loading && (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-md w-full text-center">
            {/* Heading */}
            <h1 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-400">Developer Profile</h1>

            {/* Response Message */}
            {response.message && (
              <p
                className={`mb-4 font-semibold ${
                  response.status === 200 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {response.message}
              </p>
            )}

            {/* User Details */}
            <div className="space-y-4 text-left mb-6">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">ID:</span>
                <span className="text-gray-600 dark:text-gray-300">{data._id || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Username:</span>
                <span className="text-gray-600 dark:text-gray-300">{data.username || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Email:</span>
                <span className="text-gray-600 dark:text-gray-300">{data.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Email Verified:</span>
                <span className="text-gray-600 dark:text-gray-300">{data.isVerified ? "Yes" : "No"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition"
              >
                Logout
              </button>
              <button
                onClick={getUserDetails}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition"
              >
                Refresh
              </button>
              <button
                onClick={deleteUser}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-md transition"
              >
                Delete Account
              </button>
              <button
                onClick={dashboard}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
