import path from 'path';
import { ConfigEnv, loadEnv, UserConfig } from 'vite';
import { HOST, PORT } from './config/constant';
import { createVitePlugins } from './config/vite/plugins';
import { createProxy } from './config/vite/proxy';
import dayjs from 'dayjs';
import package_ from './package.json';

const { dependencies, devDependencies, name, version } = package_;

const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();

  const isBuild = command === 'build';

  const env = loadEnv(mode, root);

  const { VITE_PUBLIC_PATH } = env;

  // const isTest = mode === 'test';
  const isProd = mode === 'production';

  return {
    base: VITE_PUBLIC_PATH,
    plugins: createVitePlugins(isBuild),
    root,
    envPrefix: 'VITE_',
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        {
          find: 'config',
          replacement: path.resolve(__dirname, './config'),
        },
        {
          find: /^~/,
          replacement: `${path.resolve(__dirname, './node_modules')}/`,
        },
      ],
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    server: {
      host: HOST,
      port: PORT,
      proxy: createProxy(),
    },

    build: {
      target: 'es2015',
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: isProd,
        },
      },
      // Turning off brotliSize display can slightly reduce packaging time
      brotliSize: false,
      chunkSizeWarningLimit: 2000,
      sourcemap: false,
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
  };
};
