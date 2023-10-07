'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Derek Lee',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2023-11-29T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US', // de-DE
};

const account2 = {
  owner: 'Mathurin Vibulchai',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2023-11-29T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'THB',
  locale: 'th-TH',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, '0');
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = true) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // At 0s, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease by 1s
    time--;
  };

  // Set time to 5min
  let time = 120;

  // Call timer every 1s
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// Fake always logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, '0');
    // const year = `${now.getFullYear()}`.padStart(2, 0);
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const minute = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minute}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/*
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
console.log(23 === 23.0);
// Base 10 ~ 0-9
// Binary base 2 ~ 0 1
console.log(0.1 + 0.2 === 0.3);

// convert strings to numbers
console.log(Number('23'));
console.log(+'23');

// Use for getting the value of a string
// parsing
console.log(Number.parseInt('30px'));
console.log(Number.parseInt('e30'));

console.log(Number.parseInt('2.5rem'));
console.log(Number.parseFloat('     2.5rem'));
console.log(parseFloat('     2.5rem'));

// Check if value is NaN
// Is NaN
console.log('---is NaN or IS NOT a Number---');
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20x'));
console.log(Number.isNaN(23 / 0));

// Check if value is number
console.log('--is Finite best way check if real number and not a string --');
console.log(Number.isFinite(23));
console.log(Number.isFinite('23'));
console.log(Number.isFinite(+'20X'));
console.log(Number.isFinite(23 / 0));

console.log('---is integer--');
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));

// Square root
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

// Max and Min
console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2));
console.log(Math.max(5, 18, '23px', 11, 2));

console.log(Math.min(5, 18, 23, 11, 2));

console.log(Math.PI * Number.parseFloat('10px') ** 2);

console.log(Math.trunc(Math.random() * 6) + 1);

console.log('--Random integer function--');
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0 to 1 -> 0...(max - min); then add min value(10) -> min...max
console.log(randomInt(10, 20));

// Rounding integers
console.log('---Math round---');
console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log('---Math ciel---');
console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log('---Math floor---');
console.log(Math.floor(23.3));
console.log(Math.floor('23.9'));

console.log('---Math trunc---');
console.log(Math.trunc(23.3));
console.log(Math.trunc(23.9));

console.log(Math.floor(-23.3));
console.log(Math.trunc(-23.3));

// Rounding decimals
console.log('--rounding decimals returns string--');
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log(+(2.345).toFixed(5));

// Remainder -> Modulo
console.log(5 % 2);
console.log(5 / 2); //5 = 2 * 2 + 1

console.log(8 % 3); // = 2
console.log(8 / 3); // 8 = 2 * 3 + 2

console.log('---Odd or Even---');
console.log(6 % 2);
console.log(6 / 2);
console.log(7 % 2);
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(16));
console.log(isEven(111));

// Use when you need something every Nth time
labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});

// Numeric Separators
const diameter = 287_260_000_000; // 287,260,000,000
console.log(diameter);

const priceCents = 345_99;

const transferFee1 = 15_00;
const transferFee2 = 1_500;

const PI = 3.1_415;
console.log(PI);

console.log(Number('230_000')); // Don't use underscore in strings
console.log(parseInt('230_000')); // Don't use underscore in parseInt

// Big Integers
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);

console.log(9547409919007199254740991n);
console.log(BigInt(9547409919));

// Operations
console.log(10000n * 10000n);
console.log(9547409919007199254740991n * 100000n);
// console.log(Math.sqrt(16n));

const huge = 9547409919007199254740991n;
const num = 23;
console.log(huge * BigInt(num));

// Exceptions
console.log(20n > 15);
console.log(20n === 20);
console.log(typeof 20n);
console.log(20n == 20);

console.log(huge + ' is REALLY big!!!');

// Division
console.log(12n / 3n);
console.log(10 / 3);

// Create a date
// const now = new Date();
// console.log(now);

// console.log();
// console.log(new Date('Sep 30 2023 17:08:51'));
// console.log(new Date('Dec 24, 2015'));
// console.log(new Date(account1.movementsDates[0]));
// console.log(new Date(2037, 10, 19, 15, 25, 5));
// console.log(new Date(2037, 10, 1)); // month is 0-based

// console.log(new Date(0));
// console.log(new Date(3 * 24 * 60 * 60 * 1000));

// Working with date methods
const future = new Date(2037, 10, 19, 15, 25);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(2142231900000));
console.log(Date.now());
console.log(new Date(1696069408201));

future.setFullYear(2040);
console.log(future);

const future = new Date(2037, 10, 19, 15, 23);
console.log(Number(future));
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(
  new Date(2037, 3, 4),
  new Date(2037, 3, 14, 10, 8)
);
console.log(days1);

// Formatting numbers new Intl w/ locale ISO
const num = 388485859.23;

const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  // useGrouping: false,
};
console.log('US:    ', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria:   ', new Intl.NumberFormat('ar-SY', options).format(num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
);


// setTimeout
const ingredients = ['ham', 'pineapple', 'mushrooms'];
const pizzaTimer = setTimeout(
  (ing1, ing2, ing3) =>
    console.log(
      `Here is your Hawaiian pizza 🍕🍕🍕 with ${ing1}, ${ing2} and ${ing3}`
    ),
  3000,
  ...ingredients
);
console.log('Waiting...');

if (ingredients.includes('mushrooms')) clearTimeout(pizzaTimer);

// setInterval
// setInterval(function () {
//   const date = new Date();
//   const hour = date.getHours();
//   const minute = date.getMinutes();
//   const sec = date.getSeconds();
//   console.log(`${hour}hr:${minute}min:${sec}s`);
// }, 3000);

// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 3000);
*/
