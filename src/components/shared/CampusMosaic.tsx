import seccionalCali     from "../../assets/seccionales/seccional-cali.jpg";
import seccionalMedellin from "../../assets/seccionales/seccional-medellin.jpg";
import seccionalBogota   from "../../assets/seccionales/seccional-bogota.jpg";
import seccionalCartagena from "../../assets/seccionales/seccional-cartagena.webp";

type CampusMosaicProps = {
  className?: string;
  hideTitles?: boolean;
  overlay?: boolean;
  layout?: "square" | "fill";
};

const campuses = [
  {
    title: "Sede Cali",
    image: seccionalCali,
  },
  {
    title: "Sede Medellín",
    image: seccionalMedellin,
  },
  {
    title: "Sede Bogotá",
    image: seccionalBogota,
  },
  {
    title: "Sede Cartagena",
    image: seccionalCartagena,
  },
];

export default function CampusMosaic({
  className = "",
  hideTitles = false,
  overlay = true,
  layout = "square",
}: CampusMosaicProps) {
  const isFill = layout === "fill";

  return (
    <div className={`w-full ${isFill ? "h-full" : ""} ${className}`}>
      <div
        className={`grid grid-cols-2 ${isFill ? "h-full grid-rows-2" : "aspect-square"}`}
      >
        {campuses.map((campus) => (
          <article
            key={campus.title}
            className="group relative h-full w-full overflow-hidden"
          >
            <img
              src={campus.image}
              alt={campus.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {overlay && (
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(24,34,51,0.42),rgba(24,34,51,0.06),transparent)]" />
            )}

            {!hideTitles && (
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <p className="font-heading text-xs font-semibold text-white sm:text-sm md:text-base">
                  {campus.title}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}