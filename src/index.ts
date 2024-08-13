import confetti from 'canvas-confetti';
import Swiper from 'swiper/bundle';

const confettiCanvas = document.getElementById('canvas');
const confettiInstance = confetti.create(confettiCanvas, {
  resize: true,
  useWorker: true,
});

const escapeHtml = (unsafe) => {
  return unsafe.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initializeSwiper(containerClass) {
  if (containerClass === '.food-swiper') {
    new Swiper(containerClass, {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 30,
      pagination: {
        el: '.swiper-pagination-food',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next-food',
        prevEl: '.swiper-button-prev-food',
      },
    });
  } else {
    new Swiper(containerClass, {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 30,
      pagination: {
        el: '.swiper-pagination-activity',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next-activity',
        prevEl: '.swiper-button-prev-activity',
      },
    });
  }
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
function displayResults(results, containerId) {
  const resultList = document.getElementById(containerId);
  const swiperContainer = resultList.closest('.swiper-container');
  resultList.innerHTML = '';

  if (results && results.length > 0) {
    results.forEach(result => {
      const div = document.createElement('div');
      div.className = 'swiper-slide';

      // Create Google Maps link for the address
      const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(result.address)}`;

      // Check if the restaurant has a website
      const restaurantNameLink = result.website 
        ? `<a href="${result.website}" target="_blank">${result.name}</a>` 
        : result.name;

      div.innerHTML = `
        <div class="result-card">
          <img src="${result.photo_url}" alt="${result.name}">
          <div class="result-card-content">
            <h3>${restaurantNameLink}</h3>
            <p>Rating: ${result.rating}</p>
            <p>Open Now: ${result.open}</p>
            <p><a href="${googleMapsLink}" target="_blank">${result.address}</a></p>
          </div>
        </div>`;
      resultList.appendChild(div);
    });

    // Add the 'has-items' class to the Swiper container
    swiperContainer.classList.add('has-items');

    initializeSwiper(containerId === 'foodResultList' ? '.food-swiper' : '.activity-swiper');
  } else {
    resultList.innerHTML = 'No results found.';
    
    // Remove the 'has-items' class from the Swiper container
    swiperContainer.classList.remove('has-items');
  }
}



// Event listener for "Plan Date" button
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
}else if(activityCheck.checked){
    const filters = document.getElementById('activityFilters');
        filters.style.display = 'flex';
        setTimeout(() => {
        filters.classList.add('show');
        }, 10);
}else{
     alert('Please select date type/types.');
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
      displayResults(data.restaurants.slice(0, 5), 'foodResultList');
      document.querySelector('.food-results').style.display = 'block';

    });
  } else {
    document.getElementById('foodResultList').innerHTML = 'Please enter a town name.';
  }
});

document.getElementById('getActivitiesBtn').addEventListener('click', () => {
  const townName = escapeHtml(document.getElementById('locationInput').value);
  const selectedActivityTypes = Array.from(document.querySelectorAll('input[name="activityType"]:checked')).map(checkbox => checkbox.value);
  if (townName) {
    fetchResults('activities', { location: townName, activityTypes: selectedActivityTypes }).then(data => {
      displayResults(data.activities, 'activityResultList');
      document.querySelector('.activity-results').style.display = 'block';
    });
  } else {
    document.getElementById('activityResultList').innerHTML = 'Please enter a town name.';
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
