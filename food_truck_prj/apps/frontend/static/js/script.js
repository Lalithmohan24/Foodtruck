var selected_food = []

function getCSRFToken() {
    // Retrieve the CSRF token from the cookie
    var csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        .split('=')[1];

    return csrfToken;
}
function resetResults() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('pagination').innerHTML = '';

    document.getElementById('facilityType').value = 'Truck';
    document.getElementById('radius').value = '1';
    document.getElementById('location').value = '';
}

function searchFoodTrucks() {
    // Your search function logic goes here...
    var facilityType = document.getElementById('facilityType').value;
    var radius = document.getElementById('radius').value;
    var location = document.getElementById('location').value;

    // Convert the location address to lat, long
    convertAddress(location)
        .then(convertedLocation => {
            if (selected_food.length > 0) {
                // Make a GET request to your API with the converted location
                var apiUrl = '/api/foodtruck/search/?facility_type=' + facilityType + '&radius=' + radius + '&location=' + convertedLocation + '&favourite=' + selected_food;
            }
            else {
                var apiUrl = '/api/foodtruck/search/?facility_type=' + facilityType + '&radius=' + radius + '&location=' + convertedLocation;
            }
            fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + token,
                    'X-CSRFToken': getCSRFToken(),
                },
            })
                .then(response => response.json())
                .then(data => {
                    displayResults(data);
                })
                .catch(error => {
                    console.error('Error fetching food trucks:', error);
                    alert('Error fetching food trucks. Please try again.');
                });
        })
        .catch(error => {
            console.error('Error converting address:', error);
            alert('Error converting address. Please try again.');
        });

}        

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            // getAddressFromCoordinates(37.760086931987, -122.418806481101);
            getAddressFromCoordinates(latitude, longitude);
            // document.getElementById('location').value = latitude + ', ' + longitude;
        }, function(error) {
            console.error('Error getting current location:', error.message);
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}


function getAddressFromCoordinates(latitude, longitude) {
    // Replace 'YOUR_OPENCAGE_API_KEY' with your OpenCage API key
    var apiKey = '16c4959b946b4c2289a05ebdf50db5ab';

    // OpenCage Geocoding API endpoint
    var apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

    // Make a request to the OpenCage Geocoding API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                var address = data.results[0].formatted;
                document.getElementById('location').value = address;
            } else {
                console.error('Unable to get address for the current location.');
            }
        })
        .catch(error => {
            console.error('Error fetching address:', error);
        });
}

function displayResults(results) {
    var resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<h2>Results:</h2>';

    // Display records
    results.result.data.forEach(function (truck) {
        resultDiv.innerHTML += '<div class="result-card">' +
                               '<p><strong>Location:</strong> ' + truck.LocationDescription + '</p>' +
                               '<p><strong>Address:</strong> ' + truck.Address + '</p>' +
                               '<p><strong>Food Items:</strong> ' + truck.FoodItems + '</p>' +
                               '<p><strong>Approved:</strong> ' + formatDate(truck.Approved) + '</p>' +
                               '<p><strong>Expiration Date:</strong> ' + formatDate(truck.ExpirationDate) + '</p>' +
                               '</div>';
    });

    // Display pagination links
    var pagination = results.result.pagination;
    var paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    if (pagination) {
        if (pagination.previous) {
            paginationDiv.innerHTML += '<button class="pagination-button" onclick="loadPage(\'' + pagination.previous + '\')">Previous</button>';
        }

        if (pagination.next) {
            paginationDiv.innerHTML += '<button class="pagination-button" onclick="loadPage(\'' + pagination.next + '\')">Next</button>';
        }
    }
}

