import { useContext } from "react";
import Movie from "./Movie";
import MovieContext from "../MovieContext";

export default function MovieList() {
    const { movies, onSelectMovie } = useContext(MovieContext);
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
            )}
        </ul>
    );
}
