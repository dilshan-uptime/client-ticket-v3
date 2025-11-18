import { Link } from "react-router-dom";

import { SIGNUP } from "../routes";
import { LoginForm } from "../forms/login/LoginForm";

export const LoginPage = () => {
  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      <div className="w-1/2 bg-white text-black flex flex-col justify-center items-center px-8 py-12 space-y-8">
        <img className="h-15" src="/logo.png" alt="logo" />

        {/* <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
        <p className="text-md text-gray-600 mb-5">Sign in to your account</p> */}

        <div className="w-full max-w-md mb-1">
          <LoginForm />
        </div>

        <div className="text-center text-sm pt-2">
          <span className="text-gray-600">Don't have an account? </span>
          <Link
            to={SIGNUP}
            className="text-primary-blue font-bold no-underline hover:text-blue-800"
          >
            Sign up
          </Link>
        </div>
      </div>

      <div className="w-1/2 bg-[#ee764e3f] text-[#ee764e] relative flex flex-col justify-center items-center px-8 py-12 right-side-container">
        <h2 className="text-2xl font-bold text-center right-side-heading mt-2">
          Automating the Future of Ticket Management
        </h2>

        <p className="text-sm text-center text-[#6b1c02] mb-8 right-side-subtext mt-5">
          Empower your support teams with smart automation <br /> to resolve
          tickets faster and boost customer satisfaction.
        </p>
      </div>
    </div>
  );
};
