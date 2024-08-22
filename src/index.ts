import Swiper from 'swiper/bundle';

// Escape HTML to prevent XSS attacks
const escapeHtml = (unsafe) => {
  return unsafe.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Initialize Swiper
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

// Fetch results from the server
function fetchResults(endpoint, body) {
  return fetch(`http://localhost:5001/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(response => response.json());
}

// Display results in the Swiper containers
function displayResults(results, containerId) {
  const resultList = document.getElementById(containerId);
  const swiperContainer = resultList.closest('.swiper-container');
  resultList.innerHTML = '';

  if (results && results.length > 0) {
    results.forEach(result => {
      const div = document.createElement('div');
      div.className = 'swiper-slide';

      const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(result.address)}`;
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

    swiperContainer.classList.add('has-items');
    initializeSwiper(containerId === 'foodResultList' ? '.food-swiper' : '.activity-swiper');
  } else {
    resultList.innerHTML = 'No results found.';
    swiperContainer.classList.remove('has-items');
  }
}

// Function to update filter visibility and clear results
function updateFilters() {
  const foodCheck = document.getElementById('restaurants').checked;
  const activityCheck = document.getElementById('activities').checked;
  const foodFilters = document.getElementById('foodFilters');
  const activityFilters = document.getElementById('activityFilters');
  const foodResults = document.querySelector('.food-results');
  const activityResults = document.querySelector('.activity-results');

  // Update filter visibility
  if (foodCheck && activityCheck) {
    foodFilters.style.display = 'flex';
    activityFilters.style.display = 'flex';
    setTimeout(() => {
      foodFilters.classList.add('show');
      activityFilters.classList.add('show');
    }, 10);
  } else if (foodCheck) {
    foodFilters.style.display = 'flex';
    setTimeout(() => {
      foodFilters.classList.add('show');
    }, 10);
    activityFilters.style.display = 'none';
    activityFilters.classList.remove('show');
  } else if (activityCheck) {
    activityFilters.style.display = 'flex';
    setTimeout(() => {
      activityFilters.classList.add('show');
    }, 10);
    foodFilters.style.display = 'none';
    foodFilters.classList.remove('show');
  } else {
    foodFilters.style.display = 'none';
    foodFilters.classList.remove('show');
    activityFilters.style.display = 'none';
    activityFilters.classList.remove('show');
  }

  // Clear results if no checkboxes are selected
  if (!foodCheck) {
    document.getElementById('foodResultList').innerHTML = '';
    foodResults.style.display = 'none';
  }

  if (!activityCheck) {
    document.getElementById('activityResultList').innerHTML = '';
    activityResults.style.display = 'none';
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
    updateFilters(); // Update filters based on checkbox states
  } else {
    alert('Please enter a town name.');
  }
});

// Event listener for the "Get Restaurants" button
document.getElementById('getRestaurantsBtn').addEventListener('click', () => {
  const townName = escapeHtml(document.getElementById('locationInput').value);
  const selectedFoodTypes = Array.from(document.querySelectorAll('input[name="foodType"]:checked')).map(checkbox => checkbox.value);
  if (townName) {
    if (selectedFoodTypes.length > 0) {
      fetchResults('restaurants', { location: townName, foodTypes: selectedFoodTypes }).then(data => {
        displayResults(data.restaurants.slice(0, 5), 'foodResultList');
        document.querySelector('.food-results').style.display = 'block';
      });
    } else {
      alert('Please select food type(s).');
    }
  } else {
    alert('Please enter a town name.');
  }
});

// Event listener for the "Get Activities" button
document.getElementById('getActivitiesBtn').addEventListener('click', () => {
  const townName = escapeHtml(document.getElementById('locationInput').value);
  const selectedActivityTypes = Array.from(document.querySelectorAll('input[name="activityType"]:checked')).map(checkbox => checkbox.value);
  if (townName) {
    if (selectedActivityTypes.length > 0) {
      fetchResults('activities', { location: townName, activityTypes: selectedActivityTypes }).then(data => {
        displayResults(data.activities, 'activityResultList');
        document.querySelector('.activity-results').style.display = 'block';
      });
    } else {
      alert('Please select activity type(s).');
    }
  } else {
    alert('Please enter a town name.');
  }
});

// Event listener for location input keypress (Enter key)
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

// Event listener for checkbox changes
document.querySelectorAll('input[name="foodType"], input[name="activityType"]').forEach(checkbox => {
  checkbox.addEventListener('change', updateFilters);
});
