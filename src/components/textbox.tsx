import React, { InputHTMLAttributes } from "react";

interface TextBoxProps extends InputHTMLAttributes<HTMLInputElement> {}

export const TextBox: React.FC<TextBoxProps> = ({ ...props }) => {
  return (
    <input
      className="bg-white focus:ring-2 focus:outline-none ring-green-400 ring-offset-2 px-3 py-3 rounded border"
      {...props}
    ></input>
  );
};
