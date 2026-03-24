import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "chart.js", "react-chartjs-2"],
  },
};

export default nextConfig;
