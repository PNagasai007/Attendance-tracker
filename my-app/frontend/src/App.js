import "./App.css";
import Form from "./components/Form";
import Main from "./components/Main";
import { Routes,Route } from 'react-router-dom'

function App() {
  return (
    <div className="back">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/register" element={<Form />} />
      </Routes>
      {/* <Main /> */}
      {/* <Form /> */}
    </div>
  );
}

export default App;
