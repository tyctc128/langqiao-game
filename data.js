// Wind Rises at Langqiao - Game Data Configuration
const FACTIONS = { sheshe:'瑯嶠社群', hoklo:'閩南庄頭', hakka:'客庄', qing:'官府', foreign:'外國船商' };
const FACTION_GLYPH = { sheshe:'社', hoklo:'閩', hakka:'客', qing:'官', foreign:'船' };
const FACTION_COLOR = { sheshe:'#3f8f5b', hoklo:'#3a72b0', hakka:'#c07a2a', qing:'#7a5aa8', foreign:'#2f8fa8' };

const ROLES = [
  { id:'langqiao', faction:'sheshe', name:'瑯嶠社群頭人', sideA:'🌳', sideB:'💦',
    advantage:'熟悉山林、水源和山路，附近的人都認識', limit:'外面的東西不好買；要照顧領域和族人的支持',
    actions:'找盟友、談通行、看出山裡的危險',
    res:{food:55,water:70,labor:55,support:72,timber:78,prestige:62,security:55,soil:44,forest:82,pressure:24},
    rel:{hoklo:-5,hakka:5,qing:-15,foreign:-20} },
  { id:'hoklo', faction:'hoklo', name:'閩南庄頭墾戶', sideA:'⛵', sideB:'🧂',
    advantage:'有市集、有船運、有錢也有外面的貨', limit:'需要田、需要水、需要安全的路；山裡的事不清楚',
    actions:'做買賣、湊錢、招工人、走海路',
    res:{food:66,water:44,labor:62,support:54,timber:38,prestige:46,security:50,soil:62,forest:34,pressure:42},
    rel:{sheshe:-10,hakka:0,qing:15,foreign:20} },
  { id:'hakka', faction:'hakka', name:'客庄墾戶', sideA:'🌾', sideB:'👷',
    advantage:'大家會一起做工，很會挖水圳、守村子', limit:'住在山和田的交界，常被捲進邊界和搶水的爭執',
    actions:'修水圳、組工班、安排巡守、交換技術',
    res:{food:58,water:50,labor:72,support:64,timber:50,prestige:48,security:60,soil:56,forest:46,pressure:34},
    rel:{sheshe:-5,hoklo:0,qing:5,foreign:-5} }
];

const RES_META = {
  food:{label:'糧食',g:'🌾',c:'#d99a2b'}, water:{label:'水',g:'💧',c:'#3a9bd4'},
  labor:{label:'人力',g:'👣',c:'#5f9e50'}, support:{label:'支持',g:'❤️',c:'#d1553f'},
  timber:{label:'木材',g:'🌲',c:'#7a6a3a'}, prestige:{label:'威望',g:'🏅',c:'#9a6bb5'},
  security:{label:'平安',g:'🛡️',c:'#3f9a86'}, soil:{label:'田地肥力',g:'🌱',c:'#93a63a'},
  forest:{label:'山林',g:'🌳',c:'#3f8f5b'}, pressure:{label:'外來壓力',g:'⚠️',c:'#d4552b'}
};
const CORE = ['food','water','labor','support'];
const RIGHT_ICON = { '農耕使用':'🌾','取水與灌溉':'💧','獵場與採集':'🏞️','道路通行':'🚶','傳統權威':'🏕️','行政主張':'📜','交易與集期':'⚖️','撿拾與救助慣例':'⛵' };

