import { useMemo } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/16/solid";
import Switch from "@mui/material/Switch";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEarthAmericas,
  faHandHolding,
  faMountainSun,
  faWater
} from "@fortawesome/free-solid-svg-icons";
import SpeciesIcon from "./SpeciesIcon";
import { iucnAssessment } from "../utils/timelineUtils";

export default function DiversityScale(props) {
  const { scales = {}, className, setMapMode, colorBlind } = props;
  /*   const stringedScales = JSON.stringify(scales);

  const scale = useMemo(() => {
    const parsed = JSON.parse(stringedScales);
    if (parsed.hasOwnProperty(mapMode)) {
      return JSON.parse(stringedScales)[mapMode];
    } else {
      return [];
    }
  }, [stringedScales, mapMode]);

  console.log(scales, mapMode, scale); */

  const scale = scales.scale ?? [];
  const mapMode = scales.type ?? "countries";

  const { scaleElements, typeText, typeTextSecond, col } = useMemo(() => {
    let scaleElements = [];

    let typeText = "";
    let typeTextSecond = "";

    switch (mapMode) {
      case "countries":
        typeText = "Species";
        typeTextSecond = "Country";
        break;
      case "hexagons":
        typeText = "Species";
        typeTextSecond = "Hexagon";
        break;
      case "ecoregions":
        typeText = "Species";
        typeTextSecond = "Ecoregion";
        break;
      case "protection":
        typeText = "Protection Potential";
        typeTextSecond = "Ecogregion";
        break;
      case "orchestras":
        typeText = "Orchestras";
        typeTextSecond = "Country";
        break;
      default:
        break;
    }

    //let width =
    let col = 1;

    for (let scaleValue of scale) {
      scaleElements.push(
        <div
          key={"scaleElement" + scaleValue.scaleValue}
          className="scaleElement"
          style={{
            gridColumnStart: col,
            gridColumnEnd: col,
            gridRowStart: 1,
            gridRowEnd: 1,
            height: "20px"
          }}
        >
          <div
            className="innerScaleElement color"
            style={{
              backgroundColor: "white",
              border: "solid 1px #f4f4f4",
              height: "10px"
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: scaleValue.scaleColor
              }}
            ></div>
          </div>
          <div
            className="innerScaleElement text"
            style={{
              height: "10px",
              paddingRight: "2px",
              textAlign: "start",
              fontSize: "smaller"
            }}
          >
            {scaleValue.scaleLabel
              ? scaleValue.scaleLabel
              : scaleValue.scaleValue}
          </div>
        </div>
      );
      col = col + 1;
    }

    return { scaleElements, typeText, typeTextSecond, col };
  }, [scale, mapMode]);

  const orangeIconColor = iucnAssessment.get("CR").getColor(colorBlind);
  const redIconColor = iucnAssessment.get("EX").getColor(colorBlind);
  const yellowIconColor = iucnAssessment.get("NT").getColor(colorBlind);
  const greenIconColor = iucnAssessment.get("LC").getColor(colorBlind);
  const neutralIconColor = "gray";

  const blueIconColor = "rgba(45, 45, 255, 0.8)";

  const MapModeListboxOption = (params) => {
    const { id } = params;

    switch (id) {
      case "countries":
        return (
          <>
            <div className="flex gap-1 items-center">
              <SpeciesIcon
                animalColor={orangeIconColor}
                plantColor={yellowIconColor}
                neutralColor={greenIconColor}
              />
              <div className="text-sm/6 text-nowrap">
                Species<span className="maplayer-devider">/</span>Country
              </div>
            </div>
            <FontAwesomeIcon icon={faEarthAmericas} color={blueIconColor} />
          </>
        );
      case "ecoregions":
        return (
          <>
            <div className="flex gap-1 items-center">
              <SpeciesIcon
                animalColor={orangeIconColor}
                plantColor={yellowIconColor}
                neutralColor={greenIconColor}
              />
              <div className="text-sm/6 text-nowrap">
                Species<span className="maplayer-devider">/</span>Ecoregion
              </div>
            </div>
            <FontAwesomeIcon icon={faMountainSun} color={blueIconColor} />
          </>
        );
      case "hexagons":
        return (
          <>
            {" "}
            <div className="flex gap-1 items-center">
              <SpeciesIcon
                animalColor={orangeIconColor}
                plantColor={yellowIconColor}
                neutralColor={greenIconColor}
              />
              <div className="text-sm/6 text-nowrap">
                Species<span className="maplayer-devider">/</span>Hexagon
              </div>
            </div>
            <div
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: blueIconColor,
                "-webkit-clip-path":
                  "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
                clipPath:
                  "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)"
              }}
            ></div>
          </>
        );
      /* case "ecoregionsmar":
        return (
          <>
            <div className="flex gap-1 items-center">
              <SpeciesIcon
                animalColor={orangeIconColor}
                plantColor={yellowIconColor}
                neutralColor={greenIconColor}
              />
              <div className="text-sm/6 text-nowrap">
                Species<span className="maplayer-devider">/</span>Mar. Ecoregion
              </div>
            </div>
            <FontAwesomeIcon icon={faWater} color={blueIconColor} />
          </>
        ); */
      case "orchestras":
        return (
          <>
            <div className="flex gap-1 items-center">
              <div className="w-[18px] h-[20px] flex items-center justify-center">
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    backgroundColor: "purple",
                    borderRadius: "50%"
                  }}
                ></div>
              </div>
              <div className="text-sm/6 text-nowrap">
                Orchestras<span className="maplayer-devider">/</span>
                Country
              </div>
            </div>
            <FontAwesomeIcon icon={faEarthAmericas} color={blueIconColor} />
          </>
        );
      case "protection":
        return (
          <>
            <div className="flex gap-1 items-center">
              <SpeciesIcon
                animalColor={orangeIconColor}
                plantColor={yellowIconColor}
                neutralColor={greenIconColor}
              />
              <div className="text-sm/6 w-min leading-none">
                Species
                <span className="maplayer-devider">/</span>
                Ecoregion{" "}
                <span className="whitespace-nowrap">Protection Potential</span>
              </div>
            </div>
            <div className="relative h-[21px] w-5">
              <FontAwesomeIcon
                className="absolute top-0 left-1"
                icon={faMountainSun}
                color={orangeIconColor}
                size="xs"
              />
              <FontAwesomeIcon
                className="absolute bottom-0 left-0"
                icon={faHandHolding}
                color={redIconColor}
                size="lg"
              />
            </div>
          </>
        );
      default:
        break;
    }
  };

  const mapModeListOptions = [
    "countries",
    "ecoregions",
    "hexagons",
    "devider",
    "orchestras",
    "protection"
  ];

  return (
    <div className="grid grid-cols-[auto_min-content] grid-rows-1 items-center">
      <div
        className={className}
        style={{
          width: "100%",
          height: "auto",
          display: "grid",
          gridTemplateColumns: Array.from(Array(col - 1).keys())
            .map((e) => "auto")
            .join(" "),
          gridTemplateRows: "30px"
        }}
      >
        {scaleElements}
      </div>
      <div
        style={{
          display: "grid",
          height: "auto",
          width: "fit-content",
          gridTemplateColumns: "auto auto auto auto",
          gridTemplateRows: "auto",
          gridGap: "8px",
          padding: "3px",
          alignItems: "center"
        }}
      >
        <div
          style={{
            /* whiteSpace: "break-spaces", */
            textAlign: "center",
            height: "100%",
            alignSelf: "center",
            width: "min-content",
            fontSize: "smaller",
            marginLeft: "5px"
          }}
        >
          {/* <div style={{textWrapMode: "nowrap", height: "100%", display: "flex"}}>{typeText}<span className="maplayer-devider">/</span>{typeTextSecond}</div> */}
          <div className="mx-auto h-full">
            <Listbox value={mapMode} onChange={setMapMode}>
              <ListboxButton className="relative block w-full rounded-[4px] bg-white border border-gray-400 py-1 pr-7 pl-1 text-left text-sm/6 focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25">
                <div className="flex gap-1 items-center">
                  <MapModeListboxOption id={mapMode} />
                </div>
                <ChevronDownIcon
                  className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-gray-400"
                  aria-hidden="true"
                />
              </ListboxButton>
              <ListboxOptions
                anchor="bottom end"
                className="w-auto rounded-[4px] border border-gray-400 bg-white [--anchor-gap:var(--spacing-1)] focus:outline-none data-[leave]:data-[closed]:opacity-0 z-[9999]"
              >
                {mapModeListOptions.map((e) => {
                  if (e === "devider") {
                    return (
                      <div
                        className="my-[2px]"
                        style={{
                          gridColumnStart: 1,
                          gridColumnEnd: "span 2",
                          height: "1px",
                          width: "100%",
                          backgroundColor: "gray"
                        }}
                      ></div>
                    );
                  } else {
                    return (
                      <ListboxOption
                        key={`${e}-listoption`}
                        value={e}
                        className="justify-between p-1 px-[6px] group flex cursor-pointer items-center gap-2 hover:bg-gray-100 select-none data-[focus]:bg-purple/10"
                      >
                        <MapModeListboxOption id={e} />
                      </ListboxOption>
                    );
                  }
                })}
              </ListboxOptions>
            </Listbox>
          </div>

          {/* <div className="w-52 text-right z-50">
            <Listbox value={mapMode} onChange={()=>{}}>
            <ListboxButton
              className='relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6 focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'>
              <span>{typeText}<span className="maplayer-devider">/</span>{typeTextSecond}</span>
              <ChevronDownIcon
                className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-gray-400"
                aria-hidden="true"
              />
            </ListboxButton>
              <ListboxOptions anchor="bottom">
                  <ListboxOption key={"countries-listoption"} value={"countries"} className="data-[focus]:bg-blue-100">
                    Species<span className="maplayer-devider">/</span>Countries
                  </ListboxOption>
                  <ListboxOption key={"ecoregions-listoption"} value={"ecoregions"} className="data-[focus]:bg-blue-100">
                  Species<span className="maplayer-devider">/</span>Ecoregions
                  </ListboxOption>
              </ListboxOptions>
            </Listbox>
          </div> */}
        </div>
      </div>
    </div>
  );

  //return <div style={{  }}></div>;
}
