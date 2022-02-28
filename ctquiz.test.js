import quizConvert from './ctquiz.js';

describe('ctquiz sample1', () => {
  const sample = getQuizSample1();
  const ctquiz = quizConvert(sample);
//   console.log('ctquiz:', ctquiz);
//   console.log('questions:', ctquiz.questions);

  const { questions, answers } = ctquiz;

  test('question count', () => {
    expect(questions.length).toBe(5);
  })

  test('question body', () => {
    expect(questions[0].body).toBe("What is Woofles?");
  })

  test('question choices', () => {
    expect(questions[2].choices[0]).toBe('the house');
    expect(questions[4].choices[1]).toBe('a ball');
    expect(questions[4].choices[3]).toBe('a cat');
  })

  test('question answers', () => {
    expect(answers).toStrictEqual([ 'B', 'C', 'D', 'C', 'A' ]);
  })
});

describe('ctquiz sample2 (Chinese)', () => {
  const sample = getQuizSample2();
  const ctquiz = quizConvert(sample);
//   console.log('ctquiz:', ctquiz);

  const { questions, answers } = ctquiz;

  test('question count', () => {
    expect(questions.length).toBe(8);
  })

  test('question choices array', () => {
    expect(questions[0].choices).toStrictEqual(['黄金','珍珠','水晶']);
  });

  test('question answers', () => {
    // note that we deliberately have a qn with no choice, to make sure missing answers are not skipped
    expect(answers).toStrictEqual([ 'A', 'B', 'B', 'C', 'A', '', 'C', 'A' ]);
  });
});

describe('ctquiz sample3 (text, audio and image)', () => {
  const sample = getQuizSample3();
  const ctquiz = quizConvert(sample);
//   console.log('ctquiz:', ctquiz);
//   console.log('ctquiz:', JSON.stringify(ctquiz));

  const { questions, answers } = ctquiz;

  test('question count', () => {
    expect(questions.length).toBe(3);
  })

  test('question body text only', () => {
    expect(questions[0].body).toBe("What colour is he?");
  })

  test('question body with text, image and audio', () => {
    expect(questions[1].body.text).toBe('What is this?');
    expect(questions[1].body.image).toBe('https://go.dudu.town/skin/ca4/etitle/pic/icon-box-3.png');
  })

  test('question choices with text and image', () => {
    expect(questions[1].choices[1].text).toBe('Cat');
    expect(questions[1].choices[1].image).toBe('https://go.dudu.town/skin/ca4/simmod/wordpop/pix/icon-gift-1.png');
  })

  test('question choices with text, audio and image', () => {
    expect(questions[1].choices[3].text).toBe('Horse');
    expect(questions[1].choices[3].audio).toBe('https://dd.ca4dev.url3.net/rs/fx/tingtang2.mp3');
    expect(questions[1].choices[3].image).toBe('https://go.dudu.town/skin/ca4/simmod/wordpop/pix/icon-gift-3.png');
  })

  test('question choices with audio or image and NO text', () => {
    expect(questions[2].choices[0].text).toBeUndefined();
    expect(questions[2].choices[0].audio).toBe('https://dd.ca4dev.url3.net/rs/fx/tingtang2.mp3');
  })

  test('question answers', () => {
    // note that we deliberately have a qn with no choice, to make sure missing answers are not skipped
    expect(answers).toStrictEqual([ 'C', 'B', 'A' ]);
  });

});


// ---- test data ----
function getQuizSample1() {
  return `1.  What is Woofles?
A.        my cat
B.        my dog##
C.        my rabbit
D.        my fish
  
2.  What colour is he?
A.        white and orange
B.        black and brown
C.        brown and white##
D.        grey and black
  
3.  Where is his favourite place?
A.        the house
B.        the garden
C.        the park
D.        the beach##
  
4.  When does he like to swim?
A.        all the time
B.        in the morning
C.        in the summer##
D.        when it is hot

5.   What CAN’T Woofles catch?
A.        the water##
B.        a ball 
C.        the birds
D.        a cat
`;
}

function getQuizSample2() {
  return `
1. 本文提到钻石比什么还要贵？
a. 黄金##
b. 珍珠
c. 水晶

2. 本文提到的一对耳坠上的两颗钻石的重量都是多少克拉左右？
a. 10
b. 16##
c. 22

3. 本文中提到的一对彩色钻石耳坠的拍卖价格是多少万美金？
a. 3680
b. 5740##
c. 7820

4. 哪个国家最早出产钻石？
a. 澳大利亚
b. 南非
c. 印度##

5. 目前有多少个国家拥有钻石资源？
a. 30多个##
b. 40多个
c. 50多个

6. 全世界钻石产量最大的5个国家的钻石总产量约占全世界的百分之几？
a. 70%
b. 80%
c. 90%
 
7. 全世界产量最大的钻石矿属于哪个国家？
a. 澳大利亚
b. 俄罗斯
c. 南非##

8. 为什么天然钻石的价格会逐渐下降？
a. 人工钻石的普及##
b. 人们改变了对钻石的喜爱
c. 天然钻石的产量减少
  `;
}

function getQuizSample3() {
  return `
1.  What colour is he?
A.        white and orange
B.        black and brown
C.        brown and white##
D.        grey and black
  
2.  What is this? [[image|https://go.dudu.town/skin/ca4/etitle/pic/icon-box-3.png]][[audio|https://dd.ca4dev.url3.net/rs/fx/tingtang2.mp3]]
A.  [[image|https://go.dudu.town/skin/ca4/etitle/pic/icon-board.png]]
B.  Cat [[image|https://go.dudu.town/skin/ca4/simmod/wordpop/pix/icon-gift-1.png]]##
C.  [[image|https://go.dudu.town/skin/ca4/simmod/wordpop/pix/icon-gift-2.png]]
D.  Horse [[audio|https://dd.ca4dev.url3.net/rs/fx/tingtang2.mp3]][[image|https://go.dudu.town/skin/ca4/simmod/wordpop/pix/icon-gift-3.png]]

3.   Select similar word: [[audio|https://dd.ca4dev.url3.net/rs/fx/magic.mp3]]
A.   [[audio|https://dd.ca4dev.url3.net/rs/fx/tingtang2.mp3]]     ##
B.   [[audio|https://dd.ca4dev.url3.net/rs/fx/wet_burst.mp3]]    
C.  [[image|https://go.dudu.town/skin/ca4/simmod/wordpop/pix/icon-gift-2.png]]
D.   [[audio|https://dd.ca4dev.url3.net/rs/fx/ascend.mp3]]    
`;
}
