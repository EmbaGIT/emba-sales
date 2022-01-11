import axios from 'axios';
import { toast } from 'react-toastify';

const axiosInstance = axios.create({
    baseURL: 'http://bpaws01l:8083/api',
    fileURL: 'http://bpaws01l:8089/api',
    orderURL: 'http://bpaws01l:8087/api'
});

export const get = (url) => axiosInstance.get(url).then((res) => res.data);
export const post = (url, data) => axiosInstance.post(url, data).then((res) => res.data);
export const put = (url, data) => axiosInstance.put(url, data).then((res) => res.data);
export const remove = (url, data) => axiosInstance.delete(url, data).then((res) => res.data);
export const gett = (url) => axiosInstance.get(url);
export const postt = (url, data) => axiosInstance.post(url, data);

const MessageComponent = ({ text }) => (
    <span style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
    <span
        style={{
            fontWeight: 500,
            fontSize: 16,
            lineHeight: '24px',
            color: '#FFEDED',
        }}
    >
      {text}
    </span>
  </span>
);

axiosInstance.interceptors.request.use((config) => {
    const jwt = localStorage.getItem('jwt_token');
    if (jwt) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${jwt}`,
        };
    }
    if (config.url.includes('http://bpaws01l:8089/api/image')) {
        config.headers = {
            ...config.headers,
            'Content-Type': 'multipart/form-data;',
        };
    }else if(config.url.includes('http://bpaws01l:8087/api')) {
        config.headers = {
            ...config.headers,
            'Content-Type': 'application/json;',
        };
    }
    return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use((res) => {
    if ((res.status === 201 || res.status === 200) && (res.config.method === 'post' && res.config.url!=='http://bpaws01l:8087/api/inventory') && res.config.method === 'put') {
        toast.success(<MessageComponent text='Uğurlu Əməliyyat!' />, {
            position: toast.POSITION.TOP_LEFT,
            toastId: 'success-toast-message',
            autoClose: 1500,
            closeOnClick: true,
        });
    }
    if (res.status === 204 && res.config.method === 'delete') {
        toast.success(<MessageComponent text='Uğurla Silindi!' />, {
            position: toast.POSITION.TOP_LEFT,
            toastId: 'success-toast-message',
            autoClose: 2000,
            closeOnClick: true,
        });
    }
    return res;
}, (error) => {
    if (error?.response?.status === 403 || error?.response?.status === 401) {
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
    }
    if (error?.response?.status) {
        toast.error(<MessageComponent text={error?.response?.data?.message || 'Xəta baş verdi!'} />, {
            position: toast.POSITION.TOP_LEFT,
            toastId: 'error-toast-message',
            autoClose: 3000,
            closeOnClick: true,
        });
    }
    return Promise.reject(error);
});

export default axiosInstance;

