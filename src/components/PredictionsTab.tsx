// PredictionsTab.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Prediction, PredictionContent } from './types';

interface PredictionProps {
  prediction: Prediction[];
}

const PredictionsTab: React.FC<PredictionProps> = ({ prediction }) => { 
  
  let current_prediction: Prediction | undefined;

  let containerWidthPx = 28 * (window.innerWidth / 100)     //the image display is rigidly defined to 28 svw width and 23 svw height (yes, vw). A feature that expanded the image to big screen and permitted an individual export would be good, even if the main feature is ability to export on the level of thousands or more images
  let containerHeightPx = 23 * (window.innerWidth / 100)    // scaling everything might not have been the quickest approach, but I still would have had to scale something due to mismatches between the specific Orange On Bowl image I was able to display (1147x860) and the scale of the coordinates (1600x1200)
  
  function calculate_container_width() {
    containerWidthPx = 28 * (window.innerWidth / 100)
    containerHeightPx = 23 * (window.innerWidth / 100)
    if (current_prediction) {
      drawAnnotations(current_prediction);
    }
  }

  window.addEventListener('resize', calculate_container_width); // risk of memory leak, but resizes the image every time the window is resized
  
  const canvasRef = useRef<HTMLCanvasElement>(null);      // canvas to draw the prediction boxes on the image
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

        scaleX = containerWidthPx / 1600;   // I divide by 1600 and 1200, rather than the actual image width, because I hardcoded a version of the Orange On A Bowl image, and my version is 1147 pixels wide and scaled, whereas the hardcoded data is for 1600x1200; I've had to scale them for the canvas appropriately
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
          ctx?.rect(x1, y1, width, height);       // drawing the prediction boxes (first filling, then border)
          ctx!.fillStyle = '#075d502d';           // high transparency
          ctx?.fillRect(x1, y1, width, height); 

          ctx!.strokeStyle = '#075d50f1';       // both these colours are dark greens
          ctx?.stroke();
          ctx?.closePath();


          // Calculate text width and height
          const text = `${item.label.charAt(0).toUpperCase()}${item.label.slice(1)}: (${item.score}%)`;
          const textMetrics = ctx!.measureText(text);
          const textWidth = textMetrics.width;
          const textHeight = 12; // select text height
          ctx!.font = `${textHeight}px Helvetica`;
          ctx!.fillStyle = '#dae7e5'; // Text colour, a white with a tiny green blue tint
          ctx!.textBaseline = 'top';

          // Set background properties
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
          ctx!.fillStyle = '#dae7e5'; // Text colour, same pale colour as above
          ctx!.fillText(text, backgroundX + backgroundPadding*2, backgroundY + backgroundPadding);  // writes the text within the shape (rectange curved borders) created above

          ctx!.closePath();
        });
      }
    };

    image.src = prediction.filename; 
  };


  const handleViewClick = (index: string, prediction: Prediction, event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(prediction)
    drawAnnotations(prediction);        // draw the annotations on the canvas from the specified prediction (passed through clicking the View button of that prediction)
    let button = event.currentTarget;   //identify the clicked button
    let image_to_reveal = document.getElementById(index)                // identifies the ID  of the image to reveal based on the 'index' variable, which is a String type of the index number of the prediction array
    let placeholderText = document.getElementById("placeholderText");

    let imageContainerDiv = document.getElementById('imageContainer');
    let allImages = imageContainerDiv?.querySelectorAll('canvas');      //identifies every canvas, one for each image
    
    let tableBody = document.getElementById('tableBody');
    let allButtons = tableBody?.querySelectorAll('button');

    // if the button is not in 'show' mode, ie, the button gives the option to View
    if (button.innerHTML === "VIEW") {
      if (placeholderText) {
        placeholderText.innerHTML = ''    //removes the placeholderText. We could just hide the div which would be cleaner but this works fine
      }

      allButtons?.forEach((button) => {
        button.innerHTML = "VIEW";                    //when one button is clicked, we first set all of them to say 'view'
        button.classList.remove("showingPrediction")  // and remove the css styling accordingly
      });
      button.innerHTML = "SHOWN";                     //then we set the click button to 'Show'
      button.classList.add("showingPrediction")       // and add the css style accordingly
    
      allImages?.forEach((image) => {                 // we then do the same for the images...
        image.classList.add("hidden");                // first hiding all of them
      });
      image_to_reveal?.classList.remove("hidden")     // and then showing the one we wish to see

    }
    else {       // if the clicked button does not say 'View' (ie, it says Shown), we know it is currently being shown
      image_to_reveal?.classList.add("hidden")  // we hide the image 
      if (placeholderText) {
        placeholderText.innerHTML = 'Select an image from the table.' // we restore the placeholder
      }
      button.innerHTML = "VIEW";                      // we give the option to click View again
      button.classList.remove("showingPrediction")    // and remove the styling
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
