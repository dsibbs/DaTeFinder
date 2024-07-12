/**
 * This file is just a silly example to show everything working in the browser.
 * When you're ready to start on your site, clear the file. Happy hacking!
 **/

import confetti from 'canvas-confetti';

confetti.create(document.getElementById('canvas') as HTMLCanvasElement, {
  resize: true,
  useWorker: true,
})({ particleCount: 200, spread: 200 });

console.log("hi");
document.getElementById('getRestaurantsBtn').addEventListener('click', async () => {
  const location = document.getElementById('locationInput').value;
  const selectedFoodTypes = Array.from(document.querySelectorAll('input[name="foodType"]:checked')).map(checkbox => checkbox.value);

  if (!location) {
    alert('Please enter a location');
    return;
  }

  const response = await fetch('http://localhost:5001/restaurants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      location: location,
      foodTypes: selectedFoodTypes
    })
  });

  const data = await response.json();
  const restaurantList = document.getElementById('restaurantList');
  restaurantList.innerHTML = '';

  if (data.error) {
    restaurantList.innerHTML = `<p>${data.error}</p>`;
  } else {
    data.restaurants.forEach(restaurant => {
      const restaurantDiv = document.createElement('div');
      restaurantDiv.className = 'restaurant';
      restaurantDiv.innerHTML = `
        <h2>${restaurant.name}</h2>
        <p>${restaurant.address}</p>
        ${restaurant.photo_url ? `<img src="${restaurant.photo_url}" alt="${restaurant.name}">` : ''}
      `;
      restaurantList.appendChild(restaurantDiv);
    });
  }
});

