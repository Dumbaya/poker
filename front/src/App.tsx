import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from "./page/homepage";
import Login from "./page/user/login";

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
