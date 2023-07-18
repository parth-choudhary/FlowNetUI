/** @type {import('next').NextConfig} */
const nextConfig = {
  // assetPrefix: '/',
  // output: "export",

    images: {
      // loader: 'akamai',
      // path: '',

        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'dummyimage.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'cloudflare-ipfs.com',
            port: '',
            pathname: '/**',
          }, {
            protocol: 'https',
            hostname: 'ipfs.io',
            port: '',
            pathname: '/**',
          },
        ],
    },
}

module.exports = nextConfig;
