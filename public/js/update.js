import axios from 'axios';
import { showAlert } from './alert';

export const updateData = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',
      data,
    });

    console.log(res);

    if (res.data.status === 'success')
      showAlert('success', 'Data updated succesfully!');

    window.setTimeout(() => {
      location.reload(true);
    }, 1500);
  } catch (err) {
    // console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export const updatePassword = async (
  passwordCurrent,
  password,
  passwordConfirm
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updatePassword',
      data: {
        passwordCurrent,
        password,
        passwordConfirm,
      },
    });

    // console.log(res);

    if (res.data.status === 'success')
      showAlert('success', 'Password updated successfully!');

    window.setTimeout(() => {
      location.reload(true);
    }, 1500);
  } catch (err) {
    showAlert('error', err.message);
  }
};

exports.deleting = async (type, Id) => {
  try {
    let URL;

    type === 'Restaurant'
      ? (URL = `/api/v1/restaurants/${Id}`)
      : (URL = `/api/v1/users/${Id}`);

    const res = await axios({
      method: 'DELETE',
      url: URL,
    });

    // console.log(res);

    if (res.status === 204) showAlert('success', `${type} deleted succesfully`);

    window.setTimeout(() => {
      location.reload(true);
    }, 2000);
  } catch (err) {
    showAlert('error', err);
  }
};
