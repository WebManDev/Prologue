"use client"

import React from 'react'
import { AutoplayVideo } from './autoplay-video'
import { Card, CardContent, CardHeader, CardTitle } from './card'

export function AutoplayVideoExample() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Autoplay Video Examples</h1>
      
      {/* Example 1: Muted Autoplay (Works on Mobile) */}
      <Card>
        <CardHeader>
          <CardTitle>Muted Autoplay (Mobile Compatible)</CardTitle>
          <p className="text-sm text-gray-600">
            This video will autoplay on mobile browsers because it's muted. 
            Uses muted, autoplay, and playsinline attributes.
          </p>
        </CardHeader>
        <CardContent>
          <AutoplayVideo
            src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
            autoplay={true}
            muted={true}
            playsInline={true}
            loop={true}
            controls={true}
            className="rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Example 2: Custom Controls with Autoplay */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Controls with Autoplay</CardTitle>
          <p className="text-sm text-gray-600">
            Video with custom controls and muted autoplay for mobile compatibility.
          </p>
        </CardHeader>
        <CardContent>
          <AutoplayVideo
            src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
            autoplay={true}
            muted={true}
            playsInline={true}
            showCustomControls={true}
            className="rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Example 3: No Autoplay (User Initiated) */}
      <Card>
        <CardHeader>
          <CardTitle>User Initiated Play (No Autoplay)</CardTitle>
          <p className="text-sm text-gray-600">
            This video requires user interaction to play, which works on all devices.
          </p>
        </CardHeader>
        <CardContent>
          <AutoplayVideo
            src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
            autoplay={false}
            muted={false}
            playsInline={true}
            controls={true}
            className="rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Example 4: Square Aspect Ratio */}
      <Card>
        <CardHeader>
          <CardTitle>Square Aspect Ratio Video</CardTitle>
          <p className="text-sm text-gray-600">
            Video with 1:1 aspect ratio and muted autoplay.
          </p>
        </CardHeader>
        <CardContent>
          <AutoplayVideo
            src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
            autoplay={true}
            muted={true}
            playsInline={true}
            loop={true}
            controls={true}
            aspectRatio="1/1"
            className="rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Mobile Browser Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Mobile Browser Autoplay Restrictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>iOS Safari & Android Chrome:</strong> Block autoplay with sound. 
              Videos must be muted to autoplay.
            </p>
            <p>
              <strong>Solution:</strong> Use <code>muted autoplay playsinline</code> attributes.
            </p>
            <div className="bg-blue-100 p-3 rounded-lg">
              <code className="text-xs">
                {`<video muted autoplay playsinline>
  <source src="video.mp4" type="video/mp4">
</video>`}
              </code>
            </div>
            <p>
              <strong>Note:</strong> Our AutoplayVideo component automatically handles these restrictions 
              and provides fallback controls for mobile devices.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 