import axios from 'axios';
import jsonp from 'jsonp';
import ls from 'localstorage-slim';

const shouldUseStorage = true;
const isDev = window.location.hostname === 'localhost';
const caches: Record<string, any> = {};
const cachedPromise: Record<string, Promise<any>> = {};

const secondsUntilMidnight = () =>
  ((new Date().setHours(24, 0, 0, 0) - Date.now()) / 1000) | 0;

const setCache = (key: string, data: any) => {
  if (shouldUseStorage) {
    ls.set(key, data, { ttl: secondsUntilMidnight() });
  } else {
    caches[key] = data;
  }
  return data;
};

const getCache = (key: string) => {
  if (shouldUseStorage) {
    const local = ls.get(key);
    return local || null;
  }
  return caches[key];
};

export const axiosGet = (url: string, cached: boolean = false) => {
  if (Object.prototype.hasOwnProperty.call(cachedPromise, url)) {
    return cachedPromise[url];
  }
  if (isDev || cached) {
    const cachedData = getCache(url);
    if (cachedData) {
      return Promise.resolve(cachedData);
    }
  }
  cachedPromise[url] = axios
    .get(url)
    .then((res) => {
      delete cachedPromise[url];
      return res;
    })
    .then((res) => {
      if (isDev || cached) {
        return setCache(url, res.data);
      }
      return res.data;
    });
  return cachedPromise[url];
};

export const jsonpPromise = (url: string, cached: boolean = false) => {
  if (Object.prototype.hasOwnProperty.call(cachedPromise, url)) {
    return cachedPromise[url];
  }
  if (isDev || cached) {
    const cachedData = getCache(url);
    if (cachedData) {
      return Promise.resolve(cachedData);
    }
  }
  cachedPromise[url] = new Promise((resolve, reject) => {
    jsonp(url, (err, data) => {
      delete cachedPromise[url];
      if (err) {
        reject(err);
      } else {
        if (isDev || cached) {
          resolve(setCache(url, data));
        } else {
          resolve(data);
        }
      }
    });
  });
  return cachedPromise[url];
};
