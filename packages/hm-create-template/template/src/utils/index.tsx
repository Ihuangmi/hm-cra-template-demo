import dayjs from 'dayjs';
import { isNil, round } from 'lodash';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);
dayjs.extend(isSameOrBefore);

export const isUrl = (path: string): boolean => {
  if (!path.startsWith('http')) {
    return false;
  }
  try {
    const url = new URL(path);
    return !!url;
  } catch (error) {
    return false;
  }
};

/**
 * @description 驼峰转下划线
 * @param str
 */
export function humpToUnderline(str: string) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  // .replace(/([0-9])/, '_$1')
  // .toLowerCase();  // 是否给数字加下划线
}

/**
 * @description: 下划线转驼峰
 * @param string string
 */
export function underlineToHump(str: string): string {
  const reg = /_(\w)/g;
  return str.replace(reg, (_, $1) => {
    return $1.toUpperCase();
  });
}

/**
 * 存储单位转换
 */
export const bytesToSize = (bytes: number) => {
  if (bytes === 0 || isNil(bytes)) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
};

export const scrollToTop = () => {
  // body滚动至顶部
  document.documentElement.scrollTo({ top: 0 });
};

/**
 * 判断字符长度，中文占两个字节，英文占一个
 */
export const gblen = (text: string | undefined) => {
  let len = 0;
  if (!text) return len;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127 || text.charCodeAt(i) === 94) {
      len += 2;
    } else {
      len += 1;
    }
  }
  return len;
};

/**
 * 下载资源文件
 * @param resource 资源链接
 * @param name 文件名
 */
export const downloadResource = (resource: string | Blob, name?: string) => {
  const a = document.createElement('a');
  a.style.display = 'none';
  const url =
    typeof resource === 'string'
      ? resource.includes('aliyuncs.com')
        ? resource + '?response-content-type=application/octet-stream'
        : resource
      : URL.createObjectURL(resource);
  a.href = url;
  a.target = '_blank';
  name && (a.download = name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * @description 将数字转换为带单位的格式
 * @param n 数字
 * @param precision 保留的数字的精度
 */
export function numberUnit(n?: string | number, precision: number = 2) {
  if (isNil(n)) {
    return '-';
  }

  const ONE_HUNDRED_MILLION = 1e8;
  const TEN_THOUSAND = 1e4;
  if (typeof n === 'string' && !/^-?\d+$/.test(n)) {
    return n;
  }
  const num = Number(n);

  // 大于一亿
  if (num >= ONE_HUNDRED_MILLION) {
    return `${parseFloat(String(round(num / ONE_HUNDRED_MILLION, precision)))}亿`;
  }

  // 大于1万
  if (num >= TEN_THOUSAND) {
    return `${parseFloat(String(round(num / TEN_THOUSAND, precision)))}w`;
  }

  // 小于一亿
  if (num <= -ONE_HUNDRED_MILLION) {
    return `${parseFloat(String(round(num / ONE_HUNDRED_MILLION, precision)))}亿`;
  }

  // 小于1万
  if (num <= -TEN_THOUSAND) {
    return `${parseFloat(String(round(num / TEN_THOUSAND, precision)))}w`;
  }
  return round(num, precision);
}

/**
 * 处理数字相加精度丢失问题
 * 将传值统一乘 100，最后自己将计算过后的值 除 100
 * @param num
 */
export function numberPrecisionLoss(num: number) {
  return num * 100;
}

export function padStart(str: number, length: number, pad: number) {
  let charstr = String(pad);
  let len = length >> 0;
  let maxlen = Math.ceil(len / charstr.length);
  let chars = [];
  let r = String(str);
  while (maxlen--) {
    chars.push(charstr);
  }
  return chars.join('').substring(0, len - r.length) + r;
}

export function format(time: number) {
  if (window.isNaN(time)) {
    return '';
  }
  let hour = padStart(Math.floor(time / 3600), 2, 0);
  let minute = padStart(Math.floor((time - Number(hour) * 3600) / 60), 2, 0);
  let second = padStart(Math.floor(time - Number(hour) * 3600 - Number(minute) * 60), 2, 0);
  return (hour === '00' ? [minute, second] : [hour, minute, second]).join(':');
}

/**
 *  将时间字符串转换成秒数
 * @param pointTime HH:mm:ss
 * @returns secend
 */
export function convertToSeconds(pointTime?: string) {
  if (!pointTime || typeof pointTime !== 'string') return 0;
  if (pointTime.includes(':')) {
    const arr = pointTime.split(':');
    let ds: number = 0;
    if (arr.length % 2 === 0) {
      ds = Number(arr[0]) * 60 + Number(arr[1]);
    } else if (arr.length % 3 === 0) {
      ds = Number(arr[0]) * 3600 + Number(arr[1]) * 60 + Number(arr[2]);
    }
    return ds;
  }
  return 0;
}

// 正则表达式判断设备的格式
export function isMobile() {
  let flag = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
  );
  return flag;
}
