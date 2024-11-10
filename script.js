// const TMDB_API_KEY = "0807408af560ef83d761f07fcac1dbee";
const TMDB_API_KEY = "d45da6f63f14ae0770d7536c1f757495";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_ACCOUNT_ID = "21614738";

// Elements
const popularMovieGrid = document.getElementById("popular-movie-grid");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const cancelSearchButton = document.getElementById("cancel-search");

// Fetch popular movies on page load
window.addEventListener("DOMContentLoaded", fetchPopularMovies);

// Fetch popular movies from TMDB
async function fetchPopularMovies() {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    displayMovies(data.results, popularMovieGrid);
  } catch (error) {
    console.error("Error fetching popular movies:", error);
  }
}

// Handle search form submit
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    searchMovies(query);
  }
});

// Handle input change to toggle cancel button visibility
searchInput.addEventListener("input", () => {
  if (searchInput.value.trim()) {
    cancelSearchButton.style.display = "inline"; // Show the cancel button when typing
  } else {
    cancelSearchButton.style.display = "none"; // Hide it when the input is empty
  }
});

// Handle cancel button click to reset search input and show popular movies
cancelSearchButton.addEventListener("click", () => {
  searchInput.value = ""; // Clear the input field
  cancelSearchButton.style.display = "none"; // Hide the cancel button
  fetchPopularMovies(); // Display the popular movies again
});

