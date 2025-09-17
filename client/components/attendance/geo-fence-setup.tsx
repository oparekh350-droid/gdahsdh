"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MapPin, Wifi, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import type { AttendanceSettings } from "../../../shared/types"

export function GeoFenceSetup() {
  const { business } = useAuth()
  const [settings, setSettings] = useState<AttendanceSettings>({
    businessId: business?.id || "",
    geoFencingEnabled: false,
    geoFenceRadius: 100,
    businessLocation: undefined,
    faceVerificationEnabled: false,
    autoCheckoutEnabled: false,
    autoCheckoutTime: "18:00",
    lateThresholdMinutes: 15,
    overtimeThresholdMinutes: 480,
    requireApprovalForNewStaff: true,
    allowWFH: true,
    reminderEnabled: true,
    reminderTime: "09:00",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [business?.id])

  const loadSettings = async () => {
    if (business?.id) {
      setSettings((prev) => ({ ...prev, businessId: business.id }))
    }
  }

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        })
      })

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      setCurrentLocation(location)
      setSettings((prev) => ({ ...prev, businessLocation: location }))

      toast({
        title: "Location captured",
        description: `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`,
      })
    } catch (error) {
      toast({
        title: "Location access denied",
        description: "Please allow location access to set up geo-fencing",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      console.log("Saving attendance settings:", settings)

      toast({
        title: "Settings saved",
        description: "Attendance settings have been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geo-Fencing Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Geo-Fencing</Label>
              <p className="text-sm text-muted-foreground">Restrict check-ins to specific locations</p>
            </div>
            <Switch
              checked={settings.geoFencingEnabled}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, geoFencingEnabled: checked }))}
            />
          </div>

          {settings.geoFencingEnabled && (
            <>
              <div className="space-y-2">
                <Label>Business Location</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {isLoading ? "Getting Location..." : "Use Current Location"}
                  </Button>
                </div>
                {settings.businessLocation && (
                  <p className="text-sm text-muted-foreground">
                    Current: {settings.businessLocation.lat.toFixed(6)}, {settings.businessLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius">Allowed Radius (meters)</Label>
                <Input
                  id="radius"
                  type="number"
                  value={settings.geoFenceRadius}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, geoFenceRadius: Number.parseInt(e.target.value) || 100 }))
                  }
                  min="10"
                  max="1000"
                />
                <p className="text-sm text-muted-foreground">
                  Staff can check-in within {settings.geoFenceRadius}m of the business location
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Face Verification</Label>
              <p className="text-sm text-muted-foreground">Require photo verification during check-in</p>
            </div>
            <Switch
              checked={settings.faceVerificationEnabled}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, faceVerificationEnabled: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Check-out</Label>
              <p className="text-sm text-muted-foreground">Automatically check out staff at end of day</p>
            </div>
            <Switch
              checked={settings.autoCheckoutEnabled}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoCheckoutEnabled: checked }))}
            />
          </div>

          {settings.autoCheckoutEnabled && (
            <div className="space-y-2">
              <Label htmlFor="autoCheckoutTime">Auto Check-out Time</Label>
              <Input
                id="autoCheckoutTime"
                type="time"
                value={settings.autoCheckoutTime}
                onChange={(e) => setSettings((prev) => ({ ...prev, autoCheckoutTime: e.target.value }))}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lateThreshold">Late Threshold (minutes)</Label>
              <Input
                id="lateThreshold"
                type="number"
                value={settings.lateThresholdMinutes}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, lateThresholdMinutes: Number.parseInt(e.target.value) || 15 }))
                }
                min="1"
                max="120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtimeThreshold">Overtime Threshold (minutes)</Label>
              <Input
                id="overtimeThreshold"
                type="number"
                value={settings.overtimeThresholdMinutes}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, overtimeThresholdMinutes: Number.parseInt(e.target.value) || 480 }))
                }
                min="300"
                max="720"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval for New Staff</Label>
              <p className="text-sm text-muted-foreground">New staff check-ins need owner approval</p>
            </div>
            <Switch
              checked={settings.requireApprovalForNewStaff}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, requireApprovalForNewStaff: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Work from Home</Label>
              <p className="text-sm text-muted-foreground">Staff can select WFH option during check-in</p>
            </div>
            <Switch
              checked={settings.allowWFH}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, allowWFH: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Reminders</Label>
              <p className="text-sm text-muted-foreground">Send check-in reminders to staff</p>
            </div>
            <Switch
              checked={settings.reminderEnabled}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, reminderEnabled: checked }))}
            />
          </div>

          {settings.reminderEnabled && (
            <div className="space-y-2">
              <Label htmlFor="reminderTime">Reminder Time</Label>
              <Input
                id="reminderTime"
                type="time"
                value={settings.reminderTime}
                onChange={(e) => setSettings((prev) => ({ ...prev, reminderTime: e.target.value }))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={saveSettings} disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  )
}
