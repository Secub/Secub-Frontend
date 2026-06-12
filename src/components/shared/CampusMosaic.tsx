import seccionalCali from "../../assets/seccionales/seccional-cali.jpg";

type CampusMosaicProps = {
  className?: string;
  hideTitles?: boolean;
  overlay?: boolean;
  layout?: "square" | "fill";
};

const campuses = [
  { title: "Seccional Cali", image: seccionalCali },
  { title: "Psicología", image: seccionalCali },
  { title: "Derecho", image: seccionalCali },
  { title: "Gestión académica SECUB", image: seccionalCali },
];

export default function CampusMosaic({
  className = "",
  hideTitles = false,
  layout = "square",
}: CampusMosaicProps) {
  const isFill = layout === "fill";

  return (
    <div className={`w-full ${isFill ? "h-full" : ""} ${className}`}>
      <div className={`grid grid-cols-2 ${isFill ? "h-full grid-rows-2" : "aspect-square"}`}>
        {campuses.map((campus) => (
          <article key={campus.title} className="group relative h-full w-full overflow-hidden">
            <img
              src={campus.image}
              alt={hideTitles ? "" : campus.title}
              aria-hidden={hideTitles ? "true" : undefined}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {!hideTitles && (
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.58))] p-3 sm:p-4">
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
