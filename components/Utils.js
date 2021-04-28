// 한글 사용 유틸리티 모았습니다.
import Hangul from 'hangul-js';
import ObjectOperation from './ObjectOperation';

const Utils = {

    // 한글 자음
    korConsonants: [
        'ㄱ', 'ㄲ','ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    ],
    // 한글 모음
    korVowels: [
        'ㅏ', 'ㅐ' , 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
    ],


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
    objectEqual: ObjectOperation.objectEqual
    ,

    // 배열/오브젝트의 포함관계 체크. a가 b안에 들어갈 때 True
    objectInclude: ObjectOperation.objectInclude,

    //중복 리스트 제거
    removeMultiple: ObjectOperation.removeMultiple,

    escape: (text) => {
        return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    },

    // 메시지에서 특정 패턴을 찾아서 전부 바꿔주는 함수.
    replaceAll: (message, search, replace) => {
        return message.replace(new RegExp(search, 'gi'), replace)
    },

    // 메시지에서 단어의 위치를 찾아주는 함수.
    getPositionAll: (message, search, isString = true) => {
        // 버그 방지를 위해 !, ? 기호는 드롭시키자.
        search = search.replace("!","").replace("?","")

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

    // manyArray => [[manyArray[0], manyArray[1]], [manyArray[1], manyArray[2]], ...]
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

    // 단어 -> 낱자로 분리하는 함수. 매크로를 이용한 처리
    // 수정 - 매크로 ., !, +, ?
    // . 이스케이프 문자.
    // 바! -> [바, 뱌, 빠,... ].
    // 바? -> 한글 ? 개수까지 완전 무시...
    // 바+ -> [바, 박, 밖,...]. 받침 포함.
    // wordToarray -
    wordToArray: word => {
    let wordArray = []
    for (let i = 0; i <= word.length - 1; i++) {

        if ((i===1 || i>1 && word[i-2]!== "." )&& word[i-1] === ".") {
            wordArray.splice(-1, 1, word[i])
        }
        // .뒤에 오지 않는 경우 ? 기호는 뒷 문자에 밀너허기
        else if (word[i] === "?") {
            wordArray.splice(-1, 1, wordArray.slice(-1)[0]+word[i])
        }
        // !, + 기호 관련. 한글 뒤에 오는 경우 앞 문자에 붙이기.
        else if (i>0 && /[가-힣]/.test(word[i-1]) && (word[i] === "!" || word[i] === "+") ) {
            wordArray.splice(-1, 1, wordArray.slice(-1)[0]+word[i])
        }
        // 그 외의 경우는 따로 놓기.
        else {
            wordArray.push(word[i])
        }
    }
    return wordArray
    },

    // 메시지를 특정 길이로 분리. 옵션 추가 -> full node 이외에 half node 옵션 추가.
    lengthSplit: (message, limit) => {
        if (message.length <= limit) return [message]

        let fixedMessage = []
        let fullMessageLength = message.length
        let currentLength = 0
        const halfLimit = Math.floor(limit/2)

        let splitList = []
        let splitList2 = []
        while (true) {
            if (currentLength == fullMessageLength) {
                if (currentLength != 0) {
                    if (splitList.length > splitList2.length) {
                        fixedMessage.push(splitList.join(''))
                        if (splitList2.length>0 ) fixedMessage.push(splitList2.join(""))
                        splitList = []
                        splitList2 = []
                    }
                    else {
                        fixedMessage.push(splitList2.join(""))
                        if ( splitList.length>0 ) fixedMessage.push(splitList.join(""))
                        splitList =[]
                        splitList2 =[]
                    }
                }
                break
            }
            if (currentLength != 0 && currentLength % limit == 0 && splitList.length != 0) {
                fixedMessage.push(splitList.join(''))
                splitList = []
            }
            if (currentLength !==0 && currentLength % limit == halfLimit && splitList2.length !==0) {
                fixedMessage.push(splitList2.join(""))
                splitList2 = []
            }
            splitList.push(message[currentLength])
            if (currentLength >= halfLimit) {
                splitList2.push(message[currentLength])
            }
            currentLength++
        }

        return fixedMessage
    },


    // 단어 정렬 기준을 가나다순이 아닌 단어 길이 역순으로 정렬해보자. 긴 단어부터 검사하면 짧은 단어를 중복으로 검사할 이유가 줄어든다.
    sortMap: (inputMap) => {
        let sortedMap = Array.isArray(inputMap)?[]:{}

        if (typeof inputMap === "object" && Array.isArray(inputMap) === true) {
            sortedMap = inputMap.sort((a, b) => (a.length - b.length) ).reverse();
        }
        else if (typeof inputMap === 'object' && Object.keys(inputMap).length>0) {
            Object.keys(inputMap).sort((a,b) => a.length-b.length).reverse().forEach((key) => {
                sortedMap[key] = inputMap[key]
            })
        }

        return sortedMap
    },

    // 리스트/함수 합성 등 여러 상황에서 합성할 때 사용함.
    joinMap: ObjectOperation.joinMap,

    // 리스트를 곱하기. 예시  [[1,2,3],[4,5,6]] => [[1,4], [1,5], [1,6], [2,4], [2,5], [2,6], [3,4], [3,5], [3,6]]
    productList: ObjectOperation.productList,

    // 포함관계 정리 - elem이 object 안에 있는지 확인
    objectIn : ObjectOperation.objectIn,

    // 리스트 합집합 구하기. 리스트 원소가 일반이면 그냥 더하기, 오브젝트면 원소들을 union 하기
    listUnion : ObjectOperation.listUnion,

    // 리스트 교집합 구하기
    listIntersection: ObjectOperation.listIntersection,

    // 리스트에서 특정 타입만 필터링
    filterList: (list, type) => {
        let res = [];
        if (Array.isArray(list)) {
            if (typeof type === "string") {
                res = list.filter(item => (typeof item === type))
            }
            else if (Array.isArray(list)) {
                res = list.filter(item => (Utils.objectIn(typeof item, type)))
            }
        }
        return res;
    },


    // 각 원소를 맵으로 바꿔주는 함수.  여기서 callback은 문자열 단변수를 입력값으로 하는 함수여야 합니다.
    listMap: (elem, callback) => {
        if (typeof elem === "string" || typeof elem === "number" || typeof elem === "boolean") {
            return callback(elem);
        }
        // elem이 리스트일 때
        else if (typeof elem === "object" && Array.isArray(elem)) {
            let res = elem.map(comp => (Utils.listMap(comp, callback)))
            return res;
        }
        else if (typeof elem === "object") {
            let res = {}
            for (let key in elem) {
                res[key] = Utils.listMap(elem[key], callback)
            }
            return res;
        }
    },


    // 2차원 배열 형태로 정의된 것을 풀어쓰기.
    recursiveComponent: (data) => {

        // 배열 정의되지 않은 것은 그대로 출력
        if (typeof data !== "object") return data
        else {
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
        }

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
    // 맵 형식 - qwertyToDubeol map, antispoof map, dropDouble map을 입력으로 한다.
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

                    if (/^[ㄱ-ㅎ][가-힣]+$/.test(val)) search +=val.length-1;
                    else search += val.length;
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
    qwertyToDubeol: (msg, isMap = false)=> {
        const mapping = Utils.enKoKeyMapping;

        const qwertyToDubeolMacro = (letter) =>  (Object.keys(mapping).indexOf(letter)!==-1 ? mapping[letter] : letter)

        // 맵을 만들 필요 없을 때
        if (!isMap) {
            // 낱자 분리 후에 영어 -> 한글 전환
            let msgReplacedToKo = msg.split('').map((letter) => qwertyToDubeolMacro(letter));
            // 분리된 낱자를 합치기.
            let newMsg = msgReplacedToKo.join('');
            // 결과 - 낱자를 조합하기.
            return Hangul.assemble(newMsg);
        }
        // 맵을 만들어야 할 때
        else {
            let msgSplit = msg.split("");
            let msgRes = []
            let res = {}
            let temp = ""; // 글씨 추가용
            // 자음이나 영어 자음에 대응되는 경우
            msgSplit.map( (letter, ind) => {
                let consonant = [...Utils.korConsonants, "q", "w", "e", "r", "t", "a", "s", "d", "f", "g", "z", "x", "c", "v"];
                let vowel = [...Utils.korVowels, "y", 'u', "i", "o", "p", "h", "j", "k", "l", "b", "n", "m"];

                let resMacro = (letter, val=temp) => {
                    if (val!=="") {
                        msgRes.push(val);
                        if (!res[val]) res[val] = {value: Utils.qwertyToDubeol(val), index: [ind - val.length]}
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
                // 목모음 케이스도 고려해보자
                else if (ind>1 && consonant.indexOf(msgSplit[ind-2].toLowerCase())!== -1  && vowel.indexOf(msgSplit[ind-1].toLowerCase())!== -1 && vowel.indexOf(letter.toLowerCase())!== -1) {
                    let tempList = [ qwertyToDubeolMacro(msgSplit[ind-1]), qwertyToDubeolMacro(letter)];
                    if (Utils.objectIn(tempList, Utils.doubleVowel)) {
                        temp += letter;
                    }
                    else {
                        resMacro(letter);
                    }
                }
                else resMacro(letter);
            });
            // 마지막 글자 붙이기
            if (temp!=="") {
                msgRes.push(temp);
                if (!res[temp]) res[temp]= {value:Utils.qwertyToDubeol(temp), index: [msg.length-temp.length]}
                else {res[temp].index.push(msg.length-temp.length);}
                temp = "";
            }
            return res;

        }

    },

    //자모조합을 악용한 비속어 걸러내기 ㄱH^H77| 검출 가능. isMap 사용시 오브젝트 형태로 결과물 도출.
    antispoof: (msg, isMap = false) => {

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
    // simplify 옵션을 true로 지정하면 거센소리 된소리를 예사소리화하기, 복모음, 이중모음 단모음화하는 작업도 추가.
    // 메시지는 반드시 한글자모로만 조합.
    dropDouble: (msg, isMap=false, simplify = false) => {

        let msgAlphabet = Hangul.disassemble(msg, false);
        const varAlphabet = {"ㄲ":'ㄱ', 'ㄸ':'ㄷ', 'ㅃ':'ㅂ','ㅆ':'ㅅ', 'ㅉ':'ㅈ', 'ㅋ':'ㄱ', 'ㅌ':'ㄷ', 'ㅍ':'ㅂ',
            'ㅒ':'ㅐ','ㅖ':'ㅔ'}; // 된소리 단순화
        const aspiritedSound ={"ㄱ": "ㅋ", "ㄷ":"ㅌ", "ㅂ":"ㅍ", "ㅅ":"ㅌ", "ㅈ":"ㅌ", "ㅊ":"ㅌ", "ㅋ":"ㅋ", "ㅌ":"ㅌ","ㅍ":"ㅍ", "ㅎ":"ㅎ"} // ㅎ앞 거센소리 연음화
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
                        // 자음+ㅡ+ㅇ+모음,  simplify일 때 한해서는 즈이 -> 지로 바꿔도 상관없음.
                        if (msgAlphabet[i-1] === 'ㅡ') {
                            if (!simplify && msgAlphabet[i] === "ㅣ") {msgAlphabet.splice(i-1, 1); i++;}
                            else  { msgAlphabet.splice(i-1, 2); }
                        }
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
                    // ㅎ과 결합했을 때 거센소리화. 색히 -> 새키
                    else if (simplify && msgAlphabet[i] === 'ㅎ' && Object.keys(aspiritedSound).indexOf(msgAlphabet[i-1])!==-1) {
                        msgAlphabet[i-1] = aspiritedSound[msgAlphabet[i-1]];
                        msgAlphabet.splice(i, 1);
                    }
                    else i++;
                }

                // 모음일 때는 앞의 모음과 복모음을 형성하지 못하는 경우 모음들만 제거하기  - 일단 dropDouble은 완전한 한글에서만 실험할 것.
                else if (Utils.korVowels.indexOf(msgAlphabet[i])!== -1) {
                    if (simplify && Object.keys(varAlphabet).indexOf(msgAlphabet[i])!== -1) {
                        msgAlphabet[i] = varAlphabet[msgAlphabet[i]];
                        i++;
                    }
                    else if (simplify && ObjectOperation.objectIn([msgAlphabet[i-1], msgAlphabet[i]],Utils.doubleVowel )) {
                        if (msgAlphabet[i-1] !== "ㅗ" || msgAlphabet[i] !=="ㅣ") {
                            msgAlphabet.splice(i-1, 1);
                            i++;
                        }
                        else {
                            i++;
                        }

                    }
                        //     if ( !Utils.isDouble(msgAlphabet[i-1], msgAlphabet[i]) ) {
                        //         msgAlphabet.splice(i,1);
                    //     }
                    else i++;
                }
                else {
                    // 첫자이지만 자음 뒤에 ㅇ 아닌 자음+모음이 오거나 모음 뒤에 모음이 때는 빼버린다.
                    if (Utils.korConsonants.indexOf(msgAlphabet[0])!== -1 && Utils.korConsonants.indexOf(msgAlphabet[1])!== -1 && msgAlphabet[1]!=="ㅇ" && Utils.korVowels.indexOf(msgAlphabet[2])!==-1 ) {
                        msgAlphabet.shift();
                    }
                    else if (Utils.korVowels.indexOf(msgAlphabet[0])!== -1 && Utils.korVowels.indexOf(msgAlphabet[1])!== -1) {
                        msgAlphabet.shift();
                    }
                    i++;
                }
            }
            return Hangul.assemble(msgAlphabet);

        }
        // isMap으로 정의할 경우 음절 단위로 우선 쪼갠 뒤 dropDouble 수행
        else {
            for (var i = 0; i < msgAlphabet.length; i++) {
                if (i === 0) {
                    singleSyllable.push(msgAlphabet[i]);
                } else {
                    // 자음 ㅇ
                    if (msgAlphabet[i] === 'ㅇ') {
                        // 앞에 모음이 오면서 (맨 마지막이거나 뒤에 모음이 오지 않으면) 앞 글자에 붙여쓰기
                        if (Utils.korVowels.indexOf(msgAlphabet[i - 1]) !== -1
                            && (i === msgAlphabet.length - 1 || Utils.korVowels.indexOf(msgAlphabet[i + 1]) === -1)) {
                            singleSyllable.push(msgAlphabet[i]);

                        }
                            // 나머지 - 앞 자음 or 뒷 모음.
                        // 자음+ㅡ 뒤에 오면 앞 글자에 붙임. 모음이 와도 무관. 브아 -> 바
                        else if (i > 1 && Utils.korConsonants.indexOf(msgAlphabet[i - 2]) !== -1 && msgAlphabet[i - 1] === 'ㅡ') {
                            singleSyllable.push(msgAlphabet[i]);

                        }
                        // 자음+모음+ㅇ+동모음 일시 ㅇ을 앞글자에 붙임. 보오 -> 보
                        else if (1 < i < msgAlphabet.length - 1 && Utils.korConsonants.indexOf(msgAlphabet[i - 2]) !== -1 &&
                            Object.keys(vowelLast).indexOf(msgAlphabet[i - 1]) !== -1 && vowelLast[msgAlphabet[i - 1]].indexOf(msgAlphabet[i + 1]) !== -1) {
                            singleSyllable.push(msgAlphabet[i]);

                        }
                        // 자음+ㅣ+ㅇ+단모음 -> 자음+복모음 처리를 위해 ㅇ을 앞에 붙임.
                        else if (1 < i < msgAlphabet.length - 1 && Utils.korConsonants.indexOf(msgAlphabet[i - 2]) !== -1 && msgAlphabet[i - 1] === 'ㅣ' && Object.keys(yVowel).indexOf(msgAlphabet[i + 1]) !== -1) {
                            singleSyllable.push(msgAlphabet[i]);

                        }
                        // 자음 + 모음 + ㅇ + 모음에서 앞모음+뒷모음이 복모음을 형성할 수 있는 경우 ㅇ을 앞에 붙임
                        else if (1 < i < msgAlphabet.length - 1 && Utils.korVowels.indexOf(msgAlphabet[i - 1]) !== -1 && Utils.korVowels.indexOf(msgAlphabet[i + 1]) !== -1 &&
                            Utils.korConsonants.indexOf(msgAlphabet[i - 2]) !== -1 ) {
                            vowelPair.forEach(x => {
                                if (Utils.objectEqual([msgAlphabet[i - 1], msgAlphabet[i + 1]], x)) {
                                    singleSyllable.push(msgAlphabet[i]);
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
                            divideSyllable.push(singleSyllable);
                            singleSyllable = [msgAlphabet[i]];
                        }
                    }

                    // ㅇ 아닌 자음일 때
                    else if (Utils.korConsonants.indexOf(msgAlphabet[i]) !== -1 && msgAlphabet[i] !== 'ㅇ') {
                        // 앞에 모음이면서 (마지막 글자 or 뒤에 ㅇ 또는 모음이 오지 않음 or 뒤 ㅇ이지만 또 자음이 온다)
                        if ( Utils.korVowels.indexOf(msgAlphabet[i - 1]) !== -1
                            && (i === msgAlphabet.length - 1 ||
                                (Utils.korVowels.indexOf(msgAlphabet[i + 1]) === -1 && msgAlphabet[i + 1] !== 'ㅇ') ||
                                (i< msgAlphabet.length-1 && msgAlphabet[i + 1] === 'ㅇ' && Utils.korConsonants.indexOf(msgAlphabet[i + 2]) !== -1)
                            )) {

                            // 특수 케이스 - 자음 중복시에는 뒤로 넘긴다.
                            if (msgAlphabet[i] !== msgAlphabet[i+1]) {
                                // simplify 한정 특수 케이스 - 앞에 모음, 뒤에 ㅎ+모음이 올 때
                                if (simplify && Object.keys(aspiritedSound).indexOf(msgAlphabet[i])!== -1 && msgAlphabet[i+1]=== "ㅎ") {
                                    divideSyllable.push(singleSyllable);
                                    singleSyllable = [msgAlphabet[i]];
                                }
                                else {
                                    singleSyllable.push(msgAlphabet[i]);
                                }

                            }


                            else {
                                divideSyllable.push(singleSyllable);
                                singleSyllable = [msgAlphabet[i]];
                            }

                        }
                        // 겹받침 케이스 분별. 이 때 ㅇ 아닌 자음이 바로 뒤에 와야 함.
                        else if (Utils.korVowels.indexOf(msgAlphabet[i - 2]) !== -1
                            && (i === msgAlphabet.length - 1 || (Utils.korConsonants.indexOf(msgAlphabet[i + 1]) !== -1 && msgAlphabet[i + 1] !== 'ㅇ') || ((msgAlphabet[i + 1] === 'ㅇ' || msgAlphabet[i + 1] === msgAlphabet[i]) && Utils.korConsonants.indexOf(msgAlphabet[i + 2]) !== -1))
                            && ObjectOperation.objectIn(msgAlphabet.slice(i - 1, i + 1), Utils.doubleConsonant) ) {
                            singleSyllable.push(msgAlphabet[i]);

                        }
                        // 겹자음 케이스 - 앞자음에 붙인다.
                        else if (singleSyllable.length ===1 && singleSyllable[0] === msgAlphabet[i]) {
                            singleSyllable.push(msgAlphabet[i]);
                        }
                        // 나머지 - 뒷글자로 넘기기
                        else {
                            divideSyllable.push(singleSyllable);
                            singleSyllable = [msgAlphabet[i]];
                        }
                    }

                    // 자음 바로 뒤 모음 - 앞글자에 붙인다.
                    else if (Utils.korVowels.indexOf(msgAlphabet[i]) !== -1 && Utils.korConsonants.indexOf(msgAlphabet[i - 1]) !== -1) {
                        singleSyllable.push(msgAlphabet[i]);
                    }
                    // 겹모음 - 앞글자에 붙인다.
                    else if (i > 1 && Utils.korConsonants.indexOf(msgAlphabet[i - 2]) !== -1 && Utils.korVowels.indexOf(msgAlphabet[i - 1]) !== -1) {
                        var tmp = true;
                        for (var lix of Utils.doubleVowel) {
                            if (Utils.objectEqual(lix, msgAlphabet.slice(i - 1, i + 1))) {
                                singleSyllable.push(msgAlphabet[i]);
                                tmp = false;
                                break;
                            }
                        }
                        if (tmp) {
                            divideSyllable.push(singleSyllable);
                            singleSyllable = [msgAlphabet[i]];
                        }
                    }
                    // 나머지 케이스
                    else {
                        divideSyllable.push(singleSyllable);
                        singleSyllable = [msgAlphabet[i]];
                    }

                }

            }
            //마지막 문자 밀어넣기
            divideSyllable.push(singleSyllable);

            let ind =0;
            for (i =0; i<divideSyllable.length; i++) {
                let cnt = 0, assembledSyllable =  Hangul.assemble(divideSyllable[i]);
                for (var leti in assembledSyllable ) { // 한글 숫자 조합. Hangul.assemble로 조합.
                    // 한글 자음이면서 낱자 바로 뒤나 앞에 한글이 오지 않으면 cnt 늘리기...
                    if (!/[ㄱ-ㅎ]/.test( assembledSyllable[leti] )  ) cnt++;
                    else if (leti > 0 && !/[가-힣]/.test( assembledSyllable[leti-1] ) ) cnt++;
                    else if (leti === 0 && !/[가-힣]/.test( assembledSyllable[leti+1] ) ) cnt++;
                }
                if (res[Hangul.assemble(divideSyllable[i])]) {
                    res[Hangul.assemble(divideSyllable[i])]["index"].push(ind);
                }
                else {
                    res[Hangul.assemble(divideSyllable[i])] = {
                        value: Utils.dropDouble(Hangul.assemble(divideSyllable[i]), false, simplify),
                        index: [ind]
                    }
                }
                ind += cnt;

            }

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

export default Utils;
