export default function WatchedMovie({ movie, onDeleteWatchedMovie }) {
    function handleDelete() {
        onDeleteWatchedMovie(movie.imdbID);
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
