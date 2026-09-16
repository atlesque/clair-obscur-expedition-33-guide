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
    expect(pending?.skillId).toBe('powerful');
    const applied = applySkillRecommendation(current, pending!);
    expect(applied.unlockedSkills).toContain('powerful');
    expect(applied.skillPoints).toBe(1);
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
    expect(recommendSkill(current)?.save).toBe(true);
  });

  it('withholds later purchases when no prerequisites are owned', () => {
    const current = character({ id: 'verso', skillSetupComplete: true, skillPoints: 10, unlockedSkills: [] });
    expect(recommendSkill(current)?.save).toBe(true);
  });

  it('accepts one branch of an OR prerequisite and rejects none', () => {
    const base = character({ id: 'lune', skillSetupComplete: true, skillPoints: 4, unlockedSkills: ['wildfire','thermal-transfer','healing-light','electrify','earth-rising','thunderfall','rebirth','fire-rage','revitalization','storm-caller','crippling-tsunami','crustal-crush','hell','terraquake','rockslide','lightning-dance'] });
    expect(recommendSkill(base)?.skillId).toBe('mayhem');
    expect(recommendSkill({ ...base, unlockedSkills: base.unlockedSkills!.filter((id) => id !== 'electrify' && id !== 'thermal-transfer') })?.skillId).not.toBe('mayhem');
  });
});


describe('catch-up and visibility regressions', () => {
  it('keeps a weighted forgiving build during large catch-up and adapts to existing investments', () => {
    const general = recommend(character({ points: 100 }));
    expect(general.points).toBe(100);
    expect(general.spend.vitality).toBeGreaterThan(general.spend.luck!);
    const scaled = recommend(character({ points: 100, weaponScaling: { luck: 'S' } }));
    expect(scaled.spend.luck).toBeGreaterThan(general.spend.luck! + 20);
    const invested = { vitality: 80, might: 0, agility: 0, defence: 0, luck: 0 };
    const adapted = recommend(character({ points: 20, invested }));
    expect(adapted.spend.vitality ?? 0).toBe(0);
    expect(invested.vitality).toBe(80);
    expect(adapted.points).toBe(20);
  });
  it('does not reintroduce hidden or unknown ordinary skills through the loadout fallback', () => {
    const current = character({ id: 'maelle', skillSetupComplete: true, unlockedSkills: ['maelle-spark', 'maelle-burning-canvas', 'unknown'], discoveredSkillIds: [] });
    expect(suggestLoadout(current)).toEqual(['maelle-spark']);
    expect(suggestLoadout({ ...current, discoveredSkillIds: ['maelle-burning-canvas'] })).toEqual(['maelle-spark', 'maelle-burning-canvas']);
  });
});
