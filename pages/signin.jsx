import React, { useState, useContext } from "react";
import { NFTContext } from "../context/NFTContext";
import { useRouter } from 'next/router';


const SignIn = () => {
  const { signIn } = useContext(NFTContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  
  const handleSignIn = async (e) => {
    e.preventDefault();
    signIn(email, password);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen dark">
      <div className="max-w-md bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Login</h2>
        <form className="flex flex-col">
          <input
            placeholder="Email address"
            className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
            type="email"
            onChange= {(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Password"
            className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center justify-between flex-wrap">
            <label
              className="text-sm text-gray-200 cursor-pointer"
              htmlFor="remember-me"
            >
              <input className="mr-2" id="remember-me" type="checkbox" />
              Remember me
            </label>
            <a
              className="text-sm text-blue-500 hover:underline mb-0.5"
              href="#"
            >
              Forgot password?
            </a>
            <p className="text-white mt-4">
              {" "}
              Don&apos;t have an account?{" "}
              <a
                className="text-sm text-blue-500 -200 hover:underline mt-4"
                href="#"
              >
                Sign In
              </a>
            </p>
          </div>
          <button
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150"
            type="submit"
            onClick={handleSignIn}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
