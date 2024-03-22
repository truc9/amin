import Link from "next/link";
import { FC, ReactNode } from "react";

interface LinkButtonProps {
  icon?: ReactNode;
  label: string;
  href: string;
}

export const LinkButton: FC<LinkButtonProps> = ({ icon, label, href }) => {
  return (
    <Link
      href={href}
      className="w-full bg-green-400 text-white px-2 py-3 rounded text-center flex items-center gap-2 justify-center"
    >
      {icon && <span className="text-xl">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
};
