import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import JSONFormatterPage from "./pages/JSONFormatterPage";

/**
 * App component contains the routes for the toolkit platform.
 */
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/json-formatter" element={<JSONFormatterPage />} />
    </Routes>
  );
};

export default App;
