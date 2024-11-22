import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaUpload, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { encrypt } from "../Security/Security";
import useUserDataStore from "../store/userDataStore";
import { useTranslation } from "react-i18next";
import API from "../CustomHooks/MasterApiHooks/api";

const Cards = ({ item, onclick, disableProject }) => {
  const navigate = useNavigate();
  const { userData } = useUserDataStore();
  const role = userData?.role;
  const supervisor = role.roleId === 5;
  const { t } = useTranslation();
  const [hasProcesses, setHasProcesses] = useState(false);
  console.log(supervisor);

  useEffect(() => {
    if (item?.projectId) {
      fetchProjectProcess();
    }
  }, [item?.projectId]);

  // Navigate to quantity sheet uploads and send projectId
  const handleUploadClick = (e) => {
    e.stopPropagation();
    if (hasProcesses) {
      navigate(`/quantity-sheet-uploads/${encrypt(item.projectId)}`);
    }
  };

  const fetchProjectProcess = async() => {
    try {
      const response = await API.get(`/ProjectProcess/GetProjectProcesses/${item.projectId}`);
      setHasProcesses(response.data.length > 1);
    } catch (error) {
      console.error("Error fetching project processes:", error);
      setHasProcesses(false);
    }
  }

  // Navigate to the dashboard and send projectId as a route parameter
  const handleCardClick = () => {
    if(!disableProject){
      return;
    }
    if (supervisor) {
      navigate(`/project-details/${encrypt(item.projectId)}/${encrypt(1)}`);
    } else {
      navigate(`/dashboard/${encrypt(item.projectId)}`);
    }
  };

  // Handle info button click
  const handleInfoClick = (e) => {
    e.stopPropagation();
    if(!disableProject){
      return;
    }
    onclick(item);
  };

  return (
    <StyledWrapper>
      <div className="card" onClick={handleCardClick}>
        <div className="header">
          <h4 className="project-name">{item.name}</h4>
          <div className={`upload-button ${!hasProcesses ? 'disabled' : ''}`} onClick={handleUploadClick}>
            <FaUpload />
          </div>
        </div>

        <p>{item.completionPercentage}% {t('completed')}</p>
        <p>{item.remainingPercentage}% {t('remaining')}</p>
        
        <div
          className={`info-button ${!disableProject ? 'disabled' : ''}`}
          onClick={handleInfoClick}
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

  .header {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 0 40px;
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
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
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

  .info-button.disabled, .upload-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .info-button.disabled:hover, .upload-button.disabled:hover {
    background-color: transparent;
  }

  .project-name {
    white-space: normal;
    word-wrap: break-word;
    max-width: 90%;
    margin: 10px 0;
  }
`;

export default Cards;
