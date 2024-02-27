// node --version # Should be >= 18
// npm install @google/generative-ai
require("dotenv").config()
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

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
async function run() {

 

  
}
async function prompt(history, emotions, predisposition,msg) {
  var prompt = [{ text: `Prompt ${msg}` },{ text: `Emotions ${emotions.join()}` },
  { text: `Predispostions ${predisposition.join()}` },
  { text: "output: " }]
  var prev=[].concat(training);
  history.forEach((elm)=>{
    prev.push([{ text: `User ${elm.username}` },{ text: `Emotions ${elm.emo.join()}` },{ text: `Predispostions ${elm.pre.join()}` }])
  })
  history.push(prompt)
  prev=prev.concat(prompt)
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  return await model.generateContent({
    contents: [{ role: "user", prev }],
    generationConfig,
    safetySettings,
  }).response.text()
}
run();
