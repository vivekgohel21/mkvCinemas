
export default function WatchedSummary({ watched }) {
    const average = (arr) => {
        return arr.reduce((acc, cur) => acc + cur, 0) / arr.length;
    };
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
                    <span>{avgImdbRating && '0'}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating && '0'}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime && '0'}</span>
                </p>
            </div>
        </div>
    );
}
