import React, { useEffect, useState } from 'react';
import '../styles/BackgroundMesh.css';

function BackgroundMesh() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const moveX = (clientX / window.innerWidth - 0.5) * 40;
      const moveY = (clientY / window.innerHeight - 0.5) * 40;
      setMousePos({ x: moveX, y: moveY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="ai-background-wrapper">
      <div 
        className="grid-pattern-interactive"
        style={{
          transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0)`
        }}
      ></div>

      <div 
        className="glow-orb orb-1"
        style={{
          transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)`
        }}
      ></div>

      <div 
        className="glow-orb orb-2"
        style={{
          transform: `translate3d(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px, 0)`
        }}
      ></div>

      <div 
        className="glow-orb orb-3"
        style={{
          transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * -0.4}px, 0)`
        }}
      ></div>
    </div>
  );
}

export default BackgroundMesh;
