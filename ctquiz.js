export default function quizConvert(ctquiz) {
  return {
    questions: quizConvertQuestions(ctquiz),
    answers: quizExtractAnswers(ctquiz),
  };
}

export function quizConvertQuestions(ctquiz) {
  // convert into json syntax
  const pats = [
    /"/g,
    /^[0-9]+(?:\.|。)\s*(\S[^\r\n]*)/mig, // item body
    /^[A-F](?:\.|。)\s*(\S[^\r\n]*)/mig, // choice
    /##/g, // right choice
    /,\s*]/g, // end of array
    /^\s*]},/g, // start of buf
    /,\s*$/g, // end of buf
  ];

  const repls = [
    '\\"',
    ']},\n{"body":"$1",\n  "choices":[',
    '"$1",',
    '',
    ']',
    '[',
    ']}]',
  ];

  let json = ctquiz;
  for (let i=0; i<pats.length; i++) {
    const pat = pats[i], repl = repls[i];
    json = json.replace(pat, repl);
  }
// console.log('json:', json);

  const data = JSON.parse(json);

  // trim text + parse media
  data.forEach(qn=>{
    qn.body = quizExtractMedia(qn.body);
    qn.choices.forEach( (choice, i) => {
      qn.choices[i] = quizExtractMedia(choice);
    })
  });
  return data;
}

export function quizExtractAnswers(ctquiz) {
  // extract right answers from quiz_content
  const pats = [
    /^[0-9]+(\.|。)\s*.*/mig, // item body
    /^([A-F])(\.|。).*##.*/mig, // right choice
    /^([A-F])(\.|。).*/mig, // other choice
    /\s+/mg,
    /^,/, // remove first comma
  ];
  const repls = [
    ',',
    '$1',
    '',
    '',
    '',
  ];

  let answers = ctquiz;
  for (let i=0; i<pats.length; i++) {
    const pat = pats[i], repl = repls[i];
    answers = answers.replace(pat, repl);
  }
  console.log('answers:', answers);
  answers = answers.split(',').map(letter=>letter.toUpperCase());
  console.log('answers:', answers);
  return answers;
}

function quizExtractMedia(str) {
  // no media [[ ]], return trim str
  if (str.indexOf('[[')<0) return str.trim();

  const obj = {};
  const pat = /\[\[([^|]*)\|([^\]]*)\]\]/g; 
  const replfn = ((match, type, url)=> { 
    obj[type] = url;
    return ''; 
  });

  str = str.replaceAll(pat, replfn).trim();
  if (str!=='') obj.text = str;
  return obj;
}

