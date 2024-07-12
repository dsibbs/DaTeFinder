import confetti from 'canvas-confetti';

confetti.create(document.getElementById('canvas') as HTMLCanvasElement, {
  resize: true,
  useWorker: true,
})({ particleCount: 200, spread: 200 });

//console.log("hi");
/*document.getElementById('getRestaurantsBtn').addEventListener('click', () => {
        const townName = document.getElementById('locationInput').value;
        if (townName) {
          fetch(`http://localhost:5001/restaurants`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ location: townName }),
          })
          .then(response => response.json())
          .then(data => {
            const restaurantList = document.getElementById('restaurantList');
            restaurantList.innerHTML = '';
            if (data.restaurants && data.restaurants.length > 0) {
              data.restaurants.forEach(restaurant => {
                const div = document.createElement('div');
                div.className = 'restaurant';
                div.innerHTML = `
                  <h3>${restaurant.name}</h3>
                  <img src="${restaurant.photo_url}" alt="${restaurant.name}">
                  <p>${restaurant.address}</p>`;
                restaurantList.appendChild(div);
              });
            } else {
              restaurantList.innerHTML = 'No restaurants found.';
            }
          })
          .catch(error => {
            console.error('Error:', error);
            document.getElementById('restaurantList').innerHTML = "An error occurred.";
          });
        } else {
          document.getElementById('restaurantList').innerHTML = "Please enter a town name.";
        }
      });
*/

function fetchRestaurants() {
  const townName = document.getElementById('locationInput').value;
  if (townName) {
    fetch(`http://localhost:5001/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location: townName }),
    })
    .then(response => response.json())
    .then(data => {
      const restaurantList = document.getElementById('restaurantList');
      restaurantList.innerHTML = '';
      if (data.restaurants && data.restaurants.length > 0) {
        data.restaurants.forEach(restaurant => {
          const div = document.createElement('div');
          div.className = 'restaurant';
          div.innerHTML = `
            <h3>${restaurant.name}</h3>
            <img src="${restaurant.photo_url}" alt="${restaurant.name}">
            <p>${restaurant.address}</p>`;
          restaurantList.appendChild(div);
        });
      } else {
        restaurantList.innerHTML = 'No restaurants found.';
      }
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('restaurantList').innerHTML = "An error occurred.";
    });
  } else {
    document.getElementById('restaurantList').innerHTML = "Please enter a town name.";
  }
}

// Event listener for the button click
document.getElementById('getRestaurantsBtn').addEventListener('click', fetchRestaurants);

// Event listener for the Enter key press in the input field
document.getElementById('locationInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    fetchRestaurants();
  }
});
