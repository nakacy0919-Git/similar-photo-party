/* Similar Photo genre catalog.
 * Each four-image group stays intact for fair, visually similar alternatives.
 * Groups not yet classified become a dynamic "New photos" genre.
 */
(function (root) {
  'use strict';
  const DEFINITIONS = Object.freeze([
    { id:'all', ja:'すべて', en:'All photos', emoji:'🎲', groups:null },
    { id:'positions', ja:'場所・位置関係', en:'Positions & places', emoji:'📍', groups:['door','between','beside','box','bridge','through','on','under','underbed'] },
    { id:'animals', ja:'動物', en:'Animals', emoji:'🐶', groups:['dog','on','under'] },
    { id:'sports', ja:'スポーツ', en:'Sports & games', emoji:'⚽', groups:['ball','parkkid','tennisstrike','watchgame','203','211'] },
    { id:'food', ja:'料理・食べ物', en:'Food & cooking', emoji:'🍳', groups:['kitchen','cookingman','209','215'] },
    { id:'travel', ja:'旅行・街', en:'Travel & city', emoji:'✈️', groups:['river','road','station','umbrella','205','213','223','237'] },
    { id:'school', ja:'学校・学習', en:'School & learning', emoji:'📚', groups:['studylibrary','quietstudy','readingbook','225','227','229','233','235'] },
    { id:'daily', ja:'日常生活', en:'Daily life', emoji:'🏡', groups:['feelunwell','201','207','217','219','221'] }
  ]);
  const knownGroups = new Set(DEFINITIONS.flatMap(category => category.groups || []));
  function usableGroups(items) {
    if (!Array.isArray(items)) return [];
    const byGroup = new Map();
    for (const item of items) {
      if (item && typeof item.group === 'string') {
        if (!byGroup.has(item.group)) byGroup.set(item.group, []);
        byGroup.get(item.group).push(item);
      }
    }
    return [...byGroup.entries()].filter(([,group])=>group.length>=4).map(([id])=>id);
  }
  function options(items) {
    const available = new Set(usableGroups(items));
    const result = DEFINITIONS.map(category => ({
      ...category,
      groups:category.groups ? category.groups.filter(id=>available.has(id)) : [...available]
    })).filter(category=>category.groups.length);
    const other=[...available].filter(id=>!knownGroups.has(id));
    if(other.length) result.push({id:'new',ja:'新しい写真',en:'New photos',emoji:'✨',groups:other});
    return result;
  }
  function pool(items,category) {
    if (!Array.isArray(items)) return [];
    const selected = options(items).find(item=>item.id===category);
    if (!selected) return [];
    const groups = new Set(selected.groups);
    return items.filter(item=>groups.has(item.group));
  }
  const api = Object.freeze({definitions:DEFINITIONS,options,pool,usableGroups});
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  root.PHOTO_CATEGORIES=api;
})(typeof window!=='undefined'?window:globalThis);
