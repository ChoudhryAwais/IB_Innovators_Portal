import React from "react";

export default function Loader() {
  const blades = Array.from({ length: 12 });

  return (
    <div className="relative inline-block w-7 h-7 text-[28px]">
      <div className="absolute inset-0 m-auto">
        {blades.map((_, i) => (
          <div
            key={i}
            className="absolute left-[46.29%] bottom-0 w-[7.4%] h-[27.77%] rounded-[5.55%] bg-white animate-spin-fade"
            style={{
              transformOrigin: "center -22.22%",
              transform: `rotate(${i * 30}deg)`,
              animationDelay: `${i * 0.083}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes spin-fade {
          0% { background-color: #fff; }
          100% { background-color: transparent; }
        }
        .animate-spin-fade {
          animation: spin-fade 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
