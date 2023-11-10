import React, { useState } from 'react';
import { ImageFile } from './ImagesTab'; // Make sure the path is correct

interface PredictDialogueProps {
  image: ImageFile;
  onClose: () => void;
  onSubmit: (title: string, description: string, image: ImageFile, predictionID: string, predictionTimestamp: number) => void;
}

const PredictDialogue: React.FC<PredictDialogueProps> = ({ image, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  let result = '';
  const generatePredictionID = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  };

  const predictionID = generatePredictionID(8);
  let predictionTimestamp = Math.floor(Date.now() / 1000);
  const handleSubmit = () => {
    onSubmit(title, description, image, predictionID, predictionTimestamp);
    document.getElementById('predictionsTablePlaceholder')?.classList.add('hidden');
    document.getElementById('predictionsTable')?.classList.remove('hidden');
  };

  return (
    <div id="prediction-meta">
        <h5>Confirm meta data for</h5>
        <text className="predictionImageName">{image.file.name}</text>
        <div id="meta-data-input" className="two-column-boxgrid">
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Title"    
          />
          <textarea
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Description"
          ></textarea>
        </div>
        <div className="dialog-actions">
          <button className="dialog-buttons" id="submit" onClick={handleSubmit}>Submit</button>
          <button className="dialog-buttons" id="cancel" onClick={onClose}>Cancel</button>
        </div>
    </div>
  );
};

export default PredictDialogue;
