import quizConvert from './ctquiz.js';

describe('ctquiz sample1', () => {
  const sample = getQuizSample1();
  const ctquiz = quizConvert(sample);
  console.log('ctquiz:', ctquiz);

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
  console.log('ctquiz:', ctquiz);

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
