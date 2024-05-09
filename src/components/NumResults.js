import { useContext } from "react";
import MovieContext from "../MovieContext";

export default function NumResults() {
    const { movies } = useContext(MovieContext);
    return (
        <p className="num-results">
            Found <strong>{movies?.length}</strong> results
        </p>
    );
}
