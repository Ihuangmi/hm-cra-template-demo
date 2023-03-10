// 开发host
export const HOST = 'dev.e.newrank.cn';
// 开发端口
export const PORT = 8085;

// 开启 mock
export const VITE_APP_MOCK: boolean = true;
// 开启包依赖分析 可视化
export const VITE_APP_ANALYZE: boolean = false;
// 开启Gzip压缩
export const VITE_APP_COMPRESS_GZIP: boolean = false;
// 开启Gzip压缩，删除原文件
export const VITE_APP_COMPRESS_GZIP_DELETE_FILE: boolean = false;
// 去除 console
export const VITE_DROP_CONSOLE: boolean = true;
// 开启兼容
export const VITE_APP_LEGACY: boolean = true;
// Whether to enable gzip or brotli compression
// Optional: gzip | brotli | none
// If you need multiple forms, you can use `,` to separate
export const VITE_BUILD_COMPRESS = 'none';

// Whether to delete origin files when using compress, default false
export const VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE = false;
