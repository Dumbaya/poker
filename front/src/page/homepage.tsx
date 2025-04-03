import { useNavigate } from "react-router-dom";

function Homepage() {
    const navigate = useNavigate();

    return(
        <>
            <div>
                <h1>Homepage</h1>

            </div>
            <div>
                <button onClick={() => navigate('/login')}>Login</button>
            </div>
        </>
    );
}

export default Homepage;