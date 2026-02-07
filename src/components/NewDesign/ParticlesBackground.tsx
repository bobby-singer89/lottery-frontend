import React from 'react';
import './ParticlesBackground.css';

const ParticlesBackground: React.FC = () => {
  return (
    <div className="particles-container">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${5 + Math.random() * 10}s`
        }} />
      ))}
    </div>
  );
};

export default ParticlesBackground;
