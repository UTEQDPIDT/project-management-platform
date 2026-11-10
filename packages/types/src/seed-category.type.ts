export interface SeedCategory {
  _id: string;
  name: string;
  createdAt: string;
}

export interface DevelopmentLineSubcategory extends SeedCategory {
  developmentLine: string | SeedCategory;
}
