/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export supaya bisa dikirim ke Cloudflare Pages (R26).
  output: 'export',
  // Tiap rute jadi direktori berisi index.html, jadi tautan internal yang
  // berakhir garis miring menunjuk berkas nyata di Pages (R59).
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
