import { ATTRIBUTES, cloneAttributes } from './types';
import type { Attributes, Character, Recommendation, SkillRecommendation } from './types';
import { SKILLS, ATTRIBUTE_PRIORITIES } from './data';
function recommendationWeights(c: Character): Record<keyof Attributes, number> {
  const base = (ATTRIBUTE_PRIORITIES[c.id as keyof typeof ATTRIBUTE_PRIORITIES] ?? ATTRIBUTE_PRIORITIES.default).weights;
  const result: Record<keyof Attributes, number> = { ...base };
  const grades: Record<string, number> = { D: 1, C: 2, B: 3, A: 4, S: 5 };
  const entered = c.weaponScaling ?? c.scaling?.attributes ?? {};
  for (const a of ATTRIBUTES) {
    const grade = entered[a]?.toUpperCase();
    if (grade && grades[grade]) result[a] += grades[grade] * 0.15;
  }
  const total = Object.values(result).reduce((sum, value) => sum + value, 0);
  for (const a of ATTRIBUTES) result[a] /= total;
  return result;
}
export function recommend(c: Character): Recommendation {
  const target = recommendationWeights(c);
  const spend: Partial<Attributes> = {};
  let left = c.points;
  let total = Object.values(c.invested).reduce((sum, value) => sum + value, 0);
  while (left > 0) {
    const candidates = ATTRIBUTES.filter(a => c.invested[a] + (spend[a] ?? 0) < 99);
    if (!candidates.length) break;
    const deficit = (a: keyof Attributes) => target[a] * (total + 1) - c.invested[a] - (spend[a] ?? 0);
    const next = candidates.sort((a, b) => deficit(b) - deficit(a))[0];
    spend[next] = (spend[next] ?? 0) + 1;
    total++; left--;
  }
  const scaling = Object.keys(c.weaponScaling ?? c.scaling?.attributes ?? {}).length > 0;
  return { characterId: c.id, base: cloneAttributes(c.invested), basePoints: c.points, spend, points: c.points - left,
    explanation: c.points ? (scaling ? 'Prioritises your entered weapon-scaling attributes, then survivability and reliable damage. Scaling is directional advice, not a full equipment optimiser.' : 'Prioritises survivability first, then reliable damage, while respecting each attribute cap. Equipped-weapon scaling is not considered until you enter it.') : 'There are no available attribute points to allocate.', revision: c.level };
}
export function applyRecommendation(c:Character,r:Recommendation):Character{if(r.revision!==c.level||r.characterId!==c.id||ATTRIBUTES.some(a=>r.base[a]!==c.invested[a])||r.points>c.points||r.basePoints!==c.points)return c;if(!Number.isInteger(r.points)||r.points<0||Object.values(r.spend).some(v=>!Number.isInteger(v)||v!<0)||r.points!==Object.values(r.spend).reduce((a,v)=>a+(v??0),0))return c;const invested=cloneAttributes(c.invested);for(const a of ATTRIBUTES){const n=r.spend[a]??0;if(invested[a]+n>99)return c;invested[a]+=n;}return{...c,invested,points:c.points-r.points,pending:undefined};}
export function updateProgress(c:Character,i:{level:number;invested:Attributes;points:number}):Character{if(!Number.isInteger(i.level)||i.level<1||i.level>99||!Number.isInteger(i.points)||i.points<0||ATTRIBUTES.some(a=>!Number.isInteger(i.invested[a])||i.invested[a]<0||i.invested[a]>99))throw new Error('Enter whole numbers within the supported level and attribute ranges.');return{...c,level:i.level,invested:cloneAttributes(i.invested),points:i.points,pending:undefined,pendingSkill:undefined};}
export function recommendSkill(c:Character):SkillRecommendation|null{if(!c.skillSetupComplete||!c.unlockedSkills)return null;if(c.id==='monoco')return{characterId:c.id,save:true,points:0,explanation:'This character learns skills through discovered encounters. Record a skill after you confirm learning it; no skill-point purchase is suggested.',revision:c.level,baseSkillPoints:c.skillPoints??0,baseUnlockedSkills:[...c.unlockedSkills]};if(c.skillPoints===undefined)return null;const owned=new Set(c.unlockedSkills),disc=new Set(c.discoveredSkillIds??[]),s=(SKILLS[c.id]??[]).find(s=>!s.starting&&s.acquisition!=='learned'&&!s.unsupportedPurchase&&(!s.storyGated||disc.has(s.id))&&!owned.has(s.id)&&(s.requires??[]).every(x=>owned.has(x))&&(s.requiresAny??[]).every(g=>g.some(x=>owned.has(x)))&&s.cost<=c.skillPoints!);return{characterId:c.id,skillId:s?.id,save:!s,points:s?.cost??0,explanation:s?`Unlock ${s.name} for ${s.cost} skill point${s.cost===1?'':'s'}.`:'Save your skill points until a visible skill is affordable and its prerequisites are met.',revision:c.level,baseSkillPoints:c.skillPoints,baseUnlockedSkills:[...c.unlockedSkills]};}
export function applySkillRecommendation(c:Character,r:SkillRecommendation):Character{if(r.characterId!==c.id||r.revision!==c.level||!c.skillSetupComplete||!c.unlockedSkills||r.baseSkillPoints!==(c.skillPoints??0)||JSON.stringify(r.baseUnlockedSkills)!==JSON.stringify(c.unlockedSkills))return c;if(r.save||!r.skillId)return{...c,pendingSkill:undefined};if(c.skillPoints===undefined)return c;const s=(SKILLS[c.id]??[]).find(x=>x.id===r.skillId);if(!s||s.starting||s.acquisition==='learned'||s.unsupportedPurchase||r.points!==s.cost||s.storyGated&&!(c.discoveredSkillIds??[]).includes(s.id)||c.unlockedSkills.includes(s.id)||!(s.requires??[]).every(x=>c.unlockedSkills!.includes(x))||!(s.requiresAny??[]).every(g=>g.some(x=>c.unlockedSkills!.includes(x)))||s.cost>c.skillPoints)return c;return{...c,unlockedSkills:[...c.unlockedSkills,s.id],skillPoints:c.skillPoints-s.cost,pendingSkill:undefined};}
export function suggestLoadout(c: Character): string[] {
  if (!c.skillSetupComplete) return [];
  const owned = new Set(c.unlockedSkills ?? []);
  if (c.id === 'monoco') return [...owned].slice(0, 6);
  return (SKILLS[c.id] ?? []).filter(s => owned.has(s.id) && (!s.storyGated || (c.discoveredSkillIds ?? []).includes(s.id))).map(s => s.id).slice(0, 6);
}
export function recordLoadout(c:Character,l:string[]):Character{const owned=new Set(c.unlockedSkills??[]);return{...c,loadout:[...new Set(l)].filter(id=>owned.has(id)).slice(0,6)};}
