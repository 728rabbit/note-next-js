import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        APP_ENV: 'production',
        API_URL: 'http://localhost:8080/api'
    },
};

export default nextConfig;
