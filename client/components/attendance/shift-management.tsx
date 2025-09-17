"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Clock, Plus, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import type { Shift } from "../../../shared/types"

export function ShiftManagement() {
  const { business } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
    breakDuration: 60,
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
  })

  useEffect(() => {
    loadShifts()
  }, [business?.id])

  const loadShifts = async () => {
    const mockShifts: Shift[] = [
      {
        id: "1",
        businessId: business?.id || "",
        name: "Morning Shift",
        startTime: "09:00",
        endTime: "17:00",
        breakDuration: 60,
        isActive: true,
        daysOfWeek: [1, 2, 3, 4, 5],
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        businessId: business?.id || "",
        name: "Evening Shift",
        startTime: "14:00",
        endTime: "22:00",
        breakDuration: 30,
        isActive: true,
        daysOfWeek: [1, 2, 3, 4, 5, 6],
        createdAt: new Date().toISOString(),
      },
    ]
    setShifts(mockShifts)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const shiftData: Omit<Shift, "id" | "createdAt"> = {
        businessId: business?.id || "",
        ...formData,
      }

      if (editingShift) {
        // Update existing shift
        const updatedShift: Shift = {
          ...editingShift,
          ...shiftData,
        }
        setShifts((prev) => prev.map((s) => (s.id === editingShift.id ? updatedShift : s)))
        toast({
          title: "Shift updated",
          description: "Shift has been updated successfully",
        })
      } else {
        // Create new shift
        const newShift: Shift = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          ...shiftData,
        }
        setShifts((prev) => [...prev, newShift])
        toast({
          title: "Shift created",
          description: "New shift has been created successfully",
        })
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save shift",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      startTime: "09:00",
      endTime: "17:00",
      breakDuration: 60,
      daysOfWeek: [1, 2, 3, 4, 5],
      isActive: true,
    })
    setEditingShift(null)
  }

  const handleEdit = (shift: Shift) => {
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
      daysOfWeek: shift.daysOfWeek,
      isActive: shift.isActive,
    })
    setEditingShift(shift)
    setIsDialogOpen(true)
  }

  const handleDelete = async (shiftId: string) => {
    try {
      setShifts((prev) => prev.filter((s) => s.id !== shiftId))
      toast({
        title: "Shift deleted",
        description: "Shift has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete shift",
        variant: "destructive",
      })
    }
  }

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }))
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const formatDays = (days: number[]) => {
    return days.map((d) => dayNames[d]).join(", ")
  }

  const calculateShiftDuration = (start: string, end: string, breakMinutes: number) => {
    const [startHour, startMin] = start.split(":").map(Number)
    const [endHour, endMin] = end.split(":").map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    const totalMinutes = endMinutes - startMinutes - breakMinutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shift Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingShift ? "Edit Shift" : "Create New Shift"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shift Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Morning Shift"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                <Input
                  id="breakDuration"
                  type="number"
                  value={formData.breakDuration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, breakDuration: Number.parseInt(e.target.value) || 0 }))
                  }
                  min="0"
                  max="240"
                />
              </div>

              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="flex gap-2">
                  {dayNames.map((day, index) => (
                    <Button
                      key={day}
                      type="button"
                      variant={formData.daysOfWeek.includes(index) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(index)}
                      className="w-12"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingShift ? "Update" : "Create"} Shift
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {shifts.map((shift) => (
          <Card key={shift.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{shift.name}</h3>
                    <Badge variant={shift.isActive ? "default" : "secondary"}>
                      {shift.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {shift.startTime} - {shift.endTime}
                    </div>
                    <div>Duration: {calculateShiftDuration(shift.startTime, shift.endTime, shift.breakDuration)}</div>
                    <div>Break: {shift.breakDuration}min</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Days: {formatDays(shift.daysOfWeek)}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(shift)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(shift.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {shifts.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No shifts configured yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first shift to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
