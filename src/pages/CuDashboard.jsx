import React, { useEffect, useState, useRef } from "react";
import LineChart from "./../sub-Components/LineChart";
import BarChart from "./../sub-Components/BarChart";
import { Card, Col,Row,Carousel,Container,OverlayTrigger,Tooltip,Dropdown} from "react-bootstrap";
import CuDetailedAgGrid from "../sub-Components/CuDetailedAgGrid";
import PieChart from "../sub-Components/PieChart";
import Cards from "../sub-Components/Cards";
import API from "../CustomHooks/MasterApiHooks/api";
import {
  IoMdArrowDroprightCircle,
  IoMdArrowDropleftCircle,
} from "react-icons/io";
import { PiDotsNineBold } from "react-icons/pi";
import { useStore } from "zustand";
import themeStore from "./../store/themeStore";
import statisticsImage from "./../assets/images/statistics.png";
import PieChartIcon from "./../assets/images/pie-chart.png";
import LineChartIcon from "./../assets/images/line-chart.png";
import Grid from "./../assets/images/table.png";
import { useUserData } from "../store/userDataStore";
import { CSSTransition } from "react-transition-group";
import styled from "styled-components";
import { getAllProjectCompletionPercentages } from "../CustomHooks/ApiServices/transacationService";
import { useTranslation } from "react-i18next";

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

