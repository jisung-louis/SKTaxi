export interface CampusBannerPalette {
  backgroundGradient: readonly [string, string];
  badgeBackground: string;
  badgeText: string;
  buttonBackground: string;
  buttonText: string;
  accent: string;
}

export interface CampusBannerSourceData {
  id: string;
  badgeLabel: string;
  titleLabel: string;
  descriptionLabel: string;
  buttonLabel: string;
  palette: CampusBannerPalette;
  imageUrl: string;
}

export interface CampusBannerViewData {
  id: string;
  badgeLabel: string;
  titleLabel: string;
  descriptionLabel: string;
  buttonLabel: string;
  palette: CampusBannerPalette;
  imageUrl: string;
}
