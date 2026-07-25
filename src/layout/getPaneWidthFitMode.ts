export type PaneWidthFitMode = {
  fitDictionary: boolean;
  fitWordList: boolean;
};

export function getPaneWidthFitMode(
  width: number,
  height: number,
): PaneWidthFitMode {
  const isPortrait = height >= width;

  return {
    fitDictionary: isPortrait,
    fitWordList: !isPortrait,
  };
}
