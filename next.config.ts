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
  },
  
  // Optimisations SWC (déprécié dans Next.js 15)
  // swcMinify: true,
  
  // Configuration webpack
  webpack: (config, { isServer, dev }) => {
    // Résoudre le problème du loader
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Optimisations pour le développement
    if (dev) {
      // Désactiver la minification en dev pour plus de vitesse
      config.optimization.minimize = false;
      config.optimization.minimizer = [];
      
      // Cache plus agressif
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;