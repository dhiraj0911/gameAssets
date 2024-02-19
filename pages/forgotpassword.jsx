import axios from "axios";
import React, { useState } from "react";
const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [verify, setVerify] = useState(false);
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [ error, setError ] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangePasswordRequest = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/vendor/forgotpassword`, {
              email,
            });
            if (response.status === 201) {
                console.log("Authentication successful");
                setVerify(true);      
            }
          } catch (error) {
            alert("No Account found with this email")
            console.error("Error during sign-in:", error);
          }
          finally{
            setLoading(false);
          }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
          }
        try {
            setLoading(true);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/vendor/verify`, {
              email,
              otp,
              chanegPassword: password
            });
            if (response.status === 200) {
                alert("your password has been changed successfully");
                window.location.href = "/signin";
            } else {
                setError("Invalid Verification code. Please try again.");
                setOtp("");
              console.log("Authentication failed");
            }
          } catch (error) {
            console.error("Error during sign-in:", error);
          }
          finally{
            setLoading(false);
          }
        console.log('change pass')
    }

    if (verify) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 mx-auto md:h-screen lg:py-0">
              <div className="flex bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    Change Password
                  </h1>
                    <p className="text-red-500">{error}</p>
                  <form className="space-y-4 md:space-y-6" action="#">
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Your Verification code
                      </label>
                      <input
                        type="number"
                        value={otp}
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Ex.123456"
                        required=""
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="password"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required=""
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Confirm password
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required=""
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full text-white bg-primary-600 border hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 hover:border hover:border-blue-500"
                      onClick={handleChangePassword}
                      disabled={loading}
                    >
                      Change password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen dark">
            <div className="max-w-md bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-200 mb-4">Enter your Email</h2>
                <form className="flex flex-col">
                    <input
                        placeholder="Email address"
                        className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150"
                        type="submit"
                        onClick={handleChangePasswordRequest}
                        disabled={loading}
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;