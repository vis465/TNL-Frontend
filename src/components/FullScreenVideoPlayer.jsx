import React, { useState, useRef } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Slider,
  Paper,
  Fade,
  useTheme
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import videurl from "../img/intro.mp4"
const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: '#000',
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover .video-controls': {
    opacity: 1,
  },
}));

const VideoElement = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ControlsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  padding: theme.spacing(3),
  opacity: 0,
  transition: 'opacity 0.3s ease',
}));

const PlayButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(0,0,0,0.7)',
  color: 'white',
  width: 80,
  height: 80,
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.9)',
    transform: 'translate(-50%, -50%) scale(1.1)',
  },
  transition: 'all 0.3s ease',
}));

const VideoUploadArea = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: '#1a1a1a',
  color: 'white',
  cursor: 'pointer',
  border: '2px dashed #666',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: '#2a2a2a',
  },
}));

const FullScreenVideoPlayer = () => {
  const theme = useTheme();
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (event, newValue) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    const volumeValue = newValue / 100;
    setVolume(volumeValue);
    if (videoRef.current) {
      videoRef.current.volume = volumeValue;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <VideoContainer
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={togglePlayPause}
    >
      <VideoElement
        ref={videoRef}
        src={videurl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        muted={isMuted}
      />

      {/* Center Play/Pause Button */}
      <Fade in={!isPlaying || showControls}>
        <PlayButton onClick={togglePlayPause}>
          {isPlaying ? <Pause sx={{ fontSize: 40 }} /> : <PlayArrow sx={{ fontSize: 40 }} />}
        </PlayButton>
      </Fade>

      {/* Bottom Controls */}
      <Fade in={showControls}>
        <ControlsOverlay className="video-controls">
          <Box sx={{ mb: 2 }}>
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleSeek}
              sx={{
                color: theme.palette.primary.main,
                '& .MuiSlider-thumb': { width: 16, height: 16 },
                '& .MuiSlider-track, .MuiSlider-rail': { height: 4 },
                '& .MuiSlider-rail': { opacity: 0.3 },
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} sx={{ color: 'white' }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <Typography variant="body2" sx={{ color: 'white', minWidth: 100 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 120 }}>
                <IconButton onClick={(e) => { e.stopPropagation(); toggleMute(); }} sx={{ color: 'white' }}>
                  {isMuted ? <VolumeOff /> : <VolumeUp />}
                </IconButton>
                <Slider
                  value={isMuted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  sx={{
                    color: 'white',
                    width: 80,
                    '& .MuiSlider-thumb': { width: 12, height: 12 },
                  }}
                />
              </Box>

              <IconButton onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} sx={{ color: 'white' }}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Box>
          </Box>
        </ControlsOverlay>
      </Fade>

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(rgba(0,0,0,0.8), transparent)',
          p: 3,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Click anywhere to play/pause • Hover for controls
        </Typography>
      </Box>
    </VideoContainer>
  );
};
export default FullScreenVideoPlayer;