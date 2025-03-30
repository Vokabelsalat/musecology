import "mapbox-gl/dist/mapbox-gl.css";
import React, { Component } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Story from "./components/Story/Story";
import ResizeComponent from "./components/ResizeComponent";
import HomeNew from "./components/Home";
import StoryEditor from "./components/StoryEditor";
import StoryWrapper from "./components/StoryWrapper";

const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
};
window.addEventListener("resize", appHeight);

/* function HomeWithParams({ match }) {
  let { instrumentGroup } = match.params;
  let { instrument } = match.params;
  let { mainPart } = match.params;

  console.log("Group", instrumentGroup);
  console.log("Instrument", instrument);
  console.log("Main Part", mainPart);

  return (
    <Home
      instrumentGroup={instrumentGroup}
      instrument={instrument}
      mainPart={mainPart}
    />
  );
} */

function App() {
  return (
    <div className="App relative">
      <div className=" absolute top-0 z-[9999] flex items-center">
        <div className="px-4 bg-orange-400 text-white">
          <span className="font-bold">&#9888;</span> Under Maintanance
        </div>
      </div>
      <Router>
        <Routes>
          <Route exact path="/" element={<HomeNew />} />
          <Route
            exact
            path="/bowstory"
            element={
              <div
                style={{
                  width: "100%",
                  height: "100%"
                }}
              >
                <ResizeComponent>
                  <Story storyName="bowstory" />
                </ResizeComponent>
              </div>
            }
          />
          <Route
            exact
            path="/concertstory"
            element={
              <div
                style={{
                  width: "100%",
                  height: "100%"
                }}
              >
                <ResizeComponent>
                  <Story storyName="concertstory" />
                </ResizeComponent>
              </div>
            }
          />
          <Route
            exact
            path="/storyeditor"
            element={
              <div
                style={{
                  width: "100%",
                  height: "100%"
                }}
              >
                <ResizeComponent>
                  <StoryEditor />
                </ResizeComponent>
              </div>
            }
          />
          <Route
            exact
            path="/sciebo/:storyId"
            element={<StoryWrapper sciebo={true} />}
          />
          <Route exact path="/:storyId" element={<StoryWrapper />} />
        </Routes>
        {/* <Route exact path="/timeline">
            <TimelineView />
            <div key="tooltip" id="tooltip" className="tooltip"></div>
          </Route> */}
      </Router>
    </div>
  );
}

export default App;
