import type {NextConfig} from 'next';
const nextConfig:NextConfig={trailingSlash:true,poweredByHeader:false,async redirects(){return [
 {source:'/privacy-policy',destination:'/privacy/',permanent:true},
 {source:'/disclaimer',destination:'/terms/#website-information',permanent:true},
 {source:'/legal',destination:'/terms/',permanent:true},
];}};
export default nextConfig;
