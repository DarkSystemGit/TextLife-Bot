// node --version # Should be >= 18
// npm install @google/generative-ai
require("dotenv").config()
const process=require('process')
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const wsl = require('ws');

const wss = new wsl.WebSocketServer({ port: 8080 });
wss.on('connection', function connection(ws) {
  const duplex = createWebSocketStream(ws, { encoding: 'utf8' });
  duplex.on('error', console.error);
  const readLineAsync = (prmpt) => {
    const rl = require('readline').createInterface({
      input: duplex,
      output: duplex
    });
    
    return new Promise((resolve) => {
      rl.question(prmpt,(line)=>{
        resolve(line)
      })
    });
  };
  run(ws)
})

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.KEY;
const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 255,
};
const training=[{text: "Use the emotions and predisposition fields to generate a response to a Prompt"},
{text: "Prompt Why are you so mean to me"},
{text: "Emotions Angry,Sad"},
{text: "Predispostions Passive Agressive"},
{text: "output: Well, maybe if you would stop being mean, maybe, I would."},
{text: "mood Raging"},
{text: "Prompt I told the principal. You had it coming"},
{text: "Emotions Nice, Neutral"},
{text: "Predispostions Kind, but fights back"},
{text: "output: Why, why would you do this"},
{text: "mood Worried"},
{text: "Prompt AAAAAAAA"},
{text: "Emotions Sassy"},
{text: "Predispostions Passive Agressive"},
{text: "output: LOL"},
{text: "mood Mocking"}]

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];
var users={}

async function genNames(){
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const parts = [
    {text: "input: Generate a few random names(first & last separated by spaces) in as a js list (nothing more, don't make it bland)"},
    {text: "output: ['Izabela Sharar\n','Lilianne Bertram\n','Danilo Melvin\n','Amalia Jerahmeel\n','Susila Tullia\n','Edwena Chijindum\n','Nikol Ani\n','Zbyněk Jenna\n'\n]"},
    {text: "input: Generate a few random names(first & last separated by spaces) in as a js list (nothing more, don't make it bland)"},
    {text: "output: "},
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });
  return eval(result.response.text().replaceAll('\n',''))
}
async function genEmo(len){
  var emotions=[{ emo: "joy", traits: ["cheerful", "optimistic", "enthusiastic", "playful", "warm"] },
{ emo: "sadness", traits: ["melancholy", "pessimistic", "lonely", "tearful", "withdrawn"] },
  { emo: "anger", traits: ["irritable", "hostile", "aggressive", "resentful", "bitter"] },
  { emo: "fear", traits: ["anxious", "worried", "apprehensive", "nervous", "timid"] },
  { emo: "surprise", traits: ["astonished", "amazed", "shocked", "startled", "bewildered"] },
  { emo: "disgust", traits: ["revulsion", "contempt", "loathing", "nausea", "aversion"] },
  { emo: "guilt", traits: ["remorseful", "ashamed", "self-critical", "regretful", "penitent"] },
  { emo: "shame", traits: ["humiliated", "embarrassed", "worthless", "inadequate", "defective"] },
  { emo: "hope", traits: ["optimistic", "hopeful", "confident", "expectant", "enthusiastic"] },
  { emo: "optimism", traits: ["cheerful", "positive", "upbeat", "hopeful", "confident"] },
  { emo: "pessimism", traits: ["melancholy", "negative", "downbeat", "hopeless", "cynical"] },
  { emo: "love", traits: ["affectionate", "caring", "compassionate", "intimate", "devoted"] },
  { emo: "hate", traits: ["hostile", "aggressive", "resentful", "bitter", "contemptuous"] },
  { emo: "compassion", traits: ["caring", "empathetic", "sympathetic", "kind", "merciful"] },
  { emo: "empathy", traits: ["understanding", "supportive", "responsive", "caring", "compassionate"] },
  { emo: "sympathy", traits: ["sorrowful", "understanding", "supportive", "caring", "compassionate"] },
  { emo: "gratitude", traits: ["thankful", "appreciative", "indebted", "obliged", "beholden"] },
  { emo: "contempt", traits: ["disrespectful", "disdainful", "scornful", "haughty", "arrogant"] },
  { emo: "pride", traits: ["confident", "self-assured", "arrogant", "boastful", "haughty"] },
  { emo: "humility", traits: ["modest", "humble", "meek", "self-effacing", "unassuming"] }]
  var result=[]
  for(var i=0;len>i;i++){
  result.push(emotions[Math.floor(Math.random() * emotions.length)])
}
  return result
}
function getEmoRating(emo){
var ratings=[
  "hate", 
  "anger", 
  "contempt", 
  "disgust", 
  "fear", 
  "sadness",
  "pessimism", 
  "pride", 
  "shame", 
  "humility", 
  "surprise", 
   "gratitude", 
  "compassion", 
  "empathy", 
  "hope", 
  "optimism", 
 "love", 
 "joy"
]
return 1-(.01*(ratings.indexOf(emo)*5))
}
var names=[]
async function genHistory(){
  names= await genNames()
  var emo=await genEmo(names.length)
  var history=[]
  names.forEach((username,i)=>{
    users[username]={username,emo:emo[i].emo,pre:emo[i].traits}
    history.push({username,emo:emo[i].emo,pre:emo[i].traits,msg:"hallo"})
  })
  return history
}

