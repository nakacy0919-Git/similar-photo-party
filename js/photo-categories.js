/* Similar Photo Party category catalog.
 * Existing scene categories remain. Original SimilarPhoto learning series are
 * also exposed as eleven clearly named learning themes, plus an all-source view.
 * All imported photos belong to numbered groups of at least four images.
 */
(function(root) {
  'use strict';
  const DEFINITIONS=Object.freeze([
    {id:'all',ja:'すべて',en:'All photos',emoji:'🎲',groups:null},
    {id:'positions',ja:'場所・位置関係',en:'Positions & places',emoji:'📍',groups:['door','between','beside','box','bridge','through','on','under','underbed']},
    {id:'animals',ja:'動物',en:'Animals',emoji:'🐶',groups:['dog','on','under']},
    {id:'sports',ja:'スポーツ',en:'Sports & games',emoji:'⚽',groups:['ball','parkkid','tennisstrike','watchgame','203','211']},
    {id:'food',ja:'料理・食べ物',en:'Food & cooking',emoji:'🍳',groups:['kitchen','cookingman','209','215']},
    {id:'travel',ja:'旅行・街',en:'Travel & city',emoji:'✈️',groups:['river','road','station','umbrella','205','213','223','237']},
    {id:'school',ja:'学校・学習',en:'School & learning',emoji:'📚',groups:['studylibrary','quietstudy','readingbook','225','227','229','233','235']},
    {id:'daily',ja:'日常生活',en:'Daily life',emoji:'🏡',groups:['feelunwell','201','207','217','219','221']}
  ]);
  // Source's "series" labels are teaching topics, NOT four-photo set identifiers.
  const SOURCE_DEFINITIONS=Object.freeze([
    {id:'source-000',ja:'位置・前置詞',en:'Position & prepositions',emoji:'📌',series:'000'},
    {id:'source-100',ja:'地図・グラフ',en:'Maps & charts',emoji:'📊',series:'100'},
    {id:'source-200',ja:'不定詞・動名詞',en:'Infinitives & gerunds',emoji:'🧠',series:'200'},
    {id:'source-300',ja:'日常・スポーツ',en:'Daily life & sports',emoji:'🏃',series:'300'},
    {id:'source-400',ja:'比較表現',en:'Comparatives',emoji:'⚖️',series:'400'},
    {id:'source-500',ja:'助動詞・選択',en:'Modals & choices',emoji:'💬',series:'500'},
    {id:'source-600',ja:'受動態',en:'Passive voice',emoji:'🪟',series:'600'},
    {id:'source-700',ja:'現在完了',en:'Perfect tenses',emoji:'🕒',series:'700'},
    {id:'source-800',ja:'関係詞',en:'Relative clauses',emoji:'🔗',series:'800'},
    {id:'source-900',ja:'仮定法・想像',en:'Hypotheticals',emoji:'💭',series:'900'},
    {id:'source-1000',ja:'接続詞・論理',en:'Conjunctions & logic',emoji:'🌏',series:'1000'}
  ]);
  const originalKnownGroups=new Set(DEFINITIONS.flatMap(c=>c.groups||[]));
  function validByGroup(items){
    const byGroup=new Map();
    if(!Array.isArray(items))return byGroup;
    for(const item of items){
      if(!item||typeof item.group!=='string')continue;
      if(!byGroup.has(item.group))byGroup.set(item.group,[]);
      byGroup.get(item.group).push(item);
    }
    return new Map([...byGroup].filter(([,group])=>group.length>=4));
  }
  function usableGroups(items){return [...validByGroup(items).keys()];}
  function options(items){
    const byGroup=validByGroup(items);
    const available=[...byGroup.keys()];
    const categories=DEFINITIONS.map(c=>({...c,groups:c.groups?
      c.groups.filter(id=>byGroup.has(id)):[...available]})).filter(c=>c.groups.length);
    const sourceGroups=available.filter(id=>byGroup.get(id).some(item=>SOURCE_DEFINITIONS.some(c=>c.series===item.sourceSeries)));
    if(sourceGroups.length){
      const similarGroups=sourceGroups.filter(id=>byGroup.get(id).every(item=>
        typeof item.visualDistance==='number' && !item.needsVisualReview));
      if(similarGroups.length)categories.push({id:'source-similar',ja:'よく似た写真',en:'Visually matched',emoji:'🔎',groups:similarGroups});
      categories.push({id:'source-all',ja:'追加教材・すべて',en:'Original SimilarPhoto',emoji:'📚',groups:sourceGroups});
      for(const c of SOURCE_DEFINITIONS){
        const groups=sourceGroups.filter(id=>byGroup.get(id).some(item=>item.sourceSeries===c.series));
        if(groups.length)categories.push({...c,groups});
      }
    }
    const accounted=new Set([...originalKnownGroups,...sourceGroups]);
    const remaining=available.filter(id=>!accounted.has(id));
    if(remaining.length)categories.push({id:'new',ja:'新しい写真',en:'New photos',emoji:'✨',groups:remaining});
    return categories;
  }
  function pool(items,category){
    if(!Array.isArray(items))return [];
    const selected=options(items).find(c=>c.id===category);
    if(!selected)return [];
    const groups=new Set(selected.groups);
    return items.filter(item=>item&&groups.has(item.group));
  }
  const api=Object.freeze({definitions:DEFINITIONS,sourceDefinitions:SOURCE_DEFINITIONS,usableGroups,options,pool});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.PHOTO_CATEGORIES=api;
})(typeof window!=='undefined'?window:globalThis);
