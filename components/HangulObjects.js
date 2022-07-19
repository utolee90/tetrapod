
// 한글 용도로 추가

// 초성
const charInitials= [
        'ㄱ', 'ㄲ','ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];
// 중성
const charMedials = [
        'ㅏ', 'ㅐ' , 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];
// 단모음
const charSimpleMedials = [
        'ㅏ', 'ㅐ' , 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', , 'ㅣ'
];
// 종성
const charFinals = [
        'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ',
        'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];
// //초성+종성
// const charConsonants = [
//         'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ',
//         'ㅂ', 'ㅃ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
// ];

// 쌍자음 추가
const doubleConsonant2 = [
    ['ㄱ', 'ㄱ'], ['ㄷ','ㄷ'], ['ㅂ', 'ㅂ'], ['ㅅ', 'ㅅ'], ['ㅈ', 'ㅈ']
]

// 이중 받침 자음
const doubleConsonant =  [
    ['ㄱ','ㄱ'], ['ㄱ','ㅅ'], ['ㄴ','ㅈ'], ['ㄴ','ㅎ'], ['ㄹ','ㄱ'], ['ㄹ','ㅁ'], ['ㄹ','ㅂ'], ['ㄹ','ㅅ'],
    ['ㄹ','ㅌ'], ['ㄹ','ㅍ'], ['ㄹ','ㅎ'], ['ㅂ','ㅅ'], ['ㅅ','ㅅ']
];

// 이중 모음
const doubleVowel =  [
    ['ㅗ','ㅏ'], ['ㅗ','ㅐ'], ['ㅗ','ㅣ'], ['ㅜ','ㅓ'], ['ㅜ','ㅔ'], ['ㅜ','ㅣ'], ['ㅡ','ㅣ']
];

// 치음
const toothConsonant = ["ㄷ", "ㄸ", "ㅅ", "ㅆ", "ㅈ", "ㅉ", "ㅊ"];

// 유사한 초성
const simInit =  {
        "ㄱ":["ㄲ", "ㅋ"], "ㄲ":['ㅋ'], "ㄷ":["ㄸ", "ㅌ", "ㅆ", "ㅉ"], "ㄸ":["ㅌ", "ㅉ"], "ㄹ":["ㄴ"], "ㅂ":["ㅃ", "ㅍ"], "ㅃ":["ㅍ"],
        "ㅅ":[ "ㄸ", "ㅆ", "ㅉ"], "ㅆ": ["ㅉ"], "ㅈ":["ㅆ", "ㅉ", "ㅊ"], "ㅉ":["ㅊ", "ㅆ"], "ㅊ":["ㅉ"], "ㅋ":["ㄲ"], "ㅌ":["ㄸ"], "ㅍ":["ㅃ"], "ㅎ":["ㅍ"]
    };

// 유사한 중성
// 유사중성.  고 -> 거, 교
const simMiddle =  {
        "ㅏ":[["ㅑ"], ["ㅗ", "ㅏ"]], "ㅐ":[["ㅒ"], ["ㅔ"], ["ㅖ"], ["ㅗ", "ㅐ"], ["ㅗ", "ㅣ"], ["ㅜ","ㅔ"]], "ㅒ":[["ㅖ"]],
        "ㅓ":[["ㅕ"], ["ㅜ", "ㅓ"], ["ㅗ"]], "ㅔ":[["ㅒ"], ["ㅔ"], ["ㅖ"], ["ㅗ", "ㅐ"], ["ㅗ", "ㅣ"], ["ㅜ","ㅔ"]], "ㅕ":[["ㅛ"]], "ㅖ":[["ㅖ"]],
        "ㅗ":[["ㅓ"], ["ㅛ"]], "ㅙ":[["ㅗ", "ㅣ"], ["ㅜ","ㅔ"]], "ㅚ":[["ㅗ", "ㅐ"], ["ㅜ","ㅔ"]], "ㅛ":[["ㅕ"]],
        "ㅜ":[["ㅠ"],["ㅡ"]], "ㅞ":[["ㅗ", "ㅐ"], ["ㅗ", "ㅣ"]], "ㅡ":[["ㅜ"]], "ㅣ":[["ㅜ","ㅣ"], ["ㅡ", "ㅣ"]]
    };

// 치음일 때의 유사중성. 치음은 i 반모음을 무시한다.
const toothSimMiddle =  { ...simMiddle,
        "ㅑ":[["ㅏ"], ["ㅗ", "ㅏ"]], "ㅒ": [["ㅐ"], ["ㅔ"], ["ㅖ"], ["ㅗ", "ㅐ"], ["ㅗ", "ㅣ"], ["ㅜ","ㅔ"]],
        "ㅕ":[["ㅓ"], ["ㅜ","ㅓ"], ["ㅗ"], ["ㅛ"]], "ㅖ":[["ㅐ"], ["ㅔ"], ["ㅒ"], ["ㅗ", "ㅐ"], ["ㅗ", "ㅣ"], ["ㅜ","ㅔ"]],
        "ㅛ":[["ㅓ"], ["ㅕ"], ["ㅜ","ㅓ"], ["ㅗ"]], "ㅠ":[["ㅜ"], ["ㅡ"]]
    };

// 유사종성
const simEnd= {
        "ㄱ": ["ㅋ", "ㄲ"], "ㄲ":["ㄱ", "ㅋ"], "ㄷ":["ㅌ", "ㅅ", "ㅆ", "ㅈ", "ㅊ"], "ㅂ":["ㅂ", "ㅍ"], "ㅅ":["ㄷ", "ㅌ", "ㅆ", "ㅈ", "ㅊ"], "ㅆ":["ㄷ", "ㅌ", "ㅅ", "ㅈ", "ㅊ"],
        "ㅈ":["ㄷ", "ㅌ", "ㅅ", "ㅆ", "ㅈ", "ㅊ"], "ㅊ":["ㄷ", "ㅌ", "ㅅ", "ㅆ", "ㅈ", "ㅊ"], "ㅋ":["ㄱ", "ㄲ"], "ㅌ":["ㄷ", "ㅅ", "ㅆ", "ㅈ", "ㅊ"], "ㅍ":["ㅂ", "ㅍ"], "ㅎ":["ㅅ"]
    };

// 뒷글자에 의한 자음동화. 뒷글자가
const jointConsonant =  {
        "ㄱ":["ㄱ", "ㄲ", "ㅋ"], "ㄲ":["ㄱ", "ㅋ", "ㄲ"], "ㄴ":["ㄴ", "ㄷ", "ㅅ"], "ㄷ":["ㄷ", "ㅌ", "ㅅ", "ㅆ", "ㅈ", "ㅊ"], "ㄸ":["ㄷ","ㅌ", "ㄸ", "ㅅ", "ㅆ", "ㅈ", "ㅊ" ], "ㄹ":["ㄴ", "ㄹ"],
        "ㅁ":["ㅁ", "ㅂ", "ㅍ"], "ㅂ":["ㅁ", "ㅂ", "ㅍ"], "ㅃ":["ㅁ", "ㅂ", "ㅃ"], "ㅅ":["ㅅ", "ㄷ", "ㅌ", "ㅆ", "ㅈ", "ㅊ"], "ㅆ":["ㄷ", "ㅌ", "ㅅ", "ㅆ", "ㅈ", "ㅊ"], "ㅈ":["ㄷ", "ㅌ", "ㅅ", "ㅈ", "ㅆ", "ㅊ"],
        "ㅊ":["ㄷ", "ㅌ", "ㅅ", "ㅆ", "ㅈ", "ㅊ"], "ㅋ":["ㄱ", "ㄲ", "ㅋ"], "ㅌ":["ㄷ", "ㅅ", "ㅆ", "ㅈ", "ㅊ", "ㅌ"], "ㅍ":["ㅁ", "ㅂ", "ㅍ"], "ㅎ":["ㅎ"]
    };

// 뒷글자에 의한 모흠동화
const jointVowel = {
    "ㅏ":[["ㅐ"]], "ㅑ":[["ㅒ"], ["ㅖ"]], "ㅓ":[["ㅔ"]], "ㅕ":[["ㅒ"], ["ㅖ"]], "ㅗ":[["ㅗ", "ㅣ"]], "ㅜ":[["ㅜ", "ㅣ"]], "ㅡ":[["ㅡ", "ㅣ"]]
};


// 두벌식 <->QWERTY 자판 호환. 한/영 키를 이용해서 욕설을 우회하는 것을 방지함.
const enKoKeyMapping = {
        'q':'ㅂ', 'Q':'ㅃ', 'w':'ㅈ', 'W':'ㅉ', 'e': 'ㄷ', 'E':'ㄸ', 'r':'ㄱ', 'R':'ㄲ', 't':'ㅅ', 'T':'ㅆ',
        'y':'ㅛ', 'Y':'ㅛ', 'u':'ㅕ', 'U':'ㅕ',  'i':'ㅑ', 'I': 'ㅑ', 'o': 'ㅐ', 'O': 'ㅒ', 'p':'ㅔ', 'P':'ㅖ',
        'a':'ㅁ', 'A':'ㅁ', 's':'ㄴ', 'S':'ㄴ', 'd': 'ㅇ', 'D':'ㅇ', 'f':'ㄹ', 'F': 'ㄹ', 'g': 'ㅎ', 'G':'ㅎ',
        'h':'ㅗ', 'H':'ㅗ', 'j':'ㅓ', 'J':'ㅓ', 'k':'ㅏ', 'K':'ㅏ', 'l':'ㅣ', 'L':'ㅣ',
        'z':'ㅋ', 'Z':'ㅋ', 'x':'ㅌ', 'X':'ㅌ', 'c':'ㅊ', 'C':'ㅊ', 'v':'ㅍ', 'V':'ㅍ',
        'b':'ㅠ', 'B':'ㅠ', 'n':'ㅜ', 'N':'ㅜ', 'm':'ㅡ', 'M':'ㅡ', '2':'ㅣ', '5':'ㅗ', '^':'ㅅ', '@':"ㅇ"
    };

// 한영발음 메커니즘 - 중복 없애기
const alphabetPronounceMapping = {
        // 메커니즘 - 우선 한/영 분리를 합니다. 그 다음에 한국어 비속어를 이용해서 영어 패턴을 생성합니다.
        consonants: {'ㄱ':['g'], 'ㄴ':['n'], 'ㄷ':['d','dd','tt'], 'ㄹ':['l','r'], 'ㅁ':['m'], 'ㅂ':['b', 'v'], 'ㅅ':['s', 'x', 'sh'], 'ㅇ':[''],
            'ㅈ':['j','z', 'jh'], 'ㅊ':['ch', 'zh'], 'ㅋ':['c', 'k', 'kh', 'q'], 'ㅌ':['t', 'th'],'ㅍ':['p', 'ph', 'f'], 'ㅎ':['h'],
            'ㄲ': ['gg', 'kk'], 'ㄸ': ['dd', 'tt'], 'ㅃ': ['bb', 'pp'], 'ㅆ': ['ss'], 'ㅉ': ['zz', 'jj']}, //쌍자음은 단자음으로 바꾸어서 전환 예정
        vowels : {'ㅏ':['a'], 'ㅐ':['ae'], 'ㅓ':['eo'], 'ㅔ':['e'],  'ㅗ':['o'], 'ㅚ':['oe', 'oi'],  'ㅜ':['u', 'oo'], 'ㅟ':['ui'], 'ㅡ':['eu', ''], 'ㅢ':['eui'], 'ㅣ':['i', 'ee']},
        doubleVowels: {
            'ㅑ':['ya'], 'ㅒ':['yae'], 'ㅕ':['yeo'], 'ㅖ':['ye'],'ㅘ':['wa'], 'ㅙ':['wae'], 'ㅝ':['wo', 'wu', 'weo'], 'ㅛ':['yo'], 'ㅞ':['we'], 'ㅟ':['wi'],  'ㅠ':['yu', 'yoo'], 'ㅣ': ['y', 'yi'], '': ['w']
        },
    // 받침 - 기본 ㅅ으로 통일하고 상황에 따라 ㄷ을 사용하는 걸로 바꿔보자
        endConsonants:{ 'ㄱ':['g','k','x'], 'ㄴ':['n'], 'ㄹ':['l', 'r'], 'ㅁ':['m'], 'ㅂ':['p','b'], 'ㅅ':['s', 't', 'd'], 'ㅇ':['ng', 'nn'], '': ['h']},
    };

// 단일 캐릭터일 때 단일발음에서 사용
const singlePronounce =  {
    'b': '비', 'c':'씨', 'd':'디', 'g': '지', 'l': '엘', 'm': '엠', 'n': '엔', 'p': '피', 'q': '큐', 'r': '알', 't': '티', 'x': 'X', 'z': '지',
    '十':'십', '+':'십', "奀":"좆", '1':'일', '2':'이', '3':'삼', '4':'사', '5':'오', '6':'육', '7':'칠', '8':'팔', '9':'구', '0':'영',
    'ㄹ': '근'
};

// 자모와 자형이 유사한 경우 사용
const similarConsonant= {
        '2':'ㄹ', '3':'ㅌ', "5":'ㄹ', '7':'ㄱ', '0':'ㅇ', 'C':'ㄷ', 'c':'ㄷ', 'D':'ㅁ', 'E':'ㅌ', "L":'ㄴ', 'M':'ㅆ', 'm':'ㅆ', 'n':'ㅅ', 'S':'ㄹ', 's':'ㄹ',
        'V':'ㅅ', 'v':'ㅅ', 'w':'ㅆ', 'W':'ㅆ', 'Z':'ㄹ', 'z':'ㄹ', '@':'ㅇ', '#':'ㅂ', '^':'ㅅ',
    };

// 모음과 자형이 유사한 경우에 대비함
const similarVowel =  {
        '1':'ㅣ', 'H':'ㅐ', 'I':'ㅣ', 'l':'ㅣ', 'T':'ㅜ', 't':'ㅜ', 'y':'ㅓ', '!':'ㅣ',  '_':'ㅡ', '-':'ㅡ', '|':'ㅣ'
    };

//자형이 유사한 단어들 모음. 추후 반영 예정
const similarShape = [
        ['ㄹ','근'], ['4', '니'], ['대', '머'], ['댁','먹'], ['댄', '먼'], ['댈', '멀'], ['댐', '멈'], ['댕', '멍'], ['金', '숲']
            ['奀', '좃', '좆'], ['長', '튼'], ['%', '응'], ['q', '이']
    ];

// 겹자모 출력
const doubleMap = {
    'ㄲ': ['ㄱ','ㄱ'], 'ㄳ':['ㄱ','ㅅ'], 'ㄵ': ['ㄴ','ㅈ'], 'ㄶ' :['ㄴ','ㅎ'], 'ㄸ':['ㄷ', 'ㄷ'], 'ㄺ': ['ㄹ','ㄱ'],
    'ㄻ': ['ㄹ','ㅁ'], 'ㄼ': ['ㄹ','ㅂ'], 'ㄽ': ['ㄹ','ㅅ'], 'ㄾ': ['ㄹ','ㅌ'], 'ㄿ': ['ㄹ','ㅍ'], 'ㅀ': ['ㄹ','ㅎ'],
    'ㅃ': ['ㅂ','ㅂ'], 'ㅄ': ['ㅂ','ㅅ'], 'ㅆ': ['ㅅ','ㅅ'], 'ㅉ': ['ㅈ','ㅈ'], 'ㅘ': ['ㅗ','ㅏ'],
    'ㅙ': ['ㅗ','ㅐ'], 'ㅚ': ['ㅗ','ㅣ'], 'ㅝ': ['ㅜ','ㅓ'], 'ㅞ': ['ㅜ','ㅔ'], 'ㅟ': ['ㅜ','ㅣ'], 'ㅢ': ['ㅡ','ㅣ'],
    'ㅑ': ['ㅣ', 'ㅏ'], 'ㅒ': ['ㅣ', 'ㅐ'], 'ㅕ': ['ㅣ', 'ㅓ'], 'ㅖ': ['ㅣ', 'ㅔ'], 'ㅛ': ['ㅣ', 'ㅗ'], 'ㅠ': ['ㅣ', 'ㅜ']
}


export {
    charInitials,
    charMedials,
    charSimpleMedials,
    charFinals,
    // charConsonants,
    doubleConsonant,
    doubleVowel,
    toothConsonant,
    simInit,
    simMiddle,
    toothSimMiddle,
    simEnd,
    jointConsonant,
    jointVowel,
    enKoKeyMapping,
    alphabetPronounceMapping,
    singlePronounce,
    similarConsonant,
    similarVowel,
    similarShape,
    doubleMap
};
