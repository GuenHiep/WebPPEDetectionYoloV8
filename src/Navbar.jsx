import './styles.css';

export default function Navbar() {
    return (
        <nav className="navbar p-2">
            <h1><a href="/">PPE Detection!</a></h1>
            <ul>
                <li>
                    <a href="/">Home</a>
                </li>
                <li>
                    <a href="/detection">Detection</a>
                </li>
                <li>
                    <a href="/camera">Camera</a>
                </li>
            </ul>
        </nav>
    )
}