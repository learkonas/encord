// ImagesTab.tsx
import React, { useState } from 'react';
import PredictDialogue from './PredictDialogue';
import PredictionsTab from './PredictionsTab';
import { Prediction, PredictionContent } from './types';


export interface ImageFile {
  file: File;
  filename: string;
  size: string;
  uploadTime: string;
}


let predictionsArray: Prediction[] = [];

const ImagesTab: React.FC<{ setPredictionsData: (newData: Prediction[]) => void }> = ({ setPredictionsData }) => {

  const [images, setImages] = useState<ImageFile[]>([]);
  const [showDialogue, setShowDialogue] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<ImageFile | null>(null);
  

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    document.getElementById('image-list-table')?.classList.remove('hidden');    // table displaying uploaded images initially hidden
    if (event.target.files) {
      const uploadedFiles = Array.from(event.target.files).map((file) => {
        let filename = file.name
        if (file.name.length>25) {                    // cleanining up long file names for this table
          let prefix = file.name.substring(0, 10);
          let suffix = file.name.substring(file.name.length - 10);
          filename = `${prefix}....${suffix}`;
        }
        return {
          file,
          filename: filename,
          size: `${(file.size / 1024).toFixed(2)} kb`, // Convert bytes to KB and fix to 2 decimal places
          uploadTime: new Date().toLocaleString() // Get current date and time
        };
      });

      // update the state of the Images
      setImages((prevImages) => [...prevImages, ...uploadedFiles]); // Add new images to the existing list
    }
  };

  const handlePredictClick = (image: ImageFile) => {
    setCurrentImage(image);
    setShowDialogue(true);    // define the selected image and show the Predict Dialogue box, where users write the title and description for that specific image
  };

  const handleRemoveClick = (imageToRemove: ImageFile) => {
    setImages(images.filter(image => image !== imageToRemove));   // delete uploaded images from the table
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submitPrediction = async (user_title: string, user_description: string, image: ImageFile, predictionID: string, predictionTimestamp: number) => {
    // submits data, including title and description to the JSON server. Was unsure how to do this so I just created my old folder within db.json
    // 
    try {
      console.log(`Making prediction for image ${user_title} with prediction ID ${predictionID}.`)
      const body = JSON.stringify({ user_title, user_description, imageFilename: 'https://lh3.googleusercontent.com/u/0/drive-viewer/AK7aPaB3Z1M2i2fnirRwsMX3SkVvZWrQ2ZTd2kBEcwd_KwAlA2_yVJNBZNmM7c9PXOTlnLnBLgApiH3c4V2GX4MVlxp4M89xuw=w1920-h868', predictionID, predictionTimestamp}) // the url would be replaced by image.file.name
      console.log(`Body of the request: ${body}`)
      const response = await fetch(`http://localhost:3001/predictions`, { // to manage predictions, should use /predictions/${predictionID}
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });
      
      if (!response.ok) {
        throw new Error('Network response failed.');
      }
      else {

      }
         
      // find and update the success status update div
      setSuccessMessage(`Successfully submitted image '${user_title}' to the prediction engine.`);
      setErrorMessage(null);
      fetchPredictions();   // fetching predictions from db
    } catch (error) {
      // Handle error - show error message to the user
      console.warn(`There was a problem with the fetch operation. \n${error}`); // find and update the error status update div
      setErrorMessage(`There was a problem with the fetch operation. \n${error}.`);
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await fetch('http://localhost:3001/predictions');  // fetches data submitted by the user, such as file title and description
      if (!response.ok) {
        throw new Error('Network response was not ok');   // ideally this would use the same statusUpdate state
      }
      const submittedData = await response.json();
      console.log(submittedData)

      const response2 = await fetch('http://localhost:3001/predict');   // fetches the hardcoded data
      if (!response.ok) {
        throw new Error('Network response was not ok'); // ideally this would use the same statusUpdate state
      }
      const hardcodedData = await response2.json();

      // formatting the fetched data into the Prediction and Prediction Content types
      // PredictionContent refers to the box labels on the images, and is one part of the broader Prediction type
      const constructPredictionContent = (data: any): PredictionContent[] => {
        return data.predictions.map((box_data: any): PredictionContent => ({
          bbox: {     // this uses the hardcoded database schema
            x1: box_data.bbox.x1,
            x2: box_data.bbox.x2,
            y1: box_data.bbox.y1,
            y2: box_data.bbox.y2,
          },
          label: box_data.label,
          score: box_data.score,
        }));
      };

      const predictions: Prediction = {  // all of this comes from user submitted data, except the hardcoded data (which would come from Encord servers)
        title: submittedData.user_title,  
        description: submittedData.user_description,
        timestamp: submittedData.predictionTimestamp,
        filename: submittedData.imageFilename,
        id: submittedData.predictionID,
        predictions: constructPredictionContent(hardcodedData),
      };

      predictionsArray.push(predictions)                  //this appends the latest prediction to an array containing all predictions
      let number_of_predictions = predictionsArray.length

      const allPredictions = predictionsArray.slice(0, number_of_predictions); // I have no idea why this line is necessary, but simply passing the original array 'predictionsArray' to setPredictionsData doesn't work, and this does. Probably to do with how I initially declare the predictionsArray array
      setPredictionsData(allPredictions);


      return    // just using return here because I wanted to show the hacky solution I found before discovering that the above 'slice' approach worked
      if (number_of_predictions === 1) {      // this was one of the hacky solutions that worked for me  before finding the above
        setPredictionsData([predictions]);
      }
      if (number_of_predictions === 2) {
        let prediction1 = predictionsArray[0]
        let prediction2 = predictionsArray[1]
        setPredictionsData([prediction1, prediction2]);
      }
      if (number_of_predictions === 3) {
        let prediction1 = predictionsArray[0]
        let prediction2 = predictionsArray[1]
        let prediction3 = predictionsArray[2]
        setPredictionsData([prediction1, prediction2, prediction3]);
      }
      if (number_of_predictions === 4) {
        let prediction1 = predictionsArray[0]
        let prediction2 = predictionsArray[1]
        let prediction3 = predictionsArray[2]
        let prediction4 = predictionsArray[3]
        setPredictionsData([prediction1, prediction2, prediction3, prediction4]);
      }
      if (number_of_predictions === 5) {
        let prediction1 = predictionsArray[0]
        let prediction2 = predictionsArray[1]
        let prediction3 = predictionsArray[2]
        let prediction4 = predictionsArray[3]
        let prediction5 = predictionsArray[4]
        setPredictionsData([prediction1, prediction2, prediction3, prediction4, prediction5]);
      }

      // I'm aware that this is the proper way to append to the existing PredictionsData state. After all, this is how I append images in the Images state. But these states differ in how they are introduced in the React.FC line 
      //setPredictionsData((prevPredictionsData) => [...prevPredictionsData, predictions]);   // this didn't work because of how I create the imagesTab at `const ImagesTab: React.FC....`. Clearly there is something obvious that I am missing, which every other React dev on the planet knows...

    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  return (
    <div id="imagesTab" className="container">
      <div id="image-upload">
        <header>Upload your image files</header>
        <input id="images" type="file" multiple accept="image/*" onChange={handleImageUpload}/>
        <table id="image-list-table" className="hidden">
          <thead>
            <tr className="tr dark">
              <th>File</th>
              <th>Size</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {images.map((image, index) => (
              <tr key={index}>
                <td className="filename" title={image.file.name}>{image.filename}</td>
                <td>{image.size}</td>
                <td>{image.uploadTime}</td>
                <td>
                <button className="button" type="submit" onClick={() => handlePredictClick(image)}>Predict</button>
                </td>
                <td>
                  <span className="removeButton" onClick={() => handleRemoveClick(image)}><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
      {showDialogue && currentImage && (
        <PredictDialogue
          image={currentImage}                  // when a user clicks an image, create the prediction Dialogue
          onClose={() => setShowDialogue(false)}
          onSubmit={submitPrediction}
          // Pass other necessary props
        />
      )}
      {errorMessage && (
        <div className="statusUpdate error-message">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="statusUpdate success-message">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default ImagesTab;
