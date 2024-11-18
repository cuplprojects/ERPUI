import React, { useEffect, useState, useRef } from "react";
import LineChart from "./../sub-Components/LineChart";
import BarChart from "./../sub-Components/BarChart";
import { Card, Col, Row, Carousel, Container, OverlayTrigger, Tooltip, Dropdown } from "react-bootstrap";
import CuDetailedAgGrid from "../sub-Components/CuDetailedAgGrid";
import PieChart from "../sub-Components/PieChart";
import Cards from "../sub-Components/Cards";
import API from '../CustomHooks/MasterApiHooks/api';
import { IoMdArrowDroprightCircle, IoMdArrowDropleftCircle } from "react-icons/io";
import { PiDotsNineBold } from "react-icons/pi";
import { useStore } from 'zustand';
import themeStore from './../store/themeStore';
import statisticsImage from './../assets/images/statistics.png';
import PieChartIcon from './../assets/images/pie-chart.png';
import LineChartIcon from './../assets/images/line-chart.png';
import Grid from './../assets/images/table.png';
import { useUserData } from "../store/userDataStore";
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import { getAllProjectCompletionPercentages } from "../CustomHooks/ApiServices/transacationService";
import { useTranslation } from 'react-i18next';

const AnimatedDropdownMenu = styled(Dropdown.Menu)`
  &.dropdown-enter {
    opacity: 0;
    transform: scale(0.9);
  }
  &.dropdown-enter-active {
    opacity: 1;
    transform: scale(1);
    transition: opacity 300ms, transform 300ms;
  }
  &.dropdown-exit {
    opacity: 0;
    transform: scale(0.9);
  }
  &.dropdown-exit-active {
    opacity: 1;
    transform: scale(1);
    transition: opacity 300ms, transform 300ms;
  }
`;

