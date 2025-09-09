export default function Loader() {
  const blades = Array.from({ length: 12 })

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-8 h-8">
        {blades.map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-1 h-3 bg-blue-600 rounded-full origin-bottom animate-spin"
            style={{
              transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
              animationDelay: `${i * 0.083}s`,
              animationDuration: "1s",
              animationIterationCount: "infinite",
              animationTimingFunction: "linear",
            }}
          />
        ))}
      </div>
    </div>
  )
}
