// PredictionsTab.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Prediction, PredictionContent } from './types';

interface PredictionProps {
  prediction: Prediction[];
}

const PredictionsTab: React.FC<PredictionProps> = ({ prediction }) => { 
  
  let current_prediction: Prediction | undefined;

  let containerWidthPx = 28 * (window.innerWidth / 100)
  let containerHeightPx = 23 * (window.innerWidth / 100)
  
  function calculate_container_width() {
    containerWidthPx = 28 * (window.innerWidth / 100)
    containerHeightPx = 23 * (window.innerWidth / 100)
    if (current_prediction) {
      drawAnnotations(current_prediction);
    }
  }

  window.addEventListener('resize', calculate_container_width); // risk of memory leak
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawAnnotations = (prediction: Prediction) => {
    current_prediction = prediction
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = new Image();

    image.onload = () => {
      let scaleX: number
      let scaleY: number
      if (canvas) {
        containerWidthPx = 28 * (window.innerWidth / 100)
        containerHeightPx = 23 * (window.innerWidth / 100)

        scaleX = containerWidthPx / 1600;
        scaleY = containerHeightPx / 1200;

        canvas.width = containerWidthPx;
        canvas.height = containerHeightPx;
        
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
      
        prediction.predictions.forEach((item) => {
          const x1 = item.bbox.x1 * scaleX;
          const y1 = item.bbox.y1 * scaleY;
          const x2 = item.bbox.x2 * scaleX;
          const y2 = item.bbox.y2 * scaleY;
          const width = x2 - x1;
          const height = y2 - y1;

          ctx?.beginPath();
          ctx?.rect(x1, y1, width, height);
          ctx!.fillStyle = '#075d502d'; 
          ctx?.fillRect(x1, y1, width, height); 

          ctx!.strokeStyle = '#075d50f1'; // Non-null assertion
          ctx?.stroke();
          ctx?.closePath();
          
          // Set the text properties


          // Calculate text width and height
          const text = `${item.label.charAt(0).toUpperCase()}${item.label.slice(1)}: (${item.score}%)`;
          const textMetrics = ctx!.measureText(text);
          const textWidth = textMetrics.width;
          const textHeight = 12; // Approximate text height; adjust as needed
          ctx!.font = `${textHeight}px Helvetica`; // Example font properties
          ctx!.fillStyle = '#dae7e5'; // Text color
          ctx!.textBaseline = 'top'; // Align text to top

          // Set the background properties
          const backgroundPadding = 4; // Space between text and background edges
          const borderRadius = textHeight; // Border radius for the background
          const backgroundWidth = textWidth + textHeight + backgroundPadding * 2;
          const backgroundHeight = textHeight + backgroundPadding * 2;

          // Calculate the position of the background
          const backgroundX = x2 - backgroundWidth - 5;
          const backgroundY = y2 - backgroundHeight - 5;

          // Draw the background with border-radius effect
          ctx!.fillStyle = '#075d50'; // Background color
          ctx!.beginPath();
          ctx!.moveTo(backgroundX + borderRadius, backgroundY);
          ctx!.lineTo(backgroundX + backgroundWidth - borderRadius, backgroundY);
          ctx!.quadraticCurveTo(backgroundX + backgroundWidth, backgroundY, backgroundX + backgroundWidth, backgroundY + borderRadius);
          ctx!.lineTo(backgroundX + backgroundWidth, backgroundY + backgroundHeight - borderRadius);
          ctx!.quadraticCurveTo(backgroundX + backgroundWidth, backgroundY + backgroundHeight, backgroundX + backgroundWidth - borderRadius, backgroundY + backgroundHeight);
          ctx!.lineTo(backgroundX + borderRadius, backgroundY + backgroundHeight);
          ctx!.quadraticCurveTo(backgroundX, backgroundY + backgroundHeight, backgroundX, backgroundY + backgroundHeight - borderRadius);
          ctx!.lineTo(backgroundX, backgroundY + borderRadius);
          ctx!.quadraticCurveTo(backgroundX, backgroundY, backgroundX + borderRadius, backgroundY);
          ctx!.closePath();
          ctx!.fill();

          // Draw the text over the background
          ctx!.fillStyle = '#dae7e5'; // Text color
          ctx!.fillText(text, backgroundX + backgroundPadding*2, backgroundY + backgroundPadding);

          ctx!.closePath();
        });
      }
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
    let allImages = imageContainerDiv?.querySelectorAll('canvas');
    
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
      <div id="predictionsTablePlaceholder">Come back to this tab once you've submitted some images</div>
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
        <div id="imageContainer" className="hidden">
              <div id="placeholderText">Select an image from the table.</div>
              {prediction.map((prediction, index) => (
                <canvas ref={canvasRef} id={String(index)} className="predictionCanvas hidden"></canvas>
                //<img src={prediction.filename} id={String(index)} className="predictionImage hidden"></img> // the logic I set up here does actually work for displaying different images governed by using the index in the prediction array as unique identifiers. If both image and canvas were to co-exist, we'd need to put the IDs in the class, because IDs cannot be duplicated accros elemtns
              ))}
              
        </div>
      </div>
  </div>
  );
};

export default PredictionsTab;
