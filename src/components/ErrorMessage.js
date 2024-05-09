export default function ErrorMessage({ error }) {
    return (
        <p className="error">
            <span>⛔ {error}</span>
        </p>
    );
}
