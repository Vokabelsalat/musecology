export default function ThreatIcon(props) {
  const { leftColor, rightColor, isAnimal, size = "small" } = props;

  const url = isAnimal ? "/assets/animalIconLeft.svg" : "/assets/plantIconLeft.svg";
  const urlRight = isAnimal ? "/assets/animalIconRight.svg" : "/assets/plantIconRight.svg";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: size === "small" ? "8px 8px" : "32px 32px",
        gridTemplateRows: size === "small" ? "17px" : "65px"
      }}
    >
      <div
        style={{
          backgroundColor: leftColor,
          mask: `url(${url}) no-repeat center / contain`,
          WebkitMask: `url(${url}) no-repeat center / contain`
        }}
      />
      <div
        style={{
          backgroundColor: rightColor,
          mask: `url(${urlRight}) no-repeat center / contain`,
          WebkitMask: `url(${urlRight}) no-repeat center / contain`
        }}
      />
    </div>
  );
}
