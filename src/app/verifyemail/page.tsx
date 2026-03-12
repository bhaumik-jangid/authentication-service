"use client";
import React, {useEffect, useState} from 'react'
import axios from 'axios';
import Link from 'next/link';
import "./style.css";

export default function Page() {

    const [token, setToken] = useState("");
    const [type, setType] = useState(-1);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
    
        const verifyemail = async () => {
            try {
                await axios.post('/api/auth/verifyMail', {token, type})
                setVerified(true)
                setStatusMessage("Email Verified");
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    // const errorMessage = error.response?.data?.message || "An error occurred.";
                    setError(true)
    
                    if (error.response?.status == 401) {
                        setStatusMessage("Verification link has expired. Please request a new one.");
                    } else if (error.response?.status == 400) {
                        setStatusMessage("Invalid verification link. Please check your email or request a new one.");
                    } else {
                        setStatusMessage("An unexpected error occurred. Please try again later.");
                    }
                    console.log(error.response?.data);
                } else {
                    setStatusMessage("An unexpected error occurred. Please try again later.");
                    console.log(error);
                }
            }
        }

        if (token) {
            verifyemail();
        }
    }, [token]);

    useEffect(() => {
        const urlToken = new URLSearchParams(window.location.search).get("token");
        const urlType = new URLSearchParams(window.location.search).get("type");
        if (urlToken) {
            setToken(urlToken);
        }
        if (urlType) {
            setType(parseInt(urlType));
        }
    }, []);

    // Trigger email verification if token is present

    return (
        <>
            <div className="verify-email-page bg-white dark:bg-gray-900 dark:text-white mt-16">
                <div className="header">
                    <h1>Verify Your Email</h1>
                    <p>Please complete the email verification to proceed.</p>
                </div>

                <main className="content">
                    {!verified && !error && (
                        <div className="status waiting">
                            <h2>Waiting for email verification...</h2>
                            <p>Check your email inbox for a verification link.</p>
                        </div>
                    )}
                    {verified && (
                        <div className="status success">
                            <h2>{statusMessage}</h2>
                        </div>
                    )}
                    {error && (
                        <div className="status error">
                            <h2>{statusMessage}</h2>
                            <p>Please try again or contact support if the issue persists.</p>
                        </div>
                    )}
                </main>

                <footer className="footer">
                    <p>&copy; 2024 SecureSign. All rights reserved.</p>
                </footer>
            </div>
        </>
  )
}