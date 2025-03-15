import './styles.css';

export default function Navbar() {
    return (
        <nav className="navbar">
            <h1>PPE Detection!</h1>
            <ul>
                <li>
                    <a href="/">Home</a>
                </li>
                <li>
                    <a href="/detection">Detection</a>
                </li>
            </ul>
        </nav>
    )
}