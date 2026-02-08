import { useEffect, useState } from 'react';
import styled from 'styled-components';

const LoadingScreen = () => {
  const [loadingMessage, setLoadingMessage] = useState("Initializing environment");
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    "Tip: Brute force first, optimize later.",
    "Pro Tip: Consistency is the key to mastering DSA.",
    "Loading: Preparing the ultimate coding workspace...",
    "Tip: Space complexity is as important as time complexity.",
    "Did you know? The server is booting up its environment for you."
  ];

  useEffect(() => {
    // Animate Dots
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    // Progress Logic
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        const increment = prev < 50 ? Math.random() * 2 : Math.random() * 0.5;
        return prev + increment;
      });
    }, 350);

    // Cycle Tips every 4 seconds
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 4000);

    // Update Status Messages
    const timers = [
      setTimeout(() => setLoadingMessage("Waking up the server"), 5000),
      setTimeout(() => setLoadingMessage("Syncing problem database"), 15000),
      setTimeout(() => setLoadingMessage("Allocating compute resources"), 30000),
    ];

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
      clearInterval(tipInterval);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <StyledWrapper>
      <div className="main-container">
        {/* Atmosphere */}
        <div className="glow-top"></div>
        <div className="glow-bottom"></div>
        <div className="stars-overlay"></div>
        <div className="longfazers">
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* 1. Header Logo */}
        <div className="brand-header">
          <h1 className="brand-name">
            ALGO<span className="text-orange">SPRINT</span>
          </h1>
        </div>

        {/* 2. Center Stage (Rocket + Rotating Tips) */}
        <div className="center-stage">
          {/* Rocket Container */}
          <div className="rocket-container">
            <div className="loader-speeder">
              <span></span>
              <div className="base">
                <span></span>
              </div>
              <div className="face"></div>
            </div>
          </div>

          {/* Dynamic Tip Section */}
          <div className="tip-area">
            <div className="tip-card">
              <span className="tip-label">SYSTEM MESSAGE</span>
              <p className="tip-text">{tips[tipIndex]}</p>
            </div>
          </div>
        </div>

        {/* 3. Status & Large Progress Section */}
        <div className="status-zone">
          <h2 className="loading-text">
            {loadingMessage}<span className="orange-dots">{dots}</span>
          </h2>

          <div className="progress-tier">
            <div className="progress-info">
              <span>BOOT_SEQUENCE_ACTIVE</span>
              <span className="percent">{Math.round(progress)}%</span>
            </div>
            {/* LARGE PROGRESS BAR */}
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }}>
                <div className="shimmer"></div>
              </div>
            </div>
          </div>

          <p className="render-notice">
            The server needs a moment to initialize. Estimated wait: <span className="highlight">~45 seconds</span>.
          </p>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .main-container {
    min-height: 100vh;
    background: #05070a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 40px 24px 50px;
    overflow: hidden;
    position: relative;
    color: white;
    font-family: 'Inter', sans-serif;
    gap: 20px;
  }

  /* Mobile Responsive Adjustments */
  @media (max-width: 768px) {
    .main-container {
      padding: 30px 20px 40px;
      gap: 15px;
      justify-content: center;
    }
  }

  @media (max-height: 700px) {
    .main-container {
      padding: 20px 20px 30px;
      gap: 10px;
    }
  }

  /* Atmosphere Glows */
  .glow-top {
    position: absolute;
    top: -10%;
    left: -10%;
    width: 50%;
    height: 50%;
    background: rgba(249, 115, 22, 0.1);
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
  }

  .glow-bottom {
    position: absolute;
    bottom: -10%;
    right: -10%;
    width: 50%;
    height: 50%;
    background: rgba(37, 99, 235, 0.1);
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
  }

  .stars-overlay {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, #ffffff15 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
  }

  /* Logo */
  .brand-header {
    z-index: 100;
  }

  .brand-name {
    font-weight: 900;
    letter-spacing: 0.6em;
    font-size: 0.8rem;
    font-style: italic;
    opacity: 0.6;
    margin: 0;
  }

  @media (max-width: 768px) {
    .brand-name {
      font-size: 0.7rem;
      letter-spacing: 0.4em;
    }
  }

  .text-orange {
    color: #f97316;
  }

  /* Rocket Container */
  .center-stage {
    flex: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    z-index: 50;
    gap: 30px;
  }

  @media (max-width: 768px) {
    .center-stage {
      gap: 20px;
    }
  }

  @media (max-height: 700px) {
    .center-stage {
      gap: 15px;
    }
  }

  .rocket-container {
    position: relative;
    width: 100%;
    height: 80px;
  }

  @media (max-width: 768px) {
    .rocket-container {
      height: 60px;
    }
  }

  @media (max-height: 700px) {
    .rocket-container {
      height: 50px;
    }
  }

  /* Speeder (Rocket) Animation */
  .loader-speeder {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(1);
    margin-left: -50px;
    animation: speeder 0.4s linear infinite;
  }

  @media (max-width: 768px) {
    .loader-speeder {
      transform: translate(-50%, -50%) scale(0.8);
      margin-left: -40px;
    }
  }

  .loader-speeder > span {
    height: 4px;
    width: 35px;
    background: #f97316;
    position: absolute;
    top: -19px;
    left: 60px;
    border-radius: 2px 10px 1px 0;
  }

  .base span {
    position: absolute;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-right: 100px solid #f3f4f6;
    border-bottom: 6px solid transparent;
  }

  .base span:before {
    content: "";
    height: 22px;
    width: 22px;
    border-radius: 50%;
    background: #f3f4f6;
    position: absolute;
    right: -110px;
    top: -16px;
  }

  .base span:after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-top: 0 solid transparent;
    border-right: 55px solid #f3f4f6;
    border-bottom: 16px solid transparent;
    top: -16px;
    right: -98px;
  }

  .face {
    position: absolute;
    height: 12px;
    width: 20px;
    background: #f3f4f6;
    border-radius: 20px 20px 0 0;
    transform: rotate(-40deg);
    right: -125px;
    top: -15px;
  }

  .face:after {
    content: "";
    height: 10px;
    width: 10px;
    background: #f97316;
    right: 4px;
    top: 7px;
    position: absolute;
    transform: rotate(40deg);
    border-radius: 0 0 2px 2px;
  }

  /* Tip Card Section */
  .tip-area {
    max-width: 450px;
    width: 100%;
  }

  .tip-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 24px 20px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    text-align: center;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    animation: fadeIn 0.5s ease;
  }

  @media (max-width: 768px) {
    .tip-card {
      padding: 20px 16px;
      border-radius: 16px;
    }
  }

  @media (max-height: 700px) {
    .tip-card {
      padding: 16px 14px;
    }
  }

  .tip-label {
    display: block;
    font-size: 9px;
    font-weight: 900;
    color: #f97316;
    letter-spacing: 0.3em;
    margin-bottom: 10px;
  }

  @media (max-width: 768px) {
    .tip-label {
      font-size: 8px;
      margin-bottom: 8px;
    }
  }

  .tip-text {
    font-size: 1.1rem;
    font-weight: 500;
    color: #e2e8f0;
    line-height: 1.5;
    margin: 0;
  }

  @media (max-width: 768px) {
    .tip-text {
      font-size: 0.95rem;
      line-height: 1.4;
    }
  }

  @media (max-height: 700px) {
    .tip-text {
      font-size: 0.9rem;
    }
  }

  /* Status Message (Large) */
  .status-zone {
    width: 100%;
    max-width: 500px;
    z-index: 100;
    text-align: center;
  }

  .loading-text {
    font-size: 1.5rem;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 24px;
    letter-spacing: -0.02em;
    margin-top: 0;
  }

  @media (max-width: 768px) {
    .loading-text {
      font-size: 1.2rem;
      margin-bottom: 20px;
    }
  }

  @media (max-height: 700px) {
    .loading-text {
      font-size: 1.1rem;
      margin-bottom: 16px;
    }
  }

  .orange-dots {
    color: #f97316;
    display: inline-block;
    width: 30px;
    text-align: left;
  }

  @media (max-width: 768px) {
    .orange-dots {
      width: 24px;
    }
  }

  /* Progress Bar (Large) */
  .progress-tier {
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    .progress-tier {
      margin-bottom: 16px;
    }
  }

  @media (max-height: 700px) {
    .progress-tier {
      margin-bottom: 12px;
    }
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.2em;
    color: #475569;
    margin-bottom: 10px;
  }

  @media (max-width: 768px) {
    .progress-info {
      font-size: 8px;
      letter-spacing: 0.15em;
      margin-bottom: 8px;
    }
  }

  .percent {
    color: #f97316;
  }

  .progress-track {
    width: 100%;
    height: 8px;
    background: rgba(255,255,255,0.05);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
  }

  @media (max-width: 768px) {
    .progress-track {
      height: 6px;
    }
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(to right, #ea580c, #f97316);
    border-radius: 20px;
    transition: width 0.4s ease-out;
    position: relative;
  }

  .shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 2s infinite;
  }

  .render-notice {
    font-size: 11px;
    color: #64748b;
    font-weight: 500;
    margin: 0;
  }

  @media (max-width: 768px) {
    .render-notice {
      font-size: 10px;
    }
  }

  @media (max-height: 700px) {
    .render-notice {
      font-size: 9px;
    }
  }

  .highlight {
    color: #f97316;
    font-weight: bold;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes speeder {
    0% {
      transform: translate(2px, 1px);
    }
    50% {
      transform: translate(-1px, -2px);
    }
    100% {
      transform: translate(1px, 1px);
    }
  }

  @media (max-width: 768px) {
    @keyframes speeder {
      0% {
        transform: translate(2px, 1px) scale(0.8);
      }
      50% {
        transform: translate(-1px, -2px) scale(0.8);
      }
      100% {
        transform: translate(1px, 1px) scale(0.8);
      }
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes lf {
    0% {
      left: 150%;
    }
    100% {
      left: -150%;
      opacity: 0;
    }
  }

  /* Background Motion lines */
  .longfazers {
    position: absolute;
    inset: 0;
  }

  .longfazers span {
    position: absolute;
    height: 1px;
    width: 25%;
    background: rgba(249, 115, 22, 0.15);
  }

  .longfazers span:nth-child(1) {
    top: 15%;
    animation: lf 0.6s linear infinite;
  }

  .longfazers span:nth-child(2) {
    top: 45%;
    animation: lf 0.8s linear infinite;
    animation-delay: -1s;
  }

  .longfazers span:nth-child(3) {
    top: 75%;
    animation: lf 0.5s linear infinite;
  }
`;

export default LoadingScreen;