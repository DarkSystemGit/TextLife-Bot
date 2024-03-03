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
const weightedRand = require('weightedrand')
const wss = new wsl.WebSocketServer({ port: 6078 });

wss.on('connection', async function(ws) {
  

  
  ws.send('Starting...')
  var history=this.history=history||await genHistory()
  var map={}
  ws.send('Ready!')
  //console.log(history)
  ws.on('message',async function msg(text){
    try{
    var weights=generateWeights(history,users);
    text=text.toString()
    //console.log(text)

    text.trim()
    if(text.indexOf('$')==0){
      var command = text.replace('$','').split(' ')
      //console.log(command)
      switch(command[0]){
        case 'read':
          ws.send(this[command[1]])
        case 'run':
          ws.send(await globalThis[command[1]](command.slice(1)))
      }
    }else{
      var name=weightedRand(weights,Object.keys(users))
      var user = users[name]
      //console.log(user,name,weights,Object.keys(users))
      //console.log(weights)
      ws.send(`${user.username}: ${await prompt(history,user.username,text)}`)
    }
  }catch(e){msg(text)}
  })
  ws.on('error',console.error)
  

  //await run(ws)
})

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.KEY;
const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 255,
};
const training=[{text: "Use the emotions and predisposition fields to generate a text-message like response to a Prompt in less than 50 chars. Emojis may be used and are reccomended. Talk like a teen"},
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
  //console.log(ai.response.text())
  users[name].emo=ai.response.text().split('mood ')[1].replace('mood ','')
  console.log(name+':',ai.response.text().split('mood ')[0].replace('mood ',''))
  return ai.response.text().split('mood ')[0].replace('mood ','')
}

function generateWeights(his,users){
  var res={}
  var positions=[]
  var emotions=[]
  var map=new Map()
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
  positions.forEach((pos,i)=>{
    res[i]=0.04*(((total/100)*pos)+emotions[i]-.02);
    //console.log(users[i],users)
    map.set(Object.keys(users)[i],res[i])
  })
  return map
}

//run()
