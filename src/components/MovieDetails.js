import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import axios from "axios";
import Loader from "./Loader";

export default function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
    const watchedUserRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating;
    let {
        Title: title,
        Year: year,
        Genre: genre,
        Runtime: runtime,
        Poster: poster,
        Plot: plot, imdbRating,
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
            userRating: Number(userRating),
            imdbRating: Number(imdbRating)
        };
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
        };
    },
        [selectedId]
    );


    useEffect(
        function () {
            if (!title) return;
            document.title = `${title}`;

            return function () {
                document.title = 'mkvCinemas';
            };

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
                        {ratings?.map((rating) => <>
                            <div className="rating-container">
                                <div className="rating-text">
                                    <img
                                        className="rating-img"
                                        src={process.env.PUBLIC_URL + '/' + rating.Source + '.png'}
                                        alt={rating.value}
                                        style={{ width: 30 }}
                                    />
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
                                    )}
                                </>
                            ) : (
                                <p>You rated movie {watchedUserRating}/10.</p>
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
