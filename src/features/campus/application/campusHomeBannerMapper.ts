import type {
  CampusBannerSourceData,
  CampusBannerViewData,
} from '../model/campusHomeBanner';

const normalizeLabel = (value: string) => value.trim();

export const mapCampusBannerSourceToViewData = (
  source: CampusBannerSourceData,
): CampusBannerViewData => ({
  badgeLabel: normalizeLabel(source.badgeLabel),
  buttonLabel: normalizeLabel(source.buttonLabel),
  descriptionLabel: normalizeLabel(source.descriptionLabel),
  id: source.id,
  imageUrl: source.imageUrl,
  palette: {
    ...source.palette,
    backgroundGradient: [...source.palette.backgroundGradient] as [
      string,
      string,
    ],
  },
  titleLabel: normalizeLabel(source.titleLabel),
});
