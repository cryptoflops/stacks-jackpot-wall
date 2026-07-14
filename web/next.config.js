/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        '@stacks/connect',
        '@stacks/connect-react',
        '@stacks/network',
        '@stacks/transactions',
        '@stacks/auth',
    ],
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Prevent webpack from splitting @stacks packages into separate chunks
            // Cloudflare Pages sometimes serves stale chunk references between deployments
            config.optimization.splitChunks = {
                ...config.optimization.splitChunks,
                cacheGroups: {
                    ...config.optimization.splitChunks?.cacheGroups,
                    stacks: {
                        test: /[\\/]node_modules[\\/]@stacks[\\/]/,
                        name: 'stacks-vendor',
                        chunks: 'all',
                        priority: 20,
                    },
                },
            };
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                http: false,
                https: false,
                zlib: false,
                path: false,
            };
        }
        return config;
    },
    async rewrites() {
        return [
            {
                source: '/chainhook',
                destination: '/api/chainhook',
            },
        ];
    },
};

export default nextConfig;
