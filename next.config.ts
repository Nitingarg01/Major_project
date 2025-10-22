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
        hostname:"api-ninjas-data.s3.us-west-2.amazonaws.com"
      },
      {
        protocol:"https",
        hostname:"assets.api-ninjas.com"
      }
    ],
  },
  serverExternalPackages:['pdf-parser'],
  output:"standalone",
  webpack:(config,{isServer})=>{
    if(isServer){
      config.externals.push('pdf-parse');
    }
    return config;
  },
  async headers(){
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  async rewrites(){
    return[];
  }
};

export default nextConfig;
