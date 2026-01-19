import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Transpile socket.io-client to ensure it works with Next.js
  transpilePackages: ["socket.io-client"],
  
  // Suppress source map warnings from Next.js internals
  webpack: (config, { isServer }) => {
    // Suppress source map warnings from Next.js internals
    config.ignoreWarnings = [
      { module: /node_modules\/next\// },
      { message: /Invalid source map/ },
      { message: /sourceMapURL could not be parsed/ },
      { message: /Only conformant source maps can be used/ },
    ];
    
    // Also suppress warnings in the webpack stats
    if (config.stats) {
      config.stats.warningsFilter = [
        /node_modules\/next\//,
        /Invalid source map/,
        /sourceMapURL could not be parsed/,
      ];
    }
    
    return config;
  },
};

export default nextConfig;
