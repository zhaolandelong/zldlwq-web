import axios from 'axios';
import jsonp from 'jsonp';

const isLocal = window.location.host.includes('localhost');
const caches: Record<string, any> = {};
const cachedPromise: Record<string, Promise<any>> = {};

const setCache = (key: string, data: any) => {
  if (isLocal) {
    sessionStorage.setItem(key, JSON.stringify(data));
  } else {
    caches[key] = data;
  }
  return data;
};

const getCache = (key: string) => {
  if (isLocal) {
    const local = sessionStorage.getItem(key);
    if (local) {
      return JSON.parse(local);
    }
    return null;
  }
  return caches[key];
};

export const axiosGet = (url: string, cached: boolean = false) => {
  if (Object.prototype.hasOwnProperty.call(cachedPromise, url)) {
    return cachedPromise[url];
  }
  if (cached) {
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
      if (cached) {
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
  if (cached) {
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
        if (cached) {
          resolve(setCache(url, data));
        } else {
          resolve(data);
        }
      }
    });
  });
  return cachedPromise[url];
};
