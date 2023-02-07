/**
 * vite plugin
 */

import type { PluginOption } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import windiCSS from 'vite-plugin-windicss';
import { configVisualizerConfig } from './visualizer';
import { configCompressPlugin } from './compress';
import { configSvgr } from './svgr';
import { VITE_APP_LEGACY, VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE } from '../../constant';

export function createVitePlugins(isBuild: boolean) {
  const vitePlugins: (PluginOption | PluginOption[])[] = [react()];

  // vite-plugin-windicss
  vitePlugins.push(windiCSS());

  // vite-plugin-legacy
  VITE_APP_LEGACY && isBuild && vitePlugins.push(legacy({ modernPolyfills: true }));

  // rollup-plugin-visualizer
  vitePlugins.push(configVisualizerConfig());

  vitePlugins.push(configSvgr());

  if (isBuild) {
    // rollup-plugin-gzip
    vitePlugins.push(configCompressPlugin(VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE));
  }

  return vitePlugins;
}
