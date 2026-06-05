const iconLayers = [1, 2, 3, 4, 5, 6, 7];

const Test = () => {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="relative aspect-[1075/988] w-44 max-w-[55vw] sm:w-56 md:w-64">
        {iconLayers.map((layer, index) => (
          <div
            key={layer}
            className="test-icon-layer absolute inset-0"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <img
              src={`/assets/questionnaire/complete/${layer}.png`}
              alt=""
              aria-hidden="true"
              className="block h-full w-full object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </main>
  );
};

export default Test;
