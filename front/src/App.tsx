import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from "./page/homepage";
import Sign_in from "./page/user/sign_in";
import Sign_up from "./page/user/sign_up";

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/sign_in" element={<Sign_in />} />
          <Route path="/sign_up" element={<Sign_up />} />
      </Routes>
    </Router>
  );
}

export default App;