const ZONES = [
  { id:'spring', name:'上游水源', kind:'水源', glyph:'💦', x:'16%', y:'27%', env:'枯水的時候水很少。',
    rights:[{type:'取水與灌溉',faction:'客庄、閩南庄頭',recognizedBy:'互相默契'},{type:'傳統權威',faction:'瑯嶠社群',recognizedBy:'地方慣例'}] },
  { id:'weir', name:'河谷水堰', kind:'水利', glyph:'🌊', x:'30%', y:'42%', env:'新做的土石堰，大雨會壞。',
    rights:[{type:'取水與灌溉',faction:'客庄',recognizedBy:'庄內公議'},{type:'行政主張',faction:'官府',recognizedBy:'文書許可'}] },
  { id:'canal', name:'水圳', kind:'水利', glyph:'〰️', x:'52%', y:'50%', env:'圳路要常常修，很花人力。',
    rights:[{type:'取水與灌溉',faction:'客庄、閩南庄頭',recognizedBy:'分水約定'}] },
  { id:'hunt', name:'山林獵場', kind:'山林', glyph:'🏞️', x:'11%', y:'62%', env:'獵得太多，動物變少了。',
    rights:[{type:'獵場與採集',faction:'瑯嶠社群',recognizedBy:'地方慣例'},{type:'行政主張',faction:'官府',recognizedBy:'名義上'}] },
  { id:'newfield', name:'新墾農地', kind:'農耕', glyph:'🌾', x:'38%', y:'76%', env:'剛開的田，界線還沒說清楚。',
    rights:[{type:'農耕使用',faction:'閩南庄頭',recognizedBy:'官府墾照'},{type:'獵場與採集',faction:'瑯嶠社群',recognizedBy:'地方慣例'}] },
  { id:'hakkaVillage', name:'客庄', kind:'聚落', glyph:'🏡', x:'70%', y:'66%', env:'工班隨時可以出動，守村的人也夠。',
    rights:[{type:'農耕使用',faction:'客庄',recognizedBy:'庄內公議'}] },
  { id:'hokloVillage', name:'閩庄', kind:'聚落', glyph:'🏠', x:'80%', y:'84%', env:'吃穿都靠船運進來。',
    rights:[{type:'農耕使用',faction:'閩南庄頭',recognizedBy:'官府墾照'}] },
  { id:'sheVillage', name:'瑯嶠社聚落', kind:'聚落', glyph:'🏕️', x:'14%', y:'86%', env:'要顧好族人的支持和盟社的交情。',
    rights:[{type:'傳統權威',faction:'瑯嶠社群',recognizedBy:'盟社共識'}] },
  { id:'pass', name:'山道隘口', kind:'道路', glyph:'🚶', x:'57%', y:'27%', env:'進出山裡只有這一條路。',
    rights:[{type:'道路通行',faction:'各方',recognizedBy:'通行約定'},{type:'傳統權威',faction:'瑯嶠社群',recognizedBy:'地方慣例'}] },
  { id:'market', name:'市集', kind:'交易', glyph:'⚖️', x:'86%', y:'50%', env:'鹽、鐵器的價錢看船什麼時候到。',
    rights:[{type:'交易與集期',faction:'閩南庄頭',recognizedBy:'官府默許'}] },
  { id:'port', name:'港口沙灘', kind:'海岸', glyph:'⛵', x:'90%', y:'22%', env:'常有船出事，外面的壓力從這裡進來。',
    rights:[{type:'行政主張',faction:'官府',recognizedBy:'文書'},{type:'撿拾與救助慣例',faction:'沿海聚落',recognizedBy:'地方慣例'}] }
];

const STATUS_META = {
  confirmed:{label:'真的發生過',bg:'#dbeafe',fg:'#1e4e8c'},
  interpreted:{label:'學者的解釋',bg:'#dcf0f5',fg:'#1e6472'},
  composite:{label:'合起來的故事',bg:'#e3f2df',fg:'#2f6b3c'},
  hypothetical:{label:'遊戲的假設',bg:'#ffe6d9',fg:'#a3441c'}
};
const SCENE = { 水源:['☀️','💧','🌾'], 土地:['🌾','📜','⛰️'], 交易:['🧂','⚒️','⛵'], 衝突:['🌫️','🗣️','🚧'], 合作:['🤝','🌊','👷'], 外部壓力:['🚢','📜','⚖️'] };
const SCENE_BG = { 水源:'linear-gradient(180deg,#cfe9ff,#a9dcf2)', 土地:'linear-gradient(180deg,#dff0c8,#bfe0a0)', 交易:'linear-gradient(180deg,#ffe9c9,#f8d9a5)', 衝突:'linear-gradient(180deg,#f6dcd6,#eec3b8)', 合作:'linear-gradient(180deg,#d9f0e4,#b7e2cd)', 外部壓力:'linear-gradient(180deg,#dee4f5,#c2cdeb)' };
const STAGE_LABEL = ['好好往來','有抱怨和謠言','不讓路、不交易','武裝警戒','互相報復','打起來／外人插手'];
const MOOD = t => t >= 25 ? '😊' : t >= 5 ? '🙂' : t >= -15 ? '😐' : '😠';
const SEASONS = ['春','夏','秋','冬'];