// Search movies from TMDB based on user input
async function searchMovies(query) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}&language=en-US&page=1`
    );
    const data = await response.json();
    displayMovies(data.results, popularMovieGrid);
  } catch (error) {
    console.error("Error searching movies:", error);
  }
}

// Display movies in a grid
async function displayMovies(movies, gridElement) {
  gridElement.innerHTML = ""; // Clear existing content
  if (movies.length === 0) {
    gridElement.innerHTML = "<p>No movies found!</p>"; // Display message if no movies are found
  } else {
    favorites = await getFavorites();
    watchlist = await getWatchlist();
    movies.forEach((movie) => {
      const movieCard = document.createElement('div');
      movieCard.classList.add('movie-card');
      movieCard.setAttribute('data-movie-id', movie.id);
      isInWatchlist = watchlist.includes(movie.id);
      // Check if the movie is in the favorites list
      const isFavorite = favorites.includes(movie.id);

      // Add star icon (filled or outlined) and movie details to the card
      movieCard.innerHTML = `
        <div class="favorite-icon" onclick="toggleFavorite(${movie.id})">
          ${isFavorite ? '⭐' : '☆'}
        </div>
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <h4>${movie.title}</h4>
        <p>Release Date: ${movie.release_date}</p>
        <div class="watchlist-icon" onclick="toggleWatchlist(${movie.id})">
            ${isInWatchlist ? '📌' : '📍'}
        </div>
      `;

      // Append the card to the grid
      gridElement.appendChild(movieCard);
    });
  }
}

// Store favorites in localStorage for simplicity
let favorites = [];
// Toggle movie in/out of favorites
function toggleFavorite(movieId) {
  if (favorites.includes(movieId)) {
    // Remove from favorites if already there
    favorites = favorites.filter(id => id !== movieId);
    removeFromFavoritesTMDB(movieId);
    alert('Removed from Favorites!');
  } else {
    // Add to favorites if not already there
    favorites.push(movieId);
    addToFavoritesTMDB(movieId);
    alert('Added to Favorites!');
  }
  // Re-render the movies to update the star icon status
  fetchPopularMovies();
}
let watchlist = [];
function toggleWatchlist(movieId) {
  if (watchlist.includes(movieId)) {
    // Remove from Watchlist if already there
    watchlist = watchlist.filter(id => id !== movieId);
    removeFromWatchlistTMDB(movieId);
    alert('Removed from Watchlist!');
  } else {
    // Add to Watchlist if not already there
    watchlist.push(movieId);
    addToWatchlistTMDB(movieId);
    alert('Added to Watchlist!');
  }
  fetchPopularMovies();
}
function getRequestToken(){
  request_token = ""
  fetch(`https://api.themoviedb.org/3/authentication/token/new?api_key=${TMDB_API_KEY}`)
    .then(response => response.json())
    .then(data => request_token = data);
  return request_token;
}
function getSessionID(){
  let request_token = getRequestToken();
  let ssid = "";
  fetch(`https://api.themoviedb.org/3/authentication/session/new?api_key=${TMDB_API_KEY}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ request_token: request_token })
})
.then(response => response.json())
.then(data => ssid = data);
return ssid;
}
function addToFavoritesTMDB(movieId) {
  let session_id = getSessionID();
  const url = `https://api.themoviedb.org/3/account/${TMDB_ACCOUNT_ID}/favorite?session_id=${session_id}`;
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNDVkYTZmNjNmMTRhZTA3NzBkNzUzNmMxZjc1NzQ5NSIsIm5iZiI6MTczMTE5MTc3Mi4zMTQwNzcsInN1YiI6IjY3MmI5YzAyNDJiZWM0OTg3NzgwNzRjYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2-4XFBYS13Kdgo5HJ_s_S_7PVt8oyNPQhjsSJYhbQYw'
    },
    body: JSON.stringify({media_type: 'movie', media_id: movieId, favorite: true})
  };
  fetch(url,options )
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert('Movie added to TMDB favorites!');
      } else {
          alert('Failed to add movie to favorites.');
      }
  })
  .catch(error => console.error('Error:', error));
}
function removeFromFavoritesTMDB(movieId) {
  let session_id = getSessionID();
  const url = `https://api.themoviedb.org/3/account/${TMDB_ACCOUNT_ID}/favorite?session_id=${session_id}`;
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNDVkYTZmNjNmMTRhZTA3NzBkNzUzNmMxZjc1NzQ5NSIsIm5iZiI6MTczMTE5MTc3Mi4zMTQwNzcsInN1YiI6IjY3MmI5YzAyNDJiZWM0OTg3NzgwNzRjYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2-4XFBYS13Kdgo5HJ_s_S_7PVt8oyNPQhjsSJYhbQYw'
    },
    body: JSON.stringify({media_type: 'movie', media_id: movieId, favorite: false})
  };
  fetch(url,options )
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert('Movie removed movie from TMDB favorites!');
      } else {
          alert('Failed to remove movie from favorites.');
      }
  })
  .catch(error => console.error('Error:', error));
}
function addToWatchlistTMDB(movieId) {
  let session_id = getSessionID();
  const url = `https://api.themoviedb.org/3/account/${TMDB_ACCOUNT_ID}/watchlist?session_id=${session_id}`;
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNDVkYTZmNjNmMTRhZTA3NzBkNzUzNmMxZjc1NzQ5NSIsIm5iZiI6MTczMTE5MTc3Mi4zMTQwNzcsInN1YiI6IjY3MmI5YzAyNDJiZWM0OTg3NzgwNzRjYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2-4XFBYS13Kdgo5HJ_s_S_7PVt8oyNPQhjsSJYhbQYw'
    },
    body: JSON.stringify({media_type: 'movie', media_id: movieId, watchlist: true})
  };
  
  fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error(err));
}
function removeFromWatchlistTMDB(movieId) {
  let session_id = getSessionID();
  const url = `https://api.themoviedb.org/3/account/${TMDB_ACCOUNT_ID}//watchlist?session_id=${session_id}`;
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNDVkYTZmNjNmMTRhZTA3NzBkNzUzNmMxZjc1NzQ5NSIsIm5iZiI6MTczMTE5MTc3Mi4zMTQwNzcsInN1YiI6IjY3MmI5YzAyNDJiZWM0OTg3NzgwNzRjYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2-4XFBYS13Kdgo5HJ_s_S_7PVt8oyNPQhjsSJYhbQYw'
    },
    body: JSON.stringify({media_type: 'movie', media_id: movieId, watchlist: false})
  };
  
  fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error(err));
}
// Get favorites
async function getFavorites() {
  const url = `https://api.themoviedb.org/3/account/${TMDB_ACCOUNT_ID}/favorite/movies`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNDVkYTZmNjNmMTRhZTA3NzBkNzUzNmMxZjc1NzQ5NSIsIm5iZiI6MTczMTE5MTc3Mi4zMTQwNzcsInN1YiI6IjY3MmI5YzAyNDJiZWM0OTg3NzgwNzRjYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2-4XFBYS13Kdgo5HJ_s_S_7PVt8oyNPQhjsSJYhbQYw'
    }
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    favs = [];
    data.results.forEach((fav)=>favs.push(fav.id));
    return favs;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
  }
  return [];
}
async function getWatchlist() {
  const url = `https://api.themoviedb.org/3/account/${TMDB_ACCOUNT_ID}/watchlist/movies`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNDVkYTZmNjNmMTRhZTA3NzBkNzUzNmMxZjc1NzQ5NSIsIm5iZiI6MTczMTE5MTc3Mi4zMTQwNzcsInN1YiI6IjY3MmI5YzAyNDJiZWM0OTg3NzgwNzRjYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2-4XFBYS13Kdgo5HJ_s_S_7PVt8oyNPQhjsSJYhbQYw'
    }
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data.results);
    favs = [];
    data.results.forEach((fav)=>favs.push(fav.id));
    return favs;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
  }
  return [];
}
