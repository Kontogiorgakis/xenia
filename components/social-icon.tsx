"use client";

import { cn } from "@/lib/general/utils";

const COLOR_CLASSES: Record<string, string> = {
  instagram: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-80 text-white",
  youtube: "bg-red-600 hover:bg-red-700 text-white",
  spotify: "bg-green-600 hover:bg-green-700 text-white",
  facebook: "bg-blue-600 hover:bg-blue-700 text-white",
  twitter: "bg-neutral-900 hover:bg-neutral-800 text-white",
  tiktok: "bg-neutral-900 hover:bg-neutral-800 text-white",
  linkedin: "bg-blue-700 hover:bg-blue-800 text-white",
  wolt: "bg-wolt-blue hover:opacity-80 text-white",
};

interface SocialIconProps {
  url: string;
  icon: React.ReactNode;
  color: string;
  isMobile?: boolean;
  className?: string;
}

const SocialIcon = ({
  url,
  icon,
  color,
  isMobile = false,
  className,
}: SocialIconProps) => {
  const colorClasses =
    COLOR_CLASSES[color] ?? "bg-primary/10 hover:bg-primary/20 text-primary";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center justify-center rounded-md transition-all duration-300 hover:scale-110 hover:shadow-lg",
        isMobile ? "h-10 w-10" : "h-12 w-12",
        colorClasses,
        className,
      )}
    >
      {icon}
    </a>
  );
};

export { COLOR_CLASSES,SocialIcon };
export type { SocialIconProps };
