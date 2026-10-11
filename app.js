const KEY="capcut_course_v1";
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{done:{},portfolio:{},lastOpen:Date.now(),quiz:null};
function save(){state.lastOpen=Date.now();localStorage.setItem(KEY,JSON.stringify(state));render()}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function doneCount(){return Object.values(state.done).filter(Boolean).length}
function render(){
  renderToday();renderCourse();renderPortfolio();renderFinal();
  const p=Math.round(doneCount()/LESSONS.length*100);
  document.querySelector("#progressText").textContent=`${doneCount()}/${LESSONS.length}`;
  document.querySelector("#progressBar").style.width=p+"%";
}
function renderToday(){
  let next=LESSONS.find(x=>!state.done[x.id])||LESSONS[LESSONS.length-1];
  const complete=!!state.done[next.id];
  document.querySelector("#todayCard").innerHTML=`<div class="card">
  <div class="today-label">Следующий урок · день ${next.day}</div>
  <div class="today-title">${esc(next.title)}</div>
  <div class="muted">${esc(next.goal)}</div>
  <div class="meta"><span class="pill">⏱ ${next.minutes} мин</span><span class="pill">${complete?"Завершён":"Не завершён"}</span></div>
  <button class="btn" onclick="openLesson('${next.id}')">${complete?"Открыть урок":"Начать урок"}</button>
  </div>`;
  const inactive=Date.now()-(state.lastOpen||Date.now())>7*864e5;
  document.querySelector("#reminder").innerHTML=inactive?`<div class="mistakes"><b>Ты давно не заходил.</b><div class="muted">Не наверстывай всё сразу. Просто сделай следующий урок.</div></div>`:"";
}
function renderCourse(){
 document.querySelector("#lessonList").innerHTML=LESSONS.map(l=>`<div class="lesson ${state.done[l.id]?"done":""}" onclick="openLesson('${l.id}')">
 <div class="num">${l.day}</div><div class="lesson-main"><div class="lesson-title">${esc(l.title)}</div><div class="lesson-sub">${l.minutes} мин · ${state.done[l.id]?"готово":"открыть"}</div></div><div class="status">${state.done[l.id]?"✓":"›"}</div></div>`).join("");
}
function renderPortfolio(){
 document.querySelector("#portfolio").innerHTML=`<div class="checklist">${CHECKLIST.map(x=>`<label class="check"><input type="checkbox" ${state.portfolio[x[0]]?"checked":""} onchange="togglePortfolio('${x[0]}',this.checked)"><span><strong>${esc(x[1])}</strong><small>${esc(x[2])}</small></span></label>`).join("")}</div>
 <div class="danger-zone"><button class="btn secondary" onclick="exportProgress()">Экспорт прогресса</button><button class="btn secondary" onclick="document.querySelector('#importInput').click()">Импорт</button><button class="btn danger" onclick="resetProgress()">Сбросить всё</button></div>`;
}
function togglePortfolio(id,v){state.portfolio[id]=v;save()}
function openLesson(id){
 const l=LESSONS.find(x=>x.id===id); if(!l)return;
 document.querySelector("#dialogContent").innerHTML=`<button class="close" onclick="lessonDialog.close()">×</button>
 <div class="today-label">День ${l.day}</div><h2 style="margin:7px 0">${esc(l.title)}</h2><p class="muted">${esc(l.goal)}</p>
 <div class="meta"><span class="pill">⏱ ${l.minutes} мин</span><span class="pill">${state.done[l.id]?"✓ выполнен":"в процессе"}</span></div>
 <div>${l.steps.map((s,i)=>`<div class="step"><b>${i+1}. ${esc(s)}</b></div>`).join("")}</div>
 <div class="mistakes"><b>Типичные ошибки</b><div class="muted" style="margin-top:6px">${l.mistakes.map(esc).join("<br>")}</div></div>
 <div class="assignment"><b>Задание дня</b><div class="muted" style="margin-top:6px">${esc(l.assignment)}</div></div>
 <div class="dialog-actions"><button class="btn" onclick="completeLesson('${l.id}')">${state.done[l.id]?"Снять выполнение":"Отметить выполненным"}</button></div>`;
 document.querySelector("#lessonDialog").showModal();
}
function completeLesson(id){state.done[id]=!state.done[id];save();openLesson(id)}
function exportProgress(){
 const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),state},null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="capcut-course-progress.json";a.click();URL.revokeObjectURL(a.href)
}
document.querySelector("#importInput").addEventListener("change",e=>{
 const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.state)throw 0;state=x.state;save();alert("Прогресс импортирован")}catch{alert("Не удалось импортировать файл")}};r.readAsText(f)
});
function resetProgress(){if(confirm("Сбросить весь прогресс?")){state={done:{},portfolio:{},lastOpen:Date.now(),quiz:null};save()}}
function tab(name){
 document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));
 document.querySelector("#"+name+"View").classList.add("active");
 document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));
}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>tab(b.dataset.tab));
document.querySelector("#exportBtn").onclick=exportProgress;

