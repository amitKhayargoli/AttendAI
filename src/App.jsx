import { useState } from "react";

import "./index.css";
import Dashboard from "./Dashboard";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Dashboard />
    </>
  );
}

export default App;
