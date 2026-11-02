import { describe, expect, it } from 'vitest';
import { mockCampaign, mockCampaignLucas, mockCampaignMaria } from './campaign';
import { mockProfile } from './profile';

describe('campaign mocks', () => {
  it('play the same video as the impact project section', () => {
    const impactProjectVideo = mockProfile.impactProject?.videoUrl;

    expect(impactProjectVideo).toBe('https://youtu.be/Bll78RzRaaU');
    for (const campaign of [mockCampaign, mockCampaignMaria, mockCampaignLucas]) {
      expect(campaign.videoUrl).toBe(impactProjectVideo);
    }
  });
});
