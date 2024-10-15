import React from "react";
import styled from "styled-components";

const Cards = ({item, onclick}) => {
  console.log(item);
  return (
    <StyledWrapper>
      <div className="card" onClick={() => onclick(item)}>
        <h4>{item.projectName}</h4>
        
        <p>{item.completionPercentage}% Completed</p>
        <p>{item.remainingPercentage}% Remaining</p>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
  box-sizing: border-box;
  width: 230px;
  height: 200px;
  background: rgba(217, 217, 217, 0.58);
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
}

.card:hover {
  border: 1px solid black;
  transform: scale(1.05);
}

.card:active {
  transform: scale(0.95) rotateZ(1.7deg);
}
`;

export default Cards;
