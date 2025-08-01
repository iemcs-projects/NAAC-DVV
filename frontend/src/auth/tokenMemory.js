import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'naac_access_token';
const REFRESH_TOKEN_KEY = 'naac_refresh_token';

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_KEY);

export const setAccessToken = (token, expires) => {
  Cookies.set(ACCESS_TOKEN_KEY, token, {
    expires: expires ? new Date(Number(expires)) : 1, // Convert timestamp to Date
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });
};

export const clearAccessToken = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token, expires) => {
  Cookies.set(REFRESH_TOKEN_KEY, token, {
    expires: expires ? new Date(Number(expires)) : 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });
};

export const clearRefreshToken = () => {
  Cookies.remove(REFRESH_TOKEN_KEY);
};

export const clearTokens = () => {
  clearAccessToken();
  clearRefreshToken();
};
