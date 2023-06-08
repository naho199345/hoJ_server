import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as https from 'https';

export async function postListRequest<T>(url: string, data: AxiosRequestConfig['data']): Promise<AxiosResponse<T>> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + process.env.CATCH_SECRET,
  };

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  try {
    const response = await axios.post<T>(url, data, { headers, httpsAgent });
    return response;
  } catch (error) {
    console.log(error.response.data);
    throw error;
  }
}

export async function itvPostListRequest<T>(url: string, data: AxiosRequestConfig['data']): Promise<AxiosResponse<T>> {
  const headers = {
    'Content-Type': 'application/json',
    itvKey: process.env.INNERVIEWON_SECRET,
  };

  try {
    const response = await axios.post<T>(url, data, { headers });
    return response;
  } catch (error) {
    throw error;
  }
}
