import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol:"https",
        hostname:"api-ninjas-data.s3.us-west-2.amazonaws"
      },
      {
        protocol:"https",
        hostname:"assets.api-ninjas.com"
      }
    ],
  },
  serverExternalPackages:['pdf-parser'],
  output:"standalone",
  reactStrictMode:true
};

export default nextConfig;
