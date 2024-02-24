import React, { useState, useContext, useEffect } from "react";
import { NFTContext } from "../context/NFTContext";

const Verify = ({ email }) => {
  const { verify, wrongOTP } = useContext(NFTContext);
  const [otp, setOtp] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    verify(email, otp);
  };

  useEffect(() => {
    if (wrongOTP) {
      setOtp("");
    }
  }, [wrongOTP]);

  return (
    <div className="flex flex-col items-center justify-center h-screen dark">
      <div className="max-w-md bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Check your email</h2>
        {wrongOTP && <p className="text-red-500">Invalid OTP. Please try again.</p>}
        <form className="flex flex-col">
          <input
            placeholder="Verification code"
            className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
            type="number"
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150"
            type="submit"
            onClick={handleVerify}
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default Verify;
