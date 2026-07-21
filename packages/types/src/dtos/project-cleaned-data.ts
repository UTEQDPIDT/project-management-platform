export type ProjectCleanedData = {
  organization: string | undefined;
  team: string | undefined;
  program: string;
  isFunded?: boolean;
  activities: any;
  name: string;
  objective: string;
  trlRating: number;
  knowledgeAreas: string[];
  impactAreas: string[];
  prioritiesPND: string[];
  sustainableObjectives: string[];
  innovationLines: string[];
};
