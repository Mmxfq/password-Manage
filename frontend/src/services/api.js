import axios from 'axios';

// 获取API基础URL
const getBaseUrl = () => {
  // 判断是否是生产环境
  if (process.env.NODE_ENV === 'production') {
    return 'https://zlilwpsuuuni.sealosbja.site/api'
  }
  // 判断是否是内网环境
  if (process.env.INTERNAL_NETWORK) {
    return 'http://encrypt.ns-hey43r72.svc.cluster.local:8000/api'
  }
  // 本地开发环境
  return '/api'
};

// 创建axios实例
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // 允许跨域请求携带cookie
  withCredentials: true,
});

// 添加请求拦截器
api.interceptors.request.use(
  config => {
    // 在这里可以添加认证信息等
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const createKey = async () => {
  const response = await api.post('/create-key/');
  return response.data;
};

export const importPasswords = async (key, passwords) => {
  const response = await api.post('/import-passwords/', { key, passwords });
  return response.data;
};

export const queryPasswords = async (key, platform = '') => {
  const response = await api.get('/query-passwords/', {
    params: { key, platform },
  });
  return response.data;
};

export const updatePassword = async (key, id, password) => {
  const response = await api.put(`/update-password/${id}/`, { key, password });
  return response.data;
};

export const deletePassword = async (key, id) => {
  const response = await api.delete(`/delete-password/${id}/`, {
    params: { key },
  });
  return response.data;
}; 