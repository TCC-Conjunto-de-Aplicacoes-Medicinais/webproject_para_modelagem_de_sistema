import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Desabilita otimização de imagens (não suportada no modo export)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
