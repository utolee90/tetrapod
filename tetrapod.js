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

    korConsonants: [
        'ㄱ', 'ㄲ','ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    ],
    korVowels: [
        'ㅏ', 'ㅐ' , 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
    ],
    korSimParts: {'ㄱ':['ㄱ','ㅋ','ㄲ'], 'ㄲ':['ㄲ','ㅋ'], 'ㄴ':['ㄴ', 'ㄹ'], 'ㄷ':['ㄴ','ㄷ', 'ㄸ', 'ㅌ'], 'ㄹ':['ㄴ'], 'ㅁ':['ㅇ'], 'ㅂ':['ㅃ', 'ㅍ'], 'ㅅ':['ㅆ'], 'ㅇ':['ㅁ'],
        'ㅈ':['ㅉ','ㅊ'], 'ㅊ':['ㅉ', 'ㅌ'], 'ㅋ':['ㄲ'], 'ㅌ':['ㄸ', 'ㅊ'], 'ㅍ':['ㅃ'], 'ㅎ': ['ㅇ'],
        'ㅏ':['ㅑ', 'ㅘ'], 'ㅐ':['ㅒ', 'ㅖ', 'ㅔ'], 'ㅑ':['ㅏ', 'ㅛ'], 'ㅒ':['ㅐ', 'ㅔ', 'ㅖ'], 'ㅓ':['ㅕ', 'ㅗ', 'ㅝ'], 'ㅔ':['ㅐ', 'ㅒ', 'ㅖ'], 'ㅕ':['ㅓ', 'ㅛ', ''], 'ㅖ':['ㅔ', 'ㅐ', 'ㅒ'],
        'ㅗ':['ㅓ', 'ㅛ', 'ㅘ'], 'ㅘ':['ㅏ'], 'ㅙ':['ㅚ', 'ㅞ'], 'ㅚ':['ㅙ', 'ㅞ'], 'ㅜ':['ㅡ', 'ㅠ'], 'ㅝ':['ㅓ'], 'ㅞ':['ㅙ', 'ㅚ'], 'ㅟ':['ㅜ', 'ㅣ'], 'ㅠ':['ㅜ', 'ㅡ'], 'ㅡ':['ㅢ', 'ㅜ'] , 'ㅢ':['ㅡ', 'ㅣ'], 'ㅣ':['ㅡ', 'ㅢ', 'ㅟ']
    },


    // 한영전환을 악용한 욕설 거를 때 사용.
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

    //단일 발음에서 사용
    singlePronounce: {
        'C':'씨', 'c':'씨','十':'십', '+':'십', 'D':'디', 'd':'디', 'g':'지', 'z':'지', "M":'엠', 'm':'엠',
        'jot':'좆', 'wha':'화', 'emi':'에미', 'ebi':'에비', 'sip':'씹', "奀":"좆",
        'si':'시', 'ral':'랄', 'bal':'발', 'em':'엠', 'ba':'바', 'bo':'보','nom':'놈', 'nyeun':'년', 'byung':'병',
        '1':'일', '2':'이', '3':'삼', '4':'사', '5':'오', '6':'육', '7':'칠', '8':'팔', '9':'구', '0':'영'},

    // 자모와 자형이 유사한 경우 사용.
    similarConsonant: {
        '2':'ㄹ', '3':'ㅌ', "5":'ㄹ', '7':'ㄱ', '0':'ㅇ', 'C':'ㄷ', 'c':'ㄷ', 'D':'ㅁ', 'E':'ㅌ', 'M':'ㅆ', 'm':'ㅆ', 'n':'ㅅ', 'S':'ㄹ', 's':'ㄹ',
        'V':'ㅅ', 'v':'ㅅ', 'w':'ㅆ', 'W':'ㅆ', 'Z':'ㄹ', 'z':'ㄹ', '@':'ㅇ', '#':'ㅂ', '^':'ㅅ',
    },

    similarVowel: {
        '1':'ㅣ', 'H':'ㅐ', 'I':'ㅣ', 'l':'ㅣ', 'T':'ㅜ', 't':'ㅜ', 'y':'ㅓ', '!':'ㅣ',  '_':'ㅡ', '-':'ㅡ', '|':'ㅣ'
    },

    //자형이 유사한 단어들 모음
    similarShape: [
        ['ㄹ','근'], ['4', '니'], ['대', '머'], ['댁','먹'], ['댄', '먼'], ['댈', '멀'], ['댐', '멈'], ['댕', '멍'], ['金', '숲']
        ['奀', '좃', '좆'], ['長', '튼'], ['%', '응'], ['q', '이']
    ],

    escape: (text) => {
        return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    },

    replaceAll: (message, search, replace) => {
        return message.replace(new RegExp(search, 'gi'), replace)
    },

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

    wordToArray: word => {
        let wordArray = []
        for (let i = 0; i <= word.length - 1; i++) {
            wordArray[i] = word[i]
        }
        return wordArray
    },

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

    // 영자조합 만들기
    enToKo: (msg)=> {
        const mapping = Utils.enKoKeyMapping;

        // 낱자 분리 후에 영어 -> 한글 전환
        let msg_split_and_replace = msg.split('').map((letter) =>
            (Object.keys(mapping).indexOf(letter)!==-1 ? mapping[letter] : letter));
        // 분리된 낱자를 합치기.
        let newmsg = msg_split_and_replace.join('');
        // 결과 - 낱자를 조합하기.
        return Hangul.assemble(newmsg);
    },

    //자모조합을 악용한 비속어 걸러내기 ㄱH^H77| 검출 가능.
    alphabetToKo: (msg) => {

        const kor_consonant = /[ㄱ-ㅎ]/;
        const kor_vowel = /[ㅏ-ㅣ]/;
        const kor_letter = /[가-힣]/;
        // const single_parts = Object.keys(Utils.singlePronounce);
        const sim_consonant = Object.keys(Utils.similarConsonant);
        const sim_vowel = Object.keys(Utils.similarVowel);
        // 둘 다 들어간 요소
       /* let common_list = [];
        for (var lets of single_parts) {
            if (single_alphabet.indexOf(lets)!==-1) {
                common_list.push(lets)
            }
        }
        */
        let letter_type ='';
        let new_letter_type='';
        let msg_alphabet = []; // 알파벳 단위로 쪼개기
        let msg_alphabet_type = []; //타입별로 나누기
        let pre_res = []; // 조합 전 준비하기. 조작이 필요.
        let res = ''

        // 우선 한글자모, 한글음절, 기타 분리
        for (var letter of msg) {
            if (kor_consonant.test(letter)) { new_letter_type = 'jaeum'; }
            else if (kor_vowel.test(letter)) {new_letter_type = 'moeum'; }
            else if (kor_letter.test(letter)) { new_letter_type = 'hangul'; }
            else if (sim_consonant.indexOf(letter)!==-1) {new_letter_type='yuja';}
            else if (sim_vowel.indexOf(letter!==-1)) {new_letter_type = 'yumo';}
            else {new_letter_type = 'etc';}

            //타입이 같으면 묶어서 생각하기
            if (new_letter_type===letter_type) {
                msg_alphabet[msg_alphabet.length-1] +=letter;
            }
            else {
                msg_alphabet.push(letter);
                msg_alphabet_type.push(new_letter_type);
            }
            letter_type = new_letter_type;
        }

        console.log(msg_alphabet, '\n', msg_alphabet_type);


        msg_alphabet.map((val, ind) => {
            switch(msg_alphabet_type[ind]) {

                case 'hangul':
                    pre_res.push(val);
                    break;

                case 'jaeum':
                case 'moeum':
                    if (ind===0 || (ind>0 && (msg_alphabet_type[ind-1]=== 'hangul' || msg_alphabet_type[ind-1]!=='etc'))) {
                        pre_res.push(val);
                    }
                    else {
                        pre_res[pre_res.length-1] +=val;
                    }
                    break;

                case 'yuja':
                    let tmp = '';
                    const val_double = {'77':'ㄲ', 'cc':'ㄸ', '##':'ㅃ', '^^':'ㅆ', 'nn':'ㅆ', '#^':'ㅂㅅ', '^#':'ㅅㅂ'};


                    // 쌍자음을 인식해서 처리하기
                    if (Object.keys(val_double).indexOf(val.slice(-2))!==-1) {
                        if (ind< msg_alphabet.length-1 && (msg_alphabet_type[ind+1]==='moeum' || msg_alphabet_type[ind+1]==='yumo' )) {
                            for (letter of val.slice(0,-2)) {
                                tmp += Utils.similarConsonant[letter];
                            }
                            tmp +=val_double[val.slice(-2)];
                        }
                        else {tmp =val;}

                    }
                    else if (Object.keys(val_double).indexOf(val.slice(0,2))!==-1) {
                        if (ind>0 && (msg_alphabet_type[ind-1]==='moeum' || msg_alphabet_type[ind-1]==='yumo' )) {
                            tmp = val_double[val.slice(0,2)];
                            for (letter of val.slice(2)) {
                                tmp += Utils.similarConsonant[letter];
                            }
                        }
                        else {tmp=val;}
                        if (ind===0 || (ind>0 && (msg_alphabet_type[ind-1]=== 'hangul' || msg_alphabet_type[ind-1]!=='etc'))) {
                            pre_res.push(tmp);
                        }
                        else {
                            pre_res[pre_res.length-1] +=tmp;
                        }
                    }
                    else {
                        if (ind< msg_alphabet.length-1 && (msg_alphabet_type[ind+1]==='moeum' || msg_alphabet_type[ind+1]==='yumo' )){
                            for (letter of val) {
                                tmp +=Utils.similarConsonant[letter];
                            }
                        }
                        else if (ind>0 && (msg_alphabet_type[ind-1]==='moeum' || msg_alphabet_type[ind-1]==='yumo' )){
                            for (letter of val) {
                                tmp +=Utils.similarConsonant[letter];
                            }
                        }
                        else {
                            tmp = val;
                        }
                    }
                    // 데이터 더하기
                    if (ind===0 || (ind>0 && (msg_alphabet_type[ind-1]=== 'hangul' || msg_alphabet_type[ind-1]!=='etc'))) {
                        pre_res.push(tmp);
                    }
                    else {
                        pre_res[pre_res.length-1] +=tmp;
                    }
                    break;

                case 'yumo':
                    tmp ='';
                    if (ind>0 && (msg_alphabet_type[ind-1]==='jaeum' || msg_alphabet_type[ind-1]==='yuja' )){
                        for (letter of val) {
                            tmp +=Utils.similarVowel[letter];
                        }
                    }
                    else { val = tmp; }
                    // 데이터 더하기
                    if (ind===0 || (ind>0 && (msg_alphabet_type[ind-1]=== 'hangul' || msg_alphabet_type[ind-1]!=='etc'))) {
                        pre_res.push(tmp);
                    }
                    else {
                        pre_res[pre_res.length-1] +=tmp;
                    }
                    break;
                case 'etc':
                    pre_res.push(val);
                    break;
            }
        });
        console.log(pre_res);

        let tmp_list = [];

        for (var letters of pre_res) {
            if (/[ㄱ-ㅎ|ㅏ-ㅣ]+/.test(letters)) { //한글 자모로 이루어진 구간
                for (letter of letters) {
                    tmp_list.push(letter);
                }
            }
            else { //한글이나 나머지 구간
                res += Hangul.assemble(tmp_list);
                tmp_list = [];
                res +=letters;
            }
        }
        if (tmp_list.length>0) {
            res +=Hangul.assemble(tmp_list);
        }
        return res;
    },

    // ㅇ, ㅡ 제거, 된소리/거센소리 예사음화 후 비속어 찾기
    dropiung: (msg) => {

        const newmsg = Hangul.disassemble(msg, false);
        const dbl_cons = {"ㄲ":'ㄱ', 'ㄸ':'ㄷ', 'ㅃ':'ㅂ','ㅆ':'ㅅ', 'ㅉ':'ㅈ', 'ㅋ':'ㄱ', 'ㅌ':'ㄷ', 'ㅍ':'ㅂ', 'ㅒ':'ㅐ','ㅖ':'ㅔ'}
        var i =0;
        while(i < newmsg.length) {
            //자음+ㅡ+ㅇ+모음 구조면 ㅡ와 ㅇ 모두 제거
            if (i>0 && i <newmsg.length-2 && newmsg[i]=='ㅡ' && newmsg[i+1]==='ㅇ' &&
                Utils.korVowels.indexOf(newmsg[i+2])!==-1 && Utils.korConsonants.indexOf(newmsg[i-1])!==-1) {
                newmsg.splice(i, 2);
            }
            // 자음 뒤, 모음 앞에 오는 ㅇ 제거.
            if (i>0 && i< newmsg.length-1 && newmsg[i]==='ㅇ' &&
                Utils.korVowels.indexOf(newmsg[i+1])!==-1 && Utils.korConsonants.indexOf(newmsg[i-1])!==-1 ) {
                newmsg.splice(i,1);
            }
            // ㅣ 앞에 오는 ㅡ 제거
            else if (i>0 && i< newmsg.length-1 && newmsg[i]==='ㅡ' && newmsg[i+1]==='ㅣ' ) {
                newmsg.splice(i,1);
            }

            // 된소리/거센소리 예사음화
            else if (Object.keys(dbl_cons).indexOf(newmsg[i])!==-1) {
                newmsg[i] = dbl_cons[newmsg[i]];
                i++;
            }
            else{ i++;}
        }
        return Hangul.assemble(newmsg);

    },

    //ㅄ받침, ㄻ받침, ㄺ받침 과잉으로 사용하는 메시지 검출.
    tooMuchDoubleEnd: (msg) => {
        const newmsg = Hangul.disassemble(msg, true);
        let cnt = 0;
        let cont_cnt =0; // 연속
        let pos = []; // 위치 찾기
        for (var i in newmsg) {
            // ㅄ, ㄺ, ㄻ 받침이 있는 문자 잡아내기
            if ((newmsg[i][2]==='ㅂ' && newmsg[i][3]==='ㅅ') ||
                (newmsg[i][2]==='ㄹ' && newmsg[i][3]==='ㄱ') ||
                (newmsg[i][2]==='ㄹ' && newmsg[i][3]==='ㅁ') ) {
                cnt++;
                cont_cnt++;
                pos.push(i);
            }
            else {
                cont_cnt =0;
            }
        }
        if (cont_cnt>2 && (newmsg.length/cnt)<=3) {
            let txt =[]
            for (var i in newmsg) {
                if (pos.indexOf(i)>-1)
                    txt.push(Hangul.assemble(newmsg[i]));
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

    // alphabetToKotest
    static alphabetToKo(msg) {
        return Utils.alphabetToKo(msg);
    }

    // dropiung Test
    static dropiung(msg) {
        if (/[가-힣|ㅏ-ㅣ|ㄱ-ㅎ \s]/.test(msg)) {
            return Utils.dropiung(msg);
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
        for (let index in badWords)
            parsedBadWords.push(Utils.wordToArray(badWords[index]))


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
        return {
            bad: Tetrapod.find(message, true, 0, false, isStrong).totalResult.length,
            soft: Tetrapod.find(message, true, 0, false, isStrong).softResult.length,
            end: Tetrapod.find(message, true, 0, false, isStrong).endResult.length,
        };
    }

    // 메시지에 비속어 찾기 - 배열로 처리함.
    static find(message, needMultipleCheck=false, splitCheck=15, needEnToKo=false, isStrong=false) {
        // 욕설 결과 집합
        let totalResult = []
        let softResult = []
        let tooMuchEnd = {val:false, pos:[], txt:[]};

        //보조 메시지
        let message2 = ''
        let message3 = ''
        let message4 = ''

        if (needEnToKo === true) { // 만약 한영 검사도 필요하면...
            message2 = Utils.enToKo(message); // 2차 점검용
        }
        if (isStrong === true) { // 문자열을 악용한 것까지 잡아보자.
            message3 = Utils.alphabetToKo(message);
            message4 = Utils.dropiung(message3);
        }

        if (splitCheck === undefined) splitCheck = 15
        var messages = (splitCheck != 0) ? Utils.lengthSplit(message, splitCheck) : [message]
        if (message2.length>0) var messages2 = (splitCheck != 0) ? Utils.lengthSplit(message2, splitCheck) : [message2]
        if (message3.length>0) var messages3 = (splitCheck != 0) ? Utils.lengthSplit(message3, splitCheck) : [message3]
        if (message4.length>0) var messages4 = (splitCheck != 0) ? Utils.lengthSplit(message4, splitCheck) : [message4]

        for (var index1 = 0; index1 <= messages.length - 1; index1++) {
            let currentResult = Tetrapod.nativeFind(messages[index1], needMultipleCheck)
            tooMuchEnd = currentResult.tooMuchDoubleEnd;

            if (needMultipleCheck) {
                for (var index2 = 0; index2 <= currentResult.founded.length - 1; index2++) {
                    if (currentResult.founded !== [] && totalResult.indexOf(currentResult.founded[index2])===-1)
                        totalResult = [...totalResult, currentResult.founded[index2]];
                }
                for (index2 = 0; index2 <= currentResult.softSearchFounded.length - 1; index2++) {
                    if (currentResult.softSearchFounded !== [] && softResult.indexOf(currentResult.softSearchFounded[index2])===-1)
                        softResult = [...softResult, currentResult.softSearchFounded[index2]];
                }
            } else {
                if (currentResult !== null){
                    totalResult = [...totalResult, currentResult.founded];
                    softResult = [...softResult, currentResult.softSearchFounded];
                }
            }
        }
        if (totalResult.length ===0 && needEnToKo === true) {
            for (var index3 = 0; index3 <= messages2.length - 1; index3++) {
                let currentResult2 = Tetrapod.nativeFind(messages2[index3], needMultipleCheck);
                tooMuchEnd = {val: (tooMuchEnd.val || currentResult2.tooMuchEnd.val),
                    pos:[...tooMuchEnd.pos, ...currentResult2.tooMuchEnd.pos],
                    txt:[...tooMuchEnd.txt, ...currentResult2.tooMuchEnd.txt]
                };

                if (needMultipleCheck) {
                    for (var index4 = 0; index4 <= currentResult2.founded.length - 1; index4++) {
                        if (currentResult2.founded !== [] && totalResult.indexOf(currentResult2.founded[index4])===-1)
                            totalResult = [...totalResult, currentResult2.founded[index4]];
                    }
                    for (index4 = 0; index4 <= currentResult2.softSearchFounded.length - 1; index4++) {
                        if (currentResult2.softSearchFounded !== [] && softResult.indexOf(currentResult2.softSearchFounded[index4])===-1)
                            softResult = [...softResult, currentResult2.softSearchFounded[index4]];
                    }
                } else {
                    if (currentResult2 !== null){
                        totalResult = [...totalResult, currentResult2.founded];
                        softResult = [...softResult, currentResult2.softSearchFounded];
                    }
                }
            }
        }
        if (isStrong === true) {
            for (var index5 = 0; index5 <= messages3.length - 1; index5++) {
                let currentResult3 = Tetrapod.nativeFind(messages3[index5], needMultipleCheck);
                tooMuchEnd = {val: (tooMuchEnd.val || currentResult3.tooMuchEnd.val),
                    pos:[...tooMuchEnd.pos, ...currentResult3.tooMuchEnd.pos],
                    txt:[...tooMuchEnd.txt, ...currentResult3.tooMuchEnd.txt]
                }

                if (needMultipleCheck) {
                    for (var index6 = 0; index6 <= currentResult3.founded.length - 1; index6++) {
                        if (currentResult3.founded !== [] && totalResult.indexOf(currentResult3.founded[index6])===-1)
                            totalResult = [...totalResult, currentResult3.founded[index6]];
                    }
                    for (index6 = 0; index6 <= currentResult3.softSearchFounded.length - 1; index6++) {
                        if (currentResult3.softSearchFounded !== [] && softResult.indexOf(currentResult3.softSearchFounded[index6])===-1)
                            softResult = [...softResult, currentResult3.softSearchFounded[index6]];
                    }
                } else {
                    if (currentResult3 !== null){
                        totalResult = [...totalResult, currentResult3.founded];
                        softResult = [...softResult, currentResult3.softSearchFounded];
                    }
                }
            }
            for (var index7 = 0; index7 <= messages4.length - 1; index7++) {
                let currentResult4 = Tetrapod.nativeFind(messages4[index7], needMultipleCheck)

                if (needMultipleCheck) {
                    for (var index8 = 0; index8 <= currentResult4.founded.length - 1; index8++) {
                        if (currentResult4.founded !== [] && totalResult.indexOf(currentResult4.founded[index6])===-1)
                            totalResult = [...totalResult, currentResult4.founded[index8]];
                    }
                    for (index8 = 0; index8 <= currentResult4.softSearchFounded.length - 1; index8++) {
                        if (currentResult4.softSearchFounded !== [] && softResult.indexOf(currentResult4.softSearchFounded[index6])===-1)
                            softResult = [...softResult, currentResult4.softSearchFounded[index8]];
                    }
                } else {
                    if (currentResult4 !== null) {
                        totalResult = [...totalResult, currentResult4.founded];
                        softResult = [...softResult, currentResult4.softSearchFounded];
                    }
                }
            }
        }
        // 결과값 - 보기 좋게 출력.
        let endResult = [];
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

        return {totalResult, softResult, endResult};
    }

    // 메시지의 비속어를 콘솔창으로 띄워서 찾기.
    static nativeFind(message, needMultipleCheck, needEnToKo) {

        // let unsafeMessage = message.toLowerCase()
        let normalWordPositions = {}
        let foundedBadWords = []
        let foundedBadWordPositions = []
        let foundedSoftSearchWords = []
        let foundedSoftSearchWordPositions = []

        let parsedSoftSearchWords = [];
        for (let word of softSearchWords) {
            parsedSoftSearchWords.push(Utils.wordToArray(word));
        }

        // 정상단어를 배제합니다.
        /*
        for (let index in normalWords) {
            if (unsafeMessage.length == 0) break
            unsafeMessage = Utils.replaceAll(unsafeMessage, normalWords[index], '')
        }
        */

        // 만약 한영전환이 필요하면 한영전환후 수행합니다.

        if (needEnToKo === true) {
            message = Utils.enToKo(message);
        }
        else if (needEnToKo === undefined || needEnToKo === false) {
            message= message;
        }


        // 정상단어의 포지션을 찾습니다.
        for (let index in normalWords) {
            if (message.length == 0) break
            let searchedPositions = Utils.getPositionAll(message, normalWords[index])
            for(let searchedPosition of searchedPositions)
                if(searchedPosition !== -1)
                    normalWordPositions[searchedPosition] = true
        }

        // 타국의 비속어를 삭제합니다.
        /*
        for (var otherLangBadWordsIndex in softSearchWords) {
            let otherLangBadWord = softSearchWords[otherLangBadWordsIndex]
            if (unsafeMessage.search(otherLangBadWord) != -1) {
                foundedBadWords.push(otherLangBadWord)
                if (!needMultipleCheck) return foundedBadWords
            }
        }
        */

        // KR BAD WORDS FIND ALGORITHM

        // 비속어 단어를 한 단어씩 순회합니다.
        for (let index1 in parsedBadWords) {
            let badWord = parsedBadWords[index1]

            let findCount = {}
            let badWordPositions = []

            // 비속어 단어를 한글자씩
            // 순회하며 존재여부를 검사합니다.
            for (let index2 in badWord) {
                let badOneCharacter = String(badWord[index2]).toLowerCase()

                // 비속어 단어의 글자위치를 수집합니다.

                // 메시지 글자를 모두 반복합니다.
                for (let index3 in message) {

                    // 정상적인 단어의 글자일경우 검사하지 않습니다.
                    if(typeof normalWordPositions[Number(index3)] != 'undefined') continue

                    // 단어 한글자라도 들어가 있으면
                    // 찾은 글자를 기록합니다.
                    let unsafeOneCharacter = String(message[index3]).toLowerCase()
                    if (badOneCharacter == unsafeOneCharacter) {
                        findCount[badOneCharacter] = true
                        badWordPositions.push(Number(index3))
                        break
                    }
                }

                // 비속어를 구성하는 글자가
                // 전부 존재하는 경우 이를 발견처리합니다.
                if (badWord.length == Object.keys(findCount).length) {

                    // 포지션을 순서대로 정렬했는데
                    // 순서가 달라진다면 글자가 섞여있는 것으로 간주합니다.
                    let isShuffled = false
                    let sortedPosition = badWordPositions.slice().sort((a, b) => a - b)
                    if(sortedPosition != badWordPositions){
                        isShuffled = true
                        badWordPositions = sortedPosition
                    }

                    // TODO
                    // 발견된 각 문자 사이의 거리 및
                    // 사람이 인식할 가능성 거리의 계산

                    // (3글자가 각각 떨어져 있을 수도 있음)


                    // 글자간 사이들을 순회하여서
                    // 해당 비속어가 사람이 인식하지 못할 정도로
                    // 퍼져있다거나 섞여있는지를 확인합니다.
                    let isNeedToPass = false
                    for(let diffRanges of Utils.grabCouple(badWordPositions)){

                        // 글자간 사이에 있는 모든 글자를 순회합니다.
                        let diff = ''
                        for(let diffi = diffRanges[0]+1; diffi <= (diffRanges[1]-1); diffi++){
                            diff += message[diffi]
                        }

                        if(isShuffled){
                            // 뒤집힌 단어의 경우엔 자음과 모음이
                            // 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.
                            if(!Tetrapod.shuffledMessageFilter(diff))
                                isNeedToPass = true
                        }

                    }

                    // 해당 비속어를 발견은 하였지만,
                    // 사람이 인지하지 못할 것으로 간주되는 경우
                    // 해당 발견된 비속어를 무시합니다.
                    if(isNeedToPass) continue


                    // 같은 포지션의 순서만 바꾼 비속어를 중복 비속어로 인식하지 않게 처리
                    if(foundedBadWordPositions.length===0) {
                        console.log(`isShuffled: ${isShuffled}`)
                        console.log(`원문: ${message}`)
                        console.log(`발견된 비속어: [${badWord.join()}]`)
                        console.log(`발견된 비속어 위치: [${badWordPositions}]`)
                        foundedBadWords.push(badWord.join(''))
                        foundedBadWordPositions.push(badWordPositions)
                    }
                    else {
                        var tmp_tf = true;
                        for (let posix of foundedBadWordPositions) {
                            //포지션이 같을 때 강제 종료
                            if (posix[0]=== badWordPositions[0] && posix[1]=== badWordPositions[1]) {
                                tmp_tf =false; break;
                            }
                        }
                        if(tmp_tf) {
                            console.log(`isShuffled: ${isShuffled}`)
                            console.log(`원문: ${message}`)
                            console.log(`발견된 비속어: [${badWord.join()}]`)
                            console.log(`발견된 비속어 위치: [${badWordPositions}]`)
                            foundedBadWords.push(badWord.join(''))
                            foundedBadWordPositions.push(badWordPositions)
                        }
                    }

                }
            }
        }

        // 저속한 단어들을 한 단어식 순회합니다.
        for (let index4 in parsedSoftSearchWords) {
            let softSearchWord = parsedSoftSearchWords[index4];
            let findCount = {}
            let softSearchWordPositions = []
            // 저속한 단어들을 한 단어씩
            // 순회하며 존재여부를 검사합니다.
            for (let index5 in softSearchWord) {
                let softSearchOneCharacter = String(softSearchWord[index5]).toLowerCase()

                // 저속한 단어의 글자위치를 수집합니다.

                // 메시지 글자를 모두 반복합니다.
                for (let index6 in message) {

                    // 정상적인 단어의 글자일 경우 검사하지 않습니다.
                    if(typeof normalWordPositions[Number(index6)] != 'undefined') continue

                    // 단어 한글자라도 들어가 있으면
                    // 찾은 글자를 기록합니다.
                    let nearlyUnsafeOneCharacter = String(message[index6]).toLowerCase()
                    if (softSearchOneCharacter == nearlyUnsafeOneCharacter) {
                        findCount[softSearchOneCharacter] = true
                        softSearchWordPositions.push(Number(index6))
                    }
                }

                // 저속한 단어를 구성하는 글자가
                // 전부 존재하는 경우 이를 발견처리합니다.
                if (softSearchWord.length == Object.keys(findCount).length) {

                    // 포지션을 순서대로 정렬했는데
                    // 순서가 달라진다면 글자가 섞여있는 것으로 간주합니다.
                    let isShuffled = false
                    let sortedPosition = softSearchWordPositions.slice().sort((a, b) => a - b)
                    if(sortedPosition != softSearchWordPositions){
                        isShuffled = true
                        softSearchWordPositions = sortedPosition
                    }

                    // TODO
                    // 발견된 각 문자 사이의 거리 및
                    // 사람이 인식할 가능성 거리의 계산

                    // (3글자가 각각 떨어져 있을 수도 있음)


                    // 글자간 사이들을 순회하여서
                    // 해당 비속어가 사람이 인식하지 못할 정도로
                    // 퍼져있다거나 섞여있는지를 확인합니다.
                    let isNeedToPass = false
                    for(let diffRanges of Utils.grabCouple(softSearchWordPositions)){

                        // 글자간 사이에 있는 모든 글자를 순회합니다.
                        let diff = ''
                        for(let diffi = diffRanges[0]+1; diffi <= (diffRanges[1]-1); diffi++){
                            diff += message[diffi]
                        }

                        if(isShuffled){
                            // 뒤집힌 단어의 경우엔 자음과 모음이
                            // 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.
                            if(!Tetrapod.shuffledMessageFilter(diff))
                                isNeedToPass = true
                        }

                    }

                    // 사람이 인지하지 못할 것으로 간주되는 경우
                    // 해당 발견된 비속어를 무시합니다.
                    if(isNeedToPass) continue

                    // 같은 포지션의 순서만 바꾼 비속어를 중복 비속어로 인식하지 않게 처리
                    if(foundedSoftSearchWordPositions.length===0) {
                        console.log(`isShuffled: ${isShuffled}`)
                        console.log(`원문: ${message}`)
                        console.log(`발견된 저속한 표현: [${softSearchWord.join()}]`)
                        console.log(`발견된 저속한 표현 위치: [${softSearchWordPositions}]`)
                        foundedSoftSearchWords.push(softSearchWord.join(''))
                        foundedSoftSearchWordPositions.push(softSearchWordPositions)
                    }
                    else {
                        let tmp_tf = true;
                        for (let posix of foundedSoftSearchWordPositions) {
                            //포지션이 같을 때 강제 종료
                            if (posix[0]=== softSearchWordPositions[0] && posix[1]=== softSearchWordPositions[1]) {
                                tmp_tf =false; break;
                            }
                        }
                        if(tmp_tf) {
                            console.log(`isShuffled: ${isShuffled}`)
                            console.log(`원문: ${message}`)
                            console.log(`발견된 저속한 표현: [${softSearchWord.join()}]`)
                            console.log(`발견된 저속한 표현 위치: [${softSearchWordPositions}]`)
                            foundedSoftSearchWords.push(softSearchWord.join(''))
                            foundedSoftSearchWordPositions.push(softSearchWordPositions)
                        }
                    }


                }
            }

        }

        //부적절하게 겹받침 많이 사용했는지 여부 확인하기

        let tooMuchDouble ={val:false, pos:[], txt:[]};

        tooMuchDouble = {
                val: tooMuchDouble.val || Utils.tooMuchDoubleEnd(message).val,
                pos: [...tooMuchDouble.pos, ...Utils.tooMuchDoubleEnd(message).pos],
                txt: [...tooMuchDouble.txt, ...Utils.tooMuchDoubleEnd(message).txt]
            }



        // 결과 출력
        if (needMultipleCheck === true) {
                return {
                    founded: foundedBadWords,
                    positions: foundedBadWordPositions,
                    softSearchFounded: foundedSoftSearchWords,
                    softSearchPositions: foundedSoftSearchWordPositions,
                    //부적절하게 겹자음 받침을 많이 사용한 단어 적발.
                    tooMuchDoubleEnd: tooMuchDouble
                }
        }
        else {
            return {
                founded: foundedBadWords.slice(0),
                positions: foundedBadWordPositions.slice(0),
                softSearchFounded: foundedSoftSearchWords.slice(0),
                softSearchPositions: foundedSoftSearchWordPositions.slice(0),
                //부적절하게 겹자음 받침을 많이 사용한 단어 적발.
                tooMuchDoubleEnd: tooMuchDouble
            }
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

    // 정상 단어를 목록에 추가.
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
    // 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.
    static shuffledMessageFilter(message, isChar = false) {
        for(let char of message){
            if(Hangul.disassemble(char)[0] == 'ㅇ') continue
            if(Hangul.isComplete(char))
                return false
        }
        return true
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

        // 데이터의 전항 후항을 순회합니다.
        for(let i=0;i<=1;i++){

            // 데이터의 모든 항목을 순회합니다.
            for(let itemIndex in data[i]){
                let item = data[i][itemIndex]

                // 데이터 항목이 배열인 경우
                // 재귀 컴포넌트 해석을 진행합니다.
                if(Array.isArray(item)){
                    let solvedData = Tetrapod.recursiveComponent(item)
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
