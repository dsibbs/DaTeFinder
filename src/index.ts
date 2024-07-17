import confetti from 'canvas-confetti';
import Swiper from 'swiper/bundle';

const confettiCanvas = document.getElementById('canvas');
const confettiInstance = confetti.create(confettiCanvas, {
  resize: true,
  useWorker: true,
});

function initializeSwiper() {
  new Swiper('.swiper-container', {
    loop: true,
    slidesPerView: 3,
    spaceBetween: 300,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
}

function fetchResults(endpoint, body) {
  return fetch(`http://localhost:5001/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(response => response.json());
}

function displayResults(results) {
  const resultList = document.getElementById('resultList');
  resultList.innerHTML = '';

  if (results && results.length > 0) {
    results.forEach(result => {
      const div = document.createElement('div');
      div.className = 'swiper-slide';
      div.innerHTML = `
        <div class="result-card">
          <img src="${result.photo_url}" alt="${result.name}">
          <div class="result-card-content">
            <h3>${result.name}</h3>
            <p>Rating: ${result.rating}</p>
            <p>Open Now: ${result.open}</p>
            <p>${result.address}</p>
          </div>
        </div>`;
      resultList.appendChild(div);
    });
    initializeSwiper();
  } else {
    resultList.innerHTML = 'No results found.';
  }
}

document.getElementById('getRestaurantsBtn').addEventListener('click', () => {
  const townName = document.getElementById('locationInput').value;
  const selectedFoodTypes = Array.from(document.querySelectorAll('input[name="foodType"]:checked')).map(checkbox => checkbox.value);
  if (townName) {
    fetchResults('restaurants', { location: townName, foodTypes: selectedFoodTypes }).then(data => {
      displayResults(data.restaurants.slice(0, 5));
    });
  } else {
    document.getElementById('resultList').innerHTML = 'Please enter a town name.';
  }
});

document.getElementById('getActivitiesBtn').addEventListener('click', () => {
  const townName = document.getElementById('locationInput').value;
  const selectedActivityTypes = Array.from(document.querySelectorAll('input[name="activityType"]:checked')).map(checkbox => checkbox.value);
  if (townName) {
    fetchResults('activities', { location: townName, activityTypes: selectedActivityTypes }).then(data => {
      displayResults(data.activities.slice(0, 5));
    });
  } else {
    document.getElementById('resultList').innerHTML = 'Please enter a town name.';
  }
});

document.getElementById('locationInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const selectedFoodTypes = Array.from(document.querySelectorAll('input[name="foodType"]:checked')).map(checkbox => checkbox.value);
    fetchResults('restaurants', { location: e.target.value, foodTypes: selectedFoodTypes }).then(data => {
      displayResults(data.restaurants.slice(0, 5));
    });
  }
});

document.getElementById('surpriseMeBtn').addEventListener('click', () => {
  const townName = document.getElementById('locationInput').value;
  const foodTypes = ['chinese', 'italian', 'mexican', 'japanese', 'jamaican', 'indian', 'mediterranean'];
  const activityTypes = ['bowling', 'mini_golf', 'movie', 'museum'];

  const selectedFoodTypes = [foodTypes[Math.floor(Math.random() * foodTypes.length)]];
  const selectedActivityTypes = [activityTypes[Math.floor(Math.random() * activityTypes.length)]];

  if (townName) {
    const isRestaurant = Math.random() < 0.5;

    const fetchPromise = isRestaurant
      ? fetchResults('restaurants', { location: townName, foodTypes: selectedFoodTypes })
      : fetchResults('activities', { location: townName, activityTypes: selectedActivityTypes });

    fetchPromise.then(data => {
      const result = isRestaurant ? data.restaurants[0] : data.activities[0];
      displayResults([result]);
    });

    confettiInstance({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  } else {
    document.getElementById('resultList').innerHTML = 'Please enter a town name.';
  }
});
