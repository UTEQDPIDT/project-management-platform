import { IStandaloneProduct } from '@repo/types';

// Team members plus the owner, mirroring the avatars shown on project cards.
export function getStandaloneProductProfiles(product: IStandaloneProduct) {
  const profiles = (product.team?.memberships ?? [])
    .map((m) => ({
      givenName: m.user?.givenName,
      familyName: m.user?.familyName,
      avatarUrl: m.user?.avatarUrl,
    }))
    .filter((p) => p.givenName && p.familyName);

  if (product.team && product.owner) {
    profiles.push({
      givenName: product.owner.givenName,
      familyName: product.owner.familyName,
      avatarUrl: product.owner.avatarUrl,
    });
  }

  return profiles;
}
