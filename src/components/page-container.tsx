import React from "react";

interface ContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="p-2 flex flex-col justify-start gap-3">{children}</div>
  );
};
