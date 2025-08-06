import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[new URL('https://fastly.picsum.photos/**'),new URL("https://fastly.picsum.photos/**")]
  }
};

export default nextConfig;
