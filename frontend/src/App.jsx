import { useState } from 'react';
import './App.css';

function App() {
  // State for tracking selected options in each set
  const [set1Selected, setSet1Selected] = useState(null); // null means no selection
  const [set2Selected, setSet2Selected] = useState(null);

  // Helper function to determine the class for a button
  const getButtonClass = (selectedOption, currentOption) =>
    selectedOption === currentOption ? 'button-bright' : 'button-dim';

  return (
    <div className="App">
      <h1>Scissors, Paper, Stone</h1>
      <div className="set">
        <h2>Set 1</h2>
        <button
          className={getButtonClass(set1Selected, 'scissors')}
          onClick={() => setSet1Selected('scissors')}
        >
          Scissors
        </button>
        <button
          className={getButtonClass(set1Selected, 'paper')}
          onClick={() => setSet1Selected('paper')}
        >
          Paper
        </button>
        <button
          className={getButtonClass(set1Selected, 'stone')}
          onClick={() => setSet1Selected('stone')}
        >
          Stone
        </button>
      </div>
      <div className="set">
        <h2>Set 2</h2>
        <button
          className={getButtonClass(set2Selected, 'scissors')}
          onClick={() => setSet2Selected('scissors')}
        >
          Scissors
        </button>
        <button
          className={getButtonClass(set2Selected, 'paper')}
          onClick={() => setSet2Selected('paper')}
        >
          Paper
        </button>
        <button
          className={getButtonClass(set2Selected, 'stone')}
          onClick={() => setSet2Selected('stone')}
        >
          Stone
        </button>
      </div>
    </div>
  );
}

export default App;
