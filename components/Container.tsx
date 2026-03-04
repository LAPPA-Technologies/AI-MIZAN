import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string; // e.g. 'max-w-reading', 'max-w-4xl', etc.
}

export default function Container({ children, className = "", maxWidth }: ContainerProps) {
  // If maxWidth is provided, constrain; otherwise, full width
  return (
    <div className={`px-4 sm:px-6 lg:px-8 ${className} ${maxWidth ? `mx-auto w-full ${maxWidth}` : "w-full"}`}>
      {children}
    </div>
  );
}
