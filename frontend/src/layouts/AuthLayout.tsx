import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="mb-10">
            <div className="flex justify-center">
              <svg className="h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form content */}
          {children}
        </div>
      </div>
      
      {/* Right side - Decorative background (only visible on lg screens and up) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-blue-600">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-indigo-700">
          {/* Decorative shapes */}
          <div className="absolute inset-0 opacity-20">
            <svg className="absolute left-full transform -translate-y-3/4 -translate-x-1/4" width="404" height="784" fill="none" viewBox="0 0 404 784">
              <defs>
                <pattern id="pattern-squares" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="4" height="4" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="404" height="784" fill="url(#pattern-squares)" />
            </svg>
            <svg className="absolute right-full bottom-0 transform translate-x-1/4" width="404" height="784" fill="none" viewBox="0 0 404 784">
              <defs>
                <pattern id="pattern-squares-2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="4" height="4" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="404" height="784" fill="url(#pattern-squares-2)" />
            </svg>
          </div>
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Welcome to Our App</h2>
            <p className="text-xl opacity-80 max-w-md mx-auto">
              Secure, fast, and reliable platform for all your needs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;