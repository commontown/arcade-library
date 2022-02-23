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
    /[0-9](?:\.|。)\s*(\S[^\r\n]*)/g, // item body
    /[A-F](?:\.|。)\s*(\S[^\r\n]*)/gi, // choice
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

  const data = JSON.parse(json);

  // trim text
  data.forEach(qn=>{
    qn.body = qn.body.trim();
    qn.choices.forEach( (choice, i) => (qn.choices[i] = choice.trim()) );
  });
  return data;
}

export function quizExtractAnswers(ctquiz) {
  // extract right answers from quiz_content
  const pats = [
    /[0-9](\.|。)\s*.*/g, // item body
    /^([A-F])(\.|。).*##.*/mgi, // right choice
    /^([A-F])(\.|。).*/mgi, // other choice
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
  answers = answers.split(',').map(letter=>letter.toUpperCase());
//   console.log('answers:', answers);
  return answers;
}
