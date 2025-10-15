'use client';
import React from "react";

const ThankYou: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-coolgray dark:bg-black transition-colors duration-500">
      <div className="bg-white/80 dark:bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/30 flex flex-col items-center">
        <svg
          className="w-20 h-20 text-green-500 mb-4 animate-bounce"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M8 12l2 2l4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="text-3xl font-poppins font-bold text-hpblue mb-2">
          Thank You!
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
          Your submission has been received.
        </p>
        <div className="flex items-center gap-2 mb-6">
          <svg
            className="w-6 h-6 text-hpblue"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 4h16v16H4z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M4 4l8 8l8-8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <span className="text-gray-600 dark:text-gray-300">
            Confirmation mail sent
          </span>
        </div>
        <div className="flex gap-4">
          <a
            href="/"
            className="px-6 py-2 rounded-full bg-blue-500 text-white font-semibold shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-hpblue hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-hpblue/40"
          >
            Back to Home
          </a>
          <a
            href="/user/form"
            className="px-6 py-2 rounded-full bg-white text-blue-500 font-semibold shadow-lg border border-blue-500 transition-all duration-300 hover:bg-blue-200 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/40"
          >
            Submit Another
          </a>
        </div>
      </div>
      {/* Confetti animation placeholder */}
      <div className="fixed inset-0 pointer-events-none z-[-1] animate-pulse">
        {/* You can use a confetti library or animated SVG here */}
      </div>
    </div>
  );
};

export default ThankYou;
