
export default function Logo() {
    return (
        <div className="logo">
            <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Logo" />
        </div>
    );
}
