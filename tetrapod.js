import Hangul from 'hangul-js';

// 사전데이터들을 배열형태로 저장해서 보관합니다. (json)
var badWords = []
var normalWords = []
var softSearchWords = []

// 빠른 비속어단어 확인을 위해 사전에
// 단어목록을 한글자씩 조각내놓고 사용합니다.
var parsedBadWords = []

// 유동적인 비속어 목록 관리를 위해 이미 배열에
// 특정 단어가 존재하는지를 확인하기위해 해시맵을 사용합니다.
var badWordsMap = {}
var normalWordsMap = {}
var softSearchWordsMap = {}

const Utils = {

    // 한글 자음
    korConsonants: [
        'ㄱ', 'ㄲ','ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    ],
    // 한글 모음
    korVowels: [
        'ㅏ', 'ㅐ' , 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
    ],

    // 유사한 자모. 예를 들면 껴져 -> 꺼저로 축약할 때 사용.
    korSimParts: {'ㄱ':['ㄱ','ㅋ','ㄲ'], 'ㄲ':['ㄲ','ㅋ'], 'ㄴ':['ㄴ', 'ㄹ'], 'ㄷ':['ㄴ','ㄷ', 'ㄸ', 'ㅌ'], 'ㄹ':['ㄴ'], 'ㅁ':['ㅇ'], 'ㅂ':['ㅃ', 'ㅍ'], 'ㅅ':['ㅆ'], 'ㅇ':['ㅁ'],
        'ㅈ':['ㅉ','ㅊ'], 'ㅊ':['ㅉ', 'ㅌ'], 'ㅋ':['ㄲ'], 'ㅌ':['ㄸ', 'ㅊ'], 'ㅍ':['ㅃ'], 'ㅎ': ['ㅇ'],
        'ㅏ':['ㅑ', 'ㅘ'], 'ㅐ':['ㅒ', 'ㅖ', 'ㅔ'], 'ㅑ':['ㅏ', 'ㅛ'], 'ㅒ':['ㅐ', 'ㅔ', 'ㅖ'], 'ㅓ':['ㅕ', 'ㅗ', 'ㅝ'], 'ㅔ':['ㅐ', 'ㅒ', 'ㅖ'], 'ㅕ':['ㅓ', 'ㅛ', ''], 'ㅖ':['ㅔ', 'ㅐ', 'ㅒ'],
        'ㅗ':['ㅓ', 'ㅛ', 'ㅘ'], 'ㅘ':['ㅏ'], 'ㅙ':['ㅚ', 'ㅞ'], 'ㅚ':['ㅙ', 'ㅞ'], 'ㅜ':['ㅡ', 'ㅠ'], 'ㅝ':['ㅓ'], 'ㅞ':['ㅙ', 'ㅚ'], 'ㅟ':['ㅜ', 'ㅣ'], 'ㅠ':['ㅜ', 'ㅡ'], 'ㅡ':['ㅢ', 'ㅜ'] , 'ㅢ':['ㅡ', 'ㅣ'], 'ㅣ':['ㅡ', 'ㅢ', 'ㅟ']
    },

    // 이중 받침 자음
    doubleConsonant: [['ㄱ','ㅅ'], ['ㄴ','ㅈ'], ['ㄴ','ㅎ'], ['ㄹ','ㄱ'], ['ㄹ','ㅁ'], ['ㄹ','ㅂ'], ['ㄹ','ㅅ'],
        ['ㄹ','ㅌ'], ['ㄹ','ㅍ'], ['ㄹ','ㅎ'], ['ㅂ','ㅅ']],

    // 이중 모음
    doubleVowel: [['ㅗ','ㅏ'], ['ㅗ','ㅐ'], ['ㅗ','ㅣ'], ['ㅜ','ㅓ'], ['ㅜ','ㅔ'], ['ㅜ','ㅣ'], ['ㅡ','ㅣ']],

    // 두벌식 <->QWERTY 자판 호환. 한/영 키를 이용해서 욕설을 우회하는 것을 방지함.
    enKoKeyMapping : {
        'q':'ㅂ', 'Q':'ㅃ', 'w':'ㅈ', 'W':'ㅉ', 'e': 'ㄷ', 'E':'ㄸ', 'r':'ㄱ', 'R':'ㄲ', 't':'ㅅ', 'T':'ㅆ',
        'y':'ㅛ', 'Y':'ㅛ', 'u':'ㅕ', 'U':'ㅕ',  'i':'ㅑ', 'I': 'ㅑ', 'o': 'ㅐ', 'O': 'ㅒ', 'p':'ㅔ', 'P':'ㅖ',
        'a':'ㅁ', 'A':'ㅁ', 's':'ㄴ', 'S':'ㄴ', 'd': 'ㅇ', 'D':'ㅇ', 'f':'ㄹ', 'F': 'ㄹ', 'g': 'ㅎ', 'G':'ㅎ',
        'h':'ㅗ', 'H':'ㅗ', 'j':'ㅓ', 'J':'ㅓ', 'k':'ㅏ', 'K':'ㅏ', 'l':'ㅣ', 'L':'ㅣ',
        'z':'ㅋ', 'Z':'ㅋ', 'x':'ㅌ', 'X':'ㅌ', 'c':'ㅊ', 'C':'ㅊ', 'v':'ㅍ', 'V':'ㅍ',
        'b':'ㅠ', 'B':'ㅠ', 'n':'ㅜ', 'N':'ㅜ', 'm':'ㅡ', 'M':'ㅡ', '2':'ㅣ', '5':'ㅗ', '^':'ㅅ', '@':"ㅇ"
    },

    // 한영발음 메커니즘
    alphabetPronounceMapping : {
        // 메커니즘 - 우선 한/영 분리를 합니다. 그 다음에 한국어 비속어를 이용해서 영어 패턴을 생성합니다.
        consonants: {'ㄱ':['g','k', 'gg', 'kk'], 'ㄴ':['n'], 'ㄷ':['d', 't', 'dd','tt'], 'ㄹ':['l','r'], 'ㅁ':['m'], 'ㅂ':['b', 'p', 'bb', 'pp'], 'ㅅ':['s', 'sh', 'ss'], 'ㅇ':[''], 'ㅈ':['j','z', 'zz', 'jj', 'tch'],
            'ㅊ':['ch', 'jh', 'zh'], 'ㅋ':['k', 'kh', 'q'], 'ㅌ':['t', 'th'],'ㅍ':['p', 'ph'], 'ㅎ':['h']}, //쌍자음은 단자음으로 바꾸어서 전환 예정
        vowels : {'ㅏ':['a'], 'ㅐ':['ae', 'e'],  'ㅑ':['ya', 'ja'], 'ㅒ':['ye', 'yae'], 'ㅓ':['u', 'eo', 'eu'], 'ㅔ':['e', 'we'], 'ㅕ':['yu', 'yeo'], 'ㅖ':['ye'], 'ㅗ':['o', 'oh'], 'ㅘ':['wa', 'oa'],
        'ㅙ':['oe', 'oae', 'we', 'wae'], 'ㅚ':['oe', 'oi', 'we'], 'ㅛ':['yo'], 'ㅜ':['u', 'oo', 'uu'], 'ㅝ':['wu', 'weo'], 'ㅞ':['we', 'ue'], 'ㅟ':['ui', 'wi'], 'ㅠ':['yu', 'yoo'], 'ㅡ':['eu', '', 'u'], 'ㅢ':['eui', 'ui'], 'ㅣ':['i', 'ee']},
        endConsonants:{ 'ㄱ':['g','k'], 'ㄴ':['n', 'l'], 'ㄷ':['t','d'], 'ㄹ':['l'], 'ㅁ':['m'], 'ㅂ':['p','b','n'], 'ㅅ':['t', 's'], 'ㅇ':['ng', 'nn']},
    },

    //단일 발음에서 사용 - 추후 개선 예정
    singlePronounce: {
        'C':'씨', 'c':'씨','十':'십', '+':'십', 'D':'디', 'd':'디', 'g':'지', 'z':'지', "M":'엠', 'm':'엠',
        'jot':'좆', 'wha':'화', 'emi':'에미', 'ebi':'에비', 'sip':'씹', "奀":"좆",
        'si':'시', 'ral':'랄', 'bal':'발', 'em':'엠', 'ba':'바', 'bo':'보','nom':'놈', 'nyeun':'년', 'byung':'병',
        '1':'일', '2':'이', '3':'삼', '4':'사', '5':'오', '6':'육', '7':'칠', '8':'팔', '9':'구', '0':'영'},

    // 자모와 자형이 유사한 경우 사용.
    similarConsonant: {
        '2':'ㄹ', '3':'ㅌ', "5":'ㄹ', '7':'ㄱ', '0':'ㅇ', 'C':'ㄷ', 'c':'ㄷ', 'D':'ㅁ', 'E':'ㅌ', "L":'ㄴ', 'M':'ㅆ', 'm':'ㅆ', 'n':'ㅅ', 'S':'ㄹ', 's':'ㄹ',
        'V':'ㅅ', 'v':'ㅅ', 'w':'ㅆ', 'W':'ㅆ', 'Z':'ㄹ', 'z':'ㄹ', '@':'ㅇ', '#':'ㅂ', '^':'ㅅ',
    },

    // 모음과 자형이 유사한 경우에 대비함
    similarVowel: {
        '1':'ㅣ', 'H':'ㅐ', 'I':'ㅣ', 'l':'ㅣ', 'T':'ㅜ', 't':'ㅜ', 'y':'ㅓ', '!':'ㅣ',  '_':'ㅡ', '-':'ㅡ', '|':'ㅣ'
    },

    //자형이 유사한 단어들 모음. 추후 반영 예정
    similarShape: [
        ['ㄹ','근'], ['4', '니'], ['대', '머'], ['댁','먹'], ['댄', '먼'], ['댈', '멀'], ['댐', '멈'], ['댕', '멍'], ['金', '숲']
        ['奀', '좃', '좆'], ['長', '튼'], ['%', '응'], ['q', '이']
    ],

    // 배열/오브젝트 동일성 체크
    objectEqual: (a,b) => {
    let val = true;
    if (Object.keys(a).length !== Object.keys(b).length ) {
        val = false;
    }
    else {
        for (var key in a) { // a의 키에 대해 조사
            if (a[key]!==b[key]) {val = false; break;}
        }
    }
    return val;
    },

    // 배열/오브젝트의 포함관계 체크. a가 b안에 들어갈 때 True
    objectInclude: (inc, exc, order=false) => {
        let val = true;
        // 순서 생각하지 않고 포함관계
        if ( !order && Array.isArray(inc) && Array.isArray(exc) ) {
            inc = inc.sort();
            exc = exc.sort();
        }
        // 우선 inc 키 안에 들어간 것이 exc에 없는지 확인하기.
        for (var key in inc) {
            if (Object.keys(exc).indexOf(key) ===-1) {val=false; break;}
            else if (inc[key]!== exc[key]) {val = false; break;}
        }
        return val;

    },

    //중복 리스트 제거
    removeMultiple: (list) => {
        let res = [];
        for (var x of list) {
            if (!Utils.objectIn(x, list)) res.push(x);
        }
        return res;

    },

    escape: (text) => {
        return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    },

    // 메시지에서 특정 패턴을 찾아서 전부 바꿔주는 함수.
    replaceAll: (message, search, replace) => {
        return message.replace(new RegExp(search, 'gi'), replace)
    },

    // 메시지에서 단어의 위치를 찾아주는 함수.
    getPositionAll: (message, search, isString = true) => {
        let i = message.indexOf(search),
            indexes = []
        while (i !== -1) {
            indexes.push(i)
            i = message.indexOf(search, ++i)
        }

        if(!isString) return indexes

        let stringPoses = []
        for(let wordIndex of indexes){
            if(wordIndex === -1) continue
            for(let i=0;i<search.length;i++)
                stringPoses.push(wordIndex++)
        }
        return stringPoses
    },

    grabCouple: (manyArray) => {
        let i = 0
        let couple = []
        for(;;){
            if((manyArray.length - i) == 1) break
            couple.push([manyArray[i], manyArray[i+1]])
            if(++i>=manyArray.length) break
        }
        return couple
    },

    // 단어 -> 낱자로 분리
    wordToArray: word => (word.split(""))
    ,

    // 메시지를 특정 단어 숫자로 분리
    lengthSplit: (message, limit) => {
        if (message.length <= limit) return [message]

        let fixedMessage = []
        let fullMessageLength = message.length
        let currentLength = 0

        let splitList = []
        while (true) {
            if (currentLength == fullMessageLength) {
                if (currentLength != 0 && splitList.length != 0) {
                    fixedMessage.push(splitList.join(''))
                    splitList = []
                }
                break
            }
            if (currentLength != 0 && currentLength % limit == 0 && splitList.length != 0) {
                fixedMessage.push(splitList.join(''))
                splitList = []
            }
            splitList.push(message[currentLength])
            currentLength++
        }

        return fixedMessage
    },


    sortMap: (inputMap) => {
        let sortedMap = {}

        Object.keys(inputMap).sort().forEach((key) => {
            sortedMap[key] = inputMap[key]
        })

        return sortedMap
    },

    // 리스트/함수 합성 등 여러 상황에서 합성할 때 사용함.
    joinMap: (lix, func) => {
        let res = {};

        // 문자 & 오브젝트 -> 단순 출력
        if (typeof lix ==="string" && typeof func === "object") return func[lix];

        // 문자 & 함수 -> 단순 함수값.
        else if (typeof lix === "string" && typeof func === "function") return func(lix);

        // 배열, 함수 형식 - 배열을 키로, 함수값을 값으로
        else if (Array.isArray(lix) && typeof func === "function") {
            lix.forEach(x=> {
                res[x] = func(x);
            });
            return res;
        }
        // 배열 & 오브젝트 -> 배열을 키로, 오브젝트 대응값을 값으로
        else if (Array.isArray(lix) && typeof func === "object" ) {
            lix.forEach(x=> {
                if (Object.keys(func).indexOf(x)!== -1) {
                    res[x] = func[x];
                }
            });
            return res;
        }
        // 오브젝트 둘 합성.
        else if (typeof lix === "object" && typeof func === "object" ) {
            Object.keys(lix).forEach(x=> {
                if (Object.keys(func).indexOf(lix[x])!== -1) {
                    res[x] = func[lix[x]];
                }
            });
            return res;
        }
        // 함수 둘 합성
        else if (typeof lix ==="function" && typeof func === "function") {
            return ((x) => {
                if (func(lix(x))) return func(lix(x));
                else return null;
            });
        }
    },

    // 리스트를 곱하기. 예시  [[1,2,3],[4,5,6]] => [[1,4], [1,5], [1,6], [2,4], [2,5], [2,6], [3,4], [3,5], [3,6]]
    productList : (list) => {
        if (Array.isArray(list)) {
            if (list.length ===0) return [];
            else if (list.length ===1 ) return list[0];
            else if (list.length ===2 ) {
                let res = [];
                for (var fele of list[0]) {
                    for (var sele of list[1]) {
                        res.push([fele, sele]);
                    }
                }
                return res;
            }
            else {
                let res =[];
                let res0 = Utils.productList(list.slice(0,-1));
                for (var fele of res0) {
                    for (var sele of list.slice(-1)[0]) {
                        res.push([...fele, sele]);
                    }
                }
                return res;
            }
        }
        else {
            return null;
        }
    },

    // 포함관계 정리 - elem이 object 안에 있는지 확인
    objectIn : (elem, object) => {

        // 우선 elem 파악
        if (typeof object === "object") {
            if (typeof elem === "string" || typeof elem ==="number" || typeof elem ==="boolean") {
                return Object.values(object).indexOf(elem)!==-1;
            }
            else if (typeof elem === "object") {
                for (var x in object) {
                    if (Utils.objectEqual(x, elem)) return true;
                }
                return false;
            }
            else return false;
        }
        else return false;

    },

    // 리스트 합집합 구하기. 리스트 원소가 일반이면 그냥 더하기, 오브젝트면 원소들을 union 하기
    listUnion : (...list) => {
        let res = []
        for (var x of list) {
            if (typeof x ==="string" || typeof x ==="number" || typeof x ==="boolean") {
                if (! Utils.objectIn(x, res )) res.push(x)
            }
            else if (typeof x === "object") {
                for (var y in x) {
                    if (!Utils.objectIn(x[y], res)) res.push(x[y])
                }
            }
        }
        return res;
    },
    // 리스트 교집합 구하기
    listIntersection: (...list) => {
        let res = [];
        if (list.length>0) {
            for (var y in list[0]) {
                let tmpRes = true;
                for (var x of list) {
                    tmpRes = tmpRes && Utils.objectIn(list[0][y], x)
                }
                if (tmpRes) res.push(list[0][y])
            }
            return res;
        }
        else return [];

    },

    // 2차원 배열 형태로 정의된 것을 풀어쓰기.
    recursiveComponent: (data) => {

        // 데이터의 전항 후항을 순회합니다.
        for (let i=0;i<=1;i++){

            // 데이터의 모든 항목을 순회합니다.
            for(let itemIndex in data[i]){
                let item = data[i][itemIndex]

                // 데이터 항목이 배열인 경우
                // 재귀 컴포넌트 해석을 진행합니다.
                if(Array.isArray(item)){
                    let solvedData = Utils.recursiveComponent(item)
                    data[i][itemIndex] = null
                    data[i] = data[i].concat(solvedData)
                }
            }
        }

        // 데이터의 전항 후항을 순회합니다.
        let solvedData = []
        for(let before of data[0]){
            if(before === null) continue
            for(let after of data[1]){
                if(after === null) continue
                solvedData.push(before+after)
            }
        }
        return solvedData
    },


    // 겹자모 판단하기. 순서 지켜주기
    isDouble: (var1, var2, allowSim =false) => {
        let res = false;
        let compareList;
        // 각 원소가 길이가 2개인 배열로 구성되어야 한다.
        if (typeof allowSim === 'object') compareList = allowSim;
        else compareList = allowSim?
            Utils.recursiveComponent(
            [...Utils.doubleConsonant, ...Utils.doubleVowel, "ㄱ7", "77", [["ㄱ", '7'],["ㅅ", "^"]],"ㄹ^", "#ㅅ", "ㅂ^", "#ㅅ",
                "ㅗH", "ㅜ, y", "t, y", "T, y", [["ㅗ","ㅜ", "t", "T", "ㅡ", "_"], ["ㅣ", "!", "I", "1","l", "|"]]]
            ).map(x => x.split(""))
        :[...Utils.doubleConsonant, ...Utils.doubleVowel];

        for (var dbl of compareList) {
            if (Utils.objectEqual([var1, var2], dbl.slice(0,2) )) res = true;
        }
        return res;
    },

    // 파싱하기 {씨:{value:시, index:[1]}, 브얼:{value:벌, index:[2]}}
    parseMap: (map) => {
        let originalMessageList = [];
        let originalMessageIndex = [];
        let parsedMessage = [];
        let search = 0;
        let maxVal = Object.values(map).map(x=> (Math.max(...x.index)));

        while(search <= Math.max(...maxVal)) {
            for (let val in map) {
                // index 값이 존재하면
                if (map[val].index.indexOf(search)!==-1) {
                    originalMessageIndex.push(search);
                    originalMessageList.push(val);
                    parsedMessage.push(map[val].value);
                    search += val.length;
                }
            }
        }
        return {
            messageList: originalMessageList,
            messageIndex: originalMessageIndex,
            parsedMessage: parsedMessage
        }
    }

    ,

    // 영자조합 만들기
    enToKo: (msg, isMap = false)=> {
        const mapping = Utils.enKoKeyMapping;

        // 맵을 만들 필요 없을 때
        if (!isMap) {
            // 낱자 분리 후에 영어 -> 한글 전환
            let msgReplacedToKo = msg.split('').map((letter) =>
                (Object.keys(mapping).indexOf(letter)!==-1 ? mapping[letter] : letter));
            // 분리된 낱자를 합치기.
            let newMsg = msgReplacedToKo.join('');
            // 결과 - 낱자를 조합하기.
            return Hangul.assemble(newMsg);
        }
        // 맵을 만들어야 할 때
        else {
            let msg_split = msg.split("");
            let msg_res = []
            let res = {}
            let temp = ""; // 글씨 추가용
            // 자음이나 영어 자음에 대응되는 경우
            msgSplit.map( (letter, ind) => {
                let consonant = [...Utils.korConsonants, "q", "w", "e", "r", "t", "a", "s", "d", "f", "g", "z", "x", "c", "v"];
                let vowel = [...Utils.korVowels, "y", 'u', "i", "o", "p", "h", "j", "k", "l", "b", "n", "m"];

                let resMacro = (letter, val=temp) => {
                    if (val!=="") {
                        msgRes.push(val);
                        if (!res[val]) res[val] = {value: Utils.enToKo(val), index: [ind - val.length]}
                        else { res[val].index.push(ind - val.length);}
                        temp = letter;
                    }
                }
                // 첫 글자는 무조건 추가.
                if (ind ===0) {
                    temp +=letter;
                }
                // 자음의 경우 -> 뒤에 모음이 아닌 문자가 올 때만 앞글자에 붙인다.
                else if (ind>0 && consonant.indexOf(letter.toLowerCase()) !==-1 && (ind===msg.length-1 || vowel.indexOf(msgSplit[ind+1].toLowerCase()) ===-1)) {
                    // 앞에 모음이거나
                    if (vowel.indexOf(msgSplit[ind-1].toLowerCase())!==-1 ) {
                        temp +=letter;
                        console.log('t1')
                    }
                    // 앞앞이 모음& 앞자음이 쌍자음 형성할 수 있을 때
                    else if (ind>1 && vowel.indexOf(msgSplit[ind-2].toLowerCase())!==-1 && consonant.indexOf(msgSplit[ind-1].toLowerCase())!==-1) {
                        let tf = false;
                        let mode = [
                            Object.keys(mapping).indexOf(msgSplit[ind-1])!==-1 ? mapping[msgSplit[ind-1]] : msgSplit[ind-1],
                        Object.keys(mapping).indexOf(letter)!==-1 ? mapping[letter] : letter
                    ];
                        // 겹자음 실험
                        Utils.doubleConsonant.forEach( x=> {
                            if (Utils.objectEqual(mode, x)) {
                                temp +=letter; tf = true;
                            }
                        });
                        if (!tf) resMacro(letter);
                    }
                    else resMacro(letter);
                }
                // 모음의 경우 앞에 자음이 오면 무조건 앞글자에 붙이기
                else if (ind>0 && vowel.indexOf(letter.toLowerCase())!==-1 && consonant.indexOf(msgSplit[ind-1].toLowerCase()) !==-1) {
                    temp +=letter;
                }
                else resMacro(letter);
            });
            // 마지막 글자 붙이기
            if (temp!=="") {
                msgRes.push(temp);
                if (!res[temp]) res[temp]= {value:Utils.enToKo(temp), index: [msg.length-temp.length]}
                else {res[temp].index.push(msg.length-temp.length);}
                temp = "";
            }
            return res;

        }

    },

    //자모조합을 악용한 비속어 걸러내기 ㄱH^H77| 검출 가능. isMap 사용시 오브젝트 형태로 결과물 도출.
    alphabetToKo: (msg, isMap = false) => {

        const korConsonant = /[ㄱ-ㅎ]/;
        const korVowel = /[ㅏ-ㅣ]/;
        const korLetter = /[가-힣]/;
        // const singleParts = Object.keys(Utils.singlePronounce);
        const simConsonant = Object.keys(Utils.similarConsonant);
        const simVowel = Object.keys(Utils.similarVowel);
        // 둘 다 들어간 요소
       /* let commonList = [];
        for (var lets of singleParts) {
            if (singleAlphabet.indexOf(lets)!==-1) {
                commonList.push(lets)
            }
        }
        */
        let letterType ='';
        let newLetterType='';
        const msgAlphabet = Utils.wordToArray(msg);
        let msgAlphabetType = []; //타입별로 나누기

        for (var letter of msgAlphabet ) {
            if (korConsonant.test(letter)) { msgAlphabetType.push('c'); } // 자음
            else if (korVowel.test(letter)) { msgAlphabetType.push('v'); } // 모음
            else if (korLetter.test(letter)) { msgAlphabetType.push('h'); } // 한글
            else if (simConsonant.indexOf(letter)!==-1) {msgAlphabetType.push('d');} // 유사자음
            else if (simVowel.indexOf(letter)!==-1) {msgAlphabetType.push('w');} // 유사모음
            else if (letter===' ') {msgAlphabetType.push('s');} // 공백
            else {msgAlphabetType.push('e');} // 나머지 문자
        }

        let preSyllable = []; // 음절단위로 분리하기
        let preSyllableOrigin = []; // isMap 사용시 원본 메시지.
        let preIndex = []; // isMap 사용시 음절의 자릿값 저장하기

        const msgLength = msgAlphabet.length;

        // 인덱스
        let ind = -1;
        // 캐릭터 타입별로 음절 분리하기.
        for (var i =0; i<msgLength; i++) {

            // 첫글자 push하기. msg는 혹시 변경될 때 대비해서...
            let pushSyllable = (msg = msgAlphabet[i]) => {
                preSyllable.push( msg );
                if ( isMap ) {
                    preSyllableOrigin.push (msgAlphabet[i]);
                    ind += msgAlphabet[i].length;
                    preIndex.push(ind);
                }
            }

            // 앞음절에 그대로 붙이기
            let joinFrontSyllable = (isSim = false) => {
                let newItem;
                if (isSim) {
                    const simAlphabet = {...Utils.similarConsonant, ...Utils.similarVowel };
                    newItem = simAlphabet[msgAlphabet[i]];
                }
                else newItem = msgAlphabet[i];
                // 치환하기
                preSyllable.splice(-1, 1, preSyllable.slice(-1)[0] + newItem);
                if ( isMap ) {
                    preSyllableOrigin.splice(-1, 1, preSyllableOrigin.slice(-1)[0] + msgAlphabet[i] );
                    ind += msgAlphabet[i].length;

                }
            }

            switch(msgAlphabetType[i]) {

                // 한글이나 공백, 기타문자 -> 그대로 삽입. 한 음절에 하나의 글자만 사용가능하며, 다른 문자 뒤에 붙을 수 없음.
                case 'h':
                case 's':
                case 'e':
                    pushSyllable();
                    break;

                // 자음 -> 모음/유사모음 뒤에 오거나 받침 없는 한글 뒤에 오면서 뒤에 모음/유사모음이 따라오지 않을 때 앞 음절에 붙임.
                // 특수한 겹받침일 때에도 케이스 추가
                case 'c':
                    // 첫자일 때는 무조건 삽입.
                    if (i === 0 ) { pushSyllable();}
                    else {
                        // 자음이 앞글자에 붙는 경우 - 앞에 모음/유사모음, 뒤에 모음/유사모음 없음, ㄸ, ㅃ, ㅉ도 아님.
                        if (
                            msgAlphabet[i] !== "ㄸ" && msgAlphabet[i] !== "ㅃ" && msgAlphabet[i] !== "ㅉ" && (msgAlphabetType[i-1] ==='v' || msgAlphabetType[i-1] === 'w') &&
                            (i < msgLength-1 &&  msgAlphabetType[i+1] !=='v' && msgAlphabetType[i+1] !== 'w'  )
                        )
                            joinFrontSyllable();
                        // 앞자음과 합성해서 겹자음을 만드는 케이스 분리하기
                        else if (
                            i>1 && (msgAlphabetType[i-2] ==='v' || msgAlphabetType[i-2] === 'w') &&
                            Utils.isDouble(msgAlphabet[i-1], msgAlphabet[i]) && (i < msgLength-1 &&  msgAlphabetType[i+1] !=='v' && msgAlphabetType[i+1] !== 'w'  )
                        )
                            joinFrontSyllable();
                        // 받침 없는 한글 + 뒤에 모음이 오지 않는 케이스 분리
                        else if (
                            msgAlphabet[i] !== "ㄸ" && msgAlphabet[i] !== "ㅃ" && msgAlphabet[i] !== "ㅉ" && (msgAlphabetType[i-1] === 'h') &&
                            Utils.korVowels.indexOf(Hangul.disassemble(msgAlphabet[i-1]).slice(-1)[0])!==-1  && (i < msgLength-1 &&  msgAlphabetType[i+1] !=='v' && msgAlphabetType[i+1] !== 'w'  )
                        )
                            joinFrontSyllable();

                        // 나머지 경우 - 그냥 뒤 음절에 배치
                        else pushSyllable();
                    }
                    break;

                //모음인 경우
                case 'v':
                    // 첫자일 때는 무조건 삽입.
                    if (i === 0 ) { pushSyllable();}
                    else {
                        // 자음이 앞에 있을 때는 앞에 붙는다.
                        if (msgAlphabetType[i-1] ==='c' || msgAlphabetType[i-1] === 'd') joinFrontSyllable();
                        // 앞의 모음과 함께 복모음 형성할 수 있는 경우 앞에 붙인다.
                        else if (
                            i>1 && (msgAlphabetType[i-2] ==='c' || msgAlphabetType[i-2] === 'd') && Utils.isDouble(msgAlphabet[i-1], msgAlphabet[i])
                        )
                            joinFrontSyllable();
                        // 나머지는 그대로 뒤 움절에 붙이기
                        else pushSyllable();

                    }
                    break;

                //유사 자음인 경우
                case "d":

                    // 첫자음 잡아내는 함수 작성
                    const isFirstDouble = (var1, var2) => {
                        let res = false;
                        const valFirstDouble = [['7', '7'], ['c', 'c'], ['#', '#'], ['^','^'], ['^', 'n'], ['n', '^'], ['n','n'], ['#', '^'], ['^', '#']]

                        for (var dbl of valFirstDouble) {
                           if (Utils.objectEqual([var1, var2], dbl)) res = true;
                        }
                        return res;
                    }

                    // 처음에는 그냥 삽입. 그러나 모음/유사모음 앞에서만큼은 자음으로 변형되서 들어간다.
                    if (i === 0 ) {
                        pushSyllable(
                            (msgLength>1 && (msgAlphabetType[i+1] ==='v' || msgAlphabetType[i+1] === 'w' || isFirstDouble(msgAlphabet[i], msgAlphabet[i+1]) ))?
                                Utils.similarConsonant[msgAlphabet[i]] : msgAlphabet[i]
                        );
                    }
                    else {
                        // 자음이 앞글자에 붙는 경우 - 앞에 모음/유사모음, 뒤에 모음/유사모음 없음
                        if (
                             (msgAlphabetType[i-1] ==='v' || msgAlphabetType[i-1] === 'w') &&
                            (i < msgLength-1 &&  msgAlphabetType[i+1] !=='v' && msgAlphabetType[i+1] !== 'w'  )
                        )
                            joinFrontSyllable(true);
                        // 앞자음과 합성해서 겹받침을 만드는 케이스 분리하기
                        else if (
                            i>1 && (msgAlphabetType[i-2] ==='v' || msgAlphabetType[i-2] === 'w') &&
                            Utils.isDouble(msgAlphabet[i-1], msgAlphabet[i], true) && (i < msgLength-1 &&  msgAlphabetType[i+1] !=='v' && msgAlphabetType[i+1] !== 'w'  )
                        )
                            joinFrontSyllable(true);
                        // 받침 없는 한글 + 뒤에 모음이 오지 않는 케이스 분리
                        else if (
                            (msgAlphabetType[i-1] === 'h') &&
                            Utils.korVowels.indexOf(Hangul.disassemble(msgAlphabet[i-1]).slice(-1)[0])!==-1  && (i < msgLength-1 &&  msgAlphabetType[i+1] !=='v' && msgAlphabetType[i+1] !== 'w'  )
                        )
                            joinFrontSyllable(true);

                        // 나머지 경우 - 그냥 뒤 음절에 배치
                        else
                            pushSyllable(
                                (msgLength>1 && (msgAlphabetType[i+1] ==='v' || msgAlphabetType[i+1] === 'w' || isFirstDouble(msgAlphabet[i], msgAlphabet[i+1]) ))?
                                    Utils.similarConsonant[msgAlphabet[i]] : msgAlphabet[i]
                            );
                    }
                    break;

                // 유사 모음인 경우
                case 'w':
                    // 첫자일 때는 무조건 삽입. 유사모음은 단어 변형하지 않고 삽입.
                    if (i === 0 ) { pushSyllable();}
                    else {
                        // 자음이 앞에 있을 때는 앞에 붙는다.
                        if (msgAlphabetType[i-1] ==='c' || msgAlphabetType[i-1] === 'd') joinFrontSyllable(true);
                        // 앞의 모음과 함께 복모음 형성할 수 있는 경우 앞에 붙인다.
                        else if (
                            i>1 && (msgAlphabetType[i-2] ==='c' || msgAlphabetType[i-2] === 'd') && Utils.isDouble(msgAlphabet[i-1], msgAlphabet[i], true)
                        )
                            joinFrontSyllable(true);
                        // 나머지는 그대로 뒤 움절에 붙이기
                        else pushSyllable();

                    }
                    break;


            }
        }

        console.log('음절단위분리', preSyllable);
        console.log('음절단위 분리 원래 메시지', preSyllableOrigin);

        // 결과값
        let res = "";
        let resObj = {};

        for (i=0; i<preSyllable.length; i++) {
            if (isMap) {
                // 키값이 있으면 인덱스만 추가
                if (Object.keys(resObj).indexOf(preSyllableOrigin[i])!== -1) {
                    resObj[preSyllableOrigin[i]]["index"].push(preIndex[i]);
                }
                else {
                    resObj[preSyllableOrigin[i]] = {value: Hangul.assemble(Hangul.disassemble(preSyllable[i])), index:[preIndex[i]] };
                }
            }
            else {
                res += Hangul.assemble(Hangul.disassemble(preSyllable[i]));
            }
        }

        return isMap ? resObj : res;
    },

    // ㅇ, ㅡ 제거, 된소리/거센소리 예사음화 후 비속어 찾기. isMap을 사용하면 제거한 모음, 자음 대응 맵 찾기.
    // 예시 : 브압오 -> {'브아':'바', 'ㅂ오':'보'}
    // 비
    // 메시지는 반드시 한글자모로만 조합.
    dropIung: (msg, isMap=false, simplify = true) => {

        let msgAlphabet = Hangul.disassemble(msg, false);
        const varAlphabet = {"ㄲ":'ㄱ', 'ㄸ':'ㄷ', 'ㅃ':'ㅂ','ㅆ':'ㅅ', 'ㅉ':'ㅈ', 'ㅋ':'ㄱ', 'ㅌ':'ㄷ', 'ㅍ':'ㅂ',
            'ㅒ':'ㅐ','ㅖ':'ㅔ'};
        const yVowel = {"ㅏ":"ㅑ", "ㅐ":'ㅒ', 'ㅑ':'ㅑ', 'ㅒ':'ㅒ', 'ㅓ':'ㅕ', 'ㅔ':'ㅖ', 'ㅕ':'ㅕ', 'ㅖ':'ㅖ', 'ㅗ':'ㅛ', 'ㅛ':'ㅛ', 'ㅜ':'ㅠ', 'ㅠ':'ㅠ', 'ㅡ':'ㅠ', 'ㅣ':'ㅣ' }
        // 유사모음 축약형으로 잡아내기 위한 조건 갸앙 ->걍
        const vowelLast = {'ㅏ':['ㅏ'], 'ㅐ':['ㅐ', 'ㅔ'], 'ㅑ': ['ㅏ', 'ㅑ'], 'ㅒ':['ㅐ', 'ㅔ', 'ㅒ', 'ㅖ'], 'ㅓ' : ['ㅓ'], 'ㅔ': ['ㅔ', 'ㅐ'], 'ㅕ': ['ㅓ', 'ㅕ'], 'ㅖ':['ㅐ', 'ㅔ', 'ㅒ', 'ㅖ'],
        'ㅗ':['ㅗ'], 'ㅛ':['ㅛ', 'ㅗ'], 'ㅜ':['ㅜ', 'ㅡ'], 'ㅠ':['ㅠ', 'ㅜ', 'ㅡ'], 'ㅡ':['ㅡ'], 'ㅣ':['ㅣ']}
        // 유사모음 축약형. 그러나 이 경우는 뒷모음을 따를 때 -> 구아 -> 과, 구에 -> 궤 고언세 -> 권세
        const vowelPair = [['ㅗ', 'ㅏ'], ['ㅗ', 'ㅐ'], ['ㅗ', 'ㅓ'], ['ㅗ', 'ㅔ'], ['ㅜ', 'ㅏ'], ['ㅜ', 'ㅐ'], ['ㅜ', 'ㅓ'], ['ㅜ', 'ㅔ'], ['ㅜ', 'ㅣ'], ['ㅡ', 'ㅣ']]
        // map일 때 최종결과용
        let singleSyllable = []; // 음절 단위
        let divideSyllable = []; // 음절단위 나누기
        let res = {};

        // 상쇄모음 조합 -

        if (!isMap) {
            var i=0;
            while ( i <msgAlphabet.length) {
                if (1<i<msgAlphabet.length-1 && msgAlphabet[i] === 'ㅇ') {
                    // 자음+모음+ㅇ+모음
                    if (Utils.korConsonants.indexOf(msgAlphabet[i-2])!== -1 && Utils.korVowels.indexOf(msgAlphabet[i-1])!== -1 && Utils.korVowels.indexOf(msgAlphabet[i+1])!== -1
                    ) {
                        // 자음+ㅡ+ㅇ+모음 (ㅣ 제외)
                        if (msgAlphabet[i-1] === 'ㅡ' && msgAlphabet[i+1]!== 'ㅣ') msgAlphabet.splice(i-1, 2);
                        // 자음+ㅣ+ㅇ+모음
                        else if (msgAlphabet[i-1] === 'ㅣ' && Object.keys(yVowel).indexOf(msgAlphabet[i+1])!==-1) {
                            msgAlphabet.splice(i-1, 3, yVowel[msgAlphabet[i+1]]);
                        }
                        // 자음+모음+ㅇ+중복모음
                        else if( Object.keys(vowelLast).indexOf(msgAlphabet[i-1])!== -1 && vowelLast[msgAlphabet[i-1]].indexOf(msgAlphabet[i+1])!==-1 ) {
                            msgAlphabet.splice(i, 2);
                        }
                        // 자음+모음+ㅇ+모음, 복모음 형성 가능한 조합
                        else if (Utils.isDouble(msgAlphabet[i-1], msgAlphabet[i+1], vowelPair) ) {
                            // 일부 복모음과 일치하지 않는 부분은 복모음 조합에 맞게 변형하기
                            if (msgAlphabet[i-1] === 'ㅗ' && msgAlphabet[i+1] === 'ㅓ') msgAlphabet[i-1] = 'ㅜ';
                            else if (msgAlphabet[i-1] === 'ㅗ' && msgAlphabet[i+1] === 'ㅔ') msgAlphabet[i+1] = 'ㅣ';
                            else if (msgAlphabet[i-1] === 'ㅜ' && msgAlphabet[i+1] === 'ㅏ') msgAlphabet[i-1] = 'ㅗ';
                            else if (msgAlphabet[i-1] === 'ㅜ' && msgAlphabet[i+1] === 'ㅐ') msgAlphabet[i-1] = 'ㅔ';

                            msgAlphabet.splice(i, 1);
                        }

                        else i++; // 다음으로 넘기기

                    }
                    // 자음+복모음+ㅇ+뒤모음과 동일함. -> 죄이
                        else if (i>2 && Utils.korConsonants.indexOf(msgAlphabet[i-3])!== -1 && Utils.korVowels.indexOf(msgAlphabet[i-1])!== -1 &&
                        (Utils.isDouble(msgAlphabet[i-2], msgAlphabet[i-1]) === true && !(msgAlphabet[i-2]==='ㅗ' && msgAlphabet[i-1]==='ㅣ') ) && msgAlphabet[i-1] == msgAlphabet[i+1]
                    ) {
                            msgAlphabet.splice(i,2);
                    }
                    // 자음+ㅇ+모음 -> ㅇ만 지우기. 복자음일 때도 해결 가능. 단 ㅇ일 때는 예외로
                    else if (Utils.korConsonants.indexOf(msgAlphabet[i-1])!== -1 && msgAlphabet[i-1] !=='ㅇ' && Utils.korVowels.indexOf(msgAlphabet[i+1])!== -1
                    ) msgAlphabet.splice(i, 1);

                    else i++; // 다음으로 넘기기
                }
                // 다른 자음일 때는
                else if (1<i<msgAlphabet.length-1 && Utils.korConsonants.indexOf(msgAlphabet[i]) !== -1) {
                    // 중복자음시 앞 자음 제거. 그 앞에 모음 오는지, 자음 오는지는 상관 없음.
                    if (Utils.korConsonants.indexOf(msgAlphabet[i-1])!== -1 && msgAlphabet[i-1] === msgAlphabet[i] && Utils.korVowels.indexOf(msgAlphabet[i+1])!== -1
                    ) msgAlphabet.splice(i-1, 1);
                    // 단순화 작업 추가.
                    else if (simplify && Object.keys(varAlphabet).indexOf(msgAlphabet[i])!== -1) {
                        msgAlphabet[i] = varAlphabet[msgAlphabet[i]];
                        i++;
                    }
                    else i++;
                }

                // 모음일 때는 앞의 모음과 복모음을 형성하지 못하는 경우 모음들만 제거하기  - 일단 dropIung은 완전한 한글에서만 실험할 것.
                else if (Utils.korVowels.indexOf(msgAlphabet[i])!== -1) {
                    if (simplify && Object.keys(varAlphabet).indexOf(msgAlphabet[i])!== -1) {
                        msgAlphabet[i] = varAlphabet[msgAlphabet[i]];
                        i++;
                    }
                //     if ( !Utils.isDouble(msgAlphabet[i-1], msgAlphabet[i]) ) {
                //         msgAlphabet.splice(i,1);
                //     }
                    else i++;
                }
                else i++;
            }
            return Hangul.assemble(msgAlphabet);

        }
        // isMap으로 정의할 경우 음절 단위로 우선 쪼갠 뒤 dropIung 수행
        else {
            for (var i = 0; i < msgAlphabet.length; i++) {
                if (i === 0) {
                    singleSyllable.push(msgAlphabet[i]);
                } else {
                    // 자음 ㅇ
                    if (msgAlphabet[i] === 'ㅇ') {
                        // 앞에 모음이 오면서 (맨 마지막이거나 뒤에 자음이 오면) 앞 글자에 붙여쓰기
                        if (Utils.korVowels.indexOf(msgAlphabet[i - 1]) !== -1
                            && (i === msgAlphabet.length - 1 || Utils.korConsonants.indexOf(msgAlphabet[i + 1]) !== -1)) {
                            singleSyllable.push(msgAlphabet[i]);
                            // console.log('case 10');
                        }
                            // 나머지 - 앞 자음 or 뒷 모음.
                        // 자음+ㅡ 뒤에 오면 앞 글자에 붙임. 모음이 와도 무관. 브아 -> 바
                        else if (i > 1 && Utils.korConsonants.indexOf(msgAlphabet[i - 2]) !== -1 && msgAlphabet[i - 1] === 'ㅡ') {
                            singleSyllable.push(msgAlphabet[i]);
                            // console.log('case 11');
                        }
                        // 자음+모음+ㅇ+동모음 일시 ㅇ을 앞글자에 붙임. 보오 -> 보
                        else if (1 < i < msgAlphabet.length - 1 && Utils.korConsonants.indexOf(msgAlphabet[i - 2]) !== -1 &&
                            Object.keys(vowelLast).indexOf(msgAlphabet[i - 1]) !== -1 && vowelLast[msgAlphabet[i - 1]].indexOf(msgAlphabet[i + 1]) !== -1) {
                            singleSyllable.push(msgAlphabet[i]);
                            // console.log('case 12');
                        }
                        // 자음+ㅣ+ㅇ+단모음 -> 자음+복모음 처리를 위해 ㅇ을 앞에 붙임.
                        else if (1 < i < msgAlphabet.length - 1 && Utils.korConsonants.indexOf(msgAlphabet[i - 2]) !== -1 && msgAlphabet[i - 1] === 'ㅣ' && Object.keys(yVowel).indexOf(msgAlphabet[i + 1]) !== -1) {
                            singleSyllable.push(msgAlphabet[i]);
                            // console.log('case 13');
                        }
                        // 자음 + 모음 + ㅇ + 모음에서 앞모음+뒷모음이 복모음을 형성할 수 있는 경우 ㅇ을 앞에 붙임
                        else if (1 < i < msgAlphabet.length - 1 && Utils.korVowels.indexOf(msgAlphabet[i - 1]) !== -1 && Utils.korVowels.indexOf(msgAlphabet[i + 1]) !== -1 &&
                            Utils.korConsonants.indexOf(msgAlphabet[i - 2]) !== -1 ) {
                            vowelPair.forEach(x => {
                                if (Utils.objectEqual([msgAlphabet[i - 1], msgAlphabet[i + 1]], x)) {
                                    singleSyllable.push(msgAlphabet[i]);
                                    // console.log('case 14')
                                }
                            })
                        }
                        // 복모음+ㅇ+모음에서 뒷모음이 복모음과 겹침. 궈어 -> 궈
                        else if (2 < i < msgAlphabet.length - 1 && Utils.korVowels.indexOf(msgAlphabet[i - 1]) !== -1 && msgAlphabet[i + 1] === msgAlphabet[i -1] &&
                            Utils.korConsonants.indexOf(msgAlphabet[i - 3]) !== -1 &&  Utils.isDouble(msgAlphabet[i-2], msgAlphabet[i-1]) === true && !(msgAlphabet[i-2]==='ㅗ' && msgAlphabet[i-1]==='ㅣ') ) {
                            singleSyllable.push(msgAlphabet[i]);
                        }
                        // 앞에 ㅇ 아닌 자음이 오는 경우 -> 앞자음에 붙인다.
                        else if (1 < i < msgAlphabet.length - 1 && Utils.korConsonants.indexOf(msgAlphabet[i - 1]) !== -1 && msgAlphabet[i - 1] !== 'ㅇ' &&
                            Utils.korVowels.indexOf(msgAlphabet[i + 1]) !== -1) {
                            singleSyllable.push(msgAlphabet[i]);
                        }

                        // 나머지 케이스는 ㅇ으로 시작하는 글자 분리
                        else {
                            // console.log('singleOrigin:::1', singleOrigin)
                            divideSyllable.push(singleSyllable);
                            singleSyllable = [msgAlphabet[i]];
                            // console.log('case 18');
                        }
                    }

                    // ㅇ 아닌 자음일 때
                    else if (Utils.korConsonants.indexOf(msgAlphabet[i]) !== -1 && msgAlphabet[i] !== 'ㅇ') {
                        // 앞에 모음이면서 (마지막 글자 or 뒤에 ㅇ 아닌 자음 옴 or 뒤 ㅇ이지만 또 자음이 온다)
                        if (Utils.korVowels.indexOf(msgAlphabet[i - 1]) !== -1
                            && (i === msgAlphabet.length - 1 || (Utils.korConsonants.indexOf(msgAlphabet[i + 1]) !== -1 && msgAlphabet[i + 1] !== 'ㅇ') || (msgAlphabet[i + 1] === 'ㅇ' && Utils.korConsonants.indexOf(msgAlphabet[i + 2]) !== -1))) {
                            singleSyllable.push(msgAlphabet[i]);
                            // console.log('case 20');
                        }
                        // 겹받침 케이스 분별. 이 때 ㅇ 아닌 자음이 바로 뒤에 와야 함.
                        else if (Utils.korVowels.indexOf(msgAlphabet[i - 2]) !== -1
                            && (i === msgAlphabet.length - 1 || (Utils.korConsonants.indexOf(msgAlphabet[i + 1]) !== -1 && msgAlphabet[i + 1] !== 'ㅇ') || ((msgAlphabet[i + 1] === 'ㅇ' || msgAlphabet[i + 1] === msgAlphabet[i]) && Utils.korConsonants.indexOf(msgAlphabet[i + 2]) !== -1))
                            && Utils.doubleConsonant.indexOf(msgAlphabet.slice(i - 1, i + 1)) !== -1) {
                            singleSyllable.push(msgAlphabet[i]);
                            // console.log('case 21');
                        }
                        // 나머지 - 뒷글자로 넘기기
                        else {
                            // console.log('singleOrigin:::2', singleOrigin)
                            divideSyllable.push(singleSyllable);
                            singleSyllable = [msgAlphabet[i]];
                            // console.log('case 28');
                        }

                    }

                    // 자음 바로 뒤 모음 - 앞글자에 붙인다.
                    else if (Utils.korVowels.indexOf(msgAlphabet[i]) !== -1 && Utils.korConsonants.indexOf(msgAlphabet[i - 1]) !== -1) {
                        singleSyllable.push(msgAlphabet[i]);
                        // console.log('case 30');
                    }
                    // 겹모음 - 앞글자에 붙인다.
                    else if (i > 1 && Utils.korConsonants.indexOf(msgAlphabet[i - 2]) !== -1 && Utils.korVowels.indexOf(msgAlphabet[i - 1]) !== -1) {
                        var tmp = true;
                        for (var lix of Utils.doubleVowel) {
                            if (Utils.objectEqual(lix, msgAlphabet.slice(i - 1, i + 1))) {
                                singleSyllable.push(msgAlphabet[i]);
                                // console.log('case 40');
                                tmp = false;
                                break;
                            }
                        }
                        if (tmp) {
                            // console.log('singleOrigin:::3', singleOrigin)
                            divideSyllable.push(singleSyllable);
                            singleSyllable = [msgAlphabet[i]];
                            // console.log('case 41');
                        }
                    }
                    // 나머지 케이스
                    else {
                        // console.log('singleOrigin:::4', singleOrigin)
                        divideSyllable.push(singleSyllable);
                        singleSyllable = [msgAlphabet[i]];
                        // console.log('case 50');
                    }

                }

            }
            //마지막 문자 밀어넣기
            // console.log('singleOrigin:::', singleOrigin);
            divideSyllable.push(singleSyllable);

            let ind =0;
            for (i =0; i<divideSyllable.length; i++) {
                let cnt = 0;
                for (var letter of Hangul.assemble(divideSyllable[i])) { // 한글 숫자 조합. Hangul.assemble로 조합.
                    if (/[가-힣]/.test(letter)) cnt++;
                }
                if (res[Hangul.assemble(divideSyllable[i])]) {
                    res[Hangul.assemble(divideSyllable[i])]["index"].push(ind);
                }
                else {
                    res[Hangul.assemble(divideSyllable[i])] = {
                        value: Utils.dropIung(Hangul.assemble(divideSyllable[i]), false, simplify),
                        index: [ind]
                    }
                }
                ind += cnt;

            }

            // if (isMap) console.log(origin);
            return res;
        }


    },

    //ㅄ받침, ㄻ받침, ㄺ받침 과잉으로 사용하는 메시지 검출.
    tooMuchDoubleEnd: (msg) => {
        const newMsg = Hangul.disassemble(msg, true);
        let cnt = 0;
        let contCnt =0; // 연속
        let pos = []; // 위치 찾기
        for (var i in newMsg) {
            // ㅄ, ㄺ, ㄻ 받침이 있는 문자 잡아내기
            if ((newMsg[i][2]==='ㅂ' && newMsg[i][3]==='ㅅ') ||
                (newMsg[i][2]==='ㄹ' && newMsg[i][3]==='ㄱ') ||
                (newMsg[i][2]==='ㄹ' && newMsg[i][3]==='ㅁ') ) {
                cnt++;
                contCnt++;
                pos.push(i);
            }
            else {
                contCnt =0;
            }
        }
        if (contCnt>2 && (newMsg.length/cnt)<=3) {
            let txt =[]
            for (var i in newMsg) {
                if (pos.indexOf(i)>-1)
                    txt.push(Hangul.assemble(newMsg[i]));
            }
            return {val:true, pos:pos, txt:txt};
        }
        else {
            return {val:false, pos:[], txt:[]};
        }
    }

}

class Tetrapod {


    // badWord, 정상단어, softSearchWord 불러오기
    static load(inputBadwords, inputDictionary, inputSoftSearchWords, disableAutoParse) {
        badWords = inputBadwords
        normalWords = inputDictionary
        softSearchWords = inputSoftSearchWords

        if (disableAutoParse != false) {
            Tetrapod.parse(badWords)
            Tetrapod.mapping()
        }
    }

    // enToKo test
    static enToKo (msg, isMap) {
        return Utils.enToKo(msg, isMap);
    }

    // alphabetToKotest
    static alphabetToKo(msg, isMap) {
        return Utils.alphabetToKo(msg, isMap);
    }

    // dropiung Test
    static dropIung(msg, isMap) {
        if (/[가-힣|ㅏ-ㅣ|ㄱ-ㅎ \s]/.test(msg)) {
            return Utils.dropIung(msg, isMap);
        }
    }

    // tooMuchDoubleEnd test
    static tooMuchDoubleEnd(msg) {
        if (/[가-힣\s]/.test(msg)) {
            return Utils.tooMuchDoubleEnd(msg);
        }
    }

    // 비속어 사전 파일 로딩함.
    static loadFile(badWordsPath, normalWordsPath, softSearchWordsPath) {
        let data = {
            badWords: require(badWordsPath).badwords,
            normalWords: require(normalWordsPath).dictionary,
            softSearchWords: require(softSearchWordsPath).badwords
        }
        Tetrapod.load(data.badWords, data.normalWords, data.softSearchWords)
    }

    // 기본 비속어 사전의 목록 로드
    static defaultLoad() {
        let data = Tetrapod.getDefaultData()
        Tetrapod.load(data.badWords, data.normalWords, data.softSearchWords)
    }

    // 리스트 형식으로 된 BadWord 리스트를 1차원 배열로 풀어쓰기
    static parse() {
        parsedBadWords = []
        let parsedSoftSearchWords = []
        for (let index in badWords) {
            if (!Utils.objectIn(Utils.wordToArray(badWords[index]), parsedBadWords))
                parsedBadWords.push(Utils.wordToArray(badWords[index]))
        }
    }

    static parseMap(map) {
        return Utils.parseMap(map);
    }

    // 목록을 맵으로 지정.
    static mapping() {
        badWordsMap = {}
        normalWordsMap = {}
        softSearchWordsMap = {}

        for (let index in badWords)
            badWordsMap[badWords[index]] = true
        for (let index in normalWords)
            normalWordsMap[normalWords[index]] = true
        for (let index in softSearchWords)
            softSearchWordsMap[softSearchWords[index]] = true
    }

    static sortBadWordsMap() {
        badWordsMap = Utils.sortMap(badWordsMap)
        badWords = []
        for (var index in badWordsMap) badWords.push(index)
    }

    static sortNormalWordsMap() {
        normalWordsMap = Utils.sortMap(normalWordsMap)
        normalWords = []
        for (var index in normalWordsMap) normalWords.push(index)
    }

    static sortSoftSearchWordsMap() {
        softSearchWordsMap = Utils.sortMap(softSearchWordsMap)
        softSearchWords = []
        for (var index in softSearchWordsMap) softSearchWords.push(index)
    }

    static sortAll() {
        Tetrapod.sortBadWordsMap()
        Tetrapod.sortNormalWordsMap()
        Tetrapod.sortSoftSearchWordsMap()
    }

    // 기본 데이터 불러오기
    static getDefaultData() {
        return {
            badWords: Tetrapod.recursiveList(require('./resource/dictionary/bad-words.json').badwords),
            normalWords: require('./resource/dictionary/normal-words.json').dictionary,
            softSearchWords: Tetrapod.recursiveList(require('./resource/dictionary/soft-search-words.json').badwords)
        }
    }

    // 사용자 정의 데이터 불러오기
    static getLoadedData() {
        return {
            badWords: badwords,
            normalWords: normalWords,
            softSearchWords: softSearchWords
        }
    }
    static objectInclude(inc, exc, order=false) {
        return Utils.objectInclude(inc, exc, order)
    }

    /*
    static saveAllData(badWordsPath, normalWordsPath, softSearchWordsPath, isAsync) {
        Tetrapod.saveBadWordsData(badWordsPath, isAsync)
        Tetrapod.saveNormalWordsData(normalWordsPath, isAsync)
        Tetrapod.saveSoftSearchWordsData(softSearchWordsPath, isAsync)
    }

    static saveBadWordsData(path, isAsync) {
        Tetrapod.sortBadWordsMap()

        let data = JSON.stringify({
            badwords: badWords
        }, null, 4)

        (isAsync === true) ? fs.writeFile(path, data) : fs.writeFileSync(path, data)
    }

    static saveNormalWordsData(path, isAsync) {
        Tetrapod.sortNormalWordsMap()

        let data = JSON.stringify({
            dictionary: normalWords
        }, null, 4)

        (isAsync === true) ? fs.writeFile(path, data) : fs.writeFileSync(path, data)
    }

    static saveSoftSearchWordsData(path, isAsync) {
        Tetrapod.sortSoftSearchWordsMap()

        let data = JSON.stringify({
            badwords: softSearchWords
        }, null, 4)

        (isAsync === true) ? fs.writeFile(path, data) : fs.writeFileSync(path, data)
    }
    */

    // 메시지에 비속어가 들어갔는지 검사
    static isBad(message, includeSoft=false) {
        if (includeSoft === true)
            return (Tetrapod.find(message, false).totalResult.length != 0 ||
                Tetrapod.find(message, false).softResult.length != 0 ||
                Tetrapod.find(message, false).endResult.length != 0
            );
        else return Tetrapod.find(message, false).totalResult.length != 0;
    }

    // 메시지에 비속어가 몇 개 있는지 검사.
    static countBad(message, isStrong=false) {

        if (isStrong) {
            let searchResult = Tetrapod.find(message, true, 0, false, true);
            let bad = 0;
            let soft = 0;
            for (var x of searchResult) {
                bad += x.totalResult.positions.length;
                soft += x.softResult.positions.length;
            }
            return {bad: bad, soft:soft, end:searchResult.endResult.length};
        }
        else {
            return {
                bad: Tetrapod.find(message, true, 0, false).totalResult.length,
                soft: Tetrapod.find(message, true, 0, false).softResult.length,
                end: Tetrapod.find(message, true, 0, false).endResult.length,
            };
        }

    }

    // 메시지에 비속어 찾기 - 배열로 처리함.
    static find(message, needMultipleCheck=false, splitCheck=15, needEnToKo=false, isStrong=false) {
        // 욕설 결과 집합
        let totalResult = []
        let softResult = []
        let tooMuchEnds = []

        //보조 메시지
        let message2Map = {};
        let message2 = ''
        let message3Map = {}
        let message3 = ''
        let message4Map = {}
        let message4 = ''
        let message5Map = {}
        let message5 = ''

        if (needEnToKo === true) { // 만약 한영 검사도 필요하면...
            message2Map = Utils.enToKo(message, true);
            message2 = Utils.enToKo(message, false); // 2차 점검용
        }
        if (isStrong === true) { // 문자열을 악용한 것까지 잡아보자.
            message3Map = Utils.alphabetToKo(message, true);
            message3 = Utils.alphabetToKo(message, false);
            message4Map = Utils.dropIung(message3, true, false);
            message4 = Utils.dropIung(message3, false, false);
            message5Map = Utils.dropIung(message3, true, true);
            message5 = Utils.dropIung(message3, false, true);
        }

        if (splitCheck === undefined) splitCheck = 15
        var messages = (splitCheck != 0) ? Utils.lengthSplit(message, splitCheck) : [message];

        // 일단 한영전환은 나누어서 검사하는 기능 제거. 추후 구현 예정.
        // var messages2 = (splitCheck != 0) ? Utils.lengthSplit(message2, splitCheck) : [message2];

        // 정밀 검사 때에는 메시지 나누어서 검사하지 말자.
        // if (message3.length>0) var messages3 =  [message3]
        // if (message4.length>0) var messages4 =  [message4]
        // if (message5.length>0) var messages5 =  [message5]


        // 메시지 나누어서 확인하기.
        for (var index1 = 0; index1 <= messages.length - 1; index1++) {
            let currentResult = this.nativeFind(messages[index1], needMultipleCheck)
            tooMuchEnds.push(currentResult.tooMuchDoubleEnd);

            // 중복체크가 포함될 때에는 각 단어를 모두 추가해준다.
            if (needMultipleCheck) {
                for (var index2 = 0; index2 <= currentResult.founded.length - 1; index2++) {
                    if (currentResult.founded !== [] && totalResult.map(v=>v.value).indexOf(currentResult.founded[index2])===-1)
                        totalResult = [...totalResult, {value:currentResult.founded[index2], positions:currentResult.positions[index2]}];
                }
                for (index2 = 0; index2 <= currentResult.softSearchFounded.length - 1; index2++) {
                    if (currentResult.softSearchFounded !== [] && softResult.map(v=>v.value).indexOf(currentResult.softSearchFounded[index2])===-1)
                        softResult = [...softResult, {value:currentResult.softSearchFounded[index2], positions:currentResult.softSearchPositions[index2]}];
                }
            } else {
                if (currentResult !== null){
                    totalResult = [...totalResult, currentResult.founded];
                    softResult = [...softResult, currentResult.softSearchFounded];
                }
            }
        }
        if (totalResult.length ===0 && needEnToKo === true) {
            let currentResult = this.nativeFind(message2Map, needMultipleCheck, true);
            tooMuchEnds.push(currentResult.tooMuchDoubleEnd);

            if (needMultipleCheck) {
                for (var index = 0; index <= currentResult.founded.length - 1; index++) {
                    if (currentResult.founded !== [] && totalResult.map(v=>v.value).indexOf(currentResult.founded[index])===-1)
                        totalResult = [...totalResult, {value:currentResult.founded[index], positions:currentResult.positions[index]}  ];
                }
                for (index = 0; index <= currentResult2.softSearchFounded.length - 1; index++) {
                    if (currentResult.softSearchFounded !== [] && softResult.map(v=>v.value).indexOf(currentResult.softSearchFounded[index])===-1)
                        softResult = [...softResult, {value:currentResult.softSearchFounded[index], positions:currentResult.softSearchPositions[index]}];
                }
            } else {
                if (currentResult !== null){
                    totalResult = [...totalResult, currentResult.founded];
                    softResult = [...softResult, currentResult.softSearchFounded];
                }
            }

        }
        if (isStrong === true) {
            let currentResult = this.nativeFind(message3Map, needMultipleCheck, true);
            let currentResult2 = this.nativeFind(message4Map, needMultipleCheck, true);
            tooMuchEnds.push(currentResult.tooMuchDoubleEnd);

            if (needMultipleCheck) {
                for (var index =0; index<currentResult.founded.length; index++) {
                    if (currentResult.founded !==[] && totalResult.map(v=>v.value).indexOf(currentResult.founded[index]) ===-1)
                        totalResult = [...totalResult, {value:currentResult.founded[index], positions:currentResult.positions[index]}];
                }
                for (index =0; index< currentResult.softSearchFounded.length; index++) {
                    if (currentResult.softSearchFounded!==[] && softResult.map(v=>v.value).indexOf(currentResult.softSearchFounded[index]===-1)) {
                        softResult = [...softResult, {value:currentResult.softSearchFounded[index], positions: currentResult.softSearchPositions[index]}]
                    }
                }
                for (index =0; index<currentResult2.founded.length; index++) {
                    if (currentResult2.founded !==[] && totalResult.map(v=>v.value).indexOf(currentResult2.founded[index]) ===-1)
                        totalResult = [...totalResult, {value:currentResult2.founded[index], positions:currentResult2.positions[index]}];
                }
                for (index =0; index< currentResult2.softSearchFounded.length; index++) {
                    if (currentResult2.softSearchFounded!==[] && softResult.map(v=>v.value).indexOf(currentResult2.softSearchFounded[index]===-1)) {
                        softResult = [...softResult, {value:currentResult2.softSearchFounded[index], positions: currentResult2.softSearchPositions[index]}]
                    }
                }

            }
            else {
                if (currentResult !== null){
                    totalResult = [...totalResult, currentResult.founded];
                    softResult = [...softResult, currentResult.softSearchFounded];
                }
                if (currentResult2 !== null){
                    totalResult = [...totalResult, currentResult2.founded];
                    softResult = [...softResult, currentResult2.softSearchFounded];
                }

            }

        }
        // 결과값 - 보기 좋게 출력.
        let endResult = [];

        for (let tooMuchEnd of tooMuchEnds) {
            let posN = tooMuchEnd.pos.map(val=>parseInt(val));
            let endTxt = tooMuchEnd.txt;
            for (var i in posN) {
                if (endResult.length ==0 || posN[i]-posN[i-1]>1) {
                    endResult.push(endTxt[i]);
                }
                else {
                    endResult[endResult.length-1] += endTxt[i];
                }
            }
        }

        return {totalResult, softResult, endResult};
    }

    // 메시지의 비속어를 콘솔창으로 띄워서 찾기.
    static nativeFind(message, needMultipleCheck, isMap = false) {

        // let unsafeMessage = message.toLowerCase()
        let normalWordPositions = {}
        let foundedBadWords = [];
        let foundedBadOriginalWords = []; // isMap에서 original 단어
        let foundedBadWordPositions = []
        let foundedBadWordOriginalPositions = []; // isMap에서 original 단어 위치
        let foundedSoftSearchWords = []
        let foundedSoftSearchOriginalWords = [] // isMap에서 original Softsearch 단어
        let foundedSoftSearchWordPositions = []
        let foundedSoftSearchWordOriginalPositions = []; // isMap에서 original Softserach 단어 위치
        let parsedSoftSearchWords = [];
        for (let word of softSearchWords) {
            if (!Utils.objectIn(Utils.wordToArray(word), parsedSoftSearchWords))
                parsedSoftSearchWords.push(Utils.wordToArray(word));
        }
        let originalMessageList = [];
        let originalMessageSyllablePositions = []; // 원래 음가 위치

        // 정상단어를 배제합니다.
        /*
        for (let index in normalWords) {
            if (unsafeMessage.length == 0) break
            unsafeMessage = Utils.replaceAll(unsafeMessage, normalWords[index], '')
        }
        */

        // Map으로 주어지면 newMessage에 대해 찾는다.
        let originalMessage = "";
        let newMessage ="";
        if (isMap) {
            originalMessageList = message.messageList;
            console.log(originalMessageList);
            originalMessage = originalMessageList.join("");
            originalMessageSyllablePositions =  message.messageIndex;
            newMessage = message.parsedMessage.join("");
        }
        else {
            newMessage = message;
        }

        // 정상단어의 포지션을 찾습니다.
        for (let index in normalWords) {
            if (newMessage.length == 0) break
            let searchedPositions = Utils.getPositionAll(newMessage, normalWords[index])
            for(let searchedPosition of searchedPositions)
                if(searchedPosition !== -1)
                    normalWordPositions[searchedPosition] = true
        }
        // normalWordPositions 형식
        // {정상단어 포지션 번호:true} 형식.


        // 저속한 단어들을 한 단어식 순회합니다.
        for (let softSearchWord of Utils.removeMultiple(parsedSoftSearchWords)) {

            // 단순히 찾는 것으로 정보를 수집하는 것이 아닌 위치를 아예 수집해보자.
            // findCount 형태 : {바: [1,8], 보:[2,7,12]}등
            let findCount = {}
            // 저속한 단어 수집 형태. 이 경우는 [[1,2], [8,7]]로 수집된다.
            let softSearchWordPositions = []


            // 저속한 단어들을 한 단어씩
            // 순회하며 존재여부를 검사합니다.
            for (let character in softSearchWord) {

                let softSearchOneCharacter = String(character).toLowerCase();

                // 일단 저속한 단어의 리스트를 정의해서 수집한다.
                findCount[softSearchOneCharacter] = []

                // 저속한 단어의 글자위치를 수집합니다.

                // 메시지 글자를 모두 반복합니다.
                for (let index in newMessage) {

                    // 정상적인 단어의 글자일경우 검사하지 않습니다.
                    // 적발된 단어가 모두 정상포지션에 자리잡힌 경우 잡지 않는다.
                    if (typeof normalWordPositions[Number(index)] != 'undefined') continue

                    // 단어 한글자라도 들어가 있으면
                    // 찾은 글자를 기록합니다.
                    let unsafeOneCharacter = String(newMessage[index]).toLowerCase()
                    if (softSearchOneCharacter === unsafeOneCharacter) {
                        findCount[softSearchOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문단에서 전부 수집한다.
                    }
                }
            }


            // 단어 포지션 리스트
            let positionsList = Object.values(findCount)
            // 낱자 포지션 맵
            let possibleWordPositions = Utils.productList(positionsList);

            // softSearchWord의 원래 포지션 찾기
            let softSearchWordOriginalPositions = [];
            let originalSoftSearchWords = [];


            // 단어 포지션 리스트에서 for문을 돌려보자.
            for (let wordPosition of possibleWordPositions) {

                let tempSoftSearchWordPositions = [...wordPosition];

                // 넘어갈 필요가 있는지 확인해보기
                let isNeedToPass = false
                // 순서가 바뀌었는지도 체크해보자.
                let isShuffled = false

                // 포지션 체크. 단어에서 뒤에 올 글자가 앞에 올 글자보다 3글자 이상 앞에 오면 isNeedToPass를 띄운다.
                for (var pos =0; pos<wordPosition.length; pos++) {
                    for (var pos1 =0; pos1<pos; pos1++) {
                        if (wordPosition[pos1] - wordPosition[pos]<-3) {
                            isNeedToPass = true; break;
                        }
                    }
                }

                // 포지션을 순서대로 정렬했는데
                // 순서가 달라진다면 글자가 섞여있는 것으로 간주합니다.
                let sortedPosition = tempSoftSearchWordPositions.slice().sort((a, b) => a - b)
                if( !Utils.objectEqual(sortedPosition, tempSoftSearchWordPositions) ){
                    isShuffled = true
                    tempSoftSearchWordPositions = sortedPosition
                }


                // TODO
                // 발견된 각 문자 사이의 거리 및
                // 사람이 인식할 가능성 거리의 계산
                // (3글자가 각각 떨어져 있을 수도 있음)
                // 글자간 사이들을 순회하여서
                // 해당 비속어가 사람이 인식하지 못할 정도로
                // 퍼져있다거나 섞여있는지를 확인합니다.

                for(let diffRanges of Utils.grabCouple(tempSoftSearchWordPositions)){

                    // 글자간 사이에 있는 모든 글자를 순회합니다.
                    let diff = ''
                    for(let diffi = diffRanges[0]+1; diffi <= (diffRanges[1]-1); diffi++){
                        diff += newMessage[diffi]
                    }

                    if(isShuffled && !isNeedToPass){
                        // 뒤집힌 단어의 경우엔 자음과 모음이
                        // 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.
                        if(!Tetrapod.shuffledMessageFilter(diff, false, true))
                            isNeedToPass = true
                    }
                    else {
                        // 순서가 뒤집히지 않았을 때는 한글의 길이가 충분히 길거나 정상단어가 글자 사이에 쓰인 경우 비속어에서 배제합니다.
                        if (Tetrapod.shuffledMessageFilter(diff,true, true)>3) isNeedToPass = true;
                        else {
                            for (let index in normalWords) {
                                if (diff.length === 0) break
                                let diffSearchedPositions = Utils.getPositionAll(diff, normalWords[index])
                                if (diffSearchedPositions.length > 1) {
                                    isNeedToPass = true;
                                }
                            }
                        }
                    }

                }

                // 기존에 발견돤 단어와 낱자가 겹쳐도 pass
                for (let usedSoftSearchWordPositions of SoftSearchWordPositions) {
                    if (Utils.listIntersection(usedSoftSearchWordPositions, tempSoftSearchWordPositions).length > 0 ) {
                        isNeedToPass = true; break;
                    }
                }

                // 해당 저속한 표현을 발견은 하였지만,
                // 사람이 인지하지 못할 것으로 간주되는 경우
                // 해당 발견된 저속한 표현을 무시합니다.
                if(isNeedToPass) continue

                // 중복 비속어 체크하기.
                var tmpTF = true;
                for (let positions of foundedSoftSearchWordPositions) {
                    // 다른 비속어와 포지션이 일치할 때 강제 종료
                    for (let softSearchPosition of positions) {
                        if (Utils.objectInclude(tempSoftSearchWordPositions, softSearchPosition)) {
                            tmpTF =false; break;
                        }
                    }
                }


                // 만약 중첩 테스트 통과되면 softSearchWordPosition에 추가
                if (tmpTF) {
                    let tempSoftSearchWordOriginalPositions = [];
                    softSearchWordPositions.push(tempSoftSearchWordPositions);

                    if (isMap) {

                        for (var pos of tempSoftSearchWordPositions) {
                            for (var k =0; k <originalMessageList[Number(pos)].length; k++) {
                                tempSoftSearchWordOriginalPositions.push( originalMessageSyllablePositions[pos] + k);
                            }
                        }
                        // 원문 찾기
                        let originalSoftSearchWord = "";
                        for (var l of tempSoftSearchWordOriginalPositions) {
                            originalSoftSearchWord +=originalMessage[l];
                        }

                        // 나쁜단어 위치 삽입, 원운 위치,

                        softSearchWordOriginalPositions.push(tempSoftSearchWordOriginalPositions);
                        originalSoftSearchWords.push(originalSoftSearchWord);

                    }

                }

            }

            if (softSearchWordPositions.length>0) {

                if (isMap) {
                    console.log(`원문: ${originalMessage}`);
                    console.log(`변환된 문장: ${newMessage}`);
                    console.log(`발견된 저속한 표현: [${softSearchWord.join()}]`)
                    console.log(`발견된 저속한 표현 원문: [${originalSoftSearchWords}]`)
                    console.log(`발견된 저속한 표현 위치: [${softSearchWordPositions}]`)
                    console.log(`발견된 저속한 표현 원래 위치: [${softSearchWordOriginalPositions}]`)
                    foundedSoftSearchWords.push(softSearchWord.join(''))
                    foundedSoftSearchWordPositions.push(softSearchWordPositions)
                    foundedSoftSearchOriginalWords.push(originalSoftSearchWords);
                    foundedSoftSearchWordOriginalPositions.push(softSearchWordOriginalPositions);
                }
                else {
                    console.log(`원문: ${newMessage}`)
                    console.log(`발견된 저속한 표현: [${softSearchWord.join()}]`)
                    console.log(`발견된 저속한 표현 위치: [${softSearchWordPositions}]`)
                    foundedSoftSearchWords.push(softSearchWord.join(''))
                    foundedSoftSearchWordPositions.push(softSearchWordPositions)
                }

            }

            // 반복 줄이기 위해 강제 탈출.
            if (needMultipleCheck === false && foundedSoftSearchWords.length>0) break;

        }


        // 비속어 단어를 한 단어씩 순회합니다.
        for (let badWord of Utils.removeMultiple(parsedBadWords)) {

            // console.log("badWord", badWord)

            // 단순히 찾는 것으로 정보를 수집하는 것이 아닌 위치를 아예 수집해보자.
            // findCount 형태 : {시: [1,8], 발:[2,7,12]}등
            let findCount = {}
            // 나쁜 단어 수집 형태. 이 경우는 [[1,2], [8,7]]로 수집된다.
            let badWordPositions = []

            // 비속어 단어를 한글자씩
            // 순회하며 존재여부를 검사합니다.
            for (let character of badWord) {
                let badOneCharacter = String(character).toLowerCase()

                // 일단 비속어 단어의 리스트를 정의해서 수집한다.
                findCount[badOneCharacter] = []

                // 비속어 단어의 글자위치를 수집합니다.

                // 메시지 글자를 모두 반복합니다.
                for (let index in newMessage) {

                    // 정상적인 단어의 글자일경우 검사하지 않습니다.
                    if (typeof normalWordPositions[Number(index)] != 'undefined') continue

                    // 단어 한글자라도 들어가 있으면
                    // 찾은 글자를 기록합니다.
                    let unsafeOneCharacter = String(newMessage[index]).toLowerCase()
                    if (badOneCharacter == unsafeOneCharacter) {
                        findCount[badOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문단에서 전부 수집한다.
                        // badWordPositions.push(Number(index3))
                        //  break
                    }
                }
            }


            // 이제 badWord를 찾아보자. 어떻게? findCount에서...

            // let countLetter = []
            // for (let letter in findCount) {
            //     countLetter.push(findCount[letter].length);
            // }
            // // 비속어를 구성하는 단어글자 중 최소 글자 갯수
            // let minCount = Math.min(...countLetter)

            // 단어 포지션 리스트
            let positionsList = Object.values(findCount)
            // 낱자 포지션 맵
            let possibleWordPositions = Utils.productList(positionsList);

            // badWord의 원래 포지션 찾기
            let badWordOriginalPositions = [];
            let originalBadWords = [];
            // let tempBadWordPositions = []; // 임시 Bad Word Position. 여기에 대해서 수행한다.

            // j개수만큼 반복하기
            for (let wordPosition of possibleWordPositions) {

                // 단어 첫글자의 위치 잡기
                let initCharacterPosition = wordPosition[0];
                let tempBadWordPositions = [...wordPosition];

                // 넘어갈 필요가 있는지 확인해보기
                let isNeedToPass = false;
                // 순서가 바뀌었는지도 체크해보자.
                let isShuffled = false

                // 포지션 체크. 단어에서 뒤에 올 글자가 앞에 올 글자보다 3글자 이상 앞에 오면 isNeedToPass를 띄운다.
                for (var pos =0; pos<wordPosition.length; pos++) {
                    for (var pos1 =0; pos1<pos; pos1++) {
                        if (wordPosition[pos1] - wordPosition[pos]<-3) {
                            isNeedToPass = true; break;
                        }
                    }
                }

                // 포지션을 순서대로 정렬했는데
                // 순서가 달라진다면 글자가 섞여있는 것으로 간주합니다.
                let sortedPosition = tempBadWordPositions.slice().sort((a, b) => a - b)
                if( !Utils.objectEqual(sortedPosition, tempBadWordPositions) ){
                    isShuffled = true
                    tempBadWordPositions = sortedPosition
                }

                // TODO
                // 발견된 각 문자 사이의 거리 및
                // 사람이 인식할 가능성 거리의 계산

                // (3글자가 각각 떨어져 있을 수도 있음)


                // 글자간 사이들을 순회하여서
                // 해당 비속어가 사람이 인식하지 못할 정도로
                // 퍼져있다거나 섞여있는지를 확인합니다.

                for(let diffRanges of Utils.grabCouple(tempBadWordPositions)){

                    // 글자간 사이에 있는 모든 글자를 순회합니다.
                    let diff = ''
                    for(let diffi = diffRanges[0]+1; diffi <= (diffRanges[1]-1); diffi++){
                        diff += newMessage[diffi]
                    }

                    if(isShuffled & !isNeedToPass){
                        // 뒤집힌 단어의 경우엔 자음과 모음이
                        // 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.
                        if(!Tetrapod.shuffledMessageFilter(diff, false, true))
                            isNeedToPass = true
                    }
                    else {
                        // 순서가 뒤집히지 않았을 때는 한글의 길이가 충분히 길거나 정상단어가 글자 사이에 쓰인 경우 비속어에서 배제합니다.
                        if (Tetrapod.shuffledMessageFilter(diff,true, true)>3) isNeedToPass = true;
                        else {
                            for (let index in normalWords) {
                                if (diff.length === 0) break
                                let diffSearchedPositions = Utils.getPositionAll(diff, normalWords[index])
                                if (diffSearchedPositions.length > 1) {
                                    isNeedToPass = true;
                                }
                            }
                        }
                    }

                }

                // 기존에 발견돤 단어와 낱자가 겹쳐도 pass
                for (let usedBadWordPositions of badWordPositions) {
                    if (Utils.listIntersection(usedBadWordPositions, tempBadWordPositions).length > 0 ) {
                        isNeedToPass = true; break;
                    }
                }

                // 해당 비속어를 발견은 하였지만,
                // 사람이 인지하지 못할 것으로 간주되는 경우
                // 해당 발견된 비속어를 무시합니다.
                if(isNeedToPass) continue

                // 중복 비속어 체크하기.
                var tmpTF = true;
                for (let positions of foundedBadWordPositions) {
                    // 다른 비속어와 포지션이 일치할 때 강제 종료
                    for (let badPosition of positions) {
                        if (Utils.objectInclude(tempBadWordPositions, badPosition)) {
                            tmpTF =false; break;
                        }
                    }
                }

                // 저속한 표현과 중복되는지 확인해보자.
                for (let positions of foundedSoftSearchWordPositions) {

                    for (let softSearchPosition of positions) {

                        // 또 저속한 표현과 포지션이 일치할 때는 거짓으로
                        if (Utils.objectEqual(tempBadWordPositions, softSearchPosition)) {
                            tmpTF =false;
                        }
                        // posix 최댓값이나 최솟값이 비속어 표현 사이에 끼어버린 경우 - 아예 비속어로 합치기
                        if (Math.min(...tempBadWordPositions) <= Math.min(...softSearchPosition) <= Math.max(...tempBadWordPositions) ) {
                            tmpTF = true;
                            badWord = [...badWord, ...foundedSoftSearchWords[foundedSoftSearchWordPositions.indexOf(positions)] ]
                            tempBadWordPositions = [...tempBadWordPositions, ...softSearchPosition]
                        }
                        else if (Math.min(...tempBadWordPositions) <= Math.max(...softSearchPosition) <= Math.max(...tempBadWordPositions) ) {
                            tmpTF = true;
                            badWord = [...foundedSoftSearchWords[foundedSoftSearchWordPositions.indexOf(positions)], ...badWord];
                            badWordPositions = [...softSearchPosition, ...tempBadWordPositions ];
                        }
                        // 만약 비속어와 저속한 표현 사이에 숫자, 알파벳, 공백밖에 없으면 비속어로 합치기
                        else if  ( Math.max(...tempBadWordPositions) < Math.min(...softSearchPosition ) ) {
                            let inter0 = Math.max(...tempBadWordPositions);
                            let inter1 = Math.min(...softSearchPosition);
                            if (newMessage.slice(inter0 + 1, inter1).match(/[0-9A-Za-z\s~!@#$%^&*()_\-+\\|\[\]{};:'"<,>.?/]*/) ) {
                                tmpTF = true;
                                badWord = [...badWord, ...foundedSoftSearchWords[foundedSoftSearchWordPositions.indexOf(positions)]];
                                tempBadWordPositions = [...tempBadWordPositions, ...softSearchPosition];
                            }
                        }
                        else if  ( Math.max(...softSearchPosition) < Math.min(...tempBadWordPositions) ) {
                            let inter0 = Math.max(...softSearchPosition);
                            let inter1 = Math.min(...tempBadWordPositions);
                            if (newMessage.slice(inter0+1, inter1).match(/[0-9A-Za-z\s~!@#$%^&*()_\-+\\|\[\]{};:'"<,>.?/]*/) ) {
                                tmpTF = true;
                                badWord = [...foundedSoftSearchWords[foundedSoftSearchWordPositions.indexOf(positions)], ...badWord];
                                tempBadWordPositions = [...softSearchPosition, ...tempBadWordPositions];
                            }
                        }

                    }

                }

                // 만약 중첩 테스트 통과되면 badWordPosition에 추가
                if (tmpTF) {
                    let tempBadWordOriginalPositions = [];

                    // 나쁜단어 위치 삽입, 원운 위치,
                    badWordPositions.push(tempBadWordPositions);
                    // map일 때는 메시지 더 찾기
                    if (isMap) {

                        for (var pos of tempBadWordPositions) {
                            for (var j =0; j <originalMessageList[Number(pos)].length; j++) {
                                tempBadWordOriginalPositions.push( originalMessageSyllablePositions[pos] + j);
                            }
                        }
                        // 원문 찾기
                        let originalBadWord = "";
                        for (var k of tempBadWordOriginalPositions) {
                            originalBadWord +=originalMessage[k];
                        }
                        badWordOriginalPositions.push(tempBadWordOriginalPositions);
                        originalBadWords.push(originalBadWord);

                    }

                }

            }

            if (badWordPositions.length>0) {

                if (isMap) {
                    console.log(`원문: ${originalMessage}`);
                    console.log(`변환된 문장: ${newMessage}`);
                    console.log(`발견된 비속어: [${badWord.join()}]`)
                    console.log(`발견된 비속어 원문: [${originalBadWords}]`)
                    console.log(`발견된 비속어 위치: [${badWordPositions}]`)
                    console.log(`발견된 비속어 원래 위치: [${badWordOriginalPositions}]`)
                    foundedBadWords.push(badWord.join(''))
                    foundedBadWordPositions.push(badWordPositions)
                    foundedBadOriginalWords.push(originalBadWords);
                    foundedBadWordOriginalPositions.push(badWordOriginalPositions);
                }
                else {
                    console.log(`원문: ${newMessage}`)
                    console.log(`발견된 비속어: [${badWord.join()}]`)
                    console.log(`발견된 비속어 위치: [${badWordPositions}]`)
                    foundedBadWords.push(badWord.join(''))
                    foundedBadWordPositions.push(badWordPositions)
                }

            }
            // 반복 줄이기 위해 강제 탈출.
            if (needMultipleCheck === false && foundedBadWords.length>0) break;
        }

        //부적절하게 겹받침 많이 사용했는지 여부 확인하기

        let tooMuchDouble ={val:false, pos:[], txt:[]};

        tooMuchDouble = {
                val: tooMuchDouble.val || Utils.tooMuchDoubleEnd(newMessage).val,
                pos: [...tooMuchDouble.pos, ...Utils.tooMuchDoubleEnd(newMessage).pos],
                txt: [...tooMuchDouble.txt, ...Utils.tooMuchDoubleEnd(newMessage).txt]
            }


            let isMapAdded = {};
            if (isMap) {
                isMapAdded = {
                    originalFounded: needMultipleCheck ? foundedBadOriginalWords : foundedBadOriginalWords.slice(0).slice(0),
                    originalPositions: needMultipleCheck ? foundedBadWordOriginalPositions : foundedBadWordOriginalPositions.slice(0).slice(0),
                    originalSoftSearchFounded : needMultipleCheck ? foundedSoftSearchOriginalWords : foundedSoftSearchOriginalWords.slice(0).slice(0),
                    originalSoftSearchPositions : needMultipleCheck ? foundedSoftSearchWordOriginalPositions : foundedSoftSearchWordOriginalPositions.slice(0).slice(0)
                };
            }

        // 결과 출력
        return {
            founded: needMultipleCheck? foundedBadWords : foundedBadWords.slice(0),
            positions: needMultipleCheck? foundedBadWordPositions : foundedBadWordPositions.slice(0).slice(0),
            softSearchFounded: needMultipleCheck? foundedSoftSearchWords: foundedSoftSearchWords.slice(0),
            softSearchPositions: needMultipleCheck? foundedSoftSearchWordPositions : foundedSoftSearchWordPositions.slice(0).slice(0),
            //부적절하게 겹자음 받침을 많이 사용한 단어 적발.
            tooMuchDoubleEnd: tooMuchDouble,
            ...isMapAdded
        }
    }

    // 비속어를 결자처리하는 함수
    static fix(message, replaceCharacter) {
        let fixedMessage = message
        let foundedBadWords = Tetrapod.find(message, true).totalResult;

        replaceCharacter = (replaceCharacter === undefined) ? '*' : replaceCharacter
        for (let index1 in foundedBadWords) {
            let foundedBadWord = Utils.wordToArray(foundedBadWords[index1])

            for (let index2 in foundedBadWord) {
                let foundedBadOneCharacter = foundedBadWord[index2]
                fixedMessage = Utils.replaceAll(fixedMessage, foundedBadOneCharacter, replaceCharacter)
            }
        }
        return fixedMessage
    }

    // 어떤 단어가 비속어 목록에 포함된지 체크
    static isExistNormalWord(word) {
        return (typeof(normalWordsMap[word]) != 'undefined')
    }

    // 정상 단어를 목록에 추가. - 배열
    static addNormalWords(words) {
        for (let wordsIndex in words) {
            let word = words[wordsIndex]
            if (word.length == 0) continue

            if (Tetrapod.isExistNormalWord(word)) continue

            normalWordsMap[word] = true
            normalWords.push(word)
        }
    }

    // 정상단어 삭제
    static deleteNormalWords(words) {
        for (let wordsIndex in words) {
            let word = words[wordsIndex]
            if (!Tetrapod.isExistNormalWord(word)) continue

            delete(normalWordsMap[word])

            for (let mapIndex = normalWords.length - 1; mapIndex >= 0; mapIndex--) {
                if (normalWords[mapIndex] === word) {
                    normalWords.splice(mapIndex, 1)
                    break
                }
            }
        }
    }


    static isExistBadWord(word) {
        return (typeof(badWordsMap[word]) != 'undefined')
    }

    static addBadWords(words) {
        for (let wordsIndex in words) {
            let word = words[wordsIndex]
            if (word.length == 0) continue

            if (Tetrapod.isExistBadWord(word)) continue

            badWordsMap[word] = true
            badWords.push(word)
        }
    }

    static deleteBadWords(words) {
        for (let wordsIndex in words) {
            let word = words[wordsIndex]
            if (!Tetrapod.isExistBadWord(word)) continue

            delete(badWordsMap[word])

            for (let mapIndex = badWords.length - 1; mapIndex >= 0; mapIndex--) {
                if (badWords[mapIndex] === word) {
                    badWords.splice(mapIndex, 1)
                    break
                }
            }
        }
    }

    static isExistSoftSearchWord(word) {
        return (typeof(softSearchWordsMap[word]) != 'undefined')
    }

    static addSoftSearchWords(words) {
        for (let wordsIndex in words) {
            let word = words[wordsIndex]
            if (word.length == 0) continue

            if (Tetrapod.isExistSoftSearchWord(word)) continue

            softSearchWordsMap[word] = true
            softSearchWords.push(word)
        }
    }

    static deleteSoftSearchWords(words) {
        for (let wordsIndex in words) {
            let word = words[wordsIndex]
            if (!Tetrapod.isExistSoftSearchWord(word)) continue

            delete(softSearchWordsMap[word])

            for (let mapIndex = softSearchWords.length - 1; mapIndex >= 0; mapIndex--) {
                if (softSearchWords[mapIndex] === word) {
                    softSearchWords.splice(mapIndex, 1)
                    break
                }
            }
        }
    }

    // 뒤집힌 단어의 경우엔 자음과 모음이
    // 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.-
    static shuffledMessageFilter(message, isCount = false, isChar = false) {
        // 우선 값 지정
        let cnt = 0;
        let tempCnt = 0;
        for(let char of message){
            if(Hangul.isComplete(char)) {
                cnt++;
                if (isChar && tempCnt>0) {cnt++; tempCnt = 0;}
            }
            else {
                // 영단어도 숫자도 센다.
                if (isChar) {
                    if (/^[A-Za-z]$/.test(char)) {tempCnt++;}
                    // 공백이 들어가면 단어로 추가
                    else if (char === " ") {cnt++; tempCnt = 0;}
                    // 특정문자는 없는 것처럼 처리함.
                    else if (/^[,\.!\?:;"'&\-()0-9]$/.test(char)) {
                        continue;
                    }
                    // 다른 문자는 그냥 영단어 숫자 초기화.
                    else { tempCnt = 0; }
                }
            }
        }
        return isCount?cnt:(cnt === 0);
    }

    /**
     * 비속어는 음절별로 발음이 약간씩
     * 달라질 수 있기 때문에 각 음절별로
     * 모든 조합의 구성이 필요합니다.
     *
     * 그러나 이를 직접 적으면 데이터 용량이 늘뿐더러
     * 편집자도 힘드므로 각 음절별 변형음을 2차원구조로 표현합니다.
     *
     *
     * 이 함수는 필터에 사용될 비속어를 2차원 배열 형태로
     * 조합될 단어의 목록을 구성할 수 있게 돕습니다.
     *
     * 2차원 배열은 before+after 의 구조로
     * 각 차원 데이터가 합쳐져서 단어를 구성하게 되며
     *
     * 2차원 배열 내 다시 2차원 배열을 둘 수 있습니다.
     *
     * @param {array} data
     */

    // 2차원 배열 형태로 정의된 것을 풀어쓰기
    static recursiveComponent (data) {
        // Utils로 정의 이동하기
        return Utils.recursiveComponent(data);
    }

    // 2차원 배열을 모두 풀어써서 스트링 목록으로 나타내는 함수.
    static recursiveList (list, defaultType = 'string') {
        let rebuild = []
        for(let item of list){
            if(typeof item === defaultType){
                rebuild.push(item)
            }else{
                rebuild = rebuild.concat(Tetrapod.recursiveComponent(item))
            }
        }
        return rebuild
    }
}

module.exports = Tetrapod
