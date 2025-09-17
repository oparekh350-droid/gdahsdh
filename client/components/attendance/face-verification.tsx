"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, Check, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface FaceVerificationProps {
  onVerificationComplete: (verified: boolean, photoData?: string) => void
  isRequired?: boolean
}

export function FaceVerification({ onVerificationComplete, isRequired = false }: FaceVerificationProps) {
  const [isActive, setIsActive] = useState(false)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsActive(true)
      }
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access for face verification",
        variant: "destructive",
      })
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsActive(false)
  }, [])

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const dataURL = canvas.toDataURL("image/jpeg", 0.8)
    setPhotoData(dataURL)
    setPhotoTaken(true)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setPhotoTaken(false)
    setPhotoData(null)
    startCamera()
  }, [startCamera])

  const verifyPhoto = useCallback(async () => {
    if (!photoData) return

    setIsVerifying(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock verification result (90% success rate)
      const isVerified = Math.random() > 0.1

      if (isVerified) {
        toast({
          title: "Verification successful",
          description: "Face verification completed successfully",
        })
        onVerificationComplete(true, photoData)
      } else {
        toast({
          title: "Verification failed",
          description: "Face verification failed. Please try again.",
          variant: "destructive",
        })
        onVerificationComplete(false)
      }
    } catch (error) {
      toast({
        title: "Verification error",
        description: "An error occurred during verification",
        variant: "destructive",
      })
      onVerificationComplete(false)
    } finally {
      setIsVerifying(false)
    }
  }, [photoData, onVerificationComplete])

  const skipVerification = useCallback(() => {
    if (!isRequired) {
      onVerificationComplete(true)
    }
  }, [isRequired, onVerificationComplete])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Face Verification
          </span>
          {isRequired && <Badge variant="destructive">Required</Badge>}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isActive && !photoTaken && (
          <div className="text-center space-y-4">
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              {isRequired
                ? "Face verification is required for check-in"
                : "Optional face verification for enhanced security"}
            </p>
            <Button onClick={startCamera} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
            {!isRequired && (
              <Button variant="outline" onClick={skipVerification} className="w-full bg-transparent">
                Skip Verification
              </Button>
            )}
          </div>
        )}

        {isActive && !photoTaken && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 bg-black rounded-lg object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <Button onClick={takePhoto} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                <CameraOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {photoTaken && photoData && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={photoData || "/placeholder.svg"}
                alt="Captured photo"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={verifyPhoto} disabled={isVerifying} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
              <Button variant="outline" onClick={retakePhoto}>
                <X className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  )
}
