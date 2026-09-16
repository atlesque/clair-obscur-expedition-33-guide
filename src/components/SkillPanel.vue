<script setup lang="ts">
import { ref } from 'vue';
import { ATTRIBUTES } from '../domain/types';
import { SKILLS, attributeLabels } from '../domain/data';
import type { Character } from '../domain/types';
import { applySkillRecommendation, recommendSkill, recordLoadout, suggestLoadout } from '../domain/rules';
const props=defineProps<{character:Character}>();
const emit=defineEmits<{ update:[character:Character] }>();
const open=ref(false); const scaling=ref<Record<string,string>>({}); const manual=ref(''); const owned=ref<string[]>([]); const points=ref(0); const skillsEnabled=ref(false);
function show(){scaling.value={...props.character.weaponScaling};manual.value=(props.character.unlockedSkills??[]).join(', ');owned.value=[...(props.character.unlockedSkills??[])];points.value=props.character.skillPoints??0;skillsEnabled.value=!!props.character.skillSetupComplete;open.value=true;}
function save(){const c={...props.character,weaponScaling:Object.fromEntries(Object.entries(scaling.value).filter(([,v])=>v)),skillSetupComplete:skillsEnabled.value,unlockedSkills:skillsEnabled.value?(props.character.skillAcquisition==='learned'?manual.value.split(',').map(x=>x.trim()).filter(Boolean):owned.value):props.character.unlockedSkills,skillPoints:skillsEnabled.value?points.value:props.character.skillPoints};emit('update',c);open.value=false;}
function advice(){const c={...props.character};c.pendingSkill=recommendSkill(c)??undefined;emit('update',c);}
function confirm(){if(!props.character.pendingSkill)return;const c=applySkillRecommendation({...props.character},props.character.pendingSkill);if(c!==props.character)emit('update',c);}
function loadout(){emit('update',recordLoadout({...props.character},suggestLoadout(props.character)));}
</script>
<template>
<section class="card guidance-tools"><h3>Build guidance</h3><button @click="show">Skill and weapon setup</button><button :disabled="!character.skillSetupComplete" @click="advice">Get skill advice</button><p v-if="character.pendingSkill" class="advice"><strong>Pending skill advice</strong><br>{{character.pendingSkill.explanation}}<button v-if="character.pendingSkill.skillId" class="primary" @click="confirm">I've applied this skill</button></p><p v-if="character.skillSetupComplete">{{character.unlockedSkills?.length??0}} skills owned · {{character.skillPoints??0}} SP · Suggested loadout: {{suggestLoadout(character).join(', ')||'none yet'}} <button @click="loadout">Record loadout</button></p></section>
<div v-if="open" class="modal-backdrop"><form class="modal" @submit.prevent="save"><h2>Setup: {{character.name}}</h2><p>Record what you have confirmed in game. Set up later keeps advice withheld.</p><fieldset><legend>Weapon scaling</legend><label v-for="a in ATTRIBUTES" :key="a">{{attributeLabels[a]}}<select v-model="scaling[a]"><option value="">Not entered</option><option v-for="g in ['D','C','B','A','S']" :key="g">{{g}}</option></select></label></fieldset><label>Available skill points<input type="number" min="0" v-model.number="points"></label><label v-if="character.skillAcquisition==='learned'">Learned skills, comma separated<input v-model="manual"></label><fieldset v-else><legend>Owned skills</legend><label v-for="s in (SKILLS[character.id]??[]).filter(s=>!s.storyGated)" :key="s.id"><input type="checkbox" :value="s.id" v-model="owned"> {{s.name}}</label></fieldset><div class="actions"><button type="button" @click="open=false">Set up later</button><button class="primary">Save setup</button></div></form></div>
</template>
