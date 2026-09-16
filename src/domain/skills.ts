import type { Character } from './types';
export type Skill = { id: string; name: string; cost: number; requires: string[]; visible: boolean };
export type SkillState = { setupComplete: boolean; unlocked: string[]; points: number; equipped: string[]; pending?: { skillId?: string; revision: number } };
export const INITIAL_SKILLS: Record<string, Skill[]> = {
  gustave: [{id:'gustave-visible-1',name:'Visible skill 1',cost:1,requires:[],visible:true},{id:'gustave-visible-2',name:'Visible skill 2',cost:2,requires:['gustave-visible-1'],visible:true}],
  lune: [{id:'lune-visible-1',name:'Visible skill 1',cost:1,requires:[],visible:true},{id:'lune-visible-2',name:'Visible skill 2',cost:2,requires:['lune-visible-1'],visible:true}]
};
export function nextSkill(_character: Character, skills: Skill[], state: SkillState): Skill | null { return skills.find(s=>s.visible && !state.unlocked.includes(s.id) && s.cost<=state.points && s.requires.every(r=>state.unlocked.includes(r))) ?? null; }
