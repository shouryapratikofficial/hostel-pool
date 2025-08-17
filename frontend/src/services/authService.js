import api from './api';

export const loginUser = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const registerUser = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

export const reactivateAccount = async (email) => {
    const { data } = await api.post('/auth/reactivate', { email });
    return data;
}

