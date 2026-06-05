/** @type {import('next').NextConfig} */
const nextConfig = {
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