async function prompt(history, name,msg) {
  //console.log(users[name],name)
  var prompt = [{ text: `Prompt ${msg}` },{ text: `Emotions ${users[name].emo}` },
  { text: `Predispostions ${users[name].pre.join()}` },
  { text: "output: " }]
  var prev=[].concat(training);
  history.forEach((elm)=>{
    prev.push(...[{ text: `User ${elm.username}` },{ text: `Emotions ${elm.emo}` },{ text: `Predispostions ${elm.pre.join()}` }])
  })
  history.push({username:'user',emo:'neutral',pre:['none'],msg})
  prev=prev.concat(prompt)
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  //console.log(prev)
  var ai=await model.generateContent({
    contents: [{ role: "user", parts:prev }],
    generationConfig,
    safetySettings,
  })
  users[name].emo=ai.response.text().split('mood ')[1].replace('mood ','')
  return ai.response.text().split('mood ')[0].replace('mood ','')
}
function weightedRand(spec) {
  var i, sum=0, r=Math.random();
  for (i in spec) {
    sum += spec[i];
    if (r <= sum) return i;
  }
}
function generateWeights(his){
  var res={}
  var positions=[]
  var emotions=[]
  var map={}
  var total=0

  Object.keys(users).forEach((user,i)=>{
    for(var pos=his.length-1;true;pos--){
      if(his[pos.toString()].username==user){
       
        break;
      }
    }
    positions.push(pos)
    total=total+pos
    names[user]=pos
    emotions.push(getEmoRating(his[pos].emo))
  })
  positions.forEach((pos,i)=>{res[i]=0.02*(((total/100)*pos)+emotions[i]);names[Object.keys(names)[Object.values(names).indexOf(pos)]]=res[i]})
  return [res,map]
}
async function run(ws){
  try{
  ws.send('Starting...')
  var history=this.history=await genHistory()
  var map={}
  ws.send('Ready!')
  while(true){
    var weights=generateWeights(history);
    
    var text=await readLineAsync('>')

    text.trim()
    if(text.indexOf('$')==0){
      var command = text.replace('$','').split(' ')
      //console.log(command)
      switch(command[0]){
        case 'read':
          console.log(this[command[1]])
        case 'run':
          console.log(await globalThis[command[1]](command.slice(1)))
      }
    }else{
      var name=weightedRand(weights[0])
      var user = Object.keys(users)[name]
      //console.log(user,name,weights[0],Object.keys(users))
      ws.send(`${user}:`,await prompt(history,user,text))
    }

  }}catch(e){/*console.log(e,users);*/console.log(e)}
}
//run()