import { useState } from "react";
import type { EnrichedCourse } from "../dashboard.types";
import { notifyTeacherMeasurementReminder } from "../dashboard.utils";

export function useDashboardNotifications() {
  const [notifyCourse, setNotifyCourse] = useState<EnrichedCourse | null>(null);

  const handleConfirmNotifyTeacher = async () => {
    if (notifyCourse) await notifyTeacherMeasurementReminder(notifyCourse);
    setNotifyCourse(null);
  };

  return {
    notifyCourse,
    setNotifyCourse,
    handleConfirmNotifyTeacher,
  };
}
