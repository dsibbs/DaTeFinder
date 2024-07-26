import confetti from 'canvas-confetti';
import Swiper from 'swiper/bundle';

const confettiCanvas = document.getElementById('canvas');
const confettiInstance = confetti.create(confettiCanvas, {
  resize: true,
  useWorker: true,
});

const escapeHtml = (unsafe) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

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
//Event listener for "Plan Date" button
document.getElementById('planDateBtn').addEventListener('click', () => {
  const townName = escapeHtml(document.getElementById('locationInput').value);
  if (townName) {
    const optSection = document.getElementById('optionSection');
    optSection.style.display = 'flex';
    setTimeout(() => {
      optSection.classList.add('show');
    }, 10);

  } else {
    alert('Please enter a town name.');
  }
});

// Event listener for the "Find Places" button
document.getElementById('FindPlacesBtn').addEventListener('click', () => {
  const townName = escapeHtml(document.getElementById('locationInput').value);
  if (townName) {
     let foodCheck = document.getElementById('restaurants')
     let activityCheck = document.getElementById('activities')
     if (foodCheck.checked && activityCheck.checked){
        const foodFilters = document.getElementById('foodFilters');
        const activityFilters = document.getElementById('activityFilters');
        foodFilters.style.display = 'flex';
        activityFilters.style.display = 'flex';
        setTimeout(() => {
        foodFilters.classList.add('show');
        activityFilters.classList.add('show');
        }, 10);
    }
    else if(foodCheck.checked){
        const filters = document.getElementById('foodFilters');
        filters.style.display = 'flex';
        setTimeout(() => {
        filters.classList.add('show');
        }, 10);
}else{
    const filters = document.getElementById('activityFilters');
        filters.style.display = 'flex';
        setTimeout(() => {
        filters.classList.add('show');
        }, 10);
}
  } else {
    alert('Please enter a town name.');
  }
});

document.getElementById('getRestaurantsBtn').addEventListener('click', () => {
  const townName = escapeHtml(document.getElementById('locationInput').value);
  const selectedFoodTypes = Array.from(document.querySelectorAll('input[name="foodType"]:checked')).map(checkbox => checkbox.value);
  if (townName) {
    fetchResults('restaurants', { location: townName, foodTypes: selectedFoodTypes }).then(data => {
      displayResults(data.restaurants.slice(0, 5));
      document.getElementById('results').style.display = 'block';  // Show the results section
    });
  } else {
    document.getElementById('resultList').innerHTML = 'Please enter a town name.';
  }
});

document.getElementById('getActivitiesBtn').addEventListener('click', () => {
  const townName = escapeHtml(document.getElementById('locationInput').value);
  const selectedActivityTypes = Array.from(document.querySelectorAll('input[name="activityType"]:checked')).map(checkbox => checkbox.value);
  if (townName) {
    fetchResults('activities', { location: townName, activityTypes: selectedActivityTypes }).then(data => {
      displayResults(data.activities.slice(0, 5));
      document.getElementById('results').style.display = 'block';  // Show the results section
    });
  } else {
    document.getElementById('resultList').innerHTML = 'Please enter a town name.';
  }
});

document.getElementById('locationInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const townName = escapeHtml(e.target.value);
    if (townName) {
      document.getElementById('filters').style.display = 'block';
    } else {
      alert('Please enter a town name.');
    }
  }
});


