/** @type {import('next').NextConfig} */
const nextConfig = {
  // The chat ships with the knowledge base files.
  outputFileTracingIncludes: { '/api/chat': ['./content/**/*'] },
  async headers() {
    return [
      // /embed is shown inside other websites by public/widget.js.
      { source: '/embed', headers: [{ key: 'Content-Security-Policy', value: 'frame-ancestors *' }] },
      { source: '/widget.js', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] }
    ]
  }
}

export default nextConfig
