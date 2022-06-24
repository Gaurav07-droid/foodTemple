import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    // console.log(res);

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in succesfully!');

      //   window.setTimeout(() => {
      //     location.assign('/');
      //   }, 2000);
    }
    console.log(res);
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export const logOut = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    // console.log(res);

    if (res.data.message === 'success') location.assign('/');
  } catch (err) {
    showAlert('error', err.message);
  }
};

export const signUp = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    // console.log(res);

    if (res.data.status === 'success') {
      showAlert('success', 'Account created succesfully!');

      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};
