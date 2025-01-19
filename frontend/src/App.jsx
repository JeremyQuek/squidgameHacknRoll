import { Suspense, lazy, useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { isMobile } from "react-device-detect";

const WebView = lazy(() => import("./web/game.jsx"));
const MobileView = lazy(() => import("./mobile/mobilegame.jsx"));
const Lobby = lazy(() => import("./web/lobby.jsx"));

function App() {
  const [isMobileDevice, setIsMobileDevice] = useState(null);

  useEffect(() => {
    setIsMobileDevice(isMobile);
  }, []);

  if (isMobileDevice === null) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route
            path="/phone"
            element={
              !isMobileDevice ? <Navigate to="/web" replace /> : <MobileView />
            }
          />
          <Route
            path="/web"
            element={
              isMobileDevice ? <Navigate to="/phone" replace /> : <WebView />
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
