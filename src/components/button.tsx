import React, { ReactNode, ButtonHTMLAttributes, forwardRef } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label: string;
}

export type Ref = HTMLButtonElement;

export const Button = forwardRef<Ref, Props>(
  ({ icon, label, ...props }, ref) => (
    <button
      ref={ref}
      className="bg-green-400 text-white px-4 py-3 rounded ring-green-300 ring-offset-2 active:ring-2 flex items-center justify-center gap-2"
      {...props}
    >
      {icon && <span className="text-xl">{icon}</span>}
      <span>{label}</span>
    </button>
  )
);