function convertAddress(location) {
    // Replace 'YOUR_API_KEY' with your actual OpenCage API key
    var apiKey = '16c4959b946b4c2289a05ebdf50db5ab';

    // OpenCage Geocoding API endpoint
    var apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}`;

    // Make a request to the OpenCage Geocoding API
    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                var firstResult = data.results[0];
                var latitude = firstResult.geometry.lat;
                var longitude = firstResult.geometry.lng;
                location = `${latitude},${longitude}`;
                return location
            } else {
                return null;
            }
        })
        .catch(error => {
            console.error('Error converting address:', error);
            throw error;
        });
}        
function loadPage(url) {
    // Make an AJAX request to load the next/previous page
    fetch(url, {
    	method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
            'X-CSRFToken': getCSRFToken(),
        },    	
    })
        .then(response => response.json())
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error('Error fetching food trucks:', error);
            alert('Error fetching food trucks. Please try again.');
        });

}

function formatDate(dateString) {
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function logout() {
    localStorage.removeItem('auth_token');
    window.location.href = '/'
}

document.addEventListener('DOMContentLoaded', function() {
    // Call your function here
    get_fovourite_food();

    // You can also call other functions or perform additional actions after loading
    // For example, you might want to initialize other parts of your page or application.
});

function addFavoriteFood(){

        var favorite_food = document.getElementById('newFavoriteFood').value;

        document.getElementById('newFavoriteFood').innerHTML = '';

        token = localStorage.getItem('auth_token');

        // Make an AJAX request for login
        fetch('/api/foodtruck/favorite_food/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token,
                'X-CSRFToken': getCSRFToken(),

            },
            body: JSON.stringify({
                food_name: favorite_food
            }),
        })
        .then(response => response.json())
        .then(data => {
            get_fovourite_food();
        })
        .catch(error => {
            console.error('Error during login:', error);
            // Handle AJAX request error
        });

}

function get_fovourite_food(){

    selected_food = []

    token = localStorage.getItem('auth_token');

    // Make an AJAX request for login
    fetch('/api/foodtruck/favorite_food/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
            'X-CSRFToken': getCSRFToken(),
        },
    })
    .then(response => response.json())
    .then(data => {
        // favourite_food = data.result;
        updateFavouriteFoodList(data.result)
    })
    .catch(error => {
        console.error('Error during login:', error);
        // Handle AJAX request error
    });
}

// function updateFavouriteFoodList(favoriteFoods){
//     var favoriteFoodList = document.getElementById('favoriteFoodList');
//     favoriteFoodList.innerHTML = ''; // Clear the existing list
    
//     // Update the HTML content with the new list of favorite foods
//     favoriteFoods.forEach(function(food) {
//         var tag = document.createElement('span');
//         var selected_food = []
//         tag.className = 'favorite-food-tag';
//         tag.textContent = food.food_name;
    
//         // Add a click event listener to remove the tag when clicked
//         tag.addEventListener('click', function() {
//             removeFavoriteFood(food.food_name, selected_food);
//         });
    
//         favoriteFoodList.appendChild(tag);
//     });    
// }


// function removeFavoriteFood(food_name, selected_food) {
//     selected_food.appendChild(food_name);
// }

function updateFavouriteFoodList(favoriteFoods){
    var favoriteFoodList = document.getElementById('favoriteFoodList');
    favoriteFoodList.innerHTML = ''; // Clear the existing list
    
    // Update the HTML content with the new list of favorite foods
    favoriteFoods.forEach(function(food) {
        var tag = document.createElement('span');
        tag.className = 'favorite-food-tag';
        tag.textContent = food.food_name;
        tag.id = 'tag_' + food.id;

        // Add a click event listener to remove the tag when clicked
        tag.addEventListener('click', function() {
            removeFavoriteFood(tag.id, food.food_name, selected_food);

        });
    
        favoriteFoodList.appendChild(tag);
    });    
}

function removeFavoriteFood(tagid, food_name, selected_food) {
    var tag = document.getElementById(tagid);

    if (selected_food.includes(food_name)){
        var index = selected_food.indexOf(food_name);
        selected_food.splice(index, 1);
        // Change the color back to the default
        tag.style.backgroundColor = 'grey';
        tag.style.color = '';

    } else {
        selected_food.push(food_name);
        // Change the color back to the default
        tag.style.backgroundColor = 'red';
        tag.style.color = 'white';

    }
}
