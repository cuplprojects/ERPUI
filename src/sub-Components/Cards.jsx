import React from "react";
import styled from "styled-components";
import { FaUpload, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Cards = ({ item, onclick, disableProject }) => {
  const navigate = useNavigate();

  // Navigate to quantity sheet uploads and send projectId
  const handleUploadClick = (e) => {
  
    e.stopPropagation();
    navigate(`/quantity-sheet-uploads/${item.projectId}`);
  };

  // Navigate to the dashboard and send projectId as a route parameter
  const handleCardClick = () => {
    if(disableProject){
      return;
    }
    navigate(`/dashboard/${item.projectId}`);
  };

  return (
    <StyledWrapper>
      <div className="card" onClick={handleCardClick}>
        <div className="upload-button" onClick={handleUploadClick} >
          <FaUpload />
        </div>

        <h4>{item.name}</h4>
        <p>{item.completionPercentage}% Completed</p>
        <p>{item.remainingPercentage}% Remaining</p>
        
        <div
          className="info-button"
          onClick={(e) => {
            e.stopPropagation();
            onclick(item);
          }}
        >
          <FaInfoCircle />
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    box-sizing: border-box;
    width: 343px;
    height: 170px;
    background: rgba(217, 217, 217, 0.3);
    border: 1px solid white;
    box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
    backdrop-filter: blur(6px);
    border-radius: 17px;
    text-align: center;
    cursor: pointer;
    transition: all 0.5s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;
    font-weight: bolder;
    color: black;
    margin: 6px;
    position: relative;
  }

  .card:hover {
    border: 1px solid black;
    transform: scale(1.05);
  }

  .card:active {
    transform: scale(0.95) rotateZ(1.7deg);
  }

  .upload-button, .info-button {
    position: absolute;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .upload-button {
    top: 10px;
    right: 10px;
    padding: 10px;
    font-size: 1.2em;
    border-radius: 50%;
  }

  .info-button {
    bottom: 10px;
    right: 10px;
    padding: 10px;
    font-size: 1.2em;
    border-radius: 50%;
  }

  .upload-button:hover, .info-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export default Cards;
