import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // El default (1mb) rechaza con 413 los CSV de importación de Casos,
      // que suelen superarlo con unos cientos de filas.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
