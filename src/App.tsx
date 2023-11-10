import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import ImagesTab from './components/ImagesTab';
import PredictDialogue from './components/PredictDialogue';
import PredictionsTab from './components/PredictionsTab';
import { Prediction, PredictionContent } from './components/types';

//
function App() {
  const [predictionsData, setPredictionsData] = useState<Prediction[]>([]);
  return (
    <div className="">
      <ImagesTab setPredictionsData={setPredictionsData} />
      
      <PredictionsTab prediction={predictionsData} />
    </div>
  );
}

export default App;
