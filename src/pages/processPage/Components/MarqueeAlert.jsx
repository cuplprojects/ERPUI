import React from 'react';
import { Row, Col } from 'react-bootstrap';
import AlertBadge from '../../../sub-Components/AlertBadge';

const MarqueeAlert = ({ data, onCatchClick }) => {
  const handleCatchClick = (record) => {
    if (onCatchClick) {
      onCatchClick(record);
    }
  };

  return (
    <Row>
      <Col lg={12} md={12}>
        <div className="marquee-container mt-2 mb-2">
          <marquee 
            id="alert-marquee" 
            behavior="scroll" 
            direction="left" 
            scrollamount="5"
            onMouseOver={(e) => e.target.stop()}
            onMouseOut={(e) => e.target.start()}
          >
            <div className="d-flex gap-4">
              {data.map((record, index) => (
                record.alerts && 
                record.alerts.length > 0 && 
                record?.alerts !== "0" && 
                record?.alerts !== "" && (
                  <AlertBadge 
                    key={index}
                    catchNo={record.catchNumber} 
                    alerts={record.alarmMessage}
                    onClick={() => handleCatchClick(record)}
                    status="level1"
                  />
                )
              ))}
            </div>
          </marquee>
        </div>
      </Col>
    </Row>
  );
};

export default MarqueeAlert;