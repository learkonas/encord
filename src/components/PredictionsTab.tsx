// PredictionsTab.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Prediction, PredictionContent } from './types';

interface PredictionProps {
  prediction: Prediction[];
}

const PredictionsTab: React.FC<PredictionProps> = ({ prediction }) => { 
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawAnnotations = (prediction: Prediction) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = new Image();

    image.onload = () => {
      ctx?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
      ctx?.drawImage(image, 0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
      prediction.predictions.forEach((item) => {
        const { x1, y1, x2, y2 } = item.bbox;
        const width = x2 - x1;
        const height = y2 - y1;

        ctx?.beginPath();
        ctx?.rect(x1, y1, width, height);
        ctx!.strokeStyle = 'red'; // Non-null assertion
        ctx?.stroke();
        ctx?.closePath();

        // Optional: Add label and score text
        ctx!.fillStyle = 'red'; // Non-null assertion
        ctx?.fillText(`${item.label}: ${item.score}`, x1, y1 - 5);
      });
    };

    image.src = prediction.filename; 
  };


  const handleViewClick = (index: string, prediction: Prediction, event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(prediction)
    drawAnnotations(prediction);
    let button = event.currentTarget;
    let image_to_reveal = document.getElementById(index)
    let placeholderText = document.getElementById("placeholderText");

    let imageContainerDiv = document.getElementById('imageContainer');
    let allImages = imageContainerDiv?.querySelectorAll('img');
    
    let tableBody = document.getElementById('tableBody');
    let allButtons = tableBody?.querySelectorAll('button');


    if (button.innerHTML === "VIEW") {
      if (placeholderText) {
        placeholderText.innerHTML = ''
      }

      allButtons?.forEach((button) => {
        button.innerHTML = "VIEW";
        button.classList.remove("showingPrediction")
      });
      button.innerHTML = "SHOWN";
      button.classList.add("showingPrediction")
    
      allImages?.forEach((image) => {
        image.classList.add("hidden");
      });

      image_to_reveal?.classList.remove("hidden")

    }
    else {
      image_to_reveal?.classList.add("hidden")
      if (placeholderText) {
        placeholderText.innerHTML = 'Select an image from the table.'
      }
      button.innerHTML = "VIEW";
      button.classList.remove("showingPrediction")
    }
  };


  return (
    <div id="predictionsTab" className="hidden">
      <header>Access your image predictions</header>
      <div id="predictionsTablePlaceholder">Come back to this tab once you've uploaded some images</div>
      <div id="predictionsContainer">
        <div id="predictionsTable" className="hidden">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {prediction.map((prediction, index) => (

              <tr key={(index)}>
                <td>{prediction.title}</td>
                <td>{prediction.description}</td>
                <td>{new Intl.DateTimeFormat('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                  }).format(new Date(prediction.timestamp * 1000))}</td>
                <td>
                  <button className="button predictionViewButtons" id="" onClick={(event) => handleViewClick(String(index), prediction, event)}>VIEW</button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div id="imageContainer">
              <div id="placeholderText">Select an image from the table.</div>
              {prediction.map((prediction, index) => (
                <img src={prediction.filename} id={String(index)} className="predictionImage hidden"></img>
              ))}
              <canvas ref={canvasRef} width={'20vw'} height={'20vw'} className="predictionCanvas hidden"></canvas>
        </div>
      </div>
  </div>
  );
};

export default PredictionsTab;
