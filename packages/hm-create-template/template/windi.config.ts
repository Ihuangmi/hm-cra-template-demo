import { defineConfig } from 'vite-plugin-windicss';

export default defineConfig({
  preflight: false,
  prefix: 'tw-',
  prefixer: true,
  important: true,
  extract: {
    include: ['./src/**/*.html', './src/**/*.tsx', './src/**/*.jsx'],
  },
  safelist: ['prose', 'prose-sm', 'm-auto'],
  theme: {
    extend: {
      colors: {
        DEFAULT: 'var(--text-color)',
        primary: 'var(--primary-color)', // 主色
        error: 'var(--error-color)', // 错误色
        success: 'var(--success-color)', // 成功色
        info: 'var(--info-color)', // 信息色
        link: 'var(--link-color)', // 链接色
        secondary: 'var(--text-color-secondary)', // 二级文本
        third: 'var(--text-color-third)', // 三级文本
        fourth: 'var(--text-color-fourth)', // 四级文本
        fifth: 'var(--text-color-fifth)', // 五级文本（失效、暗提示）
        bg: 'var(--bg-color)', // 透明度0.1的背景颜色
        layout: 'var(--layout-sider-background-light)', // layout背景色
        white: 'var(--white)',
      },
      borderColor: {
        DEFAULT: 'var(--border-color-base)',
      },
      fontSize: {
        sm: 'var(--font-size-sm)', // 12
        base: 'var(--font-size-base)', // 14
        lg: 'var(--font-size-lg)', // 16
        xl: 'var(--font-size-xl)', // 18
        xxl: 'var(--font-size-xxl)', // 24
      },
      rounded: {
        DEFAULT: 'var(--border-radius-base)',
      },
      margin: {
        /**
         * 0px
         */
        0: 'var(--zero)',
        /**
         * 4px
         */
        xxs: 'var(--xxs)',
        /**
         * 8px
         */
        xs: 'var(--xs)',
        /**
         * 12px
         */
        sm: 'var(--sm)',
        /**
         * 16px
         */
        md: 'var(--md)',
        /**
         * 24px
         */
        lg: 'var(--lg)',
        /**
         * 32px
         */
        xl: 'var(--xl)',
        /**
         * 48px
         */
        xxl: 'var(--xxl)',
      },
      padding: {
        0: 'var(--zero)',
        xxs: 'var(--xxs)',
        xs: 'var(--xs)',
        sm: 'var(--sm)',
        md: 'var(--md)',
        lg: 'var(--lg)',
        xl: 'var(--xl)',
        xxl: 'var(--xxl)',
      },
      spacing: {
        0: 'var(--zero)',
        xxs: 'var(--xxs)',
        xs: 'var(--xs)',
        sm: 'var(--sm)',
        md: 'var(--md)',
        lg: 'var(--lg)',
        xl: 'var(--xl)',
        xxl: 'var(--xxl)',
      },
    },
  },
});
