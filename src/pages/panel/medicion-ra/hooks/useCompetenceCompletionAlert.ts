import { useEffect, useRef } from "react";
import { showNotification } from "../../../../shared/feedback";
import { shouldNotifyCompetenceCompletion } from "../utils/competenceCompletion";

export function useCompetenceCompletionAlert({
  courseId,
  competenceId,
  isComplete,
  isReady,
  isLocked,
  onCompleted,
}: {
  courseId: string;
  competenceId: string;
  isComplete: boolean;
  isReady: boolean;
  isLocked: boolean;
  onCompleted: (competenceId: string) => void;
}) {
  const completionStateRef = useRef(new Map<string, boolean>());

  useEffect(() => {
    if (!isReady) return;

    const completionKey = `${courseId}__${competenceId}`;
    const previousComplete = completionStateRef.current.get(completionKey);
    completionStateRef.current.set(completionKey, isComplete);

    if (isLocked || !shouldNotifyCompetenceCompletion(previousComplete, isComplete)) return;

    onCompleted(competenceId);
    showNotification({
      variant: "success",
      message: "Competencia completada. Ya puedes continuar con la siguiente competencia.",
    });
  }, [competenceId, courseId, isComplete, isLocked, isReady, onCompleted]);
}
