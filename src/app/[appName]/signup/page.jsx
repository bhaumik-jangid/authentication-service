"use client";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/Loader";


export default function SignupPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loader, setLoader] = useState(true);
  

  const path = usePathname();
  const appName = path.split('/')[1];

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

  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const onSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Signing up:", user);
      const res = await toast.promise(
        axios.post("/api/user/signup", { ...user, appName: resolvedParams.appName }),
        {
          loading: "Signing up...",
          success: "Account created successfully!",
          error: "Something went wrong. Please try again.",
        }
      );

      setTimeout(() => router.push(`/${resolvedParams.appName}/login`), 500);
    } catch (error) {
      console.error("Signup failed:", error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.error;

        // Show specific error message
        if (errorMessage.includes("Username is already taken")) {
          toast.error("This username is not available.");
        } else if (errorMessage.includes("Email is already in use")) {
          toast.error("This email is already in use in this app.");
        } else {
          toast.error(errorMessage || "An unexpected error occurred.");
        }
      } else {
        toast.error("API or Server error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-5 min-h-[90vh] dark:bg-gray-900">
      {loader && (
        <div className="fixed inset-0 flex items-center dark:text-white justify-center bg-transparent z-5">
          <Loader />
        </div>
      )}
      {!loader && (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
          <div className="w-full max-w-md space-y-6">
            {/* Solid Header for App Name */}
            <div className=" sticky top-0 left-0 right-0 h-16 flex items-center justify-center text-2xl font-bold text-white dark:text-black bg-gray-900 dark:bg-white rounded-md shadow-md">
              {appName}
            </div>
            {/* Signup Form */}
            <div className="p-6 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
                Sign Up
              </h2>
              <Toaster />
              <form onSubmit={onSignup} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    required
                    className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring focus:ring-blue-400"
                  />
                </div>
  
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    required
                    className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring focus:ring-blue-400"
                  />
                </div>
  
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    required
                    className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring focus:ring-blue-400"
                  />
                </div>
  
                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Register"}
                </button>
                <div className="text-center mt-4">
                  <a href={`/${appName}/login`} className="hover:text-blue-600">
                    Visit login Page
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}
