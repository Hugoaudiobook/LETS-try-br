const PAGE_SIZE=25;
let anime=[],filtered=[],page=1,activeTab="complete";
const $=id=>document.getElementById(id);
const val=id=>$(id)?.value.trim()||"";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=(id,fallback)=>{const n=Number(val(id));return Number.isFinite(n)&&val(id)!==""?n:fallback};

function textOf(a){return [a.titleEnglish,a.titleRomaji,a.titleNative,...(a.synonyms||[])].filter(Boolean).join(" ").toLowerCase()}
function incomplete(a){return !a.titleEnglish&&!a.titleRomaji||!a.year||a.episodes==null||!a.duration||!a.format}
function passes(a){
  const q=val("search").toLowerCase(),g=val("genre"),f=val("format"),st=val("status");
  const ym=num("yearMin",0),yx=num("yearMax",9999),em=num("epMin",0),ex=num("epMax",Infinity),dm=num("durMin",0),dx=num("durMax",Infinity);
  const e=a.episodesTotal??a.episodes;
  return (!q||textOf(a).includes(q))&&(!g||a.primaryGenre===g)&&(!f||a.format===f)&&(!st||a.status===st)
    &&(!a.year||a.year>=ym&&a.year<=yx)&&(e==null||e>=em&&e<=ex)&&(a.duration==null||a.duration>=dm&&a.duration<=dx)
    &&(activeTab==="incomplete"?incomplete(a):!incomplete(a));
}
function sortData(arr){
  const s=val("sort");
  return arr.sort((x,y)=>{
    if(s==="title")return (x.titleEnglish||x.titleRomaji||"").localeCompare(y.titleEnglish||y.titleRomaji||"");
    if(s==="year-desc")return (y.year||0)-(x.year||0);
    if(s==="year-asc")return (x.year||9999)-(y.year||9999);
    if(s==="episodes-desc")return (y.episodesTotal??y.episodes??0)-(x.episodesTotal??x.episodes??0);
    if(s==="episodes-asc")return (x.episodesTotal??x.episodes??999999)-(y.episodesTotal??y.episodes??999999);
    if(s==="duration-desc")return (y.duration||0)-(x.duration||0);
    return (x.duration||999999)-(y.duration||999999);
  });
}
function card(a){
  const ep=a.episodesTotal??a.episodes;
  const parts=[];
  if(a.year)parts.push(a.year);
  if(ep!=null)parts.push(ep+" eps"+(a.parts>1?" total":""));
  if(a.duration)parts.push(a.duration+" min");
  if(a.primaryGenre)parts.push(a.primaryGenre);
  if(a.format)parts.push(a.format);
  return '<article class="card" tabindex="0" data-id="'+a.malId+'">'+
    '<div class="cover">'+(a.cover?'<img loading="lazy" src="'+esc(a.cover)+'" alt="'+esc(a.titleEnglish||"")+'">':'<span>No cover</span>')+'</div>'+
    '<div class="body"><div class="title">'+esc(a.titleEnglish||a.titleRomaji||"Unknown title")+'</div>'+
    '<div class="jp" title="'+esc(a.titleNative||"")+'">'+esc(a.titleNative||a.titleRomaji||"")+'</div>'+
    '<div class="meta">'+parts.map(x=>'<span class="pill">'+esc(x)+'</span>').join("")+
    (a.episodes==null?'<span class="pill missing">episode count unknown</span>':"")+
    '</div></div></article>';
}
function render(){
  filtered=sortData(anime.filter(passes));
  const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));page=Math.min(page,pages);
  const slice=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  $("count").textContent=filtered.length.toLocaleString()+" anime";
  $("page").textContent=page+" / "+pages;
  $("prev").disabled=page<=1;$("next").disabled=page>=pages;$("empty").hidden=!!slice.length;
  $("grid").innerHTML=slice.map(card).join("");
  document.querySelectorAll(".card").forEach(el=>{
    el.onclick=()=>openDetails(Number(el.dataset.id));
    el.onkeydown=e=>{if(e.key==="Enter"||e.key===" ")openDetails(Number(el.dataset.id))}
  });
}
function fill(){
  const options=(key)=>[...new Set(anime.map(a=>a[key]).filter(Boolean))].sort();
  $("genre").innerHTML='<option value="">All genres</option>'+options("primaryGenre").map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");
  $("format").innerHTML='<option value="">All formats</option>'+options("format").map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");
  $("status").innerHTML='<option value="">All statuses</option>'+options("status").map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");
}
function openDetails(id){
  const a=anime.find(x=>x.malId===id);if(!a)return;
  const ep=a.episodesTotal??a.episodes;
  $("detailsContent").innerHTML='<div class="detailHead">'+
    (a.cover?'<img src="'+esc(a.cover)+'" alt="">':"")+
    '<div><h2>'+esc(a.titleEnglish||a.titleRomaji||"Unknown title")+'</h2>'+
    '<p class="native">'+esc(a.titleNative||a.titleRomaji||"")+'</p>'+
    '<p>'+[a.year,a.format,a.status].filter(Boolean).map(esc).join(" · ")+'</p></div></div>'+
    '<dl><dt>Episodes</dt><dd>'+(ep??"Unknown")+(a.parts>1?" total across "+a.parts+" parts":"")+'</dd>'+
    '<dt>Episode duration</dt><dd>'+(a.duration?a.duration+" minutes":"Unknown")+'</dd>'+
    '<dt>Genre</dt><dd>'+esc((a.genres||[]).join(", ")||"Unknown")+'</dd>'+
    '<dt>MAL ID</dt><dd>'+esc(a.malId)+'</dd>'+
    '<dt>AniList ID</dt><dd>'+esc(a.anilistId||"Unknown")+'</dd></dl>'+
    (a.partsTitles?.length?'<h3>Included parts</h3><ul>'+a.partsTitles.map(esc).map(x=>"<li>"+x+"</li>").join("")+"</ul>":"");
  $("details").showModal();
}
function reset(){["search","yearMin","yearMax","epMin","epMax","durMin","durMax"].forEach(id=>$(id).value="");["genre","format","status"].forEach(id=>$(id).value="");$("sort").value="title";page=1;render()}

async function init(){
  try{
    const r=await fetch("data/anime.json",{cache:"no-store"});if(!r.ok)throw Error(r.status);
    const d=await r.json();anime=d.anime||d;fill();
    $("stats").textContent=anime.length.toLocaleString()+" Brazilian Portuguese titles";
    render();
  }catch(e){console.error(e);$("stats").textContent="Catalogue failed to load";$("grid").innerHTML='<div class="empty">The catalogue data could not be loaded. Please refresh or check the deployment.</div>'}
}
["search","genre","format","status","sort","yearMin","yearMax","epMin","epMax","durMin","durMax"].forEach(id=>$(id).addEventListener("input",()=>{page=1;render()}));
$("clear").onclick=reset;
$("prev").onclick=()=>{if(page>1){page--;render()}};
$("next").onclick=()=>{page++;render()};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");activeTab=b.dataset.tab;page=1;render()});
$("closeDetails").onclick=()=>$("details").close();
$("details").addEventListener("click",e=>{if(e.target===$("details"))$("details").close()});
init();
