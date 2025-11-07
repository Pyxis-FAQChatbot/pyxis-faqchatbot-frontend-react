import React from "react";
import { Menu } from "lucide-react";

export default function Header({ type = "chat", title = "", onMenuClick }) {
  return (
    <header className="header">
      {type === "main" ? (
        <>
          <div className="header-logo"></div>
          <h1 className="header-title">Pyxis</h1>
        </>
      ) : (
        <>
          <button className="menu-button" onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          <h1 className="header-title">{title}</h1>
        </>
      )}
    </header>
  );
}
