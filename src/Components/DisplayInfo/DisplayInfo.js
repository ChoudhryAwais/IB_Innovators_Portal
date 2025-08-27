import React from "react";

export function DisplayInfo({title, value}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #eee",
        padding: '5px 10px'
      }}
    >
      <div style={{ fontWeight: "bold", marginRight: "5px", textAlign: 'left' }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", textAlign: 'right' }}>
        {value}
      </div>
    </div>
  );
}
