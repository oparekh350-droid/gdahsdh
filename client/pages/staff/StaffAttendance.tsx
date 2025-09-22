import React from "react";
import BackButton from "@/components/BackButton";
import { AttendanceMain } from "@/components/attendance/attendance-main";

export default function StaffAttendance() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <BackButton className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Staff Attendance</h1>
          <p className="text-gray-600">Check-in/out, calendar, reports</p>
        </div>
      </div>
      <AttendanceMain />
    </div>
  );
}