const EVENTS = [
  { id:'water.weir.drought', title:'水被上游擋住了', cat:'水源', status:'hypothetical', zone:'weir', weight:5,
    body:'兩個星期沒下雨。上游新做的堰把水擋住，下游的田開始裂開，三邊都說水應該歸自己用。',
    known:'現在的水量、自己的農時、堰在哪裡', unknown:'下游到底損失多少、對方有沒有去找官府', affected:'客庄、閩南庄頭、瑯嶠社群',
    opts:[
      { ic:'🚧', label:'水全部留下來', cost:'糧食變多、支持變多', res:{food:8,support:6,water:6}, rel:{hakka:-12,hoklo:-10}, stage:{hakka:1},
        fb:'今年收成保住了，村裡的人很高興。但下游把這件事記在心裡。', missed:'水是大家一起用的，你只算了自己的田',
        delay:{after:2, text:'有人晚上去把水堰弄壞，修好花了很多人力。', res:{labor:-10,water:-8}, stage:{hakka:2}} },
      { ic:'🤝', label:'三邊坐下來談', cost:'花時間和糧食，收成不會最好', res:{food:-6,labor:-6,prestige:6}, rel:{hakka:8,hoklo:6,sheshe:4},
        fb:'開會花掉了農時，收成不是最好的，但「怎麼分水」第一次寫下來。', agree:'分水約定',
        delay:{after:3, text:'下次缺水時，大家照約定分水，沒有吵起來。', res:{water:8,support:6}} },
      { ic:'🧂', label:'拿東西去換水', cost:'給出農具和一些糧食', res:{food:-8,timber:-8,water:10}, rel:{hoklo:6,hakka:-4},
        fb:'水暫時來了，可是「水能不能買」變成新的爭論。', missed:'把大家共用的東西變成商品，以後很難談',
        delay:{after:2, text:'有人開始主張水權可以賣，老規矩鬆掉了。', rel:{sheshe:-8}} },
      { ic:'🛡️', label:'派人拿武器守著堰', cost:'平安變高，但關係變差', res:{security:8,support:4,labor:-6}, rel:{hakka:-18,hoklo:-10}, stage:{hakka:3},
        fb:'短時間沒人敢動堰，但買賣和走路都開始受影響。', missed:'用力量守住水，並沒有解決怎麼分',
        delay:{after:2, text:'市集不收你們的東西，報復的事也變多。', res:{food:-10,security:-8}, stage:{hoklo:2}} } ] },

  { id:'land.newfield.hunting', title:'新田開到獵場旁邊', cat:'土地', status:'interpreted', zone:'newfield', weight:5,
    body:'官府的墾照畫到山腳下，可是那片林子是季節性的獵場。兩張紙、兩種規矩，指向同一塊地。',
    known:'墾照範圍、獵場的季節、兩邊村子的距離', unknown:'官府會不會真的來管、對方能忍多久', affected:'閩南庄頭、瑯嶠社群',
    opts:[
      { ic:'🌾', label:'照墾照繼續開田', cost:'田變多、山林變少', res:{soil:8,forest:-12,food:6}, rel:{sheshe:-16}, stage:{sheshe:1},
        fb:'田開出來了，獵場那一邊開始有人守著路。', missed:'官府准了，不代表當地人承認',
        delay:{after:2, text:'越界採集和失蹤的傳言變多，山路變危險。', res:{security:-10}, stage:{sheshe:2}} },
      { ic:'📏', label:'談好一條季節界線', cost:'田少開一些，要花人力', res:{soil:4,labor:-6,prestige:5}, rel:{sheshe:10,hakka:4}, agree:'獵場與農地界線',
        fb:'開的田少一點，但界線是兩邊一起定的，以後好處理很多。' },
      { ic:'📜', label:'請官府立碑', cost:'外來壓力變大', res:{prestige:6,pressure:12}, rel:{qing:10,sheshe:-12},
        fb:'碑立好了，你的權利被寫在紙上，官府也走進了村子的事。',
        delay:{after:3, text:'官員用這件事要求village出人出糧。', res:{labor:-10,support:-6}} } ] },

  { id:'trade.saltiron', title:'鹽和鐵器變好貴', cat:'交易', status:'interpreted', zone:'market', weight:4,
    body:'船慢了，市集上鹽和鐵器的價錢變兩倍。沒有鐵就修不了農具，沒有鹽就存不住食物。',
    known:'現在的價錢、村裡剩多少', unknown:'船為什麼慢、下一批什麼時候到', affected:'各村、外國船商',
    opts:[
      { ic:'💰', label:'貴也要買', cost:'花掉不少糧食', res:{food:-10,timber:6,security:4}, rel:{hoklo:6,foreign:6},
        fb:'工具修好了，但存糧變薄，萬一遇到天災會很辛苦。' },
      { ic:'🌲', label:'用山產交換', cost:'山林變少', res:{forest:-10,food:4,timber:4}, rel:{sheshe:6},
        fb:'換到東西了，山林卻多了一筆看不見的帳。', delay:{after:3, text:'獵場收穫變少，山裡的補給不穩了。', res:{forest:-8,food:-6}} },
      { ic:'🤝', label:'幾個村一起買', cost:'要花人力，也要有交情', req:{rel:{hoklo:0}}, lockNote:'要和閩南庄頭關係不差',
        res:{labor:-8,prestige:6,food:4}, rel:{hoklo:8,hakka:6}, agree:'定期市集約定',
        fb:'價錢壓下來了，幾個村第一次有一起講價的力量。' } ] },

  { id:'conflict.missing', title:'採集的人不見了', cat:'衝突', status:'composite', zone:'hunt', weight:4,
    body:'一個去採集的人三天沒回來。有人說他在山裡受傷，有人說被別人抓走。年輕人已經在集合了。',
    known:'什麼時候不見、最近和誰有摩擦', unknown:'到底發生什麼事、有沒有別人插手', affected:'所有人',
    opts:[
      { ic:'🔍', label:'兩邊一起去找', cost:'花三天人力', res:{labor:-8,prestige:6}, rel:{sheshe:8,hakka:6,hoklo:6}, stage:{all:-1},
        fb:'找了三天，人在溪谷受傷。謠言散掉了，火氣也降下來。' },
      { ic:'🚧', label:'封路要對方交人', cost:'買賣中斷', res:{food:-8,security:4}, rel:{sheshe:-14,hoklo:-8}, stage:{sheshe:2},
        fb:'路封了，可是你也把自己的補給切斷了。', missed:'把責任算在整群人身上，會害到沒關係的人',
        delay:{after:2, text:'繞別條路成本太高，村裡開始有人反對你。', res:{support:-10,food:-6}} },
      { ic:'😤', label:'讓年輕人自己去處理', cost:'支持變高，事情失控', res:{support:8,security:-8}, stage:{sheshe:3},
        fb:'年輕人站在你這邊，可是後面的事你已經管不住了。',
        delay:{after:1, text:'雙方互相報復，兩邊都有人受傷。', res:{labor:-12,security:-10}, stage:{sheshe:4}} } ] },

  { id:'coop.canal', title:'鄰村想一起挖水圳', cat:'合作', status:'interpreted', zone:'canal', weight:4,
    body:'鄰村說一起挖一條圳，工錢和材料各出一半。可是誰先取水、缺水時怎麼減量，還沒講清楚。',
    known:'工程有多大、兩村有多少人力', unknown:'缺水的時候約定能不能做到', affected:'客庄、閩南庄頭',
    opts:[
      { ic:'📜', label:'先講好規則再開工', cost:'很花人力和糧食', res:{labor:-12,food:-6,water:10}, rel:{hakka:10,hoklo:8}, agree:'共同水圳約定',
        fb:'晚了半個月開工，但缺水時要怎麼減量已經寫進約定。',
        delay:{after:3, text:'旱年來的時候照約定辦，兩村都沒斷水。', res:{water:10,support:8}} },
      { ic:'⛏️', label:'先開工，規則以後再說', cost:'水很快變多', res:{labor:-8,water:12,food:4},
        fb:'水來得很快。誰先取水這件事，留到下次吵架時才會決定。',
        delay:{after:2, text:'缺水時兩村同時開閘，吵得更兇。', res:{water:-10}, stage:{hakka:2}} },
      { ic:'🏡', label:'不合作，自己挖小池', cost:'水只多一點', res:{labor:-10,water:5,security:4}, rel:{hakka:-8},
        fb:'你保住了自己決定的權利，也保留了水不夠用的風險。' } ] },

  { id:'external.shipwreck', title:'外國船出事了', cat:'外部壓力', status:'confirmed', zone:'port', weight:5,
    body:'一艘外國船在南邊撞到礁石，船員上岸後和當地人起了衝突。幾個星期後，領事和官員來要說法、要交人。',
    known:'船在哪裡出事、官員的要求、沿海救人的慣例', unknown:'外國會不會出兵、官府管不管得動', affected:'官府、外國船商、各村',
    opts:[
      { ic:'🗣️', label:'自己出面去談', cost:'花時間，威望變高', res:{prestige:10,labor:-6,pressure:-6}, rel:{foreign:8,qing:4,sheshe:6},
        fb:'你用地方的名義談成救船的約定，也讓外國人看見「誰能代表誰」。', agree:'船難救助與通行約定' },
      { ic:'🏛️', label:'全部交給官府', cost:'外來壓力變大', res:{pressure:14,support:-6}, rel:{qing:10,sheshe:-8},
        fb:'責任丟出去了，官府的手也一起伸進來。',
        delay:{after:2, text:'官府在附近駐兵，還要村裡出糧出人。', res:{food:-10,labor:-10,support:-8}} },
      { ic:'🙈', label:'先躲著不出面', cost:'現在不用付出什麼', res:{pressure:16,prestige:-8},
        fb:'這回沒有付出代價，問題原封不動留到下一回。',
        delay:{after:2, text:'外國直接動用武力施壓，地方只能接受條件。', res:{security:-12,pressure:10}, stage:{foreign:3}} } ] },

  { id:'water.storm', title:'大雨把水圳沖壞了', cat:'水源', status:'hypothetical', zone:'canal', weight:3,
    body:'一個晚上的大雨，圳頭和兩段圳路被沖斷。要修就要出很多人力，可是現在正是插秧的時候。',
    known:'壞了哪幾段、有多少工班', unknown:'雨還會不會再來', affected:'靠這條圳的所有村子',
    opts:[
      { ic:'👷', label:'全村一起搶修', cost:'很花人力', res:{labor:-14,water:10,support:4}, fb:'七天內通水了，代價是插秧變晚。' },
      { ic:'🤝', label:'找鄰村一起修', cost:'人力少一些，要有交情', req:{rel:{hakka:0}}, lockNote:'要和客庄關係不差',
        res:{labor:-8,water:10,prestige:6}, rel:{hakka:10,hoklo:6}, agree:'災害互助約定',
        fb:'兩村一起出工，也順手把互相幫忙的規則定下來。' },
      { ic:'✂️', label:'下游先不修', cost:'省人力，下游沒水', res:{labor:-4,water:4,food:-6}, rel:{hoklo:-10}, stage:{hoklo:1},
        fb:'你保住上游的田，下游記住了這個決定。' } ] },

  { id:'trade.roadblock', title:'山路被人設卡', cat:'交易', status:'composite', zone:'pass', weight:3,
    body:'進出山裡唯一的路被設卡，理由是上次通行沒有照約定付錢。鹽和鐵器進不來，山產也出不去。',
    known:'卡設在哪裡、上次約定的內容', unknown:'對方真正想要什麼、背後有沒有別人', affected:'瑯嶠社群、閩南庄頭、客庄',
    opts:[
      { ic:'🗣️', label:'找通譯問清楚', cost:'花時間和一點糧食', res:{food:-4,prestige:5}, rel:{sheshe:8}, stage:{all:-1},
        fb:'問清楚後誤會小了很多：對方要的是通行的規則，不是更多錢。' },
      { ic:'💰', label:'照舊付錢還加價', cost:'花很多糧食', res:{food:-12}, rel:{sheshe:6,hoklo:-4},
        fb:'路開了，價錢也變成新的規矩。' },
      { ic:'⛵', label:'改走海邊繞路', cost:'很花人力、成本變高', res:{labor:-10,food:-6,pressure:6}, rel:{foreign:6,sheshe:-6},
        fb:'貨到得慢，也讓你更依賴海路和外來的船。' } ] },

  { id:'coop.disaster', title:'颱風過後鄰村來求助', cat:'合作', status:'hypothetical', zone:'hakkaVillage', weight:3,
    body:'颱風掃過，鄰村房子和存糧都壞了，派人來借糧和人力。可是你的存糧也只夠撐到收成。',
    known:'自己剩多少糧、對方損失多少', unknown:'下次天災什麼時候來、對方還不還得起', affected:'附近的村子',
    opts:[
      { ic:'🍚', label:'借糧也借工班', cost:'糧食和人力都減少', res:{food:-10,labor:-8,prestige:8}, rel:{hakka:12,hoklo:8,sheshe:6}, agree:'災害互助約定',
        fb:'存糧變薄了，但「互相幫忙」變成以後可以拿出來講的先例。',
        delay:{after:3, text:'你們收成不好時，鄰村照約定把糧和人力補回來。', res:{food:12,labor:8}} },
      { ic:'👷', label:'只借工班', cost:'減少一些人力', res:{labor:-8,prestige:4}, rel:{hakka:5},
        fb:'有限度的幫忙保住了存糧，也保住一部分交情。' },
      { ic:'🙅', label:'婉拒', cost:'現在不用付出', res:{support:4}, rel:{hakka:-12,hoklo:-6},
        fb:'村裡覺得你顧好自己家。下次你需要人手時，這件事會被提起。',
        delay:{after:2, text:'你們缺工的時候沒有人來幫，農時延誤。', res:{labor:-10,food:-8}} } ] },

  { id:'conflict.retaliation', title:'年輕人去報復了', cat:'衝突', status:'composite', zone:'sheVillage', weight:4, minStage:2,
    body:'摩擦累積好幾個月。一群年輕人晚上出去，回來時牽著別人的牛，身上還有傷。',
    known:'雙方已經在警戒、村裡的情緒', unknown:'對方會怎麼回應、外人會不會插手', affected:'所有人',
    opts:[
      { ic:'🐂', label:'公開還回去並賠償', cost:'糧食和面子都損失', res:{food:-10,support:-8,prestige:6}, rel:{sheshe:10,hakka:8}, stage:{all:-2},
        fb:'你在村裡丟了面子，卻把事情從報復拉回談判。' },
      { ic:'🛡️', label:'護著他們不追究', cost:'支持變高、平安變差', res:{support:10,security:-10}, stage:{all:1},
        fb:'年輕人站到你這邊，對方也開始準備下一次。',
        delay:{after:1, text:'對方來報復，田和房子都受損。', res:{food:-12,labor:-8,security:-10}} },
      { ic:'⚖️', label:'請第三方一起查', cost:'外來壓力變大', res:{pressure:10,prestige:4}, rel:{qing:8}, stage:{all:-1},
        fb:'第三方壓下了衝突，也在村子裡留下長期的插手。' } ] },

  { id:'external.troops', title:'官兵上岸要糧要人', cat:'外部壓力', status:'confirmed', zone:'port', weight:4, minTurn:6,
    body:'官兵在港口上岸，說要「幫大家調停」，同時要求村子提供糧食、嚮導和住的地方。',
    known:'來了多少人、要求哪些東西', unknown:'會待多久、會不會偏袒某一邊', affected:'官府、各村',
    opts:[
      { ic:'🍚', label:'配合，順便爭條件', cost:'糧食和人力都要出', res:{food:-10,labor:-8,prestige:6,pressure:6}, rel:{qing:12},
        fb:'你被當成可以講話的地方代表，代價是先付出的糧和工。' },
      { ic:'🧭', label:'只帶路，不給糧', cost:'關係變緊張', res:{labor:-6,pressure:10}, rel:{qing:-6},
        fb:'你守住了存糧，也被官府記成不合作的一方。' },
      { ic:'🤝', label:'把各村串起來一起回應', cost:'花時間，要有威望', req:{res:{prestige:55}}, lockNote:'威望要到 55',
        res:{labor:-8,prestige:10,pressure:-8}, rel:{hakka:8,hoklo:8,sheshe:8}, agree:'共同回應約定',
        fb:'各村第一次用同一個聲音回答外面的要求，壓力被分掉了。' } ] }
];

