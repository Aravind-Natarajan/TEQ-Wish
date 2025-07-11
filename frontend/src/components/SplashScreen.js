import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/Logo.jpeg";
import "./SplashScreen.css";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);
  useEffect(() => {
    const styleEl = document.createElement("style");

    const directions = ["top", "bottom", "left", "right"];

    const bubbleStyles = Array.from({ length: 800 }, (_, i) => {
      const size = Math.random() * 15 + 5;
      const delay = Math.random() * 10;
      const duration = Math.random() * 10 + 3;
      const direction = directions[i % 4]; 

      
      let positionStyle = "";
      switch (direction) {
        case "top":
          positionStyle = `top: -${size}px; left: ${Math.random() * 100}%;`;
          break;
        case "bottom":
          positionStyle = `bottom: -${size}px; left: ${Math.random() * 100}%;`;
          break;
        case "left":
          positionStyle = `left: -${size}px; top: ${Math.random() * 100}%;`;
          break;
        case "right":
          positionStyle = `right: -${size}px; top: ${Math.random() * 100}%;`;
          break;
      }

      return `
      .bubble-${i} {
        width: ${size}px;
        height: ${size}px;
        ${positionStyle}
        animation: move-${direction} ${duration}s linear ${delay}s infinite;
      }
    `;
    }).join("");

    styleEl.innerHTML = bubbleStyles;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl); 
    };
  }, []);

  const bubbles = Array.from({ length: 800 }, (_, i) => (
    <div key={i} className={`bubble bubble-${i}`} />
  ));


  return (
    <div className="splash-container">
      {bubbles}
      <motion.img
        src={Logo}
        alt="Logo"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 3, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        className="logo"
      />
    </div>
  );
}
