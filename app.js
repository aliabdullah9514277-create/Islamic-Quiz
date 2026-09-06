
const D=window.DEEN_QUEST_DATA;
const state=Object.assign({unlocked:1,completed:[],xp:0,coins:0,current:1,resets:0},JSON.parse(localStorage.getItem("deenQuestState")||"{}"));
state.completed=Array.isArray(state.completed)?state.completed:[];
state.unlocked=Math.max(1,Math.min(50,Number(state.unlocked)||1));
state.xp=Number(state.xp)||0; state.coins=Number(state.coins)||0; state.current=Number(state.current)||1; state.resets=Number(state.resets)||0;
const highestCompleted=state.completed.length?Math.max(...state.completed):0;
state.unlocked=Math.max(state.unlocked,Math.min(50,highestCompleted+1));
let quiz={level:1,ids:[],index:0,score:0,wrong:0,answered:false,timer:null,seconds:30}; window.state=state;

const $=s=>document.querySelector(s);
const save=()=>localStorage.setItem("deenQuestState",JSON.stringify(state));
function view(id){
 document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));
 const target=$("#"+id); if(target)target.classList.add("active");
 window.scrollTo({top:0,behavior:"smooth"});
 updateUI();
 if(id==="levels")renderLevels();
 if(id==="rewards")renderRewards();
}
document.addEventListener("click",e=>{const v=e.target.closest("[data-view]");if(v){view(v.dataset.view);}});
function updateUI(){
 $("#xp").textContent=state.xp.toLocaleString(); $("#coins").textContent=state.coins.toLocaleString();
 $("#heroLevel").textContent=state.unlocked;
 $("#dashLevel").textContent=state.unlocked; $("#dashXP").textContent=state.xp.toLocaleString();
 $("#dashCoins").textContent=state.coins.toLocaleString(); $("#dashUnlocked").textContent=state.unlocked;
 $("#dashBar").style.width=Math.min(100,state.unlocked/50*100)+"%";
}
function renderLevels(){
 const grid=$("#levelGrid"); grid.innerHTML="";
 D.levels.forEach(l=>{
  const locked=l.level>state.unlocked, done=state.completed.includes(l.level);
  const c=document.createElement("article"); c.className="level-card "+(locked?"locked ":"")+(done?"complete":"");
  const lang=window.DEEN_LANG||"en";
  const diff=(lang==="ur"?({"Easy":"آسان","Easy+":"آسان+","Medium":"درمیانہ","Hard":"مشکل","Expert":"ماہر"}[l.difficulty]||l.difficulty):lang==="hi"?({"Easy":"आसान","Easy+":"आसान+","Medium":"मध्यम","Hard":"कठिन","Expert":"विशेषज्ञ"}[l.difficulty]||l.difficulty):lang==="ar"?({"Easy":"سهل","Easy+":"سهل+","Medium":"متوسط","Hard":"صعب","Expert":"خبير"}[l.difficulty]||l.difficulty):lang==="tr"?({"Easy":"Kolay","Easy+":"Kolay+","Medium":"Orta","Hard":"Zor","Expert":"Uzman"}[l.difficulty]||l.difficulty):lang==="id"?({"Easy":"Mudah","Easy+":"Mudah+","Medium":"Sedang","Hard":"Sulit","Expert":"Ahli"}[l.difficulty]||l.difficulty):l.difficulty);
  const labels={en:{done:"✓ COMPLETE",locked:"🔒 LOCKED",play:"▶ PLAY",questions:"Questions"},ur:{done:"✓ مکمل",locked:"🔒 بند",play:"▶ کھیلیں",questions:"سوالات"},hi:{done:"✓ पूरा",locked:"🔒 लॉक",play:"▶ खेलें",questions:"प्रश्न"},ar:{done:"✓ مكتمل",locked:"🔒 مغلق",play:"▶ ابدأ",questions:"أسئلة"},tr:{done:"✓ TAMAMLANDI",locked:"🔒 KİLİTLİ",play:"▶ OYNA",questions:"Soru"},id:{done:"✓ SELESAI",locked:"🔒 TERKUNCI",play:"▶ MAIN",questions:"Pertanyaan"}}[lang]||{done:"✓ COMPLETE",locked:"🔒 LOCKED",play:"▶ PLAY",questions:"Questions"};
  c.innerHTML=`<span class="badge">${done?labels.done:locked?labels.locked:labels.play}</span><div class="level-num">${String(l.level).padStart(2,"0")}</div><h3>${diff}</h3><small>${l.questionCount} ${labels.questions} • +${l.xp} XP</small>`;
  if(!locked)c.onclick=()=>startLevel(l.level);
  grid.appendChild(c);
 });
}
function renderRewards(){
 const g=$("#rewardGrid");g.innerHTML="";
 for(let i=1;i<=50;i++){
  const unlocked=state.completed.includes(i);
  const c=document.createElement("article");c.className="reward-card";c.innerHTML=`<div class="scene"></div><strong>Level ${i} Scene</strong><small>${unlocked?"Unlocked ✨":"Locked 🔒"}</small>`;
  g.appendChild(c);
 }
}
function shuffleArray(arr){
 const a=arr.slice();
 for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
 return a;
}
function startLevel(n){
 const L=D.levels.find(x=>x.level===n); if(!L)return;
 if(n>state.unlocked)return;
 // Every fresh attempt gets a new question order without changing the answer key.
 quiz={level:n,ids:shuffleArray(L.questions),index:0,score:0,wrong:0,answered:false,timer:null,seconds:30};
 state.current=n;save(); view("quiz"); loadQuestion(); if(window.IslamicAudio) IslamicAudio.start(n);
}
function getQ(){return D.questions.find(q=>q.id===quiz.ids[quiz.index]);}
function loadQuestion(){
 clearInterval(quiz.timer);
 quiz.seconds=Math.max(12,30-Math.floor(quiz.level/8)*2);
 const L=D.levels.find(x=>x.level===quiz.level),q=getQ();
 const lang=window.DEEN_LANG||"en";
 const difficulty={en:L.difficulty,ur:({"Easy":"آسان","Easy+":"آسان+","Medium":"درمیانہ","Hard":"مشکل","Expert":"ماہر"}[L.difficulty]||L.difficulty),hi:({"Easy":"आसान","Easy+":"आसान+","Medium":"मध्यम","Hard":"कठिन","Expert":"विशेषज्ञ"}[L.difficulty]||L.difficulty),ar:({"Easy":"سهل","Easy+":"سهل+","Medium":"متوسط","Hard":"صعب","Expert":"خبير"}[L.difficulty]||L.difficulty),tr:({"Easy":"Kolay","Easy+":"Kolay+","Medium":"Orta","Hard":"Zor","Expert":"Uzman"}[L.difficulty]||L.difficulty),id:({"Easy":"Mudah","Easy+":"Mudah+","Medium":"Sedang","Hard":"Sulit","Expert":"Ahli"}[L.difficulty]||L.difficulty)}[lang]||L.difficulty;
 $("#quizLevel").textContent=(lang==="ur"||lang==="ar"?"مستوى ":"LEVEL ")+quiz.level;
 $("#quizTitle").textContent=(lang==="ur"?"چیلنجِ علم":lang==="hi"?"ज्ञान चुनौती":lang==="ar"?"تحدي المعرفة":lang==="tr"?"Bilgi Mücadelesi":lang==="id"?"Tantangan Pengetahuan":"Knowledge Challenge");
 $("#qNumber").textContent=(lang==="ur"?`سوال ${quiz.index+1} از ${quiz.ids.length}`:lang==="hi"?`प्रश्न ${quiz.index+1} / ${quiz.ids.length}`:lang==="ar"?`السؤال ${quiz.index+1} من ${quiz.ids.length}`:lang==="tr"?`Soru ${quiz.index+1} / ${quiz.ids.length}`:lang==="id"?`Pertanyaan ${quiz.index+1} dari ${quiz.ids.length}`:`Question ${quiz.index+1} of ${quiz.ids.length}`);
 $("#qDifficulty").textContent=difficulty;
 $("#questionEnglish").textContent=q.question;
 $("#questionEnglish").style.display=lang==="en"?"none":"block";
 $("#questionText").textContent=lang==="en"?q.question:localizeQuestion(q.question,lang);
 $("#questionText").setAttribute("dir",(lang==="ur"||lang==="ar")?"rtl":"ltr");
 $("#progressBar").style.width=((quiz.index)/quiz.ids.length*100)+"%";
 $("#explanation").classList.remove("show");$("#explanation").textContent="";
 $("#nextBtn").disabled=true;quiz.answered=false;$("#timer").textContent=quiz.seconds;
 const box=$("#options");box.innerHTML="";
 q.options.forEach((raw,i)=>{
   const b=document.createElement("button");b.className="option";b.type="button";
   b.dataset.raw=raw;b.textContent=localizeOption(raw,lang);
   b.dir=(lang==="ur"||lang==="ar")?"rtl":"ltr";
   b.onclick=()=>answer(b,raw,q);
   box.appendChild(b);
 });
 quiz.timer=setInterval(()=>{quiz.seconds--;$("#timer").textContent=quiz.seconds;if(quiz.seconds<=0){clearInterval(quiz.timer);answer(null,null,q,true)}},1000);
}
function answer(btn,opt,q,timeout=false){
 if(quiz.answered)return;quiz.answered=true;clearInterval(quiz.timer);
 document.querySelectorAll(".option").forEach(b=>{if(b.dataset.raw===q.answer)b.classList.add("correct")});
 const ok=opt===q.answer;if(btn)btn.classList.add(ok?"correct":"wrong");if(ok)quiz.score++;else quiz.wrong++;
 const lang=window.DEEN_LANG||"en";
 const correctWord={en:"✓ Correct.",ur:"✓ درست جواب۔",hi:"✓ सही जवाब।",ar:"✓ إجابة صحيحة.",tr:"✓ Doğru.",id:"✓ Benar."}[lang];
 const wrongWord={en:"✗ Not quite.",ur:"✗ درست نہیں۔",hi:"✗ सही नहीं।",ar:"✗ ليست صحيحة.",tr:"✗ Yanlış.",id:"✗ Kurang tepat."}[lang];
 const ans=localizeOption(q.answer,lang);
 const sourceLabel={en:"Source",ur:"حوالہ",hi:"स्रोत",ar:"المصدر",tr:"Kaynak",id:"Sumber"}[lang];
 $("#explanation").textContent=(ok?correctWord+" ":wrongWord+" ")+`${lang==="en"?"Answer":lang==="ur"?"جواب":lang==="hi"?"उत्तर":lang==="ar"?"الإجابة":lang==="tr"?"Cevap":"Jawaban"}: ${ans} • ${sourceLabel}: ${q.source}`;
 $("#explanation").classList.add("show");
 $("#nextBtn").disabled=false;
}
$("#nextBtn").onclick=()=>{quiz.index++;if(quiz.index<quiz.ids.length)loadQuestion();else finishLevel()};
function finishLevel(){
 const L=D.levels.find(x=>x.level===quiz.level);
 const wrong=quiz.wrong;
 // EXACT RULES: 0–1 wrong = complete; 2–5 = fresh retry; 6+ = reset to Level 1.
 if(wrong>=6){
   state.completed=[]; state.unlocked=1; state.current=1; state.xp=0; state.coins=0;
   state.resets=(state.resets||0)+1; save(); renderLevels(); renderRewards(); updateUI();
   $("#resultTitle").textContent="Keep Learning 🌙";
   $("#resultScore").textContent=`${wrong} wrong answers — your journey has been reset to Level 1.`;
   $("#resultXP").textContent="0"; $("#resultCoins").textContent="0";
   $("#resultAnimationBtn").textContent="Restart Level 1";
   $("#resultAnimationBtn").onclick=()=>startLevel(1);
   view("result"); return;
 }
 if(wrong>=2){
   save();
   $("#resultTitle").textContent="Fresh Retry 🌙";
   $("#resultScore").textContent=`${wrong} wrong answers — retry this level with a fresh question order.`;
   $("#resultXP").textContent="0"; $("#resultCoins").textContent="0";
   $("#resultAnimationBtn").textContent="Try Level Again";
   $("#resultAnimationBtn").onclick=()=>startLevel(quiz.level);
   view("result"); return;
 }
 if(!state.completed.includes(quiz.level))state.completed.push(quiz.level);
 state.unlocked=Math.max(state.unlocked,Math.min(50,quiz.level+1));
 const earnedXP=L.xp+quiz.score*10,earnedCoins=L.coins+quiz.score*5;
 state.xp+=earnedXP; state.coins+=earnedCoins; state.current=Math.min(50,quiz.level+1); save();
 renderLevels(); renderRewards(); updateUI();
 $("#resultTitle").textContent=quiz.level===50?"MashaAllah! Level 50 Complete!":"MashaAllah! Level Complete!";
 $("#resultScore").textContent=`You scored ${quiz.score}/${quiz.ids.length}. ${wrong===0?"Perfect!":"Excellent work!"} The next level is now unlocked.`;
 $("#resultXP").textContent=earnedXP; $("#resultCoins").textContent=earnedCoins;
 $("#resultAnimationBtn").textContent=quiz.level===50?"Watch Grand Reward 🎁":"Watch 3D Reward ✨";
 $("#resultAnimationBtn").onclick=()=>showAnimation(quiz.level);
 view("result");
}
function showAnimation(level){
 $("#animLevel").textContent=level===50?"ALL 50 LEVELS COMPLETE":"LEVEL "+level+" COMPLETE";
 $("#animTitle").textContent=level===50?"Your Grand Gift Is Unlocked!":"A New 3D Scene Is Unlocked";
 $("#animText").textContent=level===50?"Congratulations! Your Quran Gift Request form is now available.":"Your journey continues. Keep learning and unlock the next scene.";
 $("#animContinue").textContent=level===50?"Open Quran Gift Form 🎁":"Continue Journey →";
 $("#animContinue").onclick=()=>level===50?view("gift"):view("levels");
 view("animation");
}
const giftForm=$("#giftForm"),sendGift=$("#sendGift");
function validateGift(){sendGift.disabled=!giftForm.checkValidity()}
giftForm.addEventListener("input",validateGift);giftForm.addEventListener("change",validateGift);
giftForm.addEventListener("submit",e=>{
 e.preventDefault();if(!giftForm.checkValidity())return;
 const fd=new FormData(giftForm);
 const msg=`🌙 DEEN QUEST — LEVEL 50 QURAN GIFT REQUEST%0A%0AName: ${fd.get("name")}%0AMobile: ${fd.get("phone")}%0ACity: ${fd.get("city")}%0AAddress: ${fd.get("address")}%0AQuran Language: ${fd.get("language")}%0A%0APlayer has completed all 50 levels.`;
 const wa="https://wa.me/923909086490?text="+encodeURIComponent(msg);
 window.location.href=wa;
});
renderLevels();renderRewards();updateUI();


