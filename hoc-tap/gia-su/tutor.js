import {library} from './library.js';
import {supplements} from './supplements.js';
import {loadModel,explain} from './local-ai.js';

const corpus=[...library,...supplements];
const $=id=>document.getElementById(id);
const form=$('ask'),question=$('question'),answers=$('answers'),status=$('status');
let engine, previous=[], generation=0;
const normalize=value=>value.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,' ').trim();
const stop=new Set('cho hoi em hay giup cach bai giai tinh tim co la gi sao voi cua trong nhu nao va de mot the nhung lop'.split(' '));
const tokens=text=>new Set(normalize(text).split(' ').filter(w=>w.length>1&&!stop.has(w)&&!/^[0-9]+$/.test(w)));
const scoped=()=>corpus.filter(x=>x.grade===Number($('grade').value)&&x.subject===$('subject').value);
const words=(query,text)=>[...tokens(query)].filter(w=>tokens(text).has(w)).length;
function search(query){
 const normalized=normalize(query);
 return scoped().map(item=>{
  const title=normalize(item.title);
  const score=normalized===title?100:words(query,item.title)*4+words(query,item.keywords||'')*3+words(query,item.rule+' '+item.example.prompt)*1.2;
  return {item,score};
 }).filter(x=>x.score>=3).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.item);
}
function element(tag,text,cls){
 const node=document.createElement(tag);
 if(text)node.textContent=text;
 if(cls)node.className=cls;
 return node;
}
function renderLibrary(){
 const list=scoped();
 $('library-count').textContent=list.length+' chủ đề lớp '+$('grade').value;
 $('library').replaceChildren(...list.map(item=>{
  const button=element('button',item.title);
  button.type='button';
  button.addEventListener('click',()=>{question.value=item.title;form.requestSubmit();});
  return button;
 }));
}
function renderMaterial(card,item,mode){
 card.append(element('h2',item.title),element('p',item.rule,'reply'));
 card.append(element('p','Ví dụ · '+item.example.prompt));
 if(mode==='practice')card.append(element('p','Gợi ý · '+item.example.hint));
 const details=element('details');
 details.open=mode!=='practice';
 details.append(element('summary','Xem lời giải'),element('p',item.example.solution+' Đáp án: '+item.example.answer));
 card.append(details);
}
function sources(card,materials){
 const links=materials.filter(x=>x.url);
 if(!links.length)return;
 const section=element('div');
 section.append(element('p','Bài học liên quan'));
 const list=element('ul');
 for(const item of links){
  const li=element('li'),anchor=element('a',item.title);
  anchor.href=item.url;anchor.target='_blank';anchor.rel='noopener';
  li.append(anchor);list.append(li);
 }
 section.append(list);card.append(section);
}
function reset(){generation++;previous=[];answers.replaceChildren();status.textContent='';}
for(const field of [$('grade'),$('subject')])field.addEventListener('change',()=>{reset();renderLibrary();});
$('clear').addEventListener('click',()=>{reset();question.value='';question.focus();});
$('enable').addEventListener('click',async()=>{
 const button=$('enable');
 button.disabled=true;
 status.textContent='Đang chuẩn bị mô hình trên thiết bị…';
 try{
  engine=await loadModel(progress=>{status.textContent='Đang tải mô hình · '+Math.round(progress.progress*100)+'%';});
  status.textContent='AI đã sẵn sàng.';
  button.textContent='AI đang bật';
 }catch{
  status.textContent='Thiết bị chưa tải được AI. Em vẫn có thể tra học liệu và xem ví dụ.';
  button.disabled=false;
 }
});
form.addEventListener('submit',async event=>{
 event.preventDefault();
 const input=question.value.trim();
 if(!input||$('submit').disabled)return;
 const stamp=generation,mode=$('mode').value,materials=search(input);
 const card=element('article',null,'tutor-turn');
 card.append(element('p','Em hỏi · '+input));
 answers.prepend(card);
 question.value='';
 if(engine){
  $('submit').disabled=true;
  status.textContent='Gia sư đang soạn câu trả lời…';
  try{
   const answer=await explain(engine,{question:input,grade:$('grade').value,subject:$('subject').value,mode,materials,previous});
   if(stamp!==generation)return;
   if(!answer)throw new Error('Empty answer');
   card.append(element('p','AI thử nghiệm · Hãy đối chiếu kết quả','answer-origin'),element('p',answer,'reply'));
   sources(card,materials);
   previous=[...previous,{question:input,answer}].slice(-2);
   status.textContent='Đã trả lời.';
   return;
  }catch{
   if(stamp!==generation)return;
   status.textContent='AI chưa trả lời được. Hiển thị kết quả tra học liệu.';
  }finally{$('submit').disabled=false;}
 }
 card.append(element('p','Tra học liệu MaxNgo','answer-origin'));
 if(materials.length){
  renderMaterial(card,materials[0],mode);
  sources(card,materials);
 }else card.append(element('p','Chưa tìm thấy chủ đề đủ gần. Em thử ghi tên công thức hoặc chọn một bài trong danh sách học liệu.'));
});
renderLibrary();
if(!navigator.gpu){$('enable').disabled=true; $('enable').textContent='WebGPU chưa khả dụng';}
