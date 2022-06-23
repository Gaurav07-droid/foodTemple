import { showAlert } from './alert';

import axios from 'axios';
const textDistance = document.getElementById('distance-text');
const distanceBtn = document.querySelector('.btn--green');

let restoName;
if (textDistance) restoName = textDistance.dataset.name;

const getLocation = async (lat, lng) => {
  try {
    let result;
    // if(req.originalUrl==='')
    const res = await axios({
      method: 'GET',
      url: `http://127.0.0.1:8000/api/v1/restaurants/distances/${[
        lat,
        lng,
      ]}/unit/km`,
    });

    if (res.data.status === 'success')
      result = res.data.data.data.forEach((el) => {
        if (el.name === restoName)
          textDistance.textContent = `${el.distance.toFixed(1)}Km from you`;
      });

    // console.log(res);
  } catch (err) {
    showAlert('error', err.message);
  }
};

export const getCordinates = () => {
  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const { latitude, longitude } = position.coords;
        // console.log(latitude, longitude);
        return getLocation(latitude, longitude);
      },
      function () {
        showAlert(
          'error',
          'Sorry!Could not get your location.Please allow access to get your location'
        );
      }
    );
};