const ScrollableContainer = styled.div`
  .scrollable-container {
    &::-webkit-scrollbar {
      display: none;
    }
    
    .d-flex {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x mandatory;
      padding: 8px 0;
      
      > div {
        scroll-snap-align: start;
      }
    }
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
  const [activeCard, setActiveCard] = useState(null);
  const [visibleCards, setVisibleCards] = useState(() => {
    const savedState = localStorage.getItem("visibleCards");
    return savedState
      ? JSON.parse(savedState)
      : {
        // lineChart: true,
        // pieChart: true,
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
    const hasQuantitySheet = hasquantitySheet.find(
      (item) => item.projectId === projectid
    );
    return hasQuantitySheet ? hasQuantitySheet.quantitySheet : false;
  };

  useEffect(() => {
    const fetchPercentages = async () => {
      try {
        const projectCompletionPercentages = await getAllProjectCompletionPercentages();
        const projectData = await API.get(
          `/Project/GetDistinctProjectsForUser/${userData.userId}`
        );

        const mergedData = projectData.data.map((project) => {
          const percentage = projectCompletionPercentages.find(
            (p) => p.projectId === project.projectId
          );
          return {
            ...project,
            completionPercentage: percentage
              ? percentage.completionPercentage
              : 0,
            remainingPercentage: percentage
              ? 100 - percentage.completionPercentage
              : 100,
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
        const response = await API.get(
          "/QuantitySheet/check-all-quantity-sheets"
        );
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { getCssClasses } = useStore(themeStore);
  const [
    customDark,
    customMid,
    customLight,
    customBtn,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder,
    customThead
  ] = getCssClasses();

  const handleProjectClick = (project) => {
    setSelectedLots(project.lots || []);
  };

  useEffect(() => {
    console.log(data[0]?.projectId);
    if (data && data.length > 0) {
      setSelectedLots(data[0]?.lots || []);
      setClickData(data[0]);
      setPieData(data[0]?.processes || []);
      setActiveCard(data[0].projectId);
    }
  }, [data]);

  const onclick = (item) => {
    console.log(item.projectId);
    setSelectedLots(item.lots || []);
    setClickData(item);
    setPieData(item.processes || []);
    setActiveCard(item.projectId);
  };

  const handleCarouselControl = (direction) => {
    if (carouselRef.current) {
      direction === "prev"
        ? carouselRef.current.prev()
        : carouselRef.current.next();
    }
  };

  const toggleCardVisibility = (card) => {
    setVisibleCards((prev) => {
      const newState = { ...prev, [card]: !prev[card] };
      localStorage.setItem("visibleCards", JSON.stringify(newState));
      return newState;
    });
  };

  const renderCards = () => {
    if (data.length === 0) {
      return (
        <div
          className="d-flex justify-content-center align-items-center flex-column"
          style={{ height: "200px" }}
        >
          <h3 className="text-center mb-3">{t("noActiveProjects")}</h3>
          <p>{t("contactAdmin")}</p>
        </div>
      );
    }

    const activeCards = Object.values(visibleCards).filter(Boolean).length;
    if (activeCards === 0) {
      return (
        <Row className="g-4">
          {data.map((item) => (
            <Col key={item.projectId} xs={12} sm={12} md={6} lg={3}>
              <Cards
                item={item}
                onclick={onclick}
                disableProject={hasDisable(item.projectId)}
                activeCardStyle={activeCard === item.projectId}
              />
            </Col>
          ))}
        </Row>
      );
    }

    const itemsPerSlide = 5;
    const carouselItems = [];

    // For large screens, use carousel
    if (window.innerWidth >= 992) {  // lg breakpoint
      for (let i = 0; i < data.length; i += itemsPerSlide) {
        carouselItems.push(
          <Carousel.Item
            key={i}
            className="px-3"
            style={{ background: "transparent" }}
          >
            <Row
              className="flex-nowrap justify-content-start"
              style={{ background: "transparent", margin: "0" }}
            >
              {data.slice(i, i + itemsPerSlide).map((item) => (
                <Col key={item.projectId} xs="auto" className="px-1">
                  <Cards
                    item={item}
                    onclick={onclick}
                    disableProject={hasDisable(item.projectId)}
                    activeCardStyle={activeCard === item.projectId}
                  />
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
              onClick={() => handleCarouselControl("prev")}
            >
              <IoMdArrowDropleftCircle
                size={40}
                className={`${customBtn} rounded-circle custom-zoom-btn ${customLightBorder}`}
              />
            </div>
            <div
              className={`position-absolute top-50 end-0 translate-middle-y rounded-circle ${customDark}`}
              style={{ zIndex: 9, right: "10px", cursor: "pointer" }}
              onClick={() => handleCarouselControl("next")}
            >
              <IoMdArrowDroprightCircle
                size={40}
                className={`${customBtn} rounded-circle custom-zoom-btn ${customLightBorder}`}
              />
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
    }

    // For medium and small screens, use scrollable container
    return (
      <ScrollableContainer className="scrollable-container mb-4" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="d-flex flex-nowrap px-2" style={{ gap: '12px' }}>
          {data.map((item) => (
            <div key={item.projectId} style={{ flex: '0 0 auto', minWidth: '343px' }}>
              <Cards
                item={item}
                onclick={onclick}
                disableProject={hasDisable(item.projectId)}
                activeCardStyle={activeCard === item.projectId}
              />
            </div>
          ))}
        </div>
      </ScrollableContainer>
    );
  };

  return (
    <Container fluid className="px-3 position-relative">
      {/* PiDotsNineBold in top right corner */}
      <div
        className="position-absolute"
        style={{ zIndex: 1000, top: "-20px", right: "-15px" }}
      >
        <div className="position-relative" ref={dropdownRef}>
          <Dropdown
            show={showDropdown}
            onToggle={() => setShowDropdown(!showDropdown)}
          >
            <Dropdown.Toggle as={CustomToggle}>
              <PiDotsNineBold
                className={`mt-3 ${customDark} ${customLightText} rounded-2 border`}
                size={30}
                style={{ cursor: "pointer" }}
              />
            </Dropdown.Toggle>

            <CSSTransition
              in={showDropdown}
              timeout={300}
              classNames="dropdown"
              unmountOnExit
            >
              <AnimatedDropdownMenu
                style={{ border: "none", boxShadow: "none" }}
              >
                <Dropdown.Item
                  as="div"
                  onClick={(e) => e.stopPropagation()}
                  style={{ background: "transparent" }}
                >
                  <Row className="g-3 p-1">
                    {Object.entries(visibleCards)
                      .slice(0, 4)
                      .map(([key, value], index) => (
                        <Col key={key} xs={6}>
                          <OverlayTrigger
                            placement="bottom"
                            overlay={
                              <Tooltip id={`tooltip-${key}`}>
                                {key === 'agGrid' ? t("Table") : key.charAt(0).toUpperCase() + key.slice(1)}
                              </Tooltip>
                            }
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
                                  transition: "opacity 0.3s ease",
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
              className={`dcard shadow-lg d-flex flex-column mb-3 ${customLight} ${customLightBorder}`}
              style={{ height: "550px", background: "rgba(255,255,255,0.6)" }}
            >
              {/* <h4 className={`d-flex justify-content-between  ${customDarkText} `}>
                {clickData.name || t("selectProject")}
              </h4> */}
              {/* passed to next component */}
              <div >
                <CuDetailedAgGrid projectId={clickData.projectId} clickedProject={clickData.name} />
              </div>
            </Card>
          </Col>
        )}

        {visibleCards.barChart && (
          <Col lg={visibleCards.agGrid ? 6 : 12}>
            <Card
              className={`dcard shadow-lg mb-3 ${customLight} ${customLightBorder}`}
              style={{
                height: "550px",
                background: "rgba(255,255,255,0.6)",
                overflow: "hidden",
              }}
            >
              <h4 className={`text-dark d-flex justify-content-between p-3 py-0 ${customDarkText}`}>
                {t("project")} | {clickData.name || t("selectProject")} | {t("lotCompletion")}
              </h4>
              <div
                style={{
                  height: "calc(100% - 50px)", // Adjust for header height
                  width: "100%",
                }}
                className={` ${customDark === "dark-dark" ? 'bg-white' : ''} p-2 rounded-3`}
              >
                <BarChart projectId={clickData.projectId} />
              </div>
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
