"use client"

import React, { useRef, useEffect, useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from './button'

interface AutoplayVideoProps {
  src: string
  poster?: string
  className?: string
  style?: React.CSSProperties
  controls?: boolean
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  playsInline?: boolean
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (error: Event) => void
  showCustomControls?: boolean
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto'
}

export function AutoplayVideo({
  src,
  poster,
  className = "",
  style,
  controls = true,
  autoplay = false,
  muted = true, // Default to muted for autoplay compatibility
  loop = false,
  playsInline = true,
  onPlay,
  onPause,
  onEnded,
  onError,
  showCustomControls = false,
  aspectRatio = '16/9'
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(isMobileDevice)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleLoadedMetadata = () => setDuration(video.duration)
    const handlePlay = () => {
      setIsPlaying(true)
      onPlay?.()
    }
    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }
    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }
    const handleError = (error: Event) => onError?.(error)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [onPlay, onPause, onEnded, onError])

  // Handle autoplay with mobile restrictions
  useEffect(() => {
    const video = videoRef.current
    if (!video || !autoplay) return

    // For mobile devices, ensure video is muted for autoplay
    if (isMobile && !muted) {
      video.muted = true
      setIsMuted(true)
    }

    // Try to autoplay
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log('Autoplay prevented:', error)
        // On mobile, autoplay is often blocked - this is expected behavior
      })
    }
  }, [autoplay, muted, isMobile])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      // For mobile, ensure video is muted before playing
      if (isMobile && !isMuted) {
        video.muted = true
        setIsMuted(true)
      }
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const time = (e.target.valueAsNumber / 100) * duration
    video.currentTime = time
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '16/9':
        return 'aspect-video'
      case '4/3':
        return 'aspect-[4/3]'
      case '1/1':
        return 'aspect-square'
      case 'auto':
        return ''
      default:
        return 'aspect-video'
    }
  }

  // Inject slider styles only on the client
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .slider::-webkit-slider-thumb {
        appearance: none;
        height: 12px;
        width: 12px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
      }
      .slider::-moz-range-thumb {
        height: 12px;
        width: 12px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        border: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={`relative ${getAspectRatioClass()} ${className}`} style={style}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        controls={controls && !showCustomControls}
        muted={isMuted}
        loop={loop}
        playsInline={playsInline}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>

      {/* Custom Controls */}
      {showCustomControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            {/* Progress Bar */}
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={duration > 0 ? (currentTime / duration) * 100 : 0}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.3) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
            </div>

            {/* Time Display */}
            <span className="text-white text-xs min-w-[40px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Mute/Unmute Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Autoplay Notice */}
      {isMobile && autoplay && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white p-4">
            <p className="text-sm mb-2">Tap to play video</p>
            <Button
              onClick={togglePlay}
              className="bg-white text-black hover:bg-gray-100"
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 