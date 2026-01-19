import { useState, useRef, useEffect } from 'react';
import { 
  Pause, Play, RotateCcw, RotateCw, 
  Settings, Volume2, VolumeX, Maximize 
} from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (amount) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    videoRef.current.playbackRate = speed;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    videoRef.current.muted = !isMuted;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        className="w-full aspect-video cursor-pointer"
      />

      {/* Center Play/Pause Large Overlay (visible only when paused) */}
      {!isPlaying && (
        <div 
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
        >
          <div className="bg-primary/90 p-5 rounded-full text-white shadow-xl">
            <Play size={40} fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 transition-opacity duration-300 ${
          isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-white text-xs font-mono w-10">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              const time = Number(e.target.value);
              videoRef.current.currentTime = time;
              setCurrentTime(time);
            }}
            className="range range-primary range-xs flex-1 accent-primary"
          />
          <span className="text-white text-xs font-mono w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button onClick={togglePlayPause} className="btn btn-ghost btn-circle btn-sm text-white">
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>

            {/* Skip Buttons */}
            <button onClick={() => skip(-10)} className="btn btn-ghost btn-circle btn-sm text-white" title="Back 10s">
              <RotateCcw size={18} />
            </button>
            <button onClick={() => skip(10)} className="btn btn-ghost btn-circle btn-sm text-white" title="Forward 10s">
              <RotateCw size={18} />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 ml-2 group/volume">
              <button onClick={toggleMute} className="btn btn-ghost btn-circle btn-sm text-white">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" 
                min="0" max="1" step="0.1" 
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  videoRef.current.volume = val;
                  setIsMuted(val === 0);
                }}
                className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 accent-white h-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Playback Speed Dropdown */}
            <div className="dropdown dropdown-top dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-sm text-white text-xs">
                {playbackSpeed}x
              </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-24 mb-2">
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <li key={speed}>
                    <button 
                      className={playbackSpeed === speed ? 'bg-primary text-white' : ''}
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quality Dropdown (Static Placeholder) */}
            <div className="dropdown dropdown-top dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-sm text-white">
                <Settings size={18} />
              </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-32 mb-2">
                <li className="menu-title text-[10px] uppercase">Quality</li>
                <li><button className="bg-primary text-white text-xs">Auto (1080p)</button></li>
                <li><button className="text-xs">720p</button></li>
                <li><button className="text-xs">480p</button></li>
              </ul>
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullScreen} className="btn btn-ghost btn-circle btn-sm text-white">
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editorial;