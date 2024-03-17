import React, { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label: string;
}

export const Button: React.FC<ButtonProps> = ({ icon, label, ...props }) => {
  return (
    <button
      className="bg-green-400 text-white px-4 py-3 rounded ring-green-300 ring-offset-2 active:ring-2 flex items-center justify-center gap-2"
      {...props}
    >
      {icon && <span className="text-xl">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
