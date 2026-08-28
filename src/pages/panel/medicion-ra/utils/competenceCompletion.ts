export function shouldNotifyCompetenceCompletion(
  previousComplete: boolean | undefined,
  currentComplete: boolean,
) {
  return previousComplete === false && currentComplete;
}
