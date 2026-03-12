import nodemailer from 'nodemailer';

interface EmailOptions {
    username: string;
    email: string;
    emailType: "USER_VERIFY" | "USER_CONFIRM" | "DEV_VERIFY" | "DEV_CONFIRM" | "APP_CREATED" | "APP_DELETED" | "USER_DELETED" | "DEV_DELETED";
    userID: string;
    token?: string;
    appID?: string; 
    appName?: string;
}

export const sendEmail = async ({username, email, emailType, token,  appID, appName  }: EmailOptions) => {
    try {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASS
            }
        });

        const mailOptions = {
            from: "support@secure-sign-auth.com", 
            to: email,
            subject: (emailType === "USER_VERIFY")? "Verify Your Email" : 
                     (emailType === "USER_CONFIRM")? "Email Confirmation" :
                     (emailType === "USER_DELETED")? "Account Deleted" :
                     (emailType === "DEV_VERIFY")? "Developer Email Verification" :
                     (emailType === "DEV_CONFIRM")? "Developer Email Confirmation" :
                     (emailType === "DEV_DELETED")? "Developer Accpunt Deleted" :
                     (emailType === "APP_CREATED")? "Your App Has Been Created" :
                     (emailType === "APP_DELETED")? "Your App Has Been Deleted" : 
                     "Error",
            text: "Hello world?",
            html: (() => {
                switch (emailType) {
                    case "USER_VERIFY":
                        return `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        color: #333333;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .email-container {
                                        background-color: #ffffff;
                                        max-width: 600px;
                                        margin: 20px auto;
                                        padding: 20px;
                                        border-radius: 8px;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .header {
                                        text-align: center;
                                        background-color: #007BFF;
                                        color: #ffffff;
                                        padding: 10px 0;
                                        border-radius: 8px 8px 0 0;
                                    }
                                    .header h1 {
                                        margin: 0;
                                        font-size: 24px;
                                    }
                                    .content {
                                        padding: 20px;
                                        line-height: 1.6;
                                    }
                                    .cta-button {
                                        display: inline-block;
                                        background-color: #007BFF;
                                        color: #ffffff;
                                        padding: 10px 20px;
                                        text-decoration: none;
                                        border-radius: 5px;
                                        font-weight: bold;
                                        margin-top: 20px;
                                    }
                                    .cta-button:hover {
                                        background-color: #0056b3;
                                    }
                                    .footer {
                                        text-align: center;
                                        margin-top: 20px;
                                        font-size: 12px;
                                        color: #777777;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="email-container">
                                    <div class="header">
                                        <h1>Verify Your Email</h1>
                                    </div>
                                    <div class="content">
                                        <p>Hello, ${username}</p>
                                        <p>Dear user, Thank you for signing up in ${appName}! To complete your registration, please verify your email address by clicking the button below:</p>
                                        <p style="text-align: center;">
                                            <a href="${process.env.DOMAIN}/verifyemail?token=${token}&type=0" class="cta-button">Verify Email</a>
                                        </p>
                                        <p>If the button doesn't work, copy and paste the following URL into your browser:</p>
                                        <p><a href="${process.env.DOMAIN}/verifyemail?token=${token}&type=0">${process.env.DOMAIN}/verifyemail?token=${token}&type=0</a></p>
                                    </div>
                                    <div class="footer">
                                        <p>If you did not request this email, you can safely ignore it.</p>
                                        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                            `;
                    case "USER_CONFIRM":
                        return `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        color: #333333;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .email-container {
                                        background-color: #ffffff;
                                        max-width: 600px;
                                        margin: 20px auto;
                                        padding: 20px;
                                        border-radius: 8px;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .header {
                                        text-align: center;
                                        background-color: #4caf50; /* Fixed: Changed ##4caf5 to #4caf50 */
                                        color: #ffffff;
                                        padding: 10px 0;
                                        border-radius: 8px 8px 0 0;
                                    }
                                    .header h1 {
                                        margin: 0;
                                        font-size: 24px;
                                    }
                                    .content {
                                        padding: 20px;
                                        line-height: 1.6;
                                    }
                                    .cta-button {
                                        display: inline-block;
                                        background-color: #007BFF;
                                        color: #ffffff;
                                        padding: 10px 20px;
                                        text-decoration: none;
                                        border-radius: 5px;
                                        font-weight: bold;
                                        margin-top: 20px;
                                    }
                                    .cta-button:hover {
                                        background-color: #0056b3;
                                    }
                                    .footer {
                                        text-align: center;
                                        margin-top: 20px;
                                        font-size: 12px;
                                        color: #777777;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="email-container">
                                    <div class="header">
                                        <h1>Email Successfully Verified</h1>
                                    </div>
                                    <div class="content">
                                        <p>Hello, ${username}</p>
                                        <p>Congratulations user! Your email address has been successfully verified.</p>
                                        <p>You can now enjoy the full features of our platform.</p>
                                    </div>
                                    <div class="footer">
                                        <p>If you did not request this email, you can safely ignore it.</p>
                                        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            `;
                    case "USER_DELETED": 
                        return `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        color: #333333;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .email-container {
                                        background-color: #ffffff;
                                        max-width: 600px;
                                        margin: 20px auto;
                                        padding: 20px;
                                        border-radius: 8px;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .header {
                                        text-align: center;
                                        background-color: #dc3545; /* Red color for account deletion */
                                        color: #ffffff;
                                        padding: 10px 0;
                                        border-radius: 8px 8px 0 0;
                                    }
                                    .header h1 {
                                        margin: 0;
                                        font-size: 24px;
                                    }
                                    .content {
                                        padding: 20px;
                                        line-height: 1.6;
                                    }
                                    .footer {
                                        text-align: center;
                                        margin-top: 20px;
                                        font-size: 12px;
                                        color: #777777;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="email-container">
                                    <div class="header">
                                        <h1>Account Deleted</h1>
                                    </div>
                                    <div class="content">
                                        <p>Hello, ${username}</p>
                                        <p>We are writing to inform you that your account associated with **${appName}** application has been permanently deleted.</p>
                                        <p>If this was a mistake or you wish to regain access, please contact our support team immediately.</p>
                                        <p>If you did not request this deletion, please reach out to us as soon as possible.</p>
                                    </div>
                                    <div class="footer">
                                        <p>If you have any questions, feel free to contact our support team.</p>
                                        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `;
                    case "DEV_VERIFY":
                        return `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        color: #333333;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .email-container {
                                        background-color: #ffffff;
                                        max-width: 600px;
                                        margin: 20px auto;
                                        padding: 20px;
                                        border-radius: 8px;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .header {
                                        text-align: center;
                                        background-color: #4169e1;
                                        color: #ffffff;
                                        padding: 10px 0;
                                        border-radius: 8px 8px 0 0;
                                    }
                                    .header h1 {
                                        margin: 0;
                                        font-size: 24px;
                                    }
                                    .content {
                                        padding: 20px;
                                        line-height: 1.6;
                                    }
                                    .cta-button {
                                        display: inline-block;
                                        background-color: #007BFF;
                                        color: #ffffff;
                                        padding: 10px 20px;
                                        text-decoration: none;
                                        border-radius: 5px;
                                        font-weight: bold;
                                        margin-top: 20px;
                                    }
                                    .cta-button:hover {
                                        background-color: #0056b3;
                                    }
                                    .footer {
                                        text-align: center;
                                        margin-top: 20px;
                                        font-size: 12px;
                                        color: #777777;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="email-container">
                                    <div class="header">
                                        <h1>Verify Your Email</h1>
                                    </div>
                                    <div class="content">
                                        <p>Hello, ${username}</p>
                                        <p>Dear Developer, Thank you for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
                                        <p style="text-align: center;">
                                            <a href="${process.env.DOMAIN}/verifyemail?token=${token}&type=1" class="cta-button">Verify Email</a>
                                        </p>
                                        <p>If the button doesn't work, copy and paste the following URL into your browser:</p>
                                        <p><a href="${process.env.DOMAIN}/verifyemail?token=${token}&type=1">${process.env.DOMAIN}/verifyemail?token=${token}&type=1</a></p>
                                    </div>
                                    <div class="footer">
                                        <p>If you did not request this email, you can safely ignore it.</p>
                                        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                            `;
                    case "DEV_CONFIRM":
                        return `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        color: #333333;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .email-container {
                                        background-color: #ffffff;
                                        max-width: 600px;
                                        margin: 20px auto;
                                        padding: 20px;
                                        border-radius: 8px;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .header {
                                        text-align: center;
                                        background-color: #4caf50; /* Fixed: Changed ##4caf5 to #4caf50 */
                                        color: #ffffff;
                                        padding: 10px 0;
                                        border-radius: 8px 8px 0 0;
                                    }
                                    .header h1 {
                                        margin: 0;
                                        font-size: 24px;
                                    }
                                    .content {
                                        padding: 20px;
                                        line-height: 1.6;
                                    }
                                    .cta-button {
                                        display: inline-block;
                                        background-color: #007BFF;
                                        color: #ffffff;
                                        padding: 10px 20px;
                                        text-decoration: none;
                                        border-radius: 5px;
                                        font-weight: bold;
                                        margin-top: 20px;
                                    }
                                    .cta-button:hover {
                                        background-color: #0056b3;
                                    }
                                    .footer {
                                        text-align: center;
                                        margin-top: 20px;
                                        font-size: 12px;
                                        color: #777777;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="email-container">
                                    <div class="header" style="background-color: #2196F3;">
                                        <h1>Email Successfully Verified</h1>
                                    </div>
                                    <div class="content">
                                        <p>Hello, ${username}</p>
                                        <p>Congratulations developer! Your email address has been successfully verified.</p>
                                        <p>You can now enjoy the full features of our platform.</p>
                                    </div>
                                    <div class="footer">
                                        <p>If you did not request this email, please contact our support team.</p>
                                        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                            `;
                    case "DEV_DELETED": 
                        return `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        color: #333333;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .email-container {
                                        background-color: #ffffff;
                                        max-width: 600px;
                                        margin: 20px auto;
                                        padding: 20px;
                                        border-radius: 8px;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .header {
                                        text-align: center;
                                        background-color: #dc3545; /* Red color for account deletion */
                                        color: #ffffff;
                                        padding: 10px 0;
                                        border-radius: 8px 8px 0 0;
                                    }
                                    .header h1 {
                                        margin: 0;
                                        font-size: 24px;
                                    }
                                    .content {
                                        padding: 20px;
                                        line-height: 1.6;
                                    }
                                    .footer {
                                        text-align: center;
                                        margin-top: 20px;
                                        font-size: 12px;
                                        color: #777777;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="email-container">
                                    <div class="header">
                                        <h1>Developer Account Deleted</h1>
                                    </div>
                                    <div class="content">
                                        <p>Hello, ${username}</p>
                                        <p>We are writing to inform you that your **developer account** has been permanently deleted from our system.</p>
                                        <p>As a result, all associated applications and user data linked to your account have also been removed.</p>
                                        <p>If this was a mistake or you wish to regain access, please contact our support team immediately.</p>
                                        <p>If you did not request this deletion, please reach out to us as soon as possible.</p>
                                    </div>
                                    <div class="footer">
                                        <p>If you have any questions, feel free to contact our support team.</p>
                                        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `;
                    case "APP_CREATED":
                        return `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        color: #333333;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .email-container {
                                        background-color: #ffffff;
                                        max-width: 600px;
                                        margin: 20px auto;
                                        padding: 20px;
                                        border-radius: 8px;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .header {
                                        text-align: center;
                                        background-color: #4caf50; /* Fixed: Changed ##4caf5 to #4caf50 */
                                        color: #ffffff;
                                        padding: 10px 0;
                                        border-radius: 8px 8px 0 0;
                                    }
                                    .header h1 {
                                        margin: 0;
                                        font-size: 24px;
                                    }
                                    .content {
                                        padding: 20px;
                                        line-height: 1.6;
                                    }
                                    .cta-button {
                                        display: inline-block;
                                        background-color: #007BFF;
                                        color: #ffffff;
                                        padding: 10px 20px;
                                        text-decoration: none;
                                        border-radius: 5px;
                                        font-weight: bold;
                                        margin-top: 20px;
                                    }
                                    .cta-button:hover {
                                        background-color: #0056b3;
                                    }
                                    .footer {
                                        text-align: center;
                                        margin-top: 20px;
                                        font-size: 12px;
                                        color: #777777;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="email-container">
                                    <div class="header">
                                        <h1>App Created Successfully</h1>
                                    </div>
                                    <div class="content">
                                        <p>Hello, ${username}</p>
                                        <p>Congratulations! Your app <strong>${appName}</strong> has been successfully created in our system.</p>
                                        <p>Here are the details of your newly registered app:</p>
                                        <ul>
                                            <li><strong>App Name:</strong> ${appName}</li>
                                            <li><strong>App ID:</strong> ${appID}</li>
                                            <li><strong>Client Secret:</strong> <em>For security reasons, this is not shown here. Please check your dashboard for the secret key.</em></li>
                                        </ul>
                                        <p>If you didn't initiate this request or don't recognize the app, please check your account and contact support immediately to secure your account.</p>
                                        <p>To manage your apps, you can visit your developer dashboard here: <a href="${process.env.DOMAIN}/dashboard">Manage Dashboard</a></p>
                                    </div>
                                    <div class="footer">
                                        <p>If you did not request this email or believe this is an error, please check your account for any suspicious activity or contact support.</p>
                                        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                            `;
                    case "APP_DELETED":
                        return `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        color: #333333;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .email-container {
                                        background-color: #ffffff;
                                        max-width: 600px;
                                        margin: 20px auto;
                                        padding: 20px;
                                        border-radius: 8px;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .header {
                                        text-align: center;
                                        background-color: #ff4d4d; /* Fixed: Changed ##4caf5 to #4caf50 */
                                        color: #ffffff;
                                        padding: 10px 0;
                                        border-radius: 8px 8px 0 0;
                                    }
                                    .header h1 {
                                        margin: 0;
                                        font-size: 24px;
                                    }
                                    .content {
                                        padding: 20px;
                                        line-height: 1.6;
                                    }
                                    .cta-button {
                                        display: inline-block;
                                        background-color: #007BFF;
                                        color: #ffffff;
                                        padding: 10px 20px;
                                        text-decoration: none;
                                        border-radius: 5px;
                                        font-weight: bold;
                                        margin-top: 20px;
                                    }
                                    .cta-button:hover {
                                        background-color: #0056b3;
                                    }
                                    .footer {
                                        text-align: center;
                                        margin-top: 20px;
                                        font-size: 12px;
                                        color: #777777;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="email-container">
                                    <div class="header">
                                        <h1>App Deleted Successfully</h1>
                                    </div>
                                    <div class="content">
                                        <p>Hello, ${username}</p>
                                        <p>Your app <strong>${appName}</strong> has been successfully deleted from our system.</p>
                                        <p>Here are the details of your newly registered app:</p>
                                        <ul>
                                            <li><strong>App Name:</strong> ${appName}</li>
                                            <li><strong>App ID:</strong> ${appID}</li>
                                        </ul>
                                        <p>If you didn't initiate this request or don't recognize the app, please check your account and contact support immediately to secure your account.</p>
                                        <p>To manage your apps, you can visit your developer dashboard here: <a href="${process.env.DOMAIN}/dashboard">Manage Dashboard</a></p>
                                    </div>
                                    <div class="footer">
                                        <p>If you did not request this email or believe this is an error, please check your account for any suspicious activity or contact support.</p>
                                        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                            `;
                    default:
                        return `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>404 Error - Page Not Found</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f4f4f4;
                                    margin: 0;
                                    padding: 0;
                                    text-align: center;
                                }
                                .email-container {
                                    width: 100%;
                                    max-width: 600px;
                                    margin: 0 auto;
                                    background-color: #ffffff;
                                    padding: 20px;
                                    border-radius: 8px;
                                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                }
                                .header {
                                    background-color: #ff4d4d;
                                    color: #ffffff;
                                    padding: 20px;
                                    border-radius: 8px 8px 0 0;
                                }
                                .header h1 {
                                    margin: 0;
                                }
                                .content {
                                    padding: 20px;
                                    font-size: 16px;
                                    color: #333333;
                                }
                                .cta-button {
                                    display: inline-block;
                                    padding: 10px 20px;
                                    background-color: #007bff;
                                    color: #ffffff;
                                    text-decoration: none;
                                    border-radius: 5px;
                                    margin-top: 10px;
                                }
                                .footer {
                                    background-color: #f1f1f1;
                                    padding: 10px;
                                    font-size: 14px;
                                    color: #777777;
                                    border-radius: 0 0 8px 8px;
                                }
                                .footer a {
                                    color: #007bff;
                                    text-decoration: none;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="email-container">
                                <div class="header">
                                    <h1>404 Error - Page Not Found</h1>
                                </div>
                                <div class="content">
                                    <p>Hello,</p>
                                    <p>Oops! It seems the page you were looking for doesn't exist. Please check the URL or try again later.</p>
                                    <p>If you believe this is an error, you can contact our support team for assistance.</p>
                                    <p>
                                        <a href="mailto:support@yourcompany.com" class="cta-button">Contact Support</a>
                                    </p>
                                </div>
                                <div class="footer">
                                    <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                                    <p>If you no longer wish to receive these emails, you can <a href="${process.env.UNSUBSCRIBE_LINK}">unsubscribe here</a>.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        `;
                }
            })(),            
        };

        const mailResponse = await transporter.sendMail(mailOptions);
        return mailResponse;

    } catch (error) {
        console.error("Error in sendEmail:", error);
        return error;
    }
};
