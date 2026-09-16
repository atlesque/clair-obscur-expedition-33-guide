import { describe, expect, it } from 'vitest';
import { applyRecommendation, recommend, updateProgress } from './rules';
import type { Character } from './types';
const base: Character = { id:'gustave', name:'Gustave', level:10, invested:{vitality:3,might:2,agility:0,defence:0,luck:0}, points:0, tracked:true, revealed:true };
describe('progression public rules', () => {
  it('reconciles a direct catch-up and recommends only remaining points', () => { const c=updateProgress(base,{level:16, invested:{...base.invested}, points:6}); const rec=recommend(c); expect(rec.points).toBeLessThanOrEqual(6); expect(Object.values(rec.spend).reduce((a,b)=>a+(b??0),0)).toBeLessThanOrEqual(6); });
  it('keeps zero-point advice explanatory', () => expect(recommend(base).explanation).toContain('no available'));
  it('rejects stale confirmation without changing actual state', () => { const c={...base,points:2}; const rec=recommend(c); const newer={...c,level:11}; expect(applyRecommendation(newer,rec)).toBe(newer); });
  it('applies a recommendation once', () => { const c={...base,points:2}; const rec=recommend(c); const applied=applyRecommendation(c,rec); expect(applied.points).toBe(0); expect(applyRecommendation(applied,rec)).toBe(applied); });
});
