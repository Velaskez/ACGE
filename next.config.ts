import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuration pour Vercel (déploiement dynamique)
  // output: 'export', // Commenté pour Vercel
  // trailingSlash: true, // Commenté pour Vercel
  // distDir: 'out', // Commenté pour Vercel
  
  // Exclure les scripts du linting pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Exclusions TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  
  // Configuration des images pour Vercel
  images: {
    // unoptimized: true, // Commenté pour Vercel
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
    // Optimiser les preloads
    optimizeCss: true,
  },
  
  // Configuration des headers pour optimiser les preloads
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ],
      },
    ]
  },
  
  // Optimisations SWC (déprécié dans Next.js 15)
  // swcMinify: true,
  
  // Configuration webpack simplifiée
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