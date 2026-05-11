"use client";

import { usePathname } from "next/navigation";
import { BannerStrip } from "./BannerStrip";

export const ConditionalBanner = () => {
  const pathname = usePathname();
  
  // List of paths where the banner should NOT be shown
  const excludedPaths = ["/login", "/register", "/account", "/cart"];
  
  // Check if current path starts with any of the excluded paths
  const isExcluded = excludedPaths.some(path => pathname.startsWith(path));

  if (isExcluded) return <div className="h-[64px]" />;

  return <BannerStrip />;
};
