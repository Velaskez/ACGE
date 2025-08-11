import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Exclure les scripts du linting pendant le build
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'], // Lint seulement le dossier src
  },
  
  // Exclusions TypeScript
  typescript: {
    ignoreBuildErrors: true, // Ignorer les erreurs TS dans les scripts
  },
  
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  
  // Configuration des images
  images: {
    unoptimized: false,
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
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;