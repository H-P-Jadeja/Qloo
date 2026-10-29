// Entity type URNs. Verify against docs.qloo.com if a call returns 400.
export const T = { artist:'urn:entity:artist', movie:'urn:entity:movie', place:'urn:entity:place', brand:'urn:entity:brand', book:'urn:entity:book' };
export const DOMAINS = [
  { key:'music', label:'Music artists', type:T.artist },
  { key:'film', label:'Films', type:T.movie },
  { key:'food', label:'Restaurants / cafes', type:T.place },
  { key:'brand', label:'Brands', type:T.brand },
  { key:'book', label:'Books', type:T.book },
];
export const SECTIONS = [
  { key:'eat', title:'Eat & Hang out', type:T.place },
  { key:'listen', title:'Listen', type:T.artist },
  { key:'shop', title:'Shop & Browse', type:T.place },
  { key:'watch', title:'Watch', type:T.movie },
  { key:'hood', title:'Neighborhood vibe', type:'urn:entity:locality' },
];
