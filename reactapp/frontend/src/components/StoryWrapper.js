import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ResizeComponent from "./ResizeComponent";
import Story from "./Story/Story";

export default function StoryWrapper(props) {
  const { sciebo = false } = props;
  let { storyId } = useParams();
  console.log(useParams(), sciebo);

  const [contents, setContents] = useState(null);

  useEffect(() => {
    let url = `./${storyId}.json`;

    if (sciebo) {
      url = `https://th-koeln.sciebo.de/s/${storyId}/download`;
      
    }

    /* url =
      "https://drive.google.com/uc?export=download&id=113Ycaz2nsrAgPXzaE7_l_wqZlJjaQtr6"; */

    fetch(url)
      .then((res) => res.json())
      .then(function (storyData) {
        setContents(storyData);
      })
      .catch((error) => {
        console.log(`Couldn't find file ${url}`, error);
      });
  }, [storyId, sciebo]);

  const content = useMemo(() => {
    if (contents) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%"
          }}
        >
          <ResizeComponent>
            <Story contents={contents} storyName={storyId} />
          </ResizeComponent>
        </div>
      );
    } else {
      return "HELP!";
    }
  }, [contents]);

  return content;
}