const QUESTIONS=[
["Что является базовым способом склеить два клипа?","Обычный cut",["Обычный cut","Сложный transition","Фильтр","Маска"]],
["Для вертикального ролика обычно используют какое соотношение?","9:16",["16:9","4:3","9:16","1:1"]],
["Зачем нужен J-cut?","Звук следующего кадра начинается раньше картинки",["Ускорить видео","Звук следующего кадра начинается раньше картинки","Убрать шум","Сделать субтитры"]],
["Что важнее при монтаже под музыку?","Смысл + ритм",["Каждый кадр на каждый бит","Только эффекты","Смысл + ритм","Максимум переходов"]],
["Что делают keyframes?","Задаются изменения параметра во времени",["Сжимают файл","Задаются изменения параметра во времени","Удаляют шум","Создают субтитры"]],
["Что лучше для читаемого текста?","Коротко, контрастно и достаточно крупно",["Очень мелко","Коротко, контрастно и достаточно крупно","Много слов","Случайный шрифт"]],
["Что проверять после экспорта?","Готовый файл целиком",["Только таймлайн","Только обложку","Готовый файл целиком","Ничего"]],
["Когда переход оправдан?","Когда он решает монтажную задачу",["Между каждым клипом","Когда он решает монтажную задачу","Всегда на бит","Только в начале"]],
["Что такое B-roll?","Дополнительные кадры поверх/вместо основного изображения",["Музыка","Дополнительные кадры поверх/вместо основного изображения","Фильтр","Экспорт"]],
["Что такое speed ramp?","Изменение скорости внутри клипа",["Изменение скорости внутри клипа","Изменение цвета","Обрезка звука","Изменение разрешения"]]
];
function renderFinal(){
 const box=document.querySelector("#final");
 if(state.quiz&&state.quiz.finished){box.innerHTML=`<div class="result"><div class="today-label">Результат</div><h2>${state.quiz.score}/10</h2><div class="bar"><i style="width:${state.quiz.score*10}%"></i></div><p class="muted">${state.quiz.score>=8?"База усвоена. Теперь главное — практика.":"Ниже 8/10: вернись к урокам и повтори слабые темы."}</p><button class="btn" onclick="startQuiz()">Пройти заново</button></div>`;return}
 if(!state.quiz||state.quiz.q===undefined){box.innerHTML=`<div class="card"><h2>Финальный тест</h2><p class="muted">10 случайных вопросов по базовым принципам курса. Не угадывай по порядку — варианты перемешаны.</p><button class="btn" onclick="startQuiz()">Начать тест</button></div>`;return}
 const q=QUESTIONS[state.quiz.q], shuffled=state.quiz.options;
 box.innerHTML=`<div class="quiz-card"><div class="today-label">Вопрос ${state.quiz.q+1}/10</div><div class="q">${esc(q[0])}</div><div class="answers">${shuffled.map((a,i)=>`<button class="answer" onclick="answer(${i})">${esc(a)}</button>`).join("")}</div></div>`;
}
function startQuiz(){
 const arr=[...Array(QUESTIONS.length).keys()].sort(()=>Math.random()-.5).slice(0,10);
 state.quiz={order:arr,q:0,score:0,finished:false,options:[]};prepareQuestion();save()
}
function prepareQuestion(){const q=QUESTIONS[state.quiz.order[state.quiz.q]];state.quiz.options=[...q[2]].sort(()=>Math.random()-.5)}
function answer(i){
 const qi=state.quiz.order[state.quiz.q],q=QUESTIONS[qi];
 if(state.quiz.options[i]===q[1])state.quiz.score++;
 state.quiz.q++;
 if(state.quiz.q>=state.quiz.order.length){state.quiz.finished=true}else prepareQuestion();
 save()
}
render();