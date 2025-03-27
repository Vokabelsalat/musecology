export default function SpeciesIcon(props) {
  const {
    plantColor,
    animalColor,
    neutralColor = "yellow",
    redColor = "red"
  } = props;

  const mode = "";
  if (mode === "icons") {
    return (
      <div className="grid h-[26px] w-[26px] grid-cols-[12px_12px] grid-rows-[22px] relative border border-gray-700 rounded-full">
        <div
          className="absolute h-[21px] w-[11px] top-[4px] left-[2`px] bg-gray-700"
          style={{
            //backgroundColor: animalColor,
            mask: `url("/animalIcon.svg") no-repeat center / contain`,
            WebkitMask: `url("/animalIcon.svg") no-repeat center / contain`
          }}
        />
        <div
          className="absolute h-[21px] w-[11px] right-[2px] bottom-[4px] bg-gray-700"
          style={{
            //backgroundColor: plantColor,
            mask: `url("/plantIcon.svg") no-repeat center / contain`,
            WebkitMask: `url("/plantIcon.svg") no-repeat center / contain`
          }}
        />
      </div>
    );
  } else {
    return (
      <div className="h-[18px] w-[20px]">
        <div className="pieContainer scale-[0.9]">
          <div className="pieBackground"></div>
          {/*         <div class="hold pieSlice4">
          <div class="pie" style={{ backgroundColor: neutralColor }}></div>
        </div>
        <div class="hold pieSlice5">
          <div class="pie" style={{ backgroundColor: plantColor }}></div>
        </div>
        <div class="hold pieSlice6">
          <div class="pie" style={{ backgroundColor: animalColor }}></div>
        </div>
        <div class="hold pieSlice7">
          <div class="pie" style={{ backgroundColor: redColor }}></div>
        </div> */}
          <div className="hold pieSlice1">
            <div
              className="pie"
              style={{ backgroundColor: neutralColor }}
            ></div>
          </div>
          <div className="hold pieSlice2">
            <div className="pie" style={{ backgroundColor: plantColor }}></div>
          </div>
          <div className="hold pieSlice3">
            <div className="pie" style={{ backgroundColor: animalColor }}></div>
          </div>
          <div className="innerCircle" />
        </div>
      </div>
    );
  }
}
