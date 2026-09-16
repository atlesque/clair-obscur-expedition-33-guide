import { describe, expect, it } from 'vitest';
import { applySkillRecommendation, recommend, recommendSkill, recordLoadout, suggestLoadout } from './rules';
import type { Character } from './types';

const character = (overrides: Partial<Character> = {}): Character => ({
  id: 'gustave', name: 'Gustave', level: 4,
  invested: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 },
  points: 2, tracked: true, revealed: true, ...overrides
});

describe('public progression guidance', () => {
  it('uses an entered high-grade weapon affinity before general priorities', () => {
    const recommendation = recommend(character({ weaponScaling: { luck: 'S' } }));
    expect(recommendation.spend.luck).toBe(1);
    expect(recommendation.explanation).toContain('entered weapon-scaling');
  });

  it('states when weapon scaling is absent', () => {
    expect(recommend(character()).explanation).toContain('not considered');
  });

  it('withholds personalized skill advice until setup is complete', () => {
    expect(recommendSkill(character({ skillPoints: 4, unlockedSkills: [] }))).toBeNull();
    expect(suggestLoadout(character({ skillSetupComplete: false, unlockedSkills: ['marking-shot'] }))).toEqual([]);
  });

  it('recommends an affordable visible skill and applies it once', () => {
    const current = character({ skillSetupComplete: true, skillPoints: 2, unlockedSkills: ['marking-shot', 'lumiere-assault', 'overcharge'] });
    const pending = recommendSkill(current);
    expect(pending?.skillId).toBe('from-fire');
    const applied = applySkillRecommendation(current, pending!);
    expect(applied.unlockedSkills).toContain('from-fire');
    expect(applied.skillPoints).toBe(0);
    expect(applySkillRecommendation(applied, pending!)).toBe(applied);
    expect(applySkillRecommendation(current, { ...pending!, points: 0 })).toBe(current);
  });

  it('withholds point purchases for learned-skill characters and limits loadouts to owned skills', () => {
    const current = character({ id: 'monoco', name: 'Monoco', skillAcquisition: 'learned', skillSetupComplete: true, skillPoints: 9, unlockedSkills: ['learned-a', 'learned-b', 'unknown'] });
    expect(recommendSkill(current)?.explanation).toContain('discovered encounters');
    const loadout = recordLoadout(current, ['learned-b', 'unknown', 'learned-a', 'learned-a']);
    expect(loadout.loadout).toEqual(['learned-b', 'unknown', 'learned-a']);
    expect(suggestLoadout(loadout)).toEqual(['learned-a', 'learned-b', 'unknown']);
  });

  it('never treats a starting skill as an SP purchase', () => {
    const current = character({ skillSetupComplete: true, skillPoints: 2, unlockedSkills: [] });
    expect(recommendSkill(current)?.skillId).toBe('marking-shot');
  });

  it('withholds later purchases whose prerequisite evidence is incomplete', () => {
    const current = character({ id: 'verso', skillSetupComplete: true, skillPoints: 10, unlockedSkills: [] });
    expect(recommendSkill(current)?.save).toBe(true);
  });
});
