import '@babel/polyfill';
import { updateData, updatePassword, deleting } from './update.js';
import { getCordinates } from './location.js';
import { login, logOut, signUp } from './auth.js';
import { bookResto } from './stripe.js';
import { showAlert } from './alert.js';

const btnBookResto = document.getElementById('book-resto');
const inputName = document.getElementById('name');
const inputUserName = document.getElementById('user-name');
const inputEmail = document.getElementById('email');
const userPhoto = document.getElementById('photo');
const inputPass = document.getElementById('password');
// const inputConfirPass = document.getElementById('password-con');

const distanceBtn = document.getElementById('distance');
const inputCurPass = document.getElementById('password-current');
const inputConfPass = document.getElementById('password-confirm');
const passBtn = document.getElementById('passSaveBtn');
const btnDeleteResto = document.querySelectorAll('#delete-resto');
const btnDeleteUser = document.querySelectorAll('#delete-user');

// const signUpBtn = document.getElementById('signup');
const saveDataBtn = document.getElementById('saveData');

const formLogin = document.querySelector('.form_login');
const formDataUpdate = document.querySelector('.form-user-data');
const formPassUpdate = document.querySelector('.form-user-settings');
const formSignup = document.querySelector('.form_signup');

const mapEl = document.getElementById('map');
import { displayMap } from './mapbox.js';

const logOutBtn = document.querySelector('.nav__el--logout');

// if(mapEl)

if (formLogin)
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();

    login(inputEmail.value, inputPass.value);
  });

//logging out user
if (logOutBtn) logOutBtn.addEventListener('click', logOut);

//Displaying map
if (mapEl) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locations);
}

//getting location of the user
// btnView.addEventListener('click', getLocation());
if (distanceBtn)
  distanceBtn.addEventListener('click', (e) => {
    getCordinates();
    e.target.classList.add('hidden');
  });

if (formDataUpdate)
  formDataUpdate.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append('name', inputName.value);
    form.append('email', inputEmail.value);
    form.append('photo', userPhoto.files[0]);

    updateData(form);
    // updateData(fv);

    saveDataBtn.textContent = 'Saving...';
    window.setTimeout(() => {
      saveDataBtn.textContent = 'Saved';
    }, 1500);
  });

if (formPassUpdate)
  formPassUpdate.addEventListener('submit', (e) => {
    e.preventDefault();
    // console.log(inputCurPass.value, inputPass.value, inputConfPass.value);
    updatePassword(inputCurPass.value, inputPass.value, inputConfPass.value);

    passBtn.textContent = 'Updating...';
  });

if (formSignup)
  formSignup.addEventListener('submit', (e) => {
    e.preventDefault();

    signUp(
      inputUserName.value,
      inputEmail.value,
      inputPass.value,
      inputConfPass.value
    );
  });

if (btnBookResto)
  btnBookResto.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';

    const restoId = e.target.dataset.restoid;
    bookResto(restoId);
  });

if (btnDeleteResto)
  btnDeleteResto.forEach((el) =>
    el.addEventListener('click', (e) => {
      e.preventDefault();

      e.target.textContent = 'Deleting...';

      const restoId = e.target.dataset.restoid;
      deleting('Restaurant', restoId);
    })
  );

if (btnDeleteUser)
  btnDeleteUser.forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.target.textContent = 'Deleting...';

      const userId = e.target.dataset.userid;

      deleting('User', userId);
    })
  );

const alertMessage = document.querySelector('body').dataset.alert;
if (alert) showAlert('success', alertMessage);
