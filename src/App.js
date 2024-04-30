import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import axios from "axios";


const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState("");
  const [error, setError] = useState("")
  const [selectedId, setSelectedId] = useState(null)
  // const searchQuery = "the wolf of"

  function handleSelectMovie(id) {
    setSelectedId(id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(watchedMovie) {
    setWatched([...watched, watchedMovie]);
  }
  function handleDeleteWatchedMovie(id) {
    setWatched(watched.filter((movie) => movie.imdbID !== id));
  }
  useEffect(() => {
    const controller = new AbortController();
    async function fetchMovies() {

      try {
        setIsLoading(true);
        const res = await axios.get(`https://www.omdbapi.com/?apikey=661b087d&s=${query}`, {
          signal: controller.signal,
        });
        const data = await res.data;
        if (data.Response === "False") throw new Error(data.Error);
        console.log(data.Search);
        setMovies(data.Search);
        setIsLoading(false);
        setError("");
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request aborted:', error.message);
        } else {
          console.error(error.message);
          setMovies([]);
          if (error.message !== "canceled") {
            setError(error.message);
          }
          setError("");
        }
        setIsLoading(false);
      }
    }
    if (query.length < 4) {
      setMovies([]);
      setError("");
      return;
    }
    fetchMovies();
    return function () {
      controller.abort();
    }
  },
    [query]
  );
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie} />}
          {error && <ErrorMessage error={error} />}
        </Box>
        {selectedId &&
          <Box>
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          </Box>
        }
        <Box>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} onDeleteWatchedMovie={handleDeleteWatchedMovie} />
        </Box>

      </Main>
    </>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  let {
    Title: title,
    Year: year,
    Genre: genre,
    Runtime: runtime,
    Poster: poster,
    Plot: plot,
    imdbRating,
    Country: country,
    Actors: actors,
    Director: director,
    Released: releaseDate,
    Ratings: ratings,
    Language: language
  } = movie;
  genre = genre?.replaceAll(", ", "/");
  runtime = convertToHoursAndMinutes(runtime);


  function convertToHoursAndMinutes(runtime) {
    const minutes = parseInt(runtime);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    let result = "";

    if (hours > 0) {
      result += `${hours}h `;
    }

    if (remainingMinutes > 0) {
      result += `${remainingMinutes}m`;
    }

    return result.trim();
  }

  function handleAdd() {
    const watchedMovie = {
      title,
      poster,
      runtime,
      imdbID: selectedId,
      userRating: userRating || null,
      imdbRating
    }
    onAddWatched(watchedMovie);
  }

  useEffect(() => {
    const { CancelToken } = axios;
    const source = CancelToken.source();
    async function getMovieDetails() {
      setMovie({});
      setIsLoading(true);

      try {
        const res = await axios.get(`https://www.omdbapi.com/?apikey=661b087d&i=${selectedId}`, {
          cancelToken: source.token
        });

        const data = res.data;

        if (data.Response === "False") {
          throw new Error(data.Error);
        }

        setMovie(data);
        setIsLoading(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled:', error.message);
        } else {
          console.error(error);
        }
      }
    }
    getMovieDetails();

    return function () {
      source.cancel("canceled");
    }
  },
    [selectedId]
  );


  useEffect(
    function () {
      if (!title) return;
      document.title = `${title}`;

      return function () {
        document.title = 'mkvCinemas';
      }

    }, [title]);
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              <i className="fa-solid fa-xmark" />
            </button>
            <img src={poster} alt={title} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>{year} ‧ {genre} ‧ {runtime}</p>
              <p>{actors}</p>
            </div>
          </header>
          <section>
            {ratings?.map((rating) =>
              <>
                <div className="rating-container">
                  <div className="rating-text">
                    <img className="rating-img" src={process.env.PUBLIC_URL + '/' + rating.Source + '.png'} alt={rating.value} style={{ width: 30 }} />
                    <span>{rating.Source === "Internet Movie Database" ? "IMDb" : rating.Source}</span>
                  </div>
                  <div className="rating-value">{rating.Value}</div>
                </div>
              </>
            )}
            <div className="rating">

              {!isWatched ? (
                <>
                  <StarRating maxRating={10} size={24} onSetRating={setUserRating} />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      <i className="fa-solid fa-plus" /> Add to list
                    </button>
                  )
                  }
                </>
              ) : (
                <p>You rated movie {userRating}/10.</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <span>
              <b>Realease date: </b>{releaseDate} ({country})
            </span>
            <span>
              <b>Director: </b>{director}
            </span>
            <span>
              <b>Language: </b>{language}
            </span>
          </section>
        </>
      )}
    </div>
  );
}

function ErrorMessage({ error }) {
  return (
    <p className="error">
      <span>⛔ {error}</span>
    </p>
  );
}

function NavBar({ children }) {

  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Logo" />
    </div>
  );
}

function Search({ query, setQuery }) {

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)} />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return (
    <main className="main">
      {children}
    </main>
  );
}

function Box({ children }) {
  // const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      {/* <Button isOpen={isOpen} setIsOpen={setIsOpen} /> */}
      {/* {isOpen && children} */}
      {children}
    </div>
  );
}

function Loader() {
  return (
    <div className="apple-loading-container">
      {/* {loading && <div className="apple-spinner"></div>}
      {!loading && <div>Content loaded!</div>} */}
      <div className="apple-spinner"></div>
    </div>
  );

}

function MovieList({ movies, onSelectMovie }) {

  return (
    <ul className="list list-movies">
      {movies?.map((movie) =>
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      )}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating)).toFixed(1);
  const avgUserRating = average(watched.map((movie) => movie.userRating)).toFixed(1);
  const avgRuntime = averageRuntime(watched);
  function averageRuntime(movies) {
    const totalMinutes = movies.map(movie => {
      const parts = movie.runtime.split(" ");
      let hours = 0;
      let minutes = 0;

      for (let part of parts) {
        if (part.includes("h")) {
          hours = parseInt(part);
        } else if (part.includes("m")) {
          minutes = parseInt(part);
        }
      }

      return hours * 60 + minutes;
    }).reduce((total, current) => total + current, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let result = "";

    if (hours > 0) {
      result += `${hours}h `;
    }

    if (minutes > 0) {
      result += `${minutes}m`;
    }
    return result;
  }
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime}</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatchedMovie }) {

  return (
    <ul className="list">
      {watched.map((movie) => <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatchedMovie={onDeleteWatchedMovie} />)}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatchedMovie }) {
  function handleDelete() {
    onDeleteWatchedMovie(movie.imdbID)
  }
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>

      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime}</span>
        </p>
      </div>
      <button className="btn-delete" onClick={handleDelete}>
        <i className="fa-solid fa-trash" />
      </button>
    </li>
  );
}

// function Button({ isOpen, setIsOpen }) {
//   return (
//     <button
//       className="btn-toggle"
//       onClick={() => setIsOpen((open) => !open)}
//     >
//       {isOpen ? (
//         <i className="fa-solid fa-minus"></i>
//       ) : (
//         <i className="fa-solid fa-plus"></i>
//       )}
//     </button>
//   );
// }