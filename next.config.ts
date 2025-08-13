import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuration pour LWS (export statique)
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Exclure les scripts du linting pendant le build
  eslint: {
    ignoreDuringBuilds: true, // Ignorer ESLint pour LWS
  },
  
  // Exclusions TypeScript
  typescript: {
    ignoreBuildErrors: true, // Ignorer les erreurs TS
  },
  
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  
  // Configuration des images pour LWS (export statique)
  images: {
    unoptimized: true, // Nécessaire pour l'export statique
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Configuration expérimentale
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Configuration webpack
  webpack: (config, { isServer }) => {
    // Résoudre le problème du loader
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;