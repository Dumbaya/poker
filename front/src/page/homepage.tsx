import { useNavigate } from "react-router-dom";

function Homepage() {
    const navigate = useNavigate();

    return(
        <>
            <div>
                <h1>Homepage</h1>

            </div>
            <div>
                <button onClick={() => navigate('/sign_in')}>Sign_in</button>
            </div>
        </>
    );
}

export default Homepage;