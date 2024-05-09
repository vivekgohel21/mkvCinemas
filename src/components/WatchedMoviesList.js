import { useContext } from "react";
import WatchedMovie from "./WatchedMovie";
import WatchedMovieContext from "../WatchedMovieContext";

export default function WatchedMoviesList() {
    const { watched, onDeleteWatchedMovie } = useContext(WatchedMovieContext);
    return (
        <ul className="list">
            {watched.map((movie) => <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatchedMovie={onDeleteWatchedMovie} />)}
        </ul>
    );
}