/* ===== V3: Procedural Islamic ambience — offline, no external audio files ===== */


document.addEventListener("click",e=>{
  const homeBtn=e.target.closest("#homeAudioToggle");
  if(homeBtn) IslamicAudio.toggle(window.state?.current||1);
});

/* Hook into level/quiz navigation without changing the existing game rules. */
document.addEventListener("levelStarted",e=>IslamicAudio.start(e.detail?.level||1));
document.addEventListener("quizLevelStarted",e=>IslamicAudio.start(e.detail?.level||1));

document.addEventListener("click", e=>{
  const card=e.target.closest("[data-level], .level-card, .level-btn");
  if(card){
    const raw=card.dataset.level || card.getAttribute("data-level");
    const n=parseInt(raw,10);
    if(n) setTimeout(()=>IslamicAudio.start(n),80);
  }
});



/* ===== V5 multilingual quiz engine =====
   English is always shown first. The selected language is shown directly underneath.
   The translation engine is fully offline and preserves the original answer values.
*/
const LANG_PACKS = {
  ur: {
    phrases: [
      ["choose the correct option","درست آپشن منتخب کریں"],
      ["How many","کتنے"],
      ["Which city","کون سا شہر"],
      ["Which prophet","کون سے نبی"],
      ["Which surah","کون سی سورت"],
      ["Who is","کون ہے"],
      ["Who was","کون تھے"],
      ["What is","کیا ہے"],
      ["What does","کیا معنی ہے"],
      ["What was","کیا تھا"],
      ["In which month","کس مہینے میں"],
      ["Which month","کون سا مہینہ"],
      ["Which prayer","کون سی نماز"],
      ["What is the name of","کا نام کیا ہے"],
      ["What is the meaning of","کا مطلب کیا ہے"],
      ["What may be used for","کے لیے کیا استعمال کیا جا سکتا ہے"],
      ["What does Islam mean","اسلام کا کیا مطلب ہے"]
    ],
    terms: {
      "the":"", "a":"ایک","an":"ایک","is":"ہے","are":"ہیں","was":"تھے","were":"تھے","what":"کیا","which":"کون سا","who":"کون","how":"کتنے","many":"کتنے","of":"کا","in":"میں","on":"پر","to":"کو","from":"سے","for":"کے لیے","and":"اور","or":"یا","called":"کہلاتا ہے","name":"نام","city":"شہر","month":"مہینہ","first":"پہلا","ninth":"نواں","after":"بعد","before":"پہلے","during":"کے دوران","day":"دن","night":"رات","final":"آخری","revealed":"نازل شدہ","scripture":"آسمانی کتاب","prophet":"نبی","prophet's":"نبی کے","angel":"فرشتہ","revelation":"وحی","command":"حکم","faith":"ایمان","articles":"ارکان","pillars":"ارکان","obligatory":"فرض","daily":"روزانہ","prayers":"نمازیں","prayer":"نماز","fast":"روزہ","fasting":"روزہ رکھنا","charity":"صدقہ","voluntary":"نفلی","direction":"سمت","pilgrimage":"حج","wealth":"مال","qualifying":"نصاب والے","declaration":"اعلان","migration":"ہجرت","human":"انسان","built":"بنائی","ark":"کشتی","dreams":"خواب","swallowed":"نگل لیا","fish":"مچھلی","received":"ملی","tradition":"روایت","calendar":"تقویم","rites":"اعمال","night":"رات","described":"بیان کی گئی","better":"بہتر","thousand":"ہزار","sought":"تلاش کی جاتی ہے","pre-dawn":"سحری","meal":"کھانا","sunset":"غروبِ آفتاب","ends":"ختم کرتا ہے","Eid":"عید","immediately":"فوراً","season":"موسم","standing":"وقوف","circling":"طواف","walking":"سعی","state":"حالت","consecration":"احرام","call":"اذان","immediately":"فوراً","congregational":"جماعت کی","Friday":"جمعہ","sun":"سورج","passed":"گزر چکا","zenith":"زوال","late":"دیر","afternoon":"دوپہر کے بعد","dawn":"فجر","sunset":"غروبِ آفتاب","night":"رات","prostration":"سجدہ","bowing":"رکوع","sitting":"بیٹھنا","testimony":"تشہد","purification":"طہارت","water":"پانی","unavailable":"دستیاب نہ ہو","harmful":"نقصان دہ","full":"مکمل","ritual":"شرعی","bath":"غسل","sacred":"مقدس","mosque":"مسجد","associated":"متعلق","Jerusalem":"بیت المقدس","first":"پہلا","opening":"افتتاحی","longest":"سب سے لمبی","shortest":"سب سے چھوٹی","verses":"آیات","verse":"آیت","named":"نام رکھا گیا","cow":"گائے","elephant":"ہاتھی","bee":"شہد کی مکھی","ant":"چیونٹی","contains":"پر مشتمل ہے","number":"نمبر","two":"دو","short":"مختصر","begins":"شروع ہوتی ہے","common":"عام","commonly":"عام طور پر","known":"معروف","mean":"مطلب","meaning":"مطلب","understood":"سمجھا جاتا ہے","Islamic":"اسلامی","sense":"معنی","taqwa":"تقویٰ","tawhid":"توحید","shirk":"شرک","sabr":"صبر","shukr":"شکر","tawakkul":"توکل","istighfar":"استغفار","dua":"دعا","dhikr":"ذکر","halal":"حلال","haram":"حرام","wajib/fard":"واجب/فرض","sunnah":"سنت","bid'ah":"بدعت","technical":"اصطلاحی","religious":"دینی","adab":"آداب","amanah":"امانت","sidq":"صدق","ghibah":"غیبت","riba":"ربا","zina":"زنا","explicitly":"واضح طور پر","compared":"تشبیہ دی گئی","father":"والد","mother":"والدہ","woman":"عورت","wife":"بیوی","ability":"صلاحیت","speech":"گفتگو","birds":"پرندوں","tested":"آزمائے گئے","severe":"سخت","illness":"بیماری","patient":"صابر","cave":"غار","beginning":"آغاز","command":"حکم","translated":"ترجمہ کیا جاتا ہے","contains":"رکھتی ہے","religion":"دین","complete":"مکمل","burden":"بوجھ","soul":"جان","capacity":"طاقت","establish":"قائم کرو","give":"دینا","meaning":"مطلب","greeting":"سلام","reply":"جواب","Jannah":"جنت","Jahannam":"جہنم","Akhirah":"آخرت","dunya":"دنیا","Qiyamah":"قیامت","Barzakh":"برزخ","blowing":"پھونکنا","trumpet":"صور","guardianship":"نگہبانی","alongside":"کے ساتھ","Day":"دن","Ashura":"عاشورہ","odd-numbered":"طاق","performed":"ادا کی جانے والی","I'tikaf":"اعتکاف","Fitr":"فطر","traditionally":"روایتی طور پر","due":"واجب","travel":"سفر","terminology":"اصطلاح","miqat":"میقات","Talbiyah":"تلبیہ","Black Stone":"حجرِ اسود","Maqam Ibrahim":"مقامِ ابراہیم","Zamzam":"زمزم","hills":"پہاڑیاں","Mina":"منیٰ","Muzdalifah":"مزدلفہ","Ramy al-Jamarat":"رمی جمرات","Umrah":"عمرہ","outside":"باہر","chapter":"باب/سورت","individual":"انفرادی","Juz":"پارہ","standard":"معیاری","division":"تقسیم","Hizb":"حزب","Tajwid":"تجوید","Hafiz":"حافظ","mushaf":"مصحف","khutbah":"خطبہ","janazah":"جنازہ","Istisqa":"استسقاء","Kusuf":"کسوف","Khusuf":"خسوف","Istikhara":"استخارہ","core":"بنیادی","JazakAllahu khayran":"جزاک اللہ خیراً","best-known":"مشہور ترین","phrase":"جملہ","testimony":"گواہی","affirms":"تصدیق کرتا ہے","Allah":"اللہ","Makkah":"مکہ","Madinah":"مدینہ","Ka'bah":"کعبہ","Salah":"نماز","Qur'an":"قرآن","Hajj":"حج","Ramadan":"رمضان","Laylat al-Qadr":"لیلۃ القدر","Arafah":"عرفہ","Safa":"صفا","Marwah":"مروہ","Masjid":"مسجد","Aqsa":"اقصیٰ","Prophet":"نبی","Allah's":"اللہ کے","Qul":"قُل","Rabb":"رب"
    }
  },
  hi: {
    phrases:[["choose the correct option","सही विकल्प चुनें"],["How many","कितने"],["Which prophet","कौन से नबी"],["Which city","कौन सा शहर"],["Which surah","कौन सी सूरह"],["Who is","कौन है"],["Who was","कौन थे"],["What is","क्या है"],["What does","क्या अर्थ है"],["In which month","किस महीने में"],["What is the name of","का नाम क्या है"]],
    terms:{the:"","a":"एक","an":"एक","is":"है","are":"हैं","was":"थे","what":"क्या","which":"कौन सा","who":"कौन","how":"कितने","many":"कितने","of":"का","in":"में","on":"पर","to":"को","from":"से","for":"के लिए","and":"और","or":"या","called":"कहलाता है","name":"नाम","city":"शहर","month":"महीना","first":"पहला","ninth":"नौवां","after":"बाद","before":"पहले","during":"के दौरान","day":"दिन","night":"रात","final":"अंतिम","revealed":"नाज़िल","scripture":"आसमानी किताब","prophet":"नबी","angel":"फ़रिश्ता","revelation":"वही","command":"हुक्म","faith":"ईमान","articles":"अकीदे","pillars":"स्तंभ","obligatory":"फ़र्ज़","daily":"रोज़ाना","prayers":"नमाज़ें","prayer":"नमाज़","fast":"रोज़ा","fasting":"रोज़ा रखना","charity":"सदक़ा","voluntary":"नफ़्ल","direction":"दिशा","pilgrimage":"हज","wealth":"माल","declaration":"घोषणा","migration":"हिजरत","human":"इंसान","dreams":"ख़्वाब","fish":"मछली","calendar":"कैलेंडर","rites":"रस्में","better":"बेहतर","thousand":"हज़ार","pre-dawn":"सहरी","sunset":"सूर्यास्त","meal":"खाना","Eid":"ईद","standing":"वक़ूफ़","circling":"तवाफ़","walking":"सई","state":"हालत","consecration":"इहराम","call":"अज़ान","congregational":"जमाअत की","Friday":"जुमुआ","dawn":"फ़ज्र","prostration":"सजदा","bowing":"रुकू","sitting":"बैठना","testimony":"तशह्हुद","purification":"पाकी","water":"पानी","sacred":"पवित्र","mosque":"मस्जिद","Jerusalem":"बैतुल मुक़द्दस","opening":"शुरुआती","longest":"सबसे लंबी","shortest":"सबसे छोटी","verses":"आयतें","verse":"आयत","cow":"गाय","elephant":"हाथी","bee":"मधुमक्खी","ant":"चींटी","contains":"में है","number":"संख्या","two":"दो","short":"छोटी","begins":"शुरू होती है","commonly":"आम तौर पर","known":"मशहूर","mean":"अर्थ","meaning":"मतलब","Islamic":"इस्लामी","sense":"अर्थ","taqwa":"तक़वा","tawhid":"तौहीद","shirk":"शिर्क","sabr":"सब्र","shukr":"शुक्र","tawakkul":"तवक्कुल","istighfar":"इस्तिग़फ़ार","dua":"दुआ","dhikr":"ज़िक्र","halal":"हलाल","haram":"हराम","sunnah":"सुन्नत","bid'ah":"बिदअत","adab":"अदब","amanah":"अमानत","sidq":"सिद्क़","ghibah":"ग़ीबत","riba":"रिबा","zina":"ज़िना","father":"पिता","mother":"माता","woman":"महिला","wife":"पत्नी","ability":"क्षमता","speech":"बात","birds":"पक्षियों","tested":"आज़माए गए","illness":"बीमारी","patient":"सब्र करने वाले","cave":"गुफ़ा","beginning":"शुरुआत","religion":"दीन","complete":"पूरा","burden":"बोझ","soul":"जान","capacity":"क्षमता","greeting":"सलाम","reply":"जवाब","Jannah":"जन्नत","Jahannam":"जहन्नम","Akhirah":"आख़िरत","dunya":"दुनिया","Qiyamah":"क़ियामत","Barzakh":"बरज़ख़","trumpet":"सूर","Ashura":"आशूरा","I'tikaf":"एतिकाफ़","Fitr":"फ़ित्र","travel":"सफ़र","miqat":"मीक़ात","Talbiyah":"तलबिया","Zamzam":"ज़मज़म","Umrah":"उमरा","chapter":"सूरह","Juz":"पारा","Hizb":"हिज़्ब","Tajwid":"तजवीद","Hafiz":"हाफ़िज़","mushaf":"मुसहफ़","khutbah":"ख़ुत्बा","janazah":"जनाज़ा","Istikhara":"इस्तिख़ारा","Allah":"अल्लाह","Makkah":"मक्का","Madinah":"मदीना","Ka'bah":"काबा","Salah":"सलाह","Qur'an":"क़ुरआन","Hajj":"हज","Ramadan":"रमज़ान","Laylat al-Qadr":"लैलतुल क़द्र","Arafah":"अरफ़ा","Safa":"सफ़ा","Marwah":"मरवा","Prophet":"नबी","Allah's":"अल्लाह के","Qul":"क़ुल"}
  },
  ar: {
    phrases:[["choose the correct option","اختر الإجابة الصحيحة"],["How many","كم عدد"],["Which prophet","أي نبي"],["Which city","أي مدينة"],["Which surah","أي سورة"],["Who is","من هو"],["Who was","من كان"],["What is","ما هو"],["What does","ماذا يعني"],["In which month","في أي شهر"],["What is the name of","ما اسم"]],
    terms:{the:"الـ","a":"","an":"","is":"هو","are":"هي","was":"كان","what":"ما","which":"أي","who":"من","how":"كم","many":"عدد","of":"من","in":"في","on":"على","to":"إلى","from":"من","for":"لـ","and":"و","or":"أو","called":"يسمى","name":"اسم","city":"مدينة","month":"شهر","first":"الأول","ninth":"التاسع","after":"بعد","before":"قبل","during":"خلال","day":"يوم","night":"ليلة","final":"الأخير","revealed":"المنزّل","scripture":"الكتاب","prophet":"نبي","angel":"مَلَك","revelation":"الوحي","command":"أمر","faith":"إيمان","articles":"أركان","pillars":"أركان","obligatory":"واجب","daily":"يومية","prayers":"صلوات","prayer":"صلاة","fast":"صيام","fasting":"الصيام","charity":"صدقة","voluntary":"تطوع","direction":"اتجاه","pilgrimage":"حج","wealth":"مال","declaration":"شهادة","migration":"هجرة","human":"إنسان","dreams":"أحلام","fish":"حوت","calendar":"تقويم","rites":"مناسك","better":"خير","thousand":"ألف","pre-dawn":"سحور","sunset":"غروب","meal":"وجبة","Eid":"عيد","standing":"وقوف","circling":"طواف","walking":"سعي","state":"حالة","consecration":"إحرام","call":"أذان","congregational":"جماعة","Friday":"جمعة","dawn":"فجر","prostration":"سجود","bowing":"ركوع","sitting":"جلوس","testimony":"تشهد","purification":"طهارة","water":"ماء","sacred":"مقدس","mosque":"مسجد","Jerusalem":"القدس","opening":"فاتحة","longest":"أطول","shortest":"أقصر","verses":"آيات","verse":"آية","cow":"البقرة","elephant":"الفيل","bee":"النحل","ant":"النمل","contains":"تحتوي على","number":"رقم","two":"اثنان","short":"قصيرة","begins":"تبدأ","commonly":"عادة","known":"معروف","mean":"يعني","meaning":"معنى","Islamic":"إسلامي","taqwa":"تقوى","tawhid":"توحيد","shirk":"شرك","sabr":"صبر","shukr":"شكر","tawakkul":"توكل","istighfar":"استغفار","dua":"دعاء","dhikr":"ذكر","halal":"حلال","haram":"حرام","sunnah":"سنة","bid'ah":"بدعة","adab":"أدب","amanah":"أمانة","sidq":"صدق","ghibah":"غيبة","riba":"ربا","zina":"زنا","father":"أب","mother":"أم","woman":"امرأة","wife":"زوجة","ability":"قدرة","speech":"كلام","birds":"طيور","tested":"ابتُلي","illness":"مرض","patient":"صابر","cave":"غار","beginning":"بداية","religion":"الدين","complete":"كامل","burden":"عبء","soul":"نفس","capacity":"قدرة","greeting":"تحية","reply":"رد","Jannah":"الجنة","Jahannam":"جهنم","Akhirah":"الآخرة","dunya":"الدنيا","Qiyamah":"القيامة","Barzakh":"البرزخ","trumpet":"الصور","Ashura":"عاشوراء","I'tikaf":"اعتكاف","Fitr":"الفطر","travel":"السفر","miqat":"الميقات","Talbiyah":"التلبية","Zamzam":"زمزم","Umrah":"عمرة","chapter":"سورة","Juz":"جزء","Hizb":"حزب","Tajwid":"تجويد","Hafiz":"حافظ","mushaf":"مصحف","khutbah":"خطبة","janazah":"جنازة","Istikhara":"استخارة","Allah":"الله","Makkah":"مكة","Madinah":"المدينة","Ka'bah":"الكعبة","Salah":"الصلاة","Qur'an":"القرآن","Hajj":"الحج","Ramadan":"رمضان","Laylat al-Qadr":"ليلة القدر","Arafah":"عرفة","Safa":"الصفا","Marwah":"المروة","Prophet":"النبي","Allah's":"الله","Qul":"قل"}
  },
  tr: {
    phrases:[["choose the correct option","doğru seçeneği seçin"],["How many","kaç"],["Which prophet","hangi peygamber"],["Which city","hangi şehir"],["Which surah","hangi sure"],["Who is","kimdir"],["Who was","kimdi"],["What is","nedir"],["What does","ne anlama gelir"],["In which month","hangi ayda"],["What is the name of","adı nedir"]],
    terms:{the:"","a":"bir","an":"bir","is":"dir","are":"dir","was":"idi","what":"ne","which":"hangi","who":"kim","how":"kaç","many":"kaç","of":"-ın","in":"içinde","on":"üzerinde","to":"-e","from":"-den","for":"için","and":"ve","or":"veya","called":"denir","name":"ad","city":"şehir","month":"ay","first":"ilk","ninth":"dokuzuncu","after":"sonra","before":"önce","during":"sırasında","day":"gün","night":"gece","final":"son","revealed":"vahyedilen","scripture":"kutsal kitap","prophet":"peygamber","angel":"melek","revelation":"vahiy","command":"emir","faith":"iman","articles":"esaslar","pillars":"şartlar","obligatory":"farz","daily":"günlük","prayers":"namazlar","prayer":"namaz","fast":"oruç","fasting":"oruç tutmak","charity":"sadaka","voluntary":"nafile","direction":"yön","pilgrimage":"hac","wealth":"mal","declaration":"şehadet","migration":"hicret","human":"insan","dreams":"rüyalar","fish":"balık","calendar":"takvim","rites":"menasik","better":"daha hayırlı","thousand":"bin","pre-dawn":"sahur","sunset":"gün batımı","meal":"öğün","Eid":"bayram","standing":"vakfe","circling":"tavaf","walking":"sa'y","state":"durum","consecration":"ihram","call":"ezan","congregational":"cemaat","Friday":"cuma","dawn":"şafak","prostration":"secde","bowing":"rükû","sitting":"oturma","testimony":"teşehhüd","purification":"temizlik","water":"su","sacred":"kutsal","mosque":"cami","Jerusalem":"Kudüs","opening":"açılış","longest":"en uzun","shortest":"en kısa","verses":"ayetler","verse":"ayet","cow":"inek","elephant":"fil","bee":"arı","ant":"karınca","contains":"içerir","number":"sayı","two":"iki","short":"kısa","begins":"başlar","commonly":"genellikle","known":"bilinen","mean":"anlamına gelmek","meaning":"anlam","Islamic":"İslami","taqwa":"takva","tawhid":"tevhid","shirk":"şirk","sabr":"sabır","shukr":"şükür","tawakkul":"tevekkül","istighfar":"istiğfar","dua":"dua","dhikr":"zikir","halal":"helal","haram":"haram","sunnah":"sünnet","bid'ah":"bid'at","adab":"edep","amanah":"emanet","sidq":"doğruluk","ghibah":"gıybet","riba":"riba","zina":"zina","father":"baba","mother":"anne","woman":"kadın","wife":"eş","ability":"yetenek","speech":"konuşma","birds":"kuşlar","tested":"sınandı","illness":"hastalık","patient":"sabırlı","cave":"mağara","beginning":"başlangıç","religion":"din","complete":"tam","burden":"yük","soul":"nefis","capacity":"güç","greeting":"selam","reply":"cevap","Jannah":"Cennet","Jahannam":"Cehennem","Akhirah":"Ahiret","dunya":"dünya","Qiyamah":"Kıyamet","Barzakh":"Berzah","trumpet":"sûr","Ashura":"Aşura","I'tikaf":"itikaf","Fitr":"fitre","travel":"sefer","miqat":"mikat","Talbiyah":"telbiye","Zamzam":"Zemzem","Umrah":"umre","chapter":"sure","Juz":"cüz","Hizb":"hizip","Tajwid":"tecvid","Hafiz":"hafız","mushaf":"mushaf","khutbah":"hutbe","janazah":"cenaze","Istikhara":"istihare","Allah":"Allah","Makkah":"Mekke","Madinah":"Medine","Ka'bah":"Kâbe","Salah":"namaz","Qur'an":"Kur'an","Hajj":"hac","Ramadan":"Ramazan","Laylat al-Qadr":"Kadir Gecesi","Arafah":"Arafat","Safa":"Safa","Marwah":"Merve","Prophet":"peygamber","Allah's":"Allah'ın","Qul":"Kul"}
  },
  id: {
    phrases:[["choose the correct option","pilih jawaban yang benar"],["How many","berapa banyak"],["Which prophet","nabi yang mana"],["Which city","kota yang mana"],["Which surah","surah yang mana"],["Who is","siapa"],["Who was","siapa"],["What is","apa"],["What does","apa arti"],["In which month","pada bulan apa"],["What is the name of","apa nama"]],
    terms:{the:"","a":"sebuah","an":"sebuah","is":"adalah","are":"adalah","was":"adalah","what":"apa","which":"yang mana","who":"siapa","how":"berapa","many":"banyak","of":"dari","in":"di","on":"pada","to":"ke","from":"dari","for":"untuk","and":"dan","or":"atau","called":"disebut","name":"nama","city":"kota","month":"bulan","first":"pertama","ninth":"kesembilan","after":"setelah","before":"sebelum","during":"selama","day":"hari","night":"malam","final":"terakhir","revealed":"diturunkan","scripture":"kitab suci","prophet":"nabi","angel":"malaikat","revelation":"wahyu","command":"perintah","faith":"iman","articles":"rukun","pillars":"rukun","obligatory":"wajib","daily":"harian","prayers":"salat","prayer":"salat","fast":"puasa","fasting":"berpuasa","charity":"sedekah","voluntary":"sunnah","direction":"arah","pilgrimage":"haji","wealth":"harta","declaration":"syahadat","migration":"hijrah","human":"manusia","dreams":"mimpi","fish":"ikan","calendar":"kalender","rites":"manasik","better":"lebih baik","thousand":"seribu","pre-dawn":"sahur","sunset":"matahari terbenam","meal":"makanan","Eid":"Id","standing":"wukuf","circling":"tawaf","walking":"sa'i","state":"keadaan","consecration":"ihram","call":"azan","congregational":"berjamaah","Friday":"Jumat","dawn":"fajar","prostration":"sujud","bowing":"rukuk","sitting":"duduk","testimony":"tasyahud","purification":"bersuci","water":"air","sacred":"suci","mosque":"masjid","Jerusalem":"Yerusalem","opening":"pembuka","longest":"terpanjang","shortest":"terpendek","verses":"ayat","verse":"ayat","cow":"sapi","elephant":"gajah","bee":"lebah","ant":"semut","contains":"berisi","number":"nomor","two":"dua","short":"pendek","begins":"dimulai","commonly":"umumnya","known":"dikenal","mean":"berarti","meaning":"arti","Islamic":"Islam","taqwa":"takwa","tawhid":"tauhid","shirk":"syirik","sabr":"sabar","shukr":"syukur","tawakkul":"tawakal","istighfar":"istighfar","dua":"doa","dhikr":"zikir","halal":"halal","haram":"haram","sunnah":"sunnah","bid'ah":"bidah","adab":"adab","amanah":"amanah","sidq":"jujur","ghibah":"ghibah","riba":"riba","zina":"zina","father":"ayah","mother":"ibu","woman":"wanita","wife":"istri","ability":"kemampuan","speech":"ucapan","birds":"burung","tested":"diuji","illness":"penyakit","patient":"sabar","cave":"gua","beginning":"awal","religion":"agama","complete":"sempurna","burden":"beban","soul":"jiwa","capacity":"kemampuan","greeting":"salam","reply":"jawaban","Jannah":"surga","Jahannam":"neraka","Akhirah":"akhirat","dunya":"dunia","Qiyamah":"kiamat","Barzakh":"barzakh","trumpet":"sangkakala","Ashura":"Asyura","I'tikaf":"i'tikaf","Fitr":"fitrah","travel":"perjalanan","miqat":"miqat","Talbiyah":"talbiyah","Zamzam":"zamzam","Umrah":"umrah","chapter":"surah","Juz":"juz","Hizb":"hizb","Tajwid":"tajwid","Hafiz":"hafiz","mushaf":"mushaf","khutbah":"khutbah","janazah":"jenazah","Istikhara":"istikharah","Allah":"Allah","Makkah":"Makkah","Madinah":"Madinah","Ka'bah":"Ka'bah","Salah":"salat","Qur'an":"Al-Qur'an","Hajj":"haji","Ramadan":"Ramadan","Laylat al-Qadr":"Lailatul Qadar","Arafah":"Arafah","Safa":"Safa","Marwah":"Marwah","Prophet":"Nabi","Allah's":"Allah","Qul":"Qul"}
  }
};

