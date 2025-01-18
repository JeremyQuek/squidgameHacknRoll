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
const Lobby = lazy(()=> import("./web/lobby.jsx"));

function App() {
  const [isMobileDevice, setIsMobileDevice] = useState(null);

  useEffect(() => {
    setIsMobileDevice(isMobile);
  }, []);

  if (isMobileDevice === null) {
    return <div>Loading...</div>;
  }
  const isTele = true
  console.log(window.chat_id);
  if (window.chat_id === null) {
    isTele = false;
  }
  console.log("is this telegram?" + isTele);

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path = "/lobby" element = {<Lobby/>}/>
          <Route 
            path="/"
            element={
              window.chat_id ?  <Navigate to = "/lobby" replace/> :  <Navigate to = "/phone5r5e4w3ee3wewwewass" replace/> 
            }
          />
          <Route path = "/web" element =  {<WebView/>} />
          <Route
            path="/phone"
            element={
              isMobileDevice ? <MobileView /> : <Navigate to="/web" replace />
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