const ENDINGS = [
  { id:'pact', emoji:'🤝', title:'三方水源盟約', body:'旱年再來的時候，水還是分得下去。大家沒有變很有錢，但規則撐住了。',
    reflect:'合作需要誰讓一步？讓步的人得到了什麼？', test:(g,a,m)=> a.some(x=>x.indexOf('分水')>=0||x.indexOf('水圳')>=0) && m<=1 },
  { id:'closed', emoji:'🚧', title:'關起門來的平安', body:'邊界守住了，對外的路也一起關上。村裡很安靜，消息和東西都很少。',
    reflect:'安全和孤立之間，你換掉了什麼？', test:(g)=> g.res.security>=68 && g.res.food<62 },
  { id:'trade', emoji:'⛵', title:'熱鬧的交易網', body:'東西很多，市集很熱。可是你們活下去，現在要看別人的船什麼時候到。',
    reflect:'變熱鬧以後，是不是也變得比較脆弱？', test:(g)=> g.res.food>=70 && g.res.prestige>=50 },
  { id:'force', emoji:'🚩', title:'靠力量擴張', body:'地變多了，人手和交情都變薄。下一次衝突，代價會更大。',
    reflect:'這樣的贏，可以維持幾年？', test:(g,a,m)=> m>=4 && g.res.support<58 },
  { id:'external', emoji:'⚖️', title:'外人來管事', body:'吵太久沒解決，秩序被外面的人帶進來，決定的權力也被一起帶走。',
    reflect:'秩序和自己作主，各要付什麼代價？', test:(g)=> g.res.pressure>=68 },
  { id:'depleted', emoji:'🍂', title:'山林用光了', body:'短期收成很好。動物走了、水源變差，這些不是一季就能長回來的。',
    reflect:'山和水，是不是被當成用不完的？', test:(g)=> g.res.forest<=28 },
  { id:'strain', emoji:'😓', title:'勉強撐住', body:'沒有垮掉，也沒有任何一件事真正解決。問題全留給下一個領導者。',
    reflect:'哪一次決定，如果重來你會改？', test:()=> true }
];

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function seedNum(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
