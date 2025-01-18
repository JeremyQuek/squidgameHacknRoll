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

  console.log(window.isTele);

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/lobby" element={<Lobby />} />
          <Route
            path="/"
            element={
              window.isTele ? (
                <Navigate to="/phone" replace />
              ) : (
                <Navigate to="/lobby" replace />
              )
            }
          />
          <Route path="/web" element={<WebView />} />
          <Route
            path="/phone"
            element={
              isMobileDevice ? <Navigate to="/web" replace /> : <MobileView />
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
