import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import JSONFormatterPage from "./pages/JSONFormatterPage";
import XMLFormatterPage from "./pages/XMLFormatterPage";
import RegexTesterPage from "./pages/RegexTesterPage";

/**
 * App component contains the routes for the toolkit platform.
 */
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/json-formatter" element={<JSONFormatterPage />} />
      <Route path="/xml-formatter" element={<XMLFormatterPage />} />
      <Route path="/regex-tester" element={<RegexTesterPage />} />
    </Routes>
  );
};

export default App;
