import ArtifactsListGrid from "./ArtifactsListGrid";
import ArtifactsListTable from "./ArtifactsListTable";

import type { IState } from "redux/reducers";
import type { IArtifact } from "models";

import React from "react";
import { useSelector } from "react-redux";

interface IArtifactsListProps {
  artifacts: IArtifact[];
  readOnly?: boolean;
}

const sortScore = (artifact: IArtifact) => {
  let score = artifact.Level ?? 0;

  if (artifact.Champion) {
    score += 100000;
  }

  switch (artifact.Slot) {
    case "Weapon":
      score += 60000;
      break;
    case "Helmet":
      score += 50000;
      break;
    case "Shield":
      score += 40000;
      break;
    case "Gauntlets":
      score += 30000;
      break;
    case "Chestplate":
      score += 20000;
      break;
    case "Boots":
      score += 10000;
      break;
    default:
  }

  score += artifact.Quality * 1000;

  switch (artifact.Rarity) {
    case "Legendary":
      score += 500;
      break;
    case "Epic":
      score += 400;
      break;
    case "Rare":
      score += 300;
      break;
    case "Uncommon":
      score += 200;
      break;
    case "Common":
      score += 100;
      break;
    default:
  }

  return score;
};

const ArtifactsList = (props: IArtifactsListProps): JSX.Element => {
  const { artifacts, readOnly } = props;
  const display = useSelector(
    (state: IState) => state.configuration.artifactsDisplay
  );

  const sorted = [...artifacts].sort((a, b) => {
    const scoreA = sortScore(a);
    const scoreB = sortScore(b);

    return scoreB - scoreA;
  });

  return display === "Grid" ? (
    <ArtifactsListGrid artifacts={sorted} readOnly={readOnly} />
  ) : (
    <ArtifactsListTable artifacts={sorted} readOnly={readOnly} />
  );
};

export default ArtifactsList;