const CuDashboard = () => {
  const { t } = useTranslation();
  const userData = useUserData();
  const [selectedLots, setSelectedLots] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [clickData, setClickData] = useState({});
  const [data, setData] = useState([]);
  const carouselRef = useRef(null);
  const [hasquantitySheet, setHasquantitySheet] = useState([]);
  const [visibleCards, setVisibleCards] = useState(() => {
    const savedState = localStorage.getItem('visibleCards');
    return savedState ? JSON.parse(savedState) : {
      lineChart: true,
      pieChart: true,
      agGrid: true,
      barChart: true,
    };
  });
  const [visiblecardsIcon] = useState({
    lineChart: LineChartIcon,
    pieChart: PieChartIcon,
    agGrid: Grid,
    barChart: statisticsImage,
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const hasDisable = (projectid) => {
    const hasQuantitySheet = hasquantitySheet.find(item => item.projectId === projectid);
    return hasQuantitySheet ? hasQuantitySheet.quantitySheet : false;
  };

useEffect(() => {
  const fetchPercentages = async () => {
    try {
      const projectCompletionPercentages = await getAllProjectCompletionPercentages();
      const projectData = await API.get(`/Project/GetDistinctProjectsForUser/${userData.userId}`);
      
      const mergedData = projectData.data.map(project => {
        const percentage = projectCompletionPercentages.find(p => p.projectId === project.projectId);
        return {
          ...project,
          completionPercentage: percentage ? percentage.completionPercentage : 0,
          remainingPercentage: percentage ? 100 - percentage.completionPercentage : 100
        };
      });
      
      setData(mergedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  fetchPercentages();
}, [userData.userId]);

  useEffect(() => {
    const fetchHasQuantitySheet = async () => {
      try {
        const response = await API.get('/QuantitySheet/check-all-quantity-sheets');
        setHasquantitySheet(response.data);
      } catch (error) {
        console.error("Error fetching quantity sheet data:", error);
      }
    };
    fetchHasQuantitySheet();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customBtn = cssClasses[3];

  const handleProjectClick = (project) => {
    setSelectedLots(project.lots || []);
  };

  const onclick = (item) => {
    setSelectedLots(item.lots || []);
    setClickData(item);
    setPieData(item.processes || []);
  };

  const handleCarouselControl = (direction) => {
    if (carouselRef.current) {
      direction === 'prev' ? carouselRef.current.prev() : carouselRef.current.next();
    }
  };

  const toggleCardVisibility = (card) => {
    setVisibleCards((prev) => {
      const newState = { ...prev, [card]: !prev[card] };
      localStorage.setItem('visibleCards', JSON.stringify(newState));
      return newState;
    });
  };

  const renderCards = () => {
    if (data.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center flex-column" style={{ height: '200px' }}>
          <h3 className="text-center mb-3">{t('noActiveProjects')}</h3>
          <p>{t('contactAdmin')}</p>
        </div>
      );
    }

    const activeCards = Object.values(visibleCards).filter(Boolean).length;
    if (activeCards === 0) {
      return (
        <Row className="g-3">
          {data.map((item) => (
            <Col key={item.projectId} xs={12} sm={6} md={4} lg={3}>
              <Cards item={item} onclick={onclick} disableProject={hasDisable(item.projectId)} remainingPercentage={item.remainingPercentage} completionPercentage={item.completionPercentage} />
            </Col>
          ))}
        </Row>
      );
    }

    const itemsPerSlide = 5;
    const carouselItems = [];
    for (let i = 0; i < data.length; i += itemsPerSlide) {
      carouselItems.push(
        <Carousel.Item key={i} className="px-3" style={{ background: "transparent" }}>
          <Row className="flex-nowrap justify-content-start" style={{ background: "transparent" }}>
            {data.slice(i, i + itemsPerSlide).map((item) => (
              <Col key={item.projectId} xs="auto" className="px-1">
                <Cards item={item} onclick={onclick} disableProject={hasDisable(item.projectId)} />
              </Col>
            ))}
          </Row>
        </Carousel.Item>
      );
    }

    return (
      <div className="position-relative mb-4">
        <div className="d-none d-lg-block">
          <div
            className={`position-absolute top-50 start-0 translate-middle-y rounded-circle ${customDark}`}
            style={{ zIndex: 9, left: "10px", cursor: "pointer" }}
            onClick={() => handleCarouselControl('prev')}
          >
            <IoMdArrowDropleftCircle size={40} className={`${customBtn} rounded-circle custom-zoom-btn`} />
          </div>
          <div
            className={`position-absolute top-50 end-0 translate-middle-y rounded-circle ${customDark} ${customDark === "dark-dark" ? `${customMid} border-light border-1` : "border-0"}`}
            style={{ zIndex: 9, right: "10px", cursor: "pointer" }}
            onClick={() => handleCarouselControl('next')}
          >
            <IoMdArrowDroprightCircle size={40} className={`${customBtn} rounded-circle custom-zoom-btn`} />
          </div>
        </div>

        <Carousel
          ref={carouselRef}
          interval={null}
          indicators={false}
          controls={false}
          touch={true}
          slide={true}
        >
          {carouselItems}
        </Carousel>
      </div>
    );
  };

  return (
    <Container fluid className="px-3 position-relative">
      {/* PiDotsNineBold in top right corner */}
      <div className="position-absolute" style={{ zIndex: 1000, top: "-20px", right: "-15px" }}>
        <div className="position-relative" ref={dropdownRef}>
          <Dropdown show={showDropdown} onToggle={() => setShowDropdown(!showDropdown)}>
            <Dropdown.Toggle as={CustomToggle}>
              <PiDotsNineBold className="mt-3" size={30} style={{ cursor: "pointer" }} />
            </Dropdown.Toggle>

            <CSSTransition
              in={showDropdown}
              timeout={300}
              classNames="dropdown"
              unmountOnExit
            >
              <AnimatedDropdownMenu style={{ border: 'none', boxShadow: 'none' }}>
                <Dropdown.Item as="div" onClick={(e) => e.stopPropagation()} style={{ background: 'transparent' }}>
                  <Row className="g-3 p-1">
                    {Object.entries(visibleCards).slice(0, 4).map(([key, value], index) => (
                      <Col key={key} xs={6} >
                      
                        <OverlayTrigger
                          placement="bottom"
                          overlay={<Tooltip id={`tooltip-${key}`}>{key.charAt(0).toUpperCase() + key.slice(1)}</Tooltip>}
                        >
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleCardVisibility(key)}
                          >
                            <img 
                              src={visiblecardsIcon[key]} 
                              alt="" 
                              width={50} 
                              height={50} 
                              style={{ 
                                opacity: value ? 1 : 0.5,
                                transition: 'opacity 0.3s ease'
                              }} 
                              className="c-pointer "
                            />
                          </div>
                        </OverlayTrigger>
                      </Col>
                    ))}
                  </Row>
                </Dropdown.Item>
              </AnimatedDropdownMenu>
            </CSSTransition>
          </Dropdown>
        </div>
      </div>

      {renderCards()}

      <Row className="gx-3 mt-4">
        {visibleCards.lineChart && (
          <Col lg={visibleCards.pieChart ? 8 : 12}>
            <Card
              className="dcard shadow-lg mb-3"
              style={{ height: "400px", background: "rgba(255,255,255,0.6)" }}
            >
              <LineChart data={data} onProjectClick={handleProjectClick} />
            </Card>
          </Col>
        )}

        {visibleCards.pieChart && (
          <Col lg={4}>
            <Card
              className="dcard shadow-lg mb-3"
              style={{ height: "400px", background: "rgba(255,255,255,0.6)" }}
            >
              <PieChart data={pieData} />
            </Card>
          </Col>
        )}
      </Row>

      <Row className="gx-3 mt-4">
        {visibleCards.agGrid && (
          <Col lg={6} md={12}>
            <Card
              className="dcard shadow-lg d-flex flex-column mb-3"
              style={{ height: "500px", background: "rgba(255,255,255,0.6)" }}
            >
              <h4 className="text-dark d-flex justify-content-between p-3">
                {clickData.name || t('selectProject')}
              </h4>
              <div style={{ flex: 1, overflow: "hidden", padding: "0 15px" }}>
                <CuDetailedAgGrid clickData={clickData} />
              </div>
            </Card>
          </Col>
        )}

        {visibleCards.barChart && (
          <Col lg={visibleCards.agGrid ? 6 : 12}>
            <Card
              className="dcard shadow-lg mb-3"
              style={{ height: "500px", background: "rgba(255,255,255,0.6)" }}
            >
              <BarChart projectId={clickData.projectId} />
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </div>
));

export default CuDashboard;
