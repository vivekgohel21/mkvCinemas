import { useEffect, useState } from "react";
import axios from "axios";
import MovieDetails from "./components/MovieDetails";
import ErrorMessage from "./components/ErrorMessage";
import WatchedMoviesList from "./components/WatchedMoviesList";
import Loader from "./components/Loader";
import NavBar from "./components/NavBar";
import WatchedSummary from "./components/WatchedSummary";
import MovieList from "./components/MovieList";
import Search from "./components/Search";
import Main from "./components/Main";
import Box from "./components/Box";
import NumResults from "./components/NumResults";
import MovieContext from "./MovieContext";
import WatchedMovieContext from "./WatchedMovieContext";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState("");
  const [error, setError] = useState("")
  const [selectedId, setSelectedId] = useState(null)

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
      <MovieContext.Provider
        value={{
          movies: movies,
          onSelectMovie: handleSelectMovie
        }}>

        <NavBar>
          <Search query={query} setQuery={setQuery} />
          <NumResults />
        </NavBar>
        <Main>

          <WatchedMovieContext.Provider value={{
            watched: watched,
            onDeleteWatchedMovie: handleDeleteWatchedMovie
          }}>

            <Box>
              {isLoading && <Loader />}
              {!isLoading && !error && <MovieList />}
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
              <WatchedSummary />
              <WatchedMoviesList />
            </Box>

          </WatchedMovieContext.Provider>

        </Main>

      </MovieContext.Provider>
    </>
  );
}