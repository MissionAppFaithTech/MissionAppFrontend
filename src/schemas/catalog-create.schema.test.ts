import { describe, expect, it } from 'vitest';
import { createFaithCommunitySchema, createMissionaryAgencySchema } from './catalog-create.schema';

const validAgency = {
  name: 'JOCUM',
  country: 'Brasil',
  state: 'PR',
  city: 'Curitiba',
  phone: '+5511987654321',
  address1: '',
  address2: '',
  zipCode: '',
  website: '',
};

const validChurch = {
  name: 'Igreja Batista',
  country: 'Brasil',
  state: 'SP',
  city: 'São Paulo',
  churchPhone: '+5511987654321',
  pastorName: 'Pr. João Souza',
  pastorPhone: '+5511912345678',
  address1: '',
  address2: '',
  zipCode: '',
  website: '',
};

describe('createMissionaryAgencySchema', () => {
  it('accepts the required agency fields', () => {
    expect(createMissionaryAgencySchema.safeParse(validAgency).success).toBe(true);
  });

  it('rejects missing required agency fields', () => {
    const result = createMissionaryAgencySchema.safeParse({
      ...validAgency,
      name: '',
      country: '',
      phone: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(expect.arrayContaining(['name', 'country', 'phone']));
    }
  });

  it('rejects an invalid optional website', () => {
    const result = createMissionaryAgencySchema.safeParse({
      ...validAgency,
      website: 'nao-e-site',
    });

    expect(result.success).toBe(false);
  });
});

describe('createFaithCommunitySchema', () => {
  it('accepts name, location, pastor and contacts', () => {
    expect(createFaithCommunitySchema.safeParse(validChurch).success).toBe(true);
  });

  it('rejects missing required church fields', () => {
    const result = createFaithCommunitySchema.safeParse({
      ...validChurch,
      name: '',
      city: '',
      pastorName: '',
      churchPhone: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(expect.arrayContaining(['name', 'city', 'pastorName', 'churchPhone']));
    }
  });
});