function translateFragment(text,lang){
  const pack=LANG_PACKS[lang]; if(!pack) return text;
  let s=text;
  const keys=Object.keys(pack.terms).sort((a,b)=>b.length-a.length);
  keys.forEach(k=>{const v=pack.terms[k];s=s.replace(new RegExp("(^|\\s)"+k.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\\\$&")+"(?=\\s|[?'.,—-]|$)","gi"),(m,p)=>p+v)});
  return s.replace(/\\s{2,}/g," ").trim();
}
const URDU_QUESTION_MAP = {"how many pillars of islam are there":"اسلام کے کتنے ارکان ہیں؟","how many articles of faith are commonly taught in the six articles of iman":"ایمان کے عام طور پر بیان کیے جانے والے چھ ارکان کتنے ہیں؟","how many obligatory daily prayers are there":"روزانہ کتنی فرض نمازیں ہیں؟","which month is fasting obligatory in":"کس مہینے میں روزہ فرض ہے؟","which direction do muslims face during salah":"مسلمان نماز کے دوران کس سمت رخ کرتے ہیں؟","what is the name of the pilgrimage to makkah":"مکہ کی زیارت اور حج کو کیا کہا جاتا ہے؟","what is the charity that is obligatory on qualifying wealth":"نصاب والے مال پر کون سا صدقہ فرض ہے؟","what is voluntary charity called":"نفلی صدقے کو کیا کہا جاتا ہے؟","what is the declaration of faith called":"شہادتِ ایمان کو کیا کہا جاتا ہے؟","what is the migration of the prophet ﷺ from makkah to madinah called":"نبی ﷺ کی مکہ سے مدینہ ہجرت کو کیا کہا جاتا ہے؟","which city is the ka'bah in":"کعبہ کس شہر میں ہے؟","which city did the prophet ﷺ migrate to":"نبی ﷺ نے کس شہر کی طرف ہجرت فرمائی؟","which angel brought revelation to the prophets":"انبیاء کے پاس وحی کون سا فرشتہ لاتا تھا؟","what is the name of the final revealed scripture":"آخری نازل ہونے والی آسمانی کتاب کا نام کیا ہے؟","who is the final prophet in islam":"اسلام کے آخری نبی کون ہیں؟","who was the first human and prophet":"پہلے انسان اور نبی کون تھے؟","which prophet built the ark by allah's command":"اللہ کے حکم سے کشتی کس نبی نے بنائی؟","which prophet is known for interpreting dreams in the qur'an":"قرآن میں خوابوں کی تعبیر کے لیے کون سے نبی مشہور ہیں؟","which prophet was swallowed by a great fish":"کس نبی کو ایک بڑی مچھلی نے نگل لیا تھا؟","which prophet received the tawrah":"کس نبی کو تورات عطا کی گئی؟","which prophet received the zabur":"کس نبی کو زبور عطا کی گئی؟","which prophet received the injil":"کس نبی کو انجیل عطا کی گئی؟","which prophet is called khalilullah in islamic tradition":"اسلامی روایت میں کس نبی کو خلیل اللہ کہا جاتا ہے؟","which prophet's father is named imran":"کس نبی کے والد کا نام عمران بیان کیا جاتا ہے؟","what is the first month of the islamic calendar":"اسلامی تقویم کا پہلا مہینہ کون سا ہے؟","what is the ninth month of the islamic calendar":"اسلامی تقویم کا نواں مہینہ کون سا ہے؟","what is the month after ramadan":"رمضان کے بعد کون سا مہینہ آتا ہے؟","which month contains hajj rites":"کس مہینے میں حج کے مناسک ادا کیے جاتے ہیں؟","what is the night described as better than a thousand months":"وہ رات کون سی ہے جسے ہزار مہینوں سے بہتر بتایا گیا ہے؟","in which month is laylat al-qadr sought":"لیلۃ القدر کس مہینے میں تلاش کی جاتی ہے؟","what is the pre-dawn meal in ramadan called":"رمضان میں فجر سے پہلے کھائے جانے والے کھانے کو کیا کہتے ہیں؟","what is the meal at sunset that ends a fast called":"غروبِ آفتاب کے وقت روزہ ختم کرنے والے کھانے کو کیا کہتے ہیں؟","what is the eid immediately after ramadan called":"رمضان کے فوراً بعد آنے والی عید کو کیا کہتے ہیں؟","what is the eid during hajj season called":"حج کے موسم میں آنے والی عید کو کیا کہتے ہیں؟","what is the standing at arafah called":"عرفات میں وقوف کو کیا کہا جاتا ہے؟","what is circling the ka'bah seven times called":"کعبہ کے گرد سات چکروں کو کیا کہا جاتا ہے؟","what is walking between safa and marwah called":"صفا اور مروہ کے درمیان چلنے کو کیا کہا جاتا ہے؟","what is the state of consecration for hajj or umrah called":"حج یا عمرہ کے لیے احرام کی حالت کو کیا کہا جاتا ہے؟","what is the call to prayer called":"نماز کے لیے دی جانے والی پکار کو کیا کہتے ہیں؟","what is the call immediately before congregational prayer called":"جماعت کی نماز سے فوراً پہلے دی جانے والی پکار کو کیا کہتے ہیں؟","what is the friday congregational prayer called":"جمعہ کی جماعت والی نماز کو کیا کہا جاتا ہے؟","which prayer is performed after the sun has passed its zenith and before late afternoon":"وہ کون سی نماز ہے جو سورج کے زوال کے بعد اور عصر سے پہلے ادا کی جاتی ہے؟","which prayer is at dawn":"فجر کے وقت کون سی نماز ادا کی جاتی ہے؟","which prayer is after sunset":"غروبِ آفتاب کے بعد کون سی نماز ادا کی جاتی ہے؟","which prayer is at night":"رات کو کون سی نماز ادا کی جاتی ہے؟","which prayer is in the late afternoon":"دیرِ عصر میں کون سی نماز ادا کی جاتی ہے؟","what is prostration in salah called":"نماز میں سجدے کو کیا کہتے ہیں؟","what is bowing in salah called":"نماز میں جھکنے کو کیا کہتے ہیں؟","what is standing in salah called":"نماز میں کھڑے ہونے کو کیا کہتے ہیں؟","what is the sitting testimony in salah called":"نماز میں بیٹھ کر پڑھے جانے والے تشہد کو کیا کہتے ہیں؟","what is the purification with water before prayer called":"نماز سے پہلے پانی کے ذریعے پاکیزگی حاصل کرنے کو کیا کہتے ہیں؟","what may be used for purification when water is unavailable or harmful":"جب پانی دستیاب نہ ہو یا نقصان دہ ہو تو پاکیزگی کے لیے کیا استعمال کیا جا سکتا ہے؟","what is the full ritual bath called":"مکمل شرعی غسل کو کیا کہتے ہیں؟","what is the sacred mosque in makkah called":"مکہ کی مقدس مسجد کو کیا کہتے ہیں؟","what is the prophet's mosque in madinah called":"مدینہ منورہ میں نبی ﷺ کی مسجد کو کیا کہتے ہیں؟","which mosque is associated with jerusalem":"یروشلم سے کون سی مسجد منسوب ہے؟","what was the first qiblah of the muslims":"مسلمانوں کا پہلا قبلہ کیا تھا؟","what is the qur'an's opening surah":"قرآن کی افتتاحی سورت کون سی ہے؟","which is the longest surah in the qur'an":"قرآن کی سب سے لمبی سورت کون سی ہے؟","which is the shortest surah by verses":"آیات کی تعداد کے لحاظ سے سب سے چھوٹی سورت کون سی ہے؟","how many verses are in surah al-fatihah":"سورۃ الفاتحہ میں کتنی آیات ہیں؟","which surah is named after the cow":"کون سی سورت گائے کے نام پر ہے؟","which surah is named after the elephant":"کون سی سورت ہاتھی کے نام پر ہے؟","which surah is named after the bee":"کون سی سورت شہد کی مکھی کے نام پر ہے؟","which surah is named after the ant":"کون سی سورت چیونٹی کے نام پر ہے؟","which surah is commonly known as the heart of the qur'an in popular tradition":"عام روایتی طور پر قرآن کا دل کس سورت کو کہا جاتا ہے؟","which surah contains ayat al-kursi":"آیت الکرسی کس سورت میں ہے؟","what number is ayat al-kursi":"آیت الکرسی کا نمبر کیا ہے؟","which two short surahs are known together as al-mu'awwidhatayn":"کون سی دو مختصر سورتیں مل کر المعوذتین کہلاتی ہیں؟","which surah begins with 'qul huwa allahu ahad'":"کون سی سورت 'قُلْ هُوَ اللّٰهُ أَحَدٌ' سے شروع ہوتی ہے؟","which surah begins with 'qul a'udhu bi rabbil-falaq'":"کون سی سورت 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ' سے شروع ہوتی ہے؟","which surah begins with 'qul a'udhu bi rabbin-nas'":"کون سی سورت 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ' سے شروع ہوتی ہے؟","what does islam mean in a common theological sense":"عام دینی مفہوم میں اسلام کا کیا مطلب ہے؟","what is taqwa commonly understood as":"تقویٰ کو عام طور پر کس معنی میں سمجھا جاتا ہے؟","what is tawhid":"توحید کیا ہے؟","what is shirk":"شرک کیا ہے؟","what is sabr":"صبر کیا ہے؟","what is shukr":"شکر کیا ہے؟","what is tawakkul":"توکل کیا ہے؟","what is istighfar":"استغفار کیا ہے؟","what is dua":"دعا کیا ہے؟","what is dhikr":"ذکر کیا ہے؟","what is halal":"حلال کیا ہے؟","what is haram":"حرام کیا ہے؟","what is wajib/fard commonly used to describe":"واجب یا فرض سے عام طور پر کیا مراد ہے؟","what is sunnah":"سنت کیا ہے؟","what is bid'ah in the technical religious sense":"اصطلاحی دینی مفہوم میں بدعت کیا ہے؟","what is adab":"ادب کیا ہے؟","what is amanah":"امانت کیا ہے؟","what is sidq":"صدق کیا ہے؟","what is ghibah":"غیبت کیا ہے؟","what is riba":"ربا کیا ہے؟","what is zina":"زنا کیا ہے؟","what is gheebah explicitly compared to in qur'an 49:12":"قرآن 49:12 میں غیبت کو کس چیز سے واضح طور پر تشبیہ دی گئی ہے؟","which prophet is the father of ismail عليه السلام":"حضرت اسماعیل علیہ السلام کے والد کون سے نبی ہیں؟","who is the mother of isa عليه السلام":"حضرت عیسیٰ علیہ السلام کی والدہ کون ہیں؟","which woman is explicitly named by name in the qur'an":"قرآن میں کس عورت کا نام واضح طور پر بیان ہوا ہے؟","what is the name of ibrahim's wife who was the mother of ismail":"حضرت اسماعیل علیہ السلام کی والدہ حضرت ابراہیم علیہ السلام کی کون سی زوجہ تھیں؟","which prophet was given the ability to understand the speech of birds by allah's permission":"اللہ کے اذن سے پرندوں کی زبان سمجھنے کی صلاحیت کس نبی کو دی گئی؟","which prophet was tested with severe illness and remained patient":"کس نبی کو شدید بیماری کے ذریعے آزمایا گیا اور انہوں نے صبر کیا؟","which prophet spoke to allah according to qur'anic description":"قرآنی بیان کے مطابق کس نبی نے اللہ سے کلام کیا؟","which prophet was raised in status and described as truthful and a prophet":"کس نبی کا مقام بلند کیا گیا اور انہیں سچا نبی بیان کیا گیا؟","which prophet was sent to the people of 'ad":"قومِ عاد کی طرف کون سے نبی بھیجے گئے؟","which prophet was sent to thamud":"قومِ ثمود کی طرف کون سے نبی بھیجے گئے؟","which prophet was sent to madyan":"مدین کی طرف کون سے نبی بھیجے گئے؟","which prophet was sent to the people of sodom according to the qur'an":"قرآن کے مطابق قومِ سدوم کی طرف کون سے نبی بھیجے گئے؟","which prophet's brothers threw him into a well":"کس نبی کے بھائیوں نے انہیں کنویں میں پھینک دیا تھا؟","which prophet's staff became a sign by allah's permission":"اللہ کے اذن سے کس نبی کی لاٹھی نشانی بن گئی؟","which prophet was given a kingdom and extraordinary control over wind by allah's permission":"اللہ کے اذن سے کس نبی کو بادشاہت اور ہوا پر غیر معمولی اختیار دیا گیا؟","which prophet was given the ability to make armor":"کس نبی کو زرہیں بنانے کی صلاحیت دی گئی؟","what is the name of the cave associated with the hijrah":"ہجرت کے ساتھ منسوب غار کا نام کیا ہے؟","what cave is associated with the beginning of qur'anic revelation":"قرآن کی پہلی وحی کے آغاز سے کون سا غار منسوب ہے؟","what was the first revealed command commonly translated as":"پہلا نازل ہونے والا حکم عام طور پر کس طرح ترجمہ کیا جاتا ہے؟","which surah contains the command to fast ramadan":"رمضان کے روزے کا حکم کس سورت میں ہے؟","which surah contains the famous verse about the religion being complete":"دین کے مکمل ہونے والی مشہور آیت کس سورت میں ہے؟","which surah contains the verse 'allah does not burden a soul beyond its capacity'":"'اللہ کسی جان کو اس کی طاقت سے زیادہ بوجھ نہیں دیتا' والی آیت کس سورت میں ہے؟","which surah contains the command 'establish prayer and give zakat' repeatedly":"'نماز قائم کرو اور زکوٰۃ دو' کا حکم بار بار کس سورت میں آیا ہے؟","what is the meaning of 'bismillah ar-rahman ar-rahim'":"'بسم اللہ الرحمن الرحیم' کا کیا مطلب ہے؟","what does 'allahu akbar' mean":"'اللہ اکبر' کا کیا مطلب ہے؟","what does 'alhamdulillah' mean":"'الحمدللہ' کا کیا مطلب ہے؟","what does 'subhanallah' commonly express":"'سبحان اللہ' عام طور پر کیا ظاہر کرتا ہے؟","what does 'astaghfirullah' mean":"'استغفر اللہ' کا کیا مطلب ہے؟","what greeting is traditionally used by muslims":"مسلمانوں میں روایتی سلام کون سا ہے؟","what is the reply to 'as-salamu alaykum'":"'السلام علیکم' کا جواب کیا ہے؟","what is jannah":"جنت کیا ہے؟","what is jahannam":"جہنم کیا ہے؟","what is akhirah":"آخرت کیا ہے؟","what is dunya":"دنیا کیا ہے؟","what is qiyamah":"قیامت کیا ہے؟","what is barzakh commonly understood as":"برزخ کو عام طور پر کس چیز کے درمیان کی حالت سمجھا جاتا ہے؟","which angel is associated in hadith with blowing the trumpet":"حدیث کے مطابق صور پھونکنے سے کون سا فرشتہ منسوب ہے؟","which angel is associated with hell's guardianship in qur'an":"قرآن میں جہنم کی نگہبانی کس فرشتے سے منسوب ہے؟","which angel is named in qur'an 2:98 alongside jibril":"قرآن 2:98 میں جبرائیل کے ساتھ کس فرشتے کا نام آیا ہے؟","what is the day of arafah":"یومِ عرفہ کیا ہے؟","what is ashura":"عاشوراء کیا ہے؟","what is the night prayer in ramadan commonly called":"رمضان میں رات کی نماز کو عام طور پر کیا کہتے ہیں؟","what is the odd-numbered night prayer that can be performed after isha":"عشاء کے بعد ادا کی جانے والی طاق راتوں کی نماز کو کیا کہتے ہیں؟","what is i'tikaf":"اعتکاف کیا ہے؟","what is fitr charity called":"فطرانے کو کیا کہا جاتا ہے؟","when is zakat al-fitr traditionally due":"زکوٰۃ الفطر روایتی طور پر کب ادا کرنا لازم ہوتی ہے؟","what is qasr in travel prayer":"سفر کی نماز میں قصر کیا ہے؟","what is jam' in prayer terminology":"نماز کی اصطلاح میں جمع کیا ہے؟","what is the miqat":"میقات کیا ہے؟","what is talbiyah":"تلبیہ کیا ہے؟","what is the black stone called in arabic":"حجرِ اسود کو عربی میں کیا کہا جاتا ہے؟","what is maqam ibrahim":"مقامِ ابراہیم کیا ہے؟","what is zamzam":"زمزم کیا ہے؟","which two hills are associated with sa'i":"صفا اور مروہ کن دو پہاڑیوں کے نام ہیں؟","what is mina":"منیٰ کیا ہے؟","what is muzdalifah":"مزدلفہ کیا ہے؟","what is the ramy al-jamarat":"رمی الجمرات کیا ہے؟","what is umrah":"عمرہ کیا ہے؟","can umrah be performed outside the hajj season":"کیا حج کے موسم کے علاوہ عمرہ کیا جا سکتا ہے؟","what is the arabic term for the qur'an's chapter":"قرآن کے باب کو عربی میں کیا کہا جاتا ہے؟","what is an individual verse of the qur'an called":"قرآن کی ایک انفرادی آیت کو کیا کہا جاتا ہے؟","what is a juz":"جزء کیا ہے؟","how many juz are in the standard qur'an division":"معیاری قرآن کی تقسیم میں کتنے پارے ہیں؟","what is a hizb":"حزب کیا ہے؟","what is tajwid":"تجوید کیا ہے؟","what is hafiz al-qur'an commonly used to mean":"حافظ القرآن سے عام طور پر کیا مراد ہے؟","what is a mushaf":"مصحف کیا ہے؟","what is a khutbah":"خطبہ کیا ہے؟","what is a janazah prayer":"نمازِ جنازہ کیا ہے؟","what is salat al-istisqa":"نمازِ استسقاء کیا ہے؟","what is salat al-kusuf/khusuf":"نمازِ کسوف یا خسوف کیا ہے؟","what is salat al-istikhara":"نمازِ استخارہ کیا ہے؟","what is the islamic greeting's core meaning":"اسلامی سلام کا بنیادی مفہوم کیا ہے؟","what is jazakallahu khayran":"'جزاک اللہ خیراً' کا کیا مطلب ہے؟","what is the best-known phrase of testimony after the name of allah":"اللہ کے نام کے بعد گواہی کا مشہور ترین جملہ کیا ہے؟","what does 'la ilaha illallah' mean":"'لا إله إلا الله' کا کیا مطلب ہے؟","what does 'muhammadur rasulullah' affirm":"'محمد رسول الله' کس بات کی تصدیق کرتا ہے؟"};
function localizeQuestion(text,lang){
  if(!lang || lang==="en") return text;
  const rawKey=text.replace(/^Knowledge check:\s*/i,"").replace(/\s+—\s+choose the correct option\.?$/i,"").trim().replace(/[?؟]$/,'').toLowerCase();
  if(lang==="ur" && URDU_QUESTION_MAP[rawKey]) return URDU_QUESTION_MAP[rawKey];
  const pack=LANG_PACKS[lang]; if(!pack) return text;
  const raw=text.replace(/^Knowledge check:\s*/i,"").replace(/\s+—\s+choose the correct option\.?$/i,"").trim().replace(/[?؟]$/,'');
  const f=translateFragment;
  let out="";
  if(lang==="ur"){
    let m;
    if((m=raw.match(/^How many (.+?) are there$/i))) out=`${f(m[1],lang)} کتنے ہیں`;
    else if((m=raw.match(/^Which prophet (.+)$/i))) out=`کون سے نبی ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which city (.+)$/i))) out=`کون سا شہر ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which surah (.+)$/i))) out=`کون سی سورت ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which prayer (.+)$/i))) out=`کون سی نماز ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which month (.+)$/i))) out=`کون سا مہینہ ${f(m[1],lang)}`;
    else if((m=raw.match(/^In which month (.+)$/i))) out=`کس مہینے میں ${f(m[1],lang)}`;
    else if((m=raw.match(/^Who is (.+)$/i))) out=`${f(m[1],lang)} کون ہے`;
    else if((m=raw.match(/^Who was (.+)$/i))) out=`${f(m[1],lang)} کون تھے`;
    else if((m=raw.match(/^What is the name of (.+)$/i))) out=`${f(m[1],lang)} کا نام کیا ہے`;
    else if((m=raw.match(/^What is (.+)$/i))) out=`${f(m[1],lang)} کیا ہے`;
    else if((m=raw.match(/^What does (.+?) mean$/i))) out=`${f(m[1],lang)} کا کیا مطلب ہے`;
    else if((m=raw.match(/^What does (.+)$/i))) out=`${f(m[1],lang)} کا کیا مطلب ہے`;
    else out=f(raw,lang);
    return out+"؟";
  }
  if(lang==="hi"){
    let m;
    if((m=raw.match(/^How many (.+?) are there$/i))) out=`${f(m[1],lang)} कितने हैं`;
    else if((m=raw.match(/^Which prophet (.+)$/i))) out=`कौन से नबी ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which city (.+)$/i))) out=`कौन सा शहर ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which surah (.+)$/i))) out=`कौन सी सूरह ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which prayer (.+)$/i))) out=`कौन सी नमाज़ ${f(m[1],lang)}`;
    else if((m=raw.match(/^In which month (.+)$/i))) out=`किस महीने में ${f(m[1],lang)}`;
    else if((m=raw.match(/^Who is (.+)$/i))) out=`${f(m[1],lang)} कौन है`;
    else if((m=raw.match(/^Who was (.+)$/i))) out=`${f(m[1],lang)} कौन थे`;
    else if((m=raw.match(/^What is the name of (.+)$/i))) out=`${f(m[1],lang)} का नाम क्या है`;
    else if((m=raw.match(/^What is (.+)$/i))) out=`${f(m[1],lang)} क्या है`;
    else if((m=raw.match(/^What does (.+)$/i))) out=`${f(m[1],lang)} का क्या अर्थ है`;
    else out=f(raw,lang);
    return out+"?";
  }
  if(lang==="ar"){
    let m;
    if((m=raw.match(/^How many (.+?) are there$/i))) out=`كم عدد ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which prophet (.+)$/i))) out=`أي نبي ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which city (.+)$/i))) out=`أي مدينة ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which surah (.+)$/i))) out=`أي سورة ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which prayer (.+)$/i))) out=`أي صلاة ${f(m[1],lang)}`;
    else if((m=raw.match(/^In which month (.+)$/i))) out=`في أي شهر ${f(m[1],lang)}`;
    else if((m=raw.match(/^Who is (.+)$/i))) out=`من هو ${f(m[1],lang)}`;
    else if((m=raw.match(/^Who was (.+)$/i))) out=`من كان ${f(m[1],lang)}`;
    else if((m=raw.match(/^What is the name of (.+)$/i))) out=`ما اسم ${f(m[1],lang)}`;
    else if((m=raw.match(/^What is (.+)$/i))) out=`ما هو ${f(m[1],lang)}`;
    else if((m=raw.match(/^What does (.+)$/i))) out=`ماذا يعني ${f(m[1],lang)}`;
    else out=f(raw,lang);
    return out+"؟";
  }
  // Turkish / Indonesian: use translated terms plus natural question stems.
  if(lang==="tr"){
    let m;
    if((m=raw.match(/^How many (.+?) are there$/i))) out=`Kaç ${f(m[1],lang)} var`;
    else if((m=raw.match(/^Which prophet (.+)$/i))) out=`Hangi peygamber ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which city (.+)$/i))) out=`Hangi şehir ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which surah (.+)$/i))) out=`Hangi sure ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which prayer (.+)$/i))) out=`Hangi namaz ${f(m[1],lang)}`;
    else if((m=raw.match(/^In which month (.+)$/i))) out=`Hangi ayda ${f(m[1],lang)}`;
    else if((m=raw.match(/^Who is (.+)$/i))) out=`${f(m[1],lang)} kimdir`;
    else if((m=raw.match(/^Who was (.+)$/i))) out=`${f(m[1],lang)} kimdi`;
    else if((m=raw.match(/^What is the name of (.+)$/i))) out=`${f(m[1],lang)} adı nedir`;
    else if((m=raw.match(/^What is (.+)$/i))) out=`${f(m[1],lang)} nedir`;
    else if((m=raw.match(/^What does (.+)$/i))) out=`${f(m[1],lang)} ne anlama gelir`;
    else out=f(raw,lang);
    return out+"?";
  }
  if(lang==="id"){
    let m;
    if((m=raw.match(/^How many (.+?) are there$/i))) out=`Ada berapa ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which prophet (.+)$/i))) out=`Nabi mana yang ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which city (.+)$/i))) out=`Kota mana yang ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which surah (.+)$/i))) out=`Surah mana yang ${f(m[1],lang)}`;
    else if((m=raw.match(/^Which prayer (.+)$/i))) out=`Salat mana yang ${f(m[1],lang)}`;
    else if((m=raw.match(/^In which month (.+)$/i))) out=`Pada bulan apa ${f(m[1],lang)}`;
    else if((m=raw.match(/^Who is (.+)$/i))) out=`Siapa ${f(m[1],lang)}`;
    else if((m=raw.match(/^Who was (.+)$/i))) out=`Siapa ${f(m[1],lang)}`;
    else if((m=raw.match(/^What is the name of (.+)$/i))) out=`Apa nama ${f(m[1],lang)}`;
    else if((m=raw.match(/^What is (.+)$/i))) out=`Apa ${f(m[1],lang)}`;
    else if((m=raw.match(/^What does (.+)$/i))) out=`Apa arti ${f(m[1],lang)}`;
    else out=f(raw,lang);
    return out+"?";
  }
  return f(raw,lang)+"?";
}
function localizeOption(text, lang){
  if(!lang || lang==="en") return text;
  return localizeQuestion(text.replace(/[.؟?]$/,""),lang).replace(/[?؟]$/,"");
}
window.localizeQuestion=localizeQuestion;
window.localizeOption=localizeOption;


/* ===== V4: onboarding, localization and reliable level ambience ===== */
(() => {
  const translations = {
    en:{welcome:"Welcome to Deen Quest", continue:"Continue", enter:"Enter Deen Quest", start:"Start Your Journey", sound:"Islamic Sound", ready:"You're Ready!", required:"Please complete all fields.", muslim:"Are you Muslim?", reading:"Can you read the Qur'an?", interest:"Are you interested in this Islamic learning game?", language:"Choose Your Language", step:"STEP"},
    ur:{welcome:"دین کویسٹ میں خوش آمدید", continue:"جاری رکھیں", enter:"دین کویسٹ میں داخل ہوں", start:"اپنا سفر شروع کریں", sound:"اسلامی آواز", ready:"آپ تیار ہیں!", required:"براہِ کرم تمام معلومات مکمل کریں۔", muslim:"کیا آپ مسلمان ہیں؟", reading:"کیا آپ قرآن پڑھ سکتے ہیں؟", interest:"کیا آپ اس اسلامی تعلیمی گیم میں دلچسپی رکھتے ہیں؟", language:"اپنی زبان منتخب کریں", step:"مرحلہ"},
    hi:{welcome:"दीन क्वेस्ट में आपका स्वागत है", continue:"जारी रखें", enter:"दीन क्वेस्ट में प्रवेश करें", start:"अपनी यात्रा शुरू करें", sound:"इस्लामिक ध्वनि", ready:"आप तैयार हैं!", required:"कृपया सभी जानकारी पूरी करें।", muslim:"क्या आप मुस्लिम हैं?", reading:"क्या आप कुरआन पढ़ सकते हैं?", interest:"क्या आप इस इस्लामिक लर्निंग गेम में रुचि रखते हैं?", language:"अपनी भाषा चुनें", step:"चरण"},
    ar:{welcome:"مرحباً بك في دين كويست", continue:"متابعة", enter:"دخول دين كويست", start:"ابدأ رحلتك", sound:"الصوت الإسلامي", ready:"أنت جاهز!", required:"يرجى إكمال جميع المعلومات.", muslim:"هل أنت مسلم؟", reading:"هل تستطيع قراءة القرآن؟", interest:"هل أنت مهتم بهذه اللعبة التعليمية الإسلامية؟", language:"اختر لغتك", step:"الخطوة"},
    tr:{welcome:"Deen Quest'e Hoş Geldiniz", continue:"Devam Et", enter:"Deen Quest'e Gir", start:"Yolculuğunu Başlat", sound:"İslami Ses", ready:"Hazırsın!", required:"Lütfen tüm bilgileri doldurun.", muslim:"Müslüman mısınız?", reading:"Kur'an okuyabiliyor musunuz?", interest:"Bu İslami eğitim oyunuyla ilgileniyor musunuz?", language:"Dilinizi seçin", step:"ADIM"},
    id:{welcome:"Selamat Datang di Deen Quest", continue:"Lanjutkan", enter:"Masuk Deen Quest", start:"Mulai Perjalanan", sound:"Suasana Islami", ready:"Kamu Siap!", required:"Silakan lengkapi semua informasi.", muslim:"Apakah Anda Muslim?", reading:"Apakah Anda bisa membaca Al-Qur'an?", interest:"Apakah Anda tertarik dengan game pembelajaran Islam ini?", language:"Pilih Bahasa", step:"LANGKAH"}
  };
  const profileKey="deenQuestProfileV4";
  let profile={};
  try{profile=JSON.parse(localStorage.getItem(profileKey)||"{}")}catch(e){}

  function applyLanguage(lang){
    const t=translations[lang]||translations.en;
    document.documentElement.lang=lang;
    document.body.dir=lang==="ur"||lang==="ar"?"rtl":"ltr";
    const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val};
    set("homeStartBtn",t.start); set("homeAudioToggle", IslamicAudio?.isPlaying?.()?"🔇 "+t.sound:"🔊 "+t.sound);
    set("readyTitle",t.ready); set("finishOnboarding",t.enter);
    document.querySelectorAll(".ob-next").forEach(x=>x.textContent=t.continue);
    const labels=document.querySelectorAll("#onboardingStep2 .choice-group span");
    if(labels[0])labels[0].textContent=t.muslim;
    if(labels[1])labels[1].textContent=t.reading;
    if(labels[2])labels[2].textContent=t.interest;
    const langTitle=document.querySelector("#onboardingStep3 h2"); if(langTitle)langTitle.textContent=t.language;
    // Preserve existing game translations where a text dictionary is available.
    window.DEEN_LANG=lang; window.DEEN_T=t; document.body.classList.toggle("rtl-ui",lang==="ur"||lang==="ar");
    const ui={
      en:{home:"Home",levels:"50 Levels",rewards:"Rewards",dashboard:"Dashboard",hero:"Learn Islam. Master 50 Levels.",start:"Start Your Journey →",viewRewards:"View Rewards",quiz:"Islamic Quiz",unlocks:"3D Unlocks",gift:"Grand Gift",journey:"50 Sacred Knowledge Levels",journeySub:"Complete a level to unlock the next one.",back:"← Levels",next:"Next Question →",complete:"LEVEL COMPLETE",backLevels:"Back to Levels"},
      ur:{home:"ہوم",levels:"50 مراحل",rewards:"انعامات",dashboard:"ڈیش بورڈ",hero:"اسلام سیکھیں۔ 50 مراحل مکمل کریں۔",start:"اپنا سفر شروع کریں →",viewRewards:"انعامات دیکھیں",quiz:"اسلامی کوئز",unlocks:"3D انعامات",gift:"بڑا تحفہ",journey:"علمِ دین کے 50 مراحل",journeySub:"اگلا مرحلہ کھولنے کے لیے موجودہ مرحلہ مکمل کریں۔",back:"← مراحل",next:"اگلا سوال →",complete:"مرحلہ مکمل",backLevels:"مراحل پر واپس"},
      hi:{home:"होम",levels:"50 स्तर",rewards:"इनाम",dashboard:"डैशबोर्ड",hero:"इस्लाम सीखें। 50 स्तर पूरे करें।",start:"अपनी यात्रा शुरू करें →",viewRewards:"इनाम देखें",quiz:"इस्लामिक क्विज़",unlocks:"3D अनलॉक",gift:"बड़ा उपहार",journey:"ज्ञान के 50 पवित्र स्तर",journeySub:"अगला स्तर खोलने के लिए वर्तमान स्तर पूरा करें।",back:"← स्तर",next:"अगला प्रश्न →",complete:"स्तर पूरा",backLevels:"स्तरों पर वापस"},
      ar:{home:"الرئيسية",levels:"50 مستوى",rewards:"المكافآت",dashboard:"لوحة التحكم",hero:"تعلّم الإسلام. أكمل 50 مستوى.",start:"ابدأ رحلتك →",viewRewards:"عرض المكافآت",quiz:"اختبار إسلامي",unlocks:"مكافآت ثلاثية الأبعاد",gift:"هدية كبرى",journey:"50 مستوى من المعرفة",journeySub:"أكمل المستوى لفتح المستوى التالي.",back:"← المستويات",next:"السؤال التالي →",complete:"اكتمل المستوى",backLevels:"العودة للمستويات"},
      tr:{home:"Ana Sayfa",levels:"50 Seviye",rewards:"Ödüller",dashboard:"Panel",hero:"İslam'ı öğren. 50 seviyeyi tamamla.",start:"Yolculuğunu Başlat →",viewRewards:"Ödülleri Gör",quiz:"İslami Bilgi Yarışması",unlocks:"3D Açılımlar",gift:"Büyük Hediye",journey:"50 Kutsal Bilgi Seviyesi",journeySub:"Sonraki seviyeyi açmak için seviyeyi tamamla.",back:"← Seviyeler",next:"Sonraki Soru →",complete:"SEVİYE TAMAMLANDI",backLevels:"Seviyelere Dön"},
      id:{home:"Beranda",levels:"50 Level",rewards:"Hadiah",dashboard:"Dasbor",hero:"Pelajari Islam. Selesaikan 50 level.",start:"Mulai Perjalanan →",viewRewards:"Lihat Hadiah",quiz:"Kuis Islam",unlocks:"Buka 3D",gift:"Hadiah Utama",journey:"50 Level Pengetahuan",journeySub:"Selesaikan level untuk membuka level berikutnya.",back:"← Level",next:"Pertanyaan Berikutnya →",complete:"LEVEL SELESAI",backLevels:"Kembali ke Level"}
    }[lang]||null;
    if(ui){
      const nav=document.querySelectorAll(".topbar nav button"); [ui.home,ui.levels,ui.rewards,ui.dashboard].forEach((v,i)=>{if(nav[i])nav[i].textContent=v});
      const h=document.querySelector(".home-copy h1"); if(h)h.innerHTML=lang==="en"?"Learn Islam. <span>Master 50 Levels.</span>":ui.hero;
      const start=document.getElementById("homeStartBtn");if(start)start.textContent=ui.start;
      const vr=document.querySelector('.home-copy [data-view="rewards"]');if(vr)vr.textContent=ui.viewRewards;
      const cards=document.querySelectorAll(".feature-grid h3"); if(cards[0])cards[0].textContent=ui.quiz;if(cards[1])cards[1].textContent=ui.unlocks;if(cards[2])cards[2].textContent=ui.gift;
      const sh=document.querySelector("#levels .section-head h2");if(sh)sh.textContent=ui.journey;
      const sp=document.querySelector("#levels .section-head p");if(sp)sp.textContent=ui.journeySub;
      const back=document.querySelector("#quiz .back");if(back)back.textContent=ui.back;
      const next=document.getElementById("nextBtn");if(next)next.textContent=ui.next;
      const resultBack=document.querySelector("#result [data-view='levels']");if(resultBack)resultBack.textContent=ui.backLevels;
      renderLevels();
    }
    const rules=document.querySelectorAll(".quiz-rules span");
    if(rules.length>=3){
      const r={en:["✓ 0–1 wrong = complete","⚠ 2–5 wrong = fresh retry","⛔ 6+ wrong = Level 1 reset"],ur:["✓ 0–1 غلط = مکمل","⚠ 2–5 غلط = نیا موقع","⛔ 6+ غلط = لیول 1 ری سیٹ"],hi:["✓ 0–1 गलत = पूरा","⚠ 2–5 गलत = फिर से प्रयास","⛔ 6+ गलत = स्तर 1 रीसेट"],ar:["✓ 0–1 خطأ = مكتمل","⚠ 2–5 أخطاء = محاولة جديدة","⛔ 6+ أخطاء = إعادة المستوى 1"],tr:["✓ 0–1 yanlış = tamamla","⚠ 2–5 yanlış = yeniden dene","⛔ 6+ yanlış = Seviye 1 sıfırla"],id:["✓ 0–1 salah = selesai","⚠ 2–5 salah = coba lagi","⛔ 6+ salah = reset level 1"]}[lang]||null;
      if(r)rules.forEach((x,i)=>x.textContent=r[i]);
    }
    if(typeof loadQuestion==="function" && document.getElementById("quiz")?.classList.contains("active")){try{loadQuestion()}catch(e){}}
    if(typeof window.render==="function") { try{window.render()}catch(e){} }
  }

  function openOnboarding(){
    const m=document.getElementById("onboardingModal"); if(!m)return;
    step=1;
    document.querySelectorAll(".onboarding-step").forEach((s,i)=>s.hidden=i!==0);
    m.classList.add("open");m.setAttribute("aria-hidden","false");
    const n=document.getElementById("obName"), em=document.getElementById("obEmail");
    if(n)n.value=profile.name||""; if(em)em.value=profile.email||"";
    document.querySelectorAll(".choices button").forEach(b=>b.classList.toggle("selected",profile[b.dataset.field]===b.dataset.value));
    document.querySelectorAll(".language-grid button").forEach(b=>b.classList.toggle("selected",profile.lang===b.dataset.lang));
  }
  function closeOnboarding(){
    const m=document.getElementById("onboardingModal"); if(!m)return;
    m.classList.remove("open");m.setAttribute("aria-hidden","true");
  }
  function validateStep(n){
    const err=document.getElementById("obError"+n);
    if(err)err.textContent="";
    if(n===1){
      const name=document.getElementById("obName").value.trim(), email=document.getElementById("obEmail").value.trim();
      if(!name || !/^[^@\s]+@gmail\.com$/i.test(email)){if(err)err.textContent="Please enter your name and a valid Gmail address.";return false}
      profile.name=name;profile.email=email;return true;
    }
    if(n===2){
      if(!profile.muslim||!profile.reading||!profile.interest){if(err)err.textContent=translations[profile.lang||"en"].required;return false}
      return true;
    }
    if(n===3){if(!profile.lang){if(err)err.textContent="Please select a language / زبان منتخب کریں۔";return false}return true}
    return true;
  }
  let step=1;
  document.addEventListener("click",e=>{
    if(e.target.closest("#homeStartBtn")){openOnboarding();step=1}
    const next=e.target.closest(".ob-next");
    if(next){
      if(!validateStep(step))return;
      document.getElementById("onboardingStep"+step).hidden=true;step++;
      const s=document.getElementById("onboardingStep"+step);if(s)s.hidden=false;
      if(step===3)applyLanguage(profile.lang||"en");
    }
    const choice=e.target.closest(".choices button");
    if(choice){profile[choice.dataset.field]=choice.dataset.value;choice.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));choice.classList.add("selected")}
    const lang=e.target.closest(".language-grid button");
    if(lang){profile.lang=lang.dataset.lang;document.querySelectorAll(".language-grid button").forEach(b=>b.classList.remove("selected"));lang.classList.add("selected");applyLanguage(profile.lang)}
    if(e.target.closest("#finishOnboarding")){
      if(!profile.lang)profile.lang="en";
      localStorage.setItem(profileKey,JSON.stringify(profile));applyLanguage(profile.lang);closeOnboarding();
      if(typeof window.navigate==="function"){try{window.navigate("levels")}catch(e){}}
    }
  });
  window.addEventListener("DOMContentLoaded",()=>{
    if(profile.lang)applyLanguage(profile.lang);
    // Require profile on first visit.
    if(!profile.name||!profile.email||!profile.lang) setTimeout(openOnboarding,350);
  });
})();

/* V4 audio: distinct offline ambient presets per level, starts after a user gesture. */
const IslamicAudio = (() => {
  let ctx, master, timer, playing=false, level=1;
  const names=["Masjid Serenity","Fajr Dawn","Noor","Ramadan Night","Golden Crescent","Madinah Calm","Quran Reflection","Lantern Glow","Sukoon","Blessed Dawn"];
  const roots=[196,185,220,147,174,165,207,196,155,233];
  function setup(){
    if(ctx)return;
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain(); master.gain.value=.045; master.connect(ctx.destination);
  }
  function chime(f,d=.9,v=.055){
    if(!ctx||!playing)return;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(.001,ctx.currentTime);
    g.gain.linearRampToValueAtTime(v,ctx.currentTime+.08);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d);
    o.connect(g).connect(master);o.start();o.stop(ctx.currentTime+d+.03);
  }
  function playPattern(){
    if(!playing)return;
    const r=roots[(level-1)%roots.length], pattern=[0,4,7,12];
    pattern.forEach((n,i)=>setTimeout(()=>chime(r*Math.pow(2,n/12),1.5,.045),i*240));
  }
  async function start(l=1){
    setup();level=Math.max(1,Math.min(50,Number(l)||1));
    if(ctx.state==="suspended")await ctx.resume();
    playing=true;master.gain.value=.045;clearInterval(timer);playPattern();
    timer=setInterval(playPattern,5200);
    update();
  }
  function stop(){playing=false;clearInterval(timer);if(master)master.gain.value=0;update()}
  function toggle(l=level){if(playing)stop();else start(l)}
  function update(){
    const name=names[(level-1)%names.length]+" • Level "+level;
    const label=document.getElementById("homeAudioLabel");if(label)label.textContent=name;
    const btn=document.getElementById("homeAudioToggle");if(btn)btn.textContent=(playing?"🔇 ":"🔊 ")+(window.DEEN_T?.sound||"Islamic Sound");
  }
  window.addEventListener("deenQuestLevelStart",e=>start(e.detail?.level||1));
  return {start,stop,toggle,isPlaying:()=>playing,update};
})();
document.addEventListener("click",e=>{
  if(e.target.closest("#homeAudioToggle"))IslamicAudio.toggle(window.state?.current||1);
});

document.addEventListener("click",e=>{
  const el=e.target.closest("[data-level]");
  if(el){const n=parseInt(el.dataset.level,10);if(n)window.dispatchEvent(new CustomEvent("deenQuestLevelStart",{detail:{level:n}}))}
});
