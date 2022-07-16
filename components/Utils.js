// 한글 사용 유틸리티 모았습니다.
import Hangul from 'hangul-js';
import ObjectOperation from './ObjectOperation';
import * as HO from './HangulObjects';

const Utils = {
    ...HO,

    // 배열/오브젝트 동일성 체크
    objectEqual: ObjectOperation.objectEqual,

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
            // isString이 거짓이면 첫 글자 위치만 추가
            if (!isString) indexes.push(i)

            // isString이 참이면 글자 전체 위치 추가
            else {
                let adding = Array.from(Array(search.length).keys()).map(x => x+i); // [i, i+1, ... i+l-1]
                indexes = indexes.concat(adding);
            }
            i = message.indexOf(search, ++i)
        }
        return indexes;
    },

    // manyArray => [[manyArray[0], manyArray[1]], [manyArray[1], manyArray[2]], ...]
    grabCouple: (manyArray) => {
        return manyArray.slice(0,-1).map((val, num)=> [val, manyArray[num+1]]);
    },

    // 단어 -> 낱자로 분리하는 함수. 매크로를 이용한 처리
    // 수정 - 매크로 ., !, +
    // . 이스케이프 문자.  .. -> .기호, .+ -> +기호 입력
    // 바! -> [바, 뱌, 빠,... ] -유사 문자까지 모두 포함
    // 바? -> 한글 ? 개수까지 완전 무시... -> 220713 구현 기능에서 일단 제거. nativeFind의 shuffle 관련 기능과 상충되는 부분 있어서 제외
    // 바+ -> [바, 박, 밖,...]. 받침 또는 중복자음 포함. 고 -> [괴, 괘, 공]
    // wordToarray -> 바?꾸 -> ['바?', '꾸']
    wordToArray: word => {
        let wordArray = []
        for (let i = 0; i <= word.length - 1; i++) {

            if ((i===1 || i>1 && word[i-2]!== "." )&& word[i-1] === ".") {
                wordArray.splice(-1, 1, word[i])
            }
            // // .뒤에 오지 않는 경우 ? 기호는 뒷 문자에 붙여서 밀어넣기. shuffle과 충돌하는 부분이 있어서 일단 구현하지 않는 것으로
            // else if (word[i] === "?") {
            //     wordArray.splice(-1, 1, wordArray.slice(-1)[0]+word[i])
            // }
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
        while (currentLength.length>=0) {
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

    // 리스트 더하기
    addList: ObjectOperation.addList,

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

    //빠른 연산을 위해 서로소 요건 판별하기
    isDisjoint: (a, b) => {
        if (typeof a === typeof b && typeof a === "object") {
            for (var i in a) {
                // 하나라도 안에 있으면 거짓을 출력.
                if (ObjectOperation.objectIn(a[i], b)) return false;
            }
            return true;
        }
        else {
            return false
        }
    },

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
        // elem이 문자열, 숫자, 불리안일 때 -> callback(elem) 반환
        if (typeof elem === "string" || typeof elem === "number" || typeof elem === "boolean") {
            return callback(elem);
        }
        // elem이 리스트일 때
        // [1,2,3,...] -> [callback(1),callback(2), callback(3),...]
        else if (typeof elem === "object" && Array.isArray(elem)) {
            let res = elem.map(comp => (Utils.listMap(comp, callback)))
            return res;
        }
        // elem이 오브젝트일 때
        // {k1:v1, k2:v2, ...} -> {k1:callback(v1), k2:callback(v2), ...}
        else if (typeof elem === "object") {
            let res = {}
            for (let key in elem) {
                res[key] = Utils.listMap(elem[key], callback)
            }
            return res;
        }
    },


    // 2차원 배열 형태로 정의된 것을 풀어쓰기. 반복적으로 풀어쓰기 가능
    // [[1,2],[3,4,5]] -> [13,14,15,23,24,25]
    recursiveComponent: (data) => {

        // 배열 정의되지 않은 것은 그대로 출력
        if (typeof data !== "object") return data
        else {
            // 데이터의 모든 항 순회
            for (let i=0;i<data.length;i++){

                // 데이터 원소 내부의 모든 항목을 순회합니다.
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

            // 그 다음에 null 원소는 모두 제거하기
            for (let i=0; i<data.length; i++) {
                data[i] = data[i].filter(x => x !==null );
            }

            // 데이터 리스트 곱 연산 수행 후 붙여쓰기
            // [[1,2],[3,4,5]] = [[1,3],[1,4],[1,5],[2,3],[2,4],[2,5]]-> [13, 14, 15, 23, 24, 25]
            let presolvedData = ObjectOperation.productList(data)
            let solvedData = presolvedData.map(x=> x.join(""))

            return solvedData
        }

    },

    // Hangul.disassemble 상위 호환
    // key 조건: part(초중종), key(키보드), sound(음소.복모음, 겹받침 모두 쪼개기)
    disassemble: (msg, cond='key', grouped=false ) => {
        let cont = Hangul.disassemble(msg, true); // 한글 키별로 낱자 분리

        let res = []
        for (let letterList of cont) {
            switch(cond) {
                // 키보드 기준. Hangul.disassemble과 동일하게 처리
                case 'key':
                case 'type':
                    res.push(letterList);
                    break;
                case 'part':
                    let idx = 0;
                    let part = letterList;
                    // 복자음 및 복받침 합치기
                    while (idx<part.length) {
                        if (idx<part.length-1 && Utils.objectIn([part[idx], part[idx+1]], Object.values(HO.doubleMap))) {
                            for (var key in HO.doubleMap) {
                                if (ObjectOperation.objectEqual([part[idx], part[idx+1]], HO.doubleMap[key])) {
                                    part.splice(idx, 2, key)
                                    break;
                                }
                            }
                        }
                        idx++;
                    }
                    res.push(part);
                    break;
                case 'sound':
                    idx = 1; // 초성은 쌍자음도 음단위로 나누지 않으므로 일단 무시
                    part = letterList;
                    // 나누기
                    while(idx<part.length) {
                        if (Object.keys(HO.doubleMap).indexOf(part[idx])>-1) {
                            let kv = HO.doubleMap[part[idx]];
                            part.splice(idx, 1, kv[0], kv[1]);
                            idx +=2;
                        }
                        else {
                            idx++;
                        }
                    }
                    res.push(part);
                    break;
            }
        }
        // grouped가 참이면 res, 거짓이면 합쳐서 출력
        return grouped? res: ObjectOperation.addList(...res);
    },


    // [var1,var2]가 겹자모 리스트 안에 있는지 판단하기.
    isDouble: (var1, var2, allowSim =false) => {

        let compareList;
        // compareList -> 각 원소의 형태가 "['v1','v2']"
        // allowSim이 리스트 형식일 때...
        if (typeof allowSim === 'object') {
            // allowSim의 원소가 [v1,v2] 형식이면 compareList는 allowSim 그대로, String이면 원소를 [v[0], v[1]] 형식으로 바꿔주기.
            compareList = Array.isArray(allowSim[0])? allowSim : allowSim.map(x=> [x[0], x[1]])
        }
        // 아니면 allowSim이 true/false 때로... true는 유사자음 허용..
        else {
            compareList = allowSim?
                (
                    [
                        ...Utils.doubleConsonant,
                        ...Utils.doubleVowel,
                        ...[
                            ["ㄱ","7"], ["7","7"], ...Utils.productList([["ㄱ", '7'],["ㅅ", "^"]]),
                            ["ㄹ","^"], ["#","ㅅ"], ["ㅂ","^"], ["#","ㅅ"],
                            ["ㅗ","H"], ["ㅜ","y"], ["t","y"], ["T","y"],
                            ...Utils.productList([["ㅗ","ㅜ", "t", "T", "ㅡ", "_"], ["ㅣ", "!", "I", "1","l", "|"]])
                        ].map(x=> [x[0],x[1]])
                    ]
                )
                :[...Utils.doubleConsonant, ...Utils.doubleVowel];
        }
        /// 각 원소에 대해서 포함여부 확인하기.
        return Utils.objectIn([var1, var2], compareList);
    },

    // 겹자모 리스트 -> 겹자모로 바꾸어 출력
    makeDouble(var1, var2) {
        if (Utils.isDouble(var1, var2) || (['ㄱ', 'ㄷ', 'ㅂ', 'ㅅ', 'ㅈ'].indexOf(var1)>-1 && var1 === var2)) {
            for (let key in HO.doubleMap) {
                if (Utils.objectEqual(HO.doubleMap[key], [var1, var2])) {
                    return key;
                }
            }
        }
        else {
            return null
        }
    },

    // 매핑형식 - 키: 어구, {value: 해석된 어구
    // 파싱하기 {씨:{value:시, index:[0]}, 브얼:{value:벌, index:[1]}} ->
    // => {messageList: ['씨', '브얼'], messageIndex: [0,1], parsedMessage: ['시', '벌']}
    // 맵 형식 - qwertyToDubeol map, antispoof map, dropDouble map을 입력으로 한다.
    parseMap: (map, isReassemble = true) => {
        let originalMessageList = []; // 원문의 리스트
        let originalMessageIndex = []; // 메시지의 원무의 위치 표시
        let parsedMessage = []; // 파싱된 메시지 리스트
        let search = 0;
        let maxVal = Object.values(map).map(x=> (Math.max(...x.index))); // index의 값 중에서 최대값.
        let isPartKey = false; // isReassemble 형식일 때

        while(search <= Math.max(...maxVal)) {
            for (let val in map) { // val : 원문의 부분 텍스트값
                // index 값이 존재하면
                if (map[val].index.indexOf(search)!==-1) {
                    originalMessageIndex.push(search); // 인덱스 값 추가
                    originalMessageList.push(val); //
                    parsedMessage.push(map[val].value);

                    if (isReassemble && /[ㄱ-ㅎ]/.test(val[0])) {
                        let lastVal = originalMessageList.slice(-1)[0]; // originalMessageList의 마지막 글자
                        let joined = lastVal + val[0]; // 마지막 글자에 val[0]을 붙임
                        search += (Hangul.assemble(Hangul.disassemble(lastVal)).length === Hangul.assemble(Hangul.disassemble(joined)).length) ?
                            val.length-1: val.length; // lastVal과 joined가 한글로 재조합시에 글자가 길어지면 길이에 -1 추가.
                        isPartKey = true;
                    }
                    else search += val.length;
                }
            }
        }
        return {
            messageList: originalMessageList,
            joinedMessage: isPartKey? Hangul.assemble(Hangul.disassemble(originalMessageList.join(''))): originalMessageList.join(''),
            messageIndex: originalMessageIndex,
            parsedMessage: parsedMessage,
            joinedParsedMessage: parsedMessage.join("")
        }
    },

    // reserveMap - parseMap의 역함수. parsed된 내용을 이용해서 맵 복구
    // {messageList: ['씨', '브얼'], messageIndex: [0,1], parsedMessage: ['시', '벌']}
    // =>
    reserveMap: (parsed) => {
        const messageList = parsed.messageList;
        const messageIndex = parsed.messageIndex;
        const parsedMessage= parsed.parsedMessage;
        let res = {}
        for (let i in messageList) {
            if (res[messageList[i]]) {
                res[messageList[i]].index.push(messageIndex[i])
            }
            else {
                res[messageList[i]] = {value: parsedMessage[i], index: [messageIndex[i]]}
            }
        }
        return res;
    },

    // 한글 낱자를 초성중성종성으로 분리하기
    choJungJong: (char) => {

        const consonant = Utils.charInitials;
        const vowel = Utils.charMedials;
        const charDisassemble = Hangul.disassemble(char); // 오브젝트가 disassemble 함수에 최적화되어 있어서 일단 수정 보류
        let res = {cho:[], jung:[], jong:[]}
        // 오류 방지를 위해 한글 낱자일 때에만 함수 수행.
        if (/[가-힣]/.test(char)) {
            for (var i =0; i<charDisassemble.length; i++) {
                // 초성 : 처음일 때 들어감.
                if (i===0 && consonant.indexOf(charDisassemble[i])>-1) res.cho.push(charDisassemble[i])
                // 중성 : 모음에 있을 때 들어감.
                else if (vowel.indexOf(charDisassemble[i])>-1) res.jung.push(charDisassemble[i])
                else res.jong.push(charDisassemble[i])
            }
        }
        return res;
    },

    // 메시지를 심플하게 맵으로 바꾸어주는 함수
    // 예시 : 가을 -> {가: {value:가,  index:[0]}, 을: {value:을, index:[1]}}
    msgToMap: (msg) => {
        const msgSplit = msg.split('');
        let res = {}
        for(let ind in msgSplit) {
            if (!res[msgSplit[ind]]) {
                res[msgSplit[ind]] = {value: msgSplit[ind], index: [parseInt(ind)]}
            }
            else {
                res[msgSplit[ind]].index.push(parseInt(ind));
            }
        }
        return res;
    },

    // 한글, 영자 혼합시에 한글 낱자로 분리한 뒤에 조합하기
    // isMap이 false이면 문자열만 출력 -> gksrmf -> 한글
    // isMap이 true이면 맵 형식으로 출력 -> gksrmf -> {gks: {value:한, index:[0]}, rmf: {value:글, index:[3]}}
    qwertyToDubeol: (msg, isMap = false)=> {
        //
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
            let msgSplit = msg.split(""); // 단어 낱자로 분리
            let res = {}; // 한글 치환 가능한 문자셋을 매핑으로 결과 저장
            let temp = ""; // 추가할 글씨에
            // 자음이나 영어 자음에 대응되는 경우
            msgSplit.map( (letter, ind) => {
                let consonant = [...Utils.charInitials, "q", "w", "e", "r", "t", "a", "s", "d", "f", "g", "z", "x", "c", "v"]; // 자음
                let vowel = [...Utils.charMedials, "y", "u", "i", "o", "p", "h", "j", "k", "l", "b", "n", "m"]; // 모음

                // 한글로 치환할 수 있는 문자셋 temp를 res에 입력
                let resMacro = (letter, val=temp) => {
                    if (val!=="") {
                        if (!res[val]) res[val] = {value: Utils.qwertyToDubeol(val), index: [ind-val.length]}
                        else { res[val].index.push(ind-val.length);}
                        temp = letter;
                    }
                }
                // 첫 글자는 무조건 추가.
                if (ind ===0) {
                    temp +=letter;
                }
                // 자음의 경우 -> 뒤에 모음이 아닌 문자가 올 때만 앞글자에 붙인다.
                else if (consonant.indexOf(letter.toLowerCase()) !==-1 && (ind===msg.length-1 || vowel.indexOf(msgSplit[ind+1].toLowerCase()) ===-1)) {
                    // 앞에 모음이거나
                    if (vowel.indexOf(msgSplit[ind-1].toLowerCase())!==-1 ) {
                        temp +=letter;
                    }
                    // 앞앞이 모음& 앞자음이 쌍자음 형성할 수 있을 때
                    else if (ind>1 && vowel.indexOf(msgSplit[ind-2].toLowerCase())!==-1 && consonant.indexOf(msgSplit[ind-1].toLowerCase())!==-1) {
                        let mode = [
                            Object.keys(mapping).indexOf(msgSplit[ind-1])!==-1 ? mapping[msgSplit[ind-1]] : msgSplit[ind-1],
                            Object.keys(mapping).indexOf(letter)!==-1 ? mapping[letter] : letter
                        ];
                        // 겹자음 실험
                        if (Utils.objectIn(mode, Utils.doubleConsonant)) resMacro(letter);
                        else temp += letter;
                    }
                    else resMacro(letter);
                }
                // 모음의 경우 앞에 자음이 오면 무조건 앞글자에 붙이기
                else if (vowel.indexOf(letter.toLowerCase())!==-1 && consonant.indexOf(msgSplit[ind-1].toLowerCase()) !==-1) {
                    temp +=letter;
                }
                // 복모음 케이스도 고려해보자
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
                if (!res[temp]) res[temp]= {value:Utils.qwertyToDubeol(temp), index: [msg.length-temp.length]}
                else {res[temp].index.push(msg.length-temp.length);}
                temp = "";
            }
            return res;
        }

    },

    // 자모조합을 악용한 비속어 걸러내기 ㄱH^H77| 검출 가능. isMap 사용시 오브젝트 형태로 결과물 도출.
    // isMap이 거짓일 때 : ㄱH^H77| -> 개색기
    // isMap이 참일 때: ㄱH^H77ㅣ -> {ㄱH: {value:개, index: [0]}, ^H7: {value: 색, index:[2]}, 7ㅣ: {value:기, index:[5]}}
    antispoof: (msg, isMap = false) => {

        const korConsonant = /[ㄱ-ㅎ]/;
        const korVowel = /[ㅏ-ㅣ]/;
        const korLetter = /[가-힣]/;
        // const singleParts = Object.keys(Utils.singlePronounce);
        const simConsonant = Object.keys(Utils.similarConsonant); // 자모/자형 오브젝트
        const simVowel = Object.keys(Utils.similarVowel);

        const msgAlphabet = msg.split(""); // 낱자별로 나누어 처리하기
        let msgAlphabetType = []; //타입별로 나누기 - 리스트 사용하지 않고 타입

        // 메시지 알파벳에 유형 추가
        for (var letter of msgAlphabet ) {
            if (["ㄳ", "ㄵ", "ㄶ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅄ"].indexOf(letter)>-1) {msgAlphabetType.push('f')} // 복모음 받침 전용
            else if (korConsonant.test(letter)) { msgAlphabetType.push('c'); } // 자음
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

            // 음절의 첫 글자를 preSyllable에 추가하는 함수. 원래 낱말 대신 변형해서 입력하고 싶을 때는 msg1로 대신 입력.
            let splitSyllable = (msg1 = msgAlphabet[i]) => {
                preSyllable.push( msg1 );
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

            // 첫자음 잡아내는 함수 작성
            const isFirstDouble = (var1, var2) => {
                let res = false;
                const valFirstDouble = [['7', '7'], ['c', 'c'], ['#', '#'], ['^','^'], ['^', 'n'], ['n', '^'], ['n','n'], ['#', '^'], ['^', '#']]

                for (var dbl of valFirstDouble) {
                    if (Utils.objectEqual([var1, var2], dbl)) res = true;
                }
                return res;
            }

            switch(msgAlphabetType[i]) {

                // 한글이나 공백, 기타문자 -> 그대로 삽입. 한 음절에 하나의 글자만 사용가능하며, 다른 문자 뒤에 붙을 수 없음.
                case 'h':
                case 's':
                case 'e':
                    splitSyllable();
                    break;

                // 자음 -> 모음/유사모음 뒤에 오거나 받침 없는 한글 뒤에 오면서 뒤에 모음/유사모음이 따라오지 않을 때 앞 음절에 붙임.
                // 특수한 겹받침일 때에도 케이스 추가
                case 'c':
                    // 첫자이거나 바로 뒤에 모음이 오면 무조건 음절분리.
                    if (i === 0 || (i<msgLength-1 &&  ['v','w'].indexOf(msgAlphabetType[i+1])>-1)) { splitSyllable();}
                    else {
                        // 자음이 앞글자에 붙는 경우 - 앞에 모음/유사모음, 뒤에 모음/유사모음 없음, ㄸ, ㅃ, ㅉ도 아님.
                        if (
                            ['ㄸ', 'ㅃ', 'ㅉ'].indexOf(msgAlphabet[i]) ===-1 && ['v', 'w'].indexOf(msgAlphabetType[i-1])>-1
                        )
                            joinFrontSyllable();
                        // 앞자음과 합성해서 겹자음을 만드는 케이스 분리하기
                        else if (
                            i>1 && ['v', 'w'].indexOf(msgAlphabetType[i-2])>-1 && Utils.isDouble(msgAlphabet[i-1], msgAlphabet[i])
                        )
                            joinFrontSyllable();

                        // 나머지 경우 - 그냥 뒤 음절에 배치
                        else splitSyllable();
                    }
                    break;

                // 받침 전용 자음의 경우 - 앞에 모음이 있으면 앞 음절에 붙이고 아님 그냥 나누기
                case 'f':
                    if (i>0 && ['v', 'w'].indexOf(msgAlphabetType[i-1])>-1) {joinFrontSyllable()}
                    else splitSyllable();
                    break;

                //모음인 경우
                case 'v':
                    // 첫자일 때는 무조건 삽입.
                    if (i === 0 ) { splitSyllable();}
                    else {
                        // 자음이 앞에 있을 때는 앞에 붙는다.
                        if (msgAlphabetType[i-1] ==='c' || msgAlphabetType[i-1] === 'd') joinFrontSyllable();
                        // 앞의 모음과 함께 복모음 형성할 수 있는 경우 앞에 붙인다.
                        else if (
                            i>1 && (msgAlphabetType[i-2] ==='c' || msgAlphabetType[i-2] === 'd') && Utils.isDouble(msgAlphabet[i-1], msgAlphabet[i])
                        )
                            joinFrontSyllable();
                        // 나머지는 그대로 뒤 움절에 붙이기
                        else splitSyllable();

                    }
                    break;

                //유사 자음인 경우
                case "d":

                    // 처음에는 그냥 삽입. 그러나 모음/유사모음 앞에서만큼은 자음으로 변형되서 들어간다.
                    if (i === 0 ) {
                        splitSyllable(
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
                            Utils.charMedials.indexOf(Hangul.disassemble(msgAlphabet[i-1]).slice(-1)[0])!==-1  && (i < msgLength-1 &&  msgAlphabetType[i+1] !=='v' && msgAlphabetType[i+1] !== 'w'  )
                        )
                            joinFrontSyllable(true);

                        // 나머지 경우 - 그냥 뒤 음절에 배치
                        else
                            splitSyllable(
                                (msgLength>1 && (msgAlphabetType[i+1] ==='v' || msgAlphabetType[i+1] === 'w' || isFirstDouble(msgAlphabet[i], msgAlphabet[i+1]) ))?
                                    Utils.similarConsonant[msgAlphabet[i]] : msgAlphabet[i]
                            );
                    }
                    break;

                // 유사 모음인 경우
                case 'w':
                    // 첫자일 때는 무조건 삽입. 유사모음은 단어 변형하지 않고 삽입.
                    if (i === 0 ) { splitSyllable();}
                    else {
                        // 자음이 앞에 있을 때는 앞에 붙는다.
                        if (msgAlphabetType[i-1] ==='c' || msgAlphabetType[i-1] === 'd') joinFrontSyllable(true);
                        // 앞의 모음과 함께 복모음 형성할 수 있는 경우 앞에 붙인다.
                        else if (
                            i>1 && (msgAlphabetType[i-2] ==='c' || msgAlphabetType[i-2] === 'd') && Utils.isDouble(msgAlphabet[i-1], msgAlphabet[i], true)
                        )
                            joinFrontSyllable(true);
                        // 나머지는 그대로 뒤 움절에 붙이기
                        else splitSyllable();

                    }
                    break;
            }
        }

        // 결과값
        let res = ""; // 문자열 기록
        let resObj = {}; // isMap이 참일 때는 resObj도 기록

        for (i=0; i<preSyllable.length; i++) {

            res += Hangul.assemble(Hangul.disassemble(preSyllable[i])); // isMap 여부와 무관하게 res 기록
            if (isMap) {
                // 키값이 있으면 인덱스만 추가
                if (Object.keys(resObj).indexOf(preSyllableOrigin[i])!== -1) {
                    resObj[preSyllableOrigin[i]]["index"].push(preIndex[i]);
                }
                else {
                    resObj[preSyllableOrigin[i]] = {value: Hangul.assemble(Hangul.disassemble(preSyllable[i])), index:[preIndex[i]] };
                }
            }
        }

        // 마지막으로 자음/모음 정리하기 ㄱ기 -> 끼, 기ㅏ-> 갸 등
        // 낱자별로 분해
        let resList = Hangul.disassemble(res, true);
        let minSize = Math.min(...resList.map(x=> x.length));
        // 낱자음/낱모음이 있을 때
        let resList2 = [] // 낱자음 낱모음을 붙여서
        let joinKey = {} // 낱자 붙일 키 모음
        let preKey='';
        let postKey='' // 낱자 붙일 키 변수
        let skipElement = false; // 넘길지 테스트
        // 단자음, 단모음이 있을 경우
        if (minSize == 1) {
            // 낱자에 대해서 분석
            for (let ind in resList) {
                // 자음+같은자음+낱자
                if (ind<resList.length-1 && resList[ind].length ===1 && ['ㄱ', 'ㄷ', 'ㅂ', 'ㅅ', 'ㅈ'].indexOf(resList[ind][0]) >-1 && resList[ind][0] == resList[parseInt(ind)+1][0]) {
                    resList2.push([Utils.makeDouble(resList[ind][0], resList[ind][0]), ...resList[parseInt(ind)+1].slice(1)]);
                    skipElement = true;
                    if (isMap) {
                        for (let key in resObj) {
                            // console.log(key, resObj[key].value, resList[ind], resList[parseInt(ind)+1])
                            if (resObj[key].value === Hangul.assemble(resList[ind])) {
                                preKey = key;
                                // console.log(preKey)
                            }
                            else if (resObj[key].value == Hangul.assemble(resList[parseInt(ind)+1])) {
                                postKey = key;
                                // console.log(postKey, 'ENDDDD')
                            }
                        }
                        joinKey[resList2.length-1] = [preKey, postKey];
                    }
                }
                // 뒷자음이 앞음절과 겹자음 받침 형성 가능할 때 또는 뒷모음이 앞음절과 겹모음 형성 가능할 때
                else if (
                    ind<resList.length-1 && resList[parseInt(ind)+1].length ===1 && ObjectOperation.objectIn([resList[ind][resList[ind].length-1], resList[parseInt(ind)+1][0]], Utils.listUnion(HO.doubleConsonant, HO.doubleVowel))
                    ) {
                    resList2.push([...resList[ind].slice(0,-1), Utils.makeDouble(resList[ind][resList[ind].length-1], resList[parseInt(ind)+1][0])])
                    skipElement = true;
                    if (isMap) {
                        for (let key in resObj) {
                            if (resObj[key].value === Hangul.assemble(resList[ind])) {
                                preKey = key;
                            }
                            else if (resObj[key].value === Hangul.assemble(resList[parseInt(ind)+1])) {
                                postKey = key;
                            }
                        }
                        joinKey[resList2.length-1] = [preKey, postKey];
                    }
                }
                // 나머지
                else {
                    if (!skipElement) {
                        resList2.push(resList[ind]);
                    }
                    skipElement = false;
                }
            }
            if (!isMap) {
                res = resList2.map(x=> Hangul.assemble(x)).join('')
            }
            else {
                for (let keyNum in joinKey) {
                    // console.log(keyNum, joinKey[keyNum])
                    preKey = joinKey[keyNum][0]
                    postKey = joinKey[keyNum][1]
                    resObj[preKey+postKey] = {value: Hangul.assemble(resList2[keyNum]), index: resObj[preKey].index}
                    delete resObj[preKey]
                    delete resObj[postKey]
                }
            }
        }
        return isMap ? resObj : res;
    },

    // ㅇ, ㅡ 제거, 된소리/거센소리 예사음화 후 비속어 찾기. isMap을 사용하면 제거한 모음, 자음 대응 맵 찾기.
    // 예시 : 브압오 -> {'브아':'바', 'ㅂ오':'보'}
    // simplify 옵션을 true로 지정하면 거센소리 된소리를 예사소리화하기, 복모음, 이중모음 단모음화하는 작업도 추가.
    // 메시지는 반드시 한글자모로만 조합.
    dropDouble: (msg, isMap=false, simplify = false) => {

        let msgAlphabet = Hangul.disassemble(msg, false); // 낱자 단위로 분해

        // 모음 바뀔 때
        const normalify = {"ㄲ":'ㄱ', 'ㄸ':'ㄷ', 'ㅃ':'ㅂ','ㅆ':'ㅅ', 'ㅉ':'ㅈ',
            'ㅋ':'ㄱ', 'ㅌ':'ㄷ', 'ㅍ':'ㅂ', 'ㅒ':'ㅐ','ㅖ':'ㅔ'}; // 된소리/거센소리 단순화
        const aspiritedSound = {"ㄱ": "ㅋ", "ㄷ":"ㅌ", "ㅂ":"ㅍ", "ㅅ":"ㅌ", "ㅈ":"ㅌ",
            "ㅊ":"ㅌ", "ㅋ":"ㅋ", "ㅌ":"ㅌ","ㅍ":"ㅍ", "ㅎ":"ㅎ"} // ㅎ앞 거센소리 연음화
        const yVowel = {"ㅏ":"ㅑ", "ㅐ":'ㅒ', 'ㅑ':'ㅑ', 'ㅒ':'ㅒ', 'ㅓ':'ㅕ', 'ㅔ':'ㅖ', 'ㅕ':'ㅕ',
            'ㅖ':'ㅖ', 'ㅗ':'ㅛ', 'ㅛ':'ㅛ', 'ㅜ':'ㅠ', 'ㅠ':'ㅠ', 'ㅡ':'ㅠ', 'ㅣ':'ㅣ' } // 이어 -> 여 단축을 위한 작업

        // 유사모음 축약형으로 잡아내기 위한 조건 갸앙 ->걍
        const vowelLast = {'ㅏ':['ㅏ'], 'ㅐ':['ㅐ', 'ㅔ'], 'ㅑ': ['ㅏ', 'ㅑ'], 'ㅒ':['ㅐ', 'ㅔ', 'ㅒ', 'ㅖ'],
            'ㅓ' : ['ㅓ'], 'ㅔ': ['ㅔ', 'ㅐ'], 'ㅕ': ['ㅓ', 'ㅕ'], 'ㅖ':['ㅐ', 'ㅔ', 'ㅒ', 'ㅖ'],
            'ㅗ':['ㅗ'], 'ㅛ':['ㅛ', 'ㅗ'], 'ㅜ':['ㅜ', 'ㅡ'], 'ㅠ':['ㅠ', 'ㅜ', 'ㅡ'], 'ㅡ':['ㅡ'], 'ㅣ':['ㅣ']}

        // 유사모음 축약형. 그러나 이 경우는 뒷모음을 따를 때 -> 구아 -> 과, 구에 -> 궤 고언세 -> 권세
        const vowelPair = [['ㅗ', 'ㅏ'], ['ㅗ', 'ㅐ'], ['ㅗ', 'ㅓ'], ['ㅗ', 'ㅔ'],
            ['ㅜ', 'ㅏ'], ['ㅜ', 'ㅐ'], ['ㅜ', 'ㅓ'], ['ㅜ', 'ㅔ'], ['ㅜ', 'ㅣ'], ['ㅡ', 'ㅣ']]
        // map일 때 최종결과용
        let singleSyllable = []; // 음절 하나 표시할 때 사용.
        let divideSyllable = []; // 음절단위 나누기
        let res = {}; // 결과 오브젝트

        // 상쇄모음 조합 -

        if (!isMap) {
            let i=0;
            // 문제 해결을 위해 단모음화하는 과정은 자음 축약화 프로세스 다음으로 미루자.
            while ( i <msgAlphabet.length) {
                // 첫자, 끝자 제외 ㅇ일 때
                if (1<i<msgAlphabet.length-1 && msgAlphabet[i] === 'ㅇ') {
                    // 자음+모음+ㅇ+모음
                    if (Utils.charInitials.indexOf(msgAlphabet[i-2])!== -1 && Utils.charMedials.indexOf(msgAlphabet[i-1])!== -1 && Utils.charMedials.indexOf(msgAlphabet[i+1])!== -1
                    ) {
                        // 자음+ㅡ+ㅇ+모음 -> 그아 -> 가
                        if (msgAlphabet[i-1] === 'ㅡ') {
                            /// ㅢ는 예외처리. 그이 -> 긔
                            if ( msgAlphabet[i+1] === "ㅣ") {msgAlphabet.splice(i-1, 3, 'ㅢ'); i++;}
                            else  { msgAlphabet.splice(i-1, 2); }
                        }
                        // 자음+ㅣ+ㅇ+모음. 이중모음이 뒤에 올 때는 예외처리. 기아 -> 갸
                        else if (msgAlphabet[i-1] === 'ㅣ' && Object.keys(yVowel).indexOf(msgAlphabet[i+1])!==-1 && Utils.charMedials.indexOf(msgAlphabet[i+2])===-1 ) {
                            msgAlphabet.splice(i-1, 3, yVowel[msgAlphabet[i+1]]);
                        }
                        // 자음+모음+ㅇ+중복모음 -> 고오 -> 고
                        else if( Object.keys(vowelLast).indexOf(msgAlphabet[i-1])!== -1 && vowelLast[msgAlphabet[i-1]].indexOf(msgAlphabet[i+1])!==-1 ) {
                            msgAlphabet.splice(i, 2);
                        }
                        // 자음+모음+ㅇ+모음, 복모음 형성 가능한 조합. 고아 -> 과
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
                    // 자음+복모음+ㅇ+뒤모음과 동일함. 귀이 -> 귀. 단 ㅚ+이는 제외.
                    else if (i>2 && Utils.charInitials.indexOf(msgAlphabet[i-3])!== -1 && Utils.charMedials.indexOf(msgAlphabet[i-1])!== -1 &&
                        (Utils.isDouble(msgAlphabet[i-2], msgAlphabet[i-1]) === true && !(msgAlphabet[i-2]==='ㅗ' && msgAlphabet[i-1]==='ㅣ') ) && msgAlphabet[i-1] == msgAlphabet[i+1]
                    ) {
                        msgAlphabet.splice(i,2);
                    }
                    // 자음+ㅇ+모음 -> ㄱ오 -> 고. ㅇ만 지우기. 복자음일 때도 해결 가능. 단 ㅇ일 때는 예외로
                    else if (Utils.charInitials.indexOf(msgAlphabet[i-1])!== -1 && msgAlphabet[i-1] !=='ㅇ' && Utils.charMedials.indexOf(msgAlphabet[i+1])!== -1
                    ) msgAlphabet.splice(i, 1);

                    else i++; // 다음으로 넘기기
                }
                // 다른 자음일 때는
                else if (1<i<msgAlphabet.length-1 && Utils.charInitials.indexOf(msgAlphabet[i]) !== -1) {
                    // 앞의 받침이 뒤의 자음과 "사실상 중복일 때" 앞 자음 제거. 그 앞에 모음 오는지, 자음 오는지는 상관 없음. 겆지 -> 거지
                    if (Utils.charInitials.indexOf(msgAlphabet[i-1])!== -1 && (Utils.objectIn(msgAlphabet[i-1], Utils.jointConsonant[msgAlphabet[i]]))
                        && Utils.charMedials.indexOf(msgAlphabet[i+1])!== -1
                    ) msgAlphabet.splice(i-1, 1);

                    // ㅎ과 결합했을 때 거센소리화. 색히 -> 새키
                    else if ( msgAlphabet[i] === 'ㅎ' && Object.keys(aspiritedSound).indexOf(msgAlphabet[i-1])!==-1) {
                        msgAlphabet[i-1] = aspiritedSound[msgAlphabet[i-1]];
                        msgAlphabet.splice(i, 1);
                    }
                    i++; // 다음으로 넘겨주기
                }
                // 나머지 경우
                else {
                    // 첫자이지만 자음 뒤에 ㅇ 아닌 자음+모음이 오는 경우 제거.
                    if (i===0 && Utils.charInitials.indexOf(msgAlphabet[0])!== -1 && Utils.charInitials.indexOf(msgAlphabet[1])!== -1 && msgAlphabet[1]!=="ㅇ" && Utils.charMedials.indexOf(msgAlphabet[2])!==-1 ) {
                        msgAlphabet.shift();
                    }
                        // 모음 뒤에 모음이 바로 오는 경우 맨 앞글자를 제거한다.
                        // else if (i===0 && Utils.charMedials.indexOf(msgAlphabet[0])!== -1 && Utils.charMedials.indexOf(msgAlphabet[1])!== -1) {
                        //     msgAlphabet.shift();
                    // }
                    else i++;
                }
            }
            // 단음화 작업 -> 복모음 단축 다 뽑아낸 이후에 작업
            if (simplify) {
                i = 0;
                while (i< msgAlphabet.length) {

                    if (Object.keys(normalify).indexOf(msgAlphabet[i])!== -1) {
                        msgAlphabet[i] = normalify[msgAlphabet[i]];
                        i++;
                    }
                    // 모음일 때는 앞의 모음과 복모음을 형성하지 못하는 경우 모음들만 제거하기  - 일단 dropDouble은 완전한 한글에서만 실험할 것.
                    else if (Utils.charMedials.indexOf(msgAlphabet[i])!== -1) {

                        // 겹모음 단모음화하기
                        if ( Object.keys(normalify).indexOf(msgAlphabet[i])!== -1) {
                            msgAlphabet[i] = normalify[msgAlphabet[i]];
                            i++;
                        }
                        // 복모음 단모음화하기
                        else if ( ObjectOperation.objectIn([msgAlphabet[i-1], msgAlphabet[i]],Utils.doubleVowel )) {
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
                    else i++;
                }
            }

            return Hangul.assemble(msgAlphabet);

        }
        // isMap으로 정의할 경우 음절 단위로 우선 쪼갠 뒤 dropDouble 수행
        else {
            let i =0;
            while ( i < msgAlphabet.length ) {

                // 처음일 때는
                if (i === 0 ) {
                    singleSyllable.push(msgAlphabet[i]);
                    i++;
                }
                // 나머지 경우
                else {
                    // 자음 ㅇ
                    if (msgAlphabet[i] === 'ㅇ') {

                        // 모음이 바로 앞에 오는 경우
                        if (Utils.charMedials.indexOf(msgAlphabet[i-1])!== -1) {
                            // 맨 마지막이거나 뒤에 모음이 안 오면 앞 글자에 붙여쓰기
                            if ( i === msgAlphabet.length - 1 || Utils.charMedials.indexOf(msgAlphabet[i + 1]) === -1 ) {
                                singleSyllable.push(msgAlphabet[i]);
                                i++;
                            }
                            // 자음+ㅡ+ㅇ+모음 패턴
                            else if (i>1 && Utils.charInitials.indexOf(msgAlphabet[i-2])!== -1  && msgAlphabet[i-1] ==='ㅡ') {
                                singleSyllable.push(msgAlphabet[i]);
                                i++;
                            }
                            // 자음+단모음+ㅇ+유사모음 패턴 - ㅇ과 유사모음을 앞음절로
                            else if (i>1 && i<msgAlphabet.length-1 && Utils.charInitials.indexOf(msgAlphabet[i-2])!==-1 &&
                                Object.keys(vowelLast).indexOf(msgAlphabet[i-1])!== -1 && vowelLast[msgAlphabet[i-1]].indexOf(msgAlphabet[i+1]) !== -1) {
                                singleSyllable = singleSyllable.concat([msgAlphabet[i], msgAlphabet[i+1]]);
                                i +=2;
                            }
                            // 자음+ㅣ+ㅇ+단모음 -> 자음+복모음 처리를 위해 ㅇ을 앞에 붙임.
                            else if (i>1 && i < msgAlphabet.length - 1 && Utils.charInitials.indexOf(msgAlphabet[i - 2]) !== -1 &&
                                msgAlphabet[i - 1] === 'ㅣ' && Object.keys(yVowel).indexOf(msgAlphabet[i + 1]) !== -1 && Utils.charMedials.indexOf(msgAlphabet[i+2]) === -1) {
                                singleSyllable = singleSyllable.concat([msgAlphabet[i], msgAlphabet[i+1]]);
                                i +=2;
                            }
                                // 자음 + 모음+ ㅇ+모음 -> 복모음 형성가능한 경우
                            // 자음 + 모음 + ㅇ + 모음에서 앞모음+뒷모음이 복모음을 형성할 수 있는 경우 ㅇ을 앞에 붙임
                            else if (i>1 && i < msgAlphabet.length - 1 && Utils.charMedials.indexOf(msgAlphabet[i - 1]) !== -1 && Utils.charMedials.indexOf(msgAlphabet[i + 1]) !== -1 &&
                                Utils.charInitials.indexOf(msgAlphabet[i - 2]) !== -1 ) {

                                if (Utils.objectIn([msgAlphabet[i-1], msgAlphabet[i+1]], vowelPair)) {
                                    singleSyllable = singleSyllable.concat([msgAlphabet[i], msgAlphabet[i+1]]);
                                    i +=2;
                                }
                                // 나머지 경우는 음절 나누기
                                else {
                                    divideSyllable.push(singleSyllable);
                                    singleSyllable = [msgAlphabet[i]];
                                    i++;
                                }
                            }
                            // 복모음+ㅇ+모음에서 뒷모음이 복모음과 겹침. 궈어 -> 궈
                            else if (2 < i < msgAlphabet.length - 1 && Utils.charInitials.indexOf(msgAlphabet[i - 3]) !== -1 &&
                                Utils.charMedials.indexOf(msgAlphabet[i-1])!==-1 && msgAlphabet[i + 1] === msgAlphabet[i -1] &&
                                Utils.isDouble(msgAlphabet[i-2], msgAlphabet[i-1]) === true && !(msgAlphabet[i-2]==='ㅗ' && msgAlphabet[i-1]==='ㅣ') ) {
                                singleSyllable = singleSyllable.concat([msgAlphabet[i], msgAlphabet[i+1]]);
                                i +=2;
                            }
                            // 나머지 케이스는 ㅇ으로 시작하는 글자 분리
                            else {
                                divideSyllable.push(singleSyllable);
                                singleSyllable = [msgAlphabet[i]];
                                i++;
                            }

                        }
                        // 자음이 바로 앞에 오는 경우
                        else if (Utils.charInitials.indexOf(msgAlphabet[i-1])!== -1) {
                            // 뒤에 모음이 올 때+앞에 ㅇ 아닌 자음이 올 때 앞 음절에 붙이기
                            if (i>1 && i < msgAlphabet.length - 1 && msgAlphabet[i - 1] !== 'ㅇ' && Utils.charMedials.indexOf(msgAlphabet[i + 1]) !== -1) {
                                singleSyllable = singleSyllable.concat([msgAlphabet[i], msgAlphabet[i+1]]);
                                i +=2;
                            }
                            // 나머지는 ㅇ을 시작으로 음절 분리
                            else {
                                divideSyllable.push(singleSyllable);
                                singleSyllable = [msgAlphabet[i]];
                                i++;
                            }
                        }
                        // 나머지는 ㅇ을 시작으로 음절 분리
                        else {
                            divideSyllable.push(singleSyllable);
                            singleSyllable = [msgAlphabet[i]];
                            i++;
                        }
                    }

                    // ㅇ 아닌 자음일 때
                    else if (Utils.charInitials.indexOf(msgAlphabet[i]) !== -1 && msgAlphabet[i] !== 'ㅇ') {
                        // 앞에 모음일 경우
                        if ( Utils.charMedials.indexOf(msgAlphabet[i - 1]) !== -1) {
                            // 뒷자음과 겹받침을 형성하는 경우 &
                            if (Utils.objectIn([msgAlphabet[i], msgAlphabet[i+1]], Utils.doubleConsonant)) {

                                // 일단 겹자음 바로 다음에 모음이 오면 겹자음 여부와는 무관하게 무조건 음절 나눈다.
                                if (i<msgAlphabet.length-2 && /[ㅏ-ㅣ]/.test(msgAlphabet[i+2])) {
                                    singleSyllable.push(msgAlphabet[i]);
                                    divideSyllable.push(singleSyllable);
                                    singleSyllable = [];
                                    i++;
                                }
                                // 맨 마지막에 오거나 뒤에 모음 또는 ㅇ,ㅎ, 중복모음이 오지 않을 때
                                else if ( i >= msgAlphabet.length -2 ||
                                    (Utils.charMedials.indexOf(msgAlphabet[i + 2]) === -1 && msgAlphabet[i + 2] !== 'ㅇ' && msgAlphabet[i+2]!== 'ㅎ'
                                        && !ObjectOperation.objectIn(msgAlphabet[i+1], Utils.jointConsonant[msgAlphabet[i+2]])  ) ) {
                                    singleSyllable = singleSyllable.concat( [msgAlphabet[i], msgAlphabet[i+1]] );
                                    divideSyllable.push(singleSyllable);
                                    singleSyllable = msgAlphabet[i+2]!==undefined?[msgAlphabet[i+2]]:[]
                                    i +=3;
                                }
                                // 뒤에 ㅇ, ㅎ, 중복자음이 오지만 그래도 그 다음에 모음이 안 올 때
                                else if ( i<msgAlphabet.length-2 &&
                                    (msgAlphabet[i+2] === 'ㅇ' || msgAlphabet[i+2] === 'ㅎ' || ObjectOperation.objectIn(msgAlphabet[i+1], Utils.jointConsonant[msgAlphabet[i+2]]))
                                    && Utils.charMedials.indexOf(msgAlphabet[i+3])=== -1) {
                                    singleSyllable = singleSyllable.concat([msgAlphabet[i], msgAlphabet[i+1]]);
                                    divideSyllable.push(singleSyllable);
                                    singleSyllable = [ msgAlphabet[i+2] ]
                                    i +=3;
                                }
                                // 뒷자음 중복시- 뒤로 넘기기.
                                else if (i<msgAlphabet.length-2 &&
                                    ObjectOperation.objectIn(msgAlphabet[i+1], Utils.jointConsonant[msgAlphabet[i+2]])
                                ) {
                                    singleSyllable.push(msgAlphabet[i]);
                                    divideSyllable.push(singleSyllable);
                                    singleSyllable = [msgAlphabet[i+1], msgAlphabet[i+2]];
                                    i +=3;
                                }
                                // 뒤에 ㅎ이 올 때 - 뒷모음으로 밀기
                                else if (i<msgAlphabet.length-2 && msgAlphabet[i+2]=== 'ㅎ') {
                                    // ㅎ 비음으로 밀어낼 수 있는 경우 한정
                                    if ( Object.keys(aspiritedSound).indexOf(msgAlphabet[i+1]) !==-1 ) {
                                        singleSyllable.push(msgAlphabet[i])
                                        divideSyllable.push(singleSyllable);
                                        singleSyllable = [msgAlphabet[i+1], msgAlphabet[i+2]];
                                        i +=3;
                                    }
                                    // 안 그런 경우는 그냥 통상적으로 나누기
                                    else {
                                        singleSyllable = singleSyllable.concat([msgAlphabet[i], msgAlphabet[i+1]]);
                                        i +=2;
                                    }
                                }
                                // 뒤에 ㅇ이 올 때 - 뒷모음으로 밀기
                                else if (i<msgAlphabet.length -2 && msgAlphabet[i+2] === 'ㅇ') {
                                    singleSyllable.push(msgAlphabet[i])
                                    divideSyllable.push(singleSyllable);
                                    singleSyllable = [msgAlphabet[i+1], msgAlphabet[i+2]];
                                    i +=3;
                                }
                                // 혹시 나머지 경우는...
                                else {
                                    singleSyllable = singleSyllable.concat([msgAlphabet[i], msgAlphabet[i+1]]);
                                    i +=2;
                                }

                            }
                            // 아닌 경우
                            else {
                                // 맨 마지막에 오거나 뒤에 모음 또는 ㅇ,ㅎ, 중복모음이 오지 않을 때
                                if ( i === msgAlphabet.length -1 ||
                                    (Utils.charMedials.indexOf(msgAlphabet[i + 1]) === -1 && msgAlphabet[i + 1] !== 'ㅇ' && msgAlphabet[i+1]!== 'ㅎ'
                                        && !ObjectOperation.objectIn(msgAlphabet[i], Utils.jointConsonant[msgAlphabet[i+1]])  ) ) {
                                    singleSyllable.push(msgAlphabet[i]);
                                    i++;
                                }
                                // 뒤에 ㅇ, ㅎ, 중복자음이 오지만 그래도 그 다음에 모음이 안 올 때
                                else if ( i<msgAlphabet.length-1 &&
                                    (msgAlphabet[i+1] === 'ㅇ' || msgAlphabet[i+1] === 'ㅎ' || ObjectOperation.objectIn(msgAlphabet[i], Utils.jointConsonant[msgAlphabet[i+1]]))
                                    && Utils.charMedials.indexOf(msgAlphabet[i+2])=== -1) {
                                    singleSyllable.push(msgAlphabet[i]);
                                    i++;
                                }
                                // 뒷자음 중복시- 뒤로 밀어내기
                                else if (i<msgAlphabet.length-1 &&
                                    ObjectOperation.objectIn(msgAlphabet[i], Utils.jointConsonant[msgAlphabet[i+1]])
                                ) {
                                    divideSyllable.push(singleSyllable);
                                    singleSyllable = [msgAlphabet[i], msgAlphabet[i+1]];
                                    i +=2;
                                }
                                // 뒤에 ㅎ이 올 때 - 뒷모음으로 밀기
                                else if (i<msgAlphabet.length-1 && msgAlphabet[i+1]=== 'ㅎ') {
                                    // ㅎ 비음으로 밀어낼 수 있는 경우 한정
                                    if ( Object.keys(aspiritedSound).indexOf(msgAlphabet[i]) !==-1 ) {
                                        divideSyllable.push(singleSyllable);
                                        singleSyllable = [msgAlphabet[i], msgAlphabet[i+1]];
                                        i +=2;
                                    }
                                    // 안 그런 경우는 그냥 통상적으로 나누기
                                    else {
                                        singleSyllable.push(msgAlphabet[i]);
                                        i++;
                                    }
                                }
                                // 뒤에 ㅇ이 올 때 - 뒷모음으로 밀기
                                else if (i<msgAlphabet.length -1 && msgAlphabet[i+1] === 'ㅇ') {
                                    divideSyllable.push(singleSyllable);
                                    singleSyllable = [msgAlphabet[i], msgAlphabet[i+1]];
                                    i +=2;
                                }
                                // 혹시 나머지 경우는...
                                else {
                                    divideSyllable.push(singleSyllable);
                                    singleSyllable = [msgAlphabet[i] ];
                                    i++;
                                }

                            }

                        }

                        // 나머지 - 뒷글자로 넘기기
                        else {
                            if(singleSyllable.length>0) divideSyllable.push(singleSyllable);
                            singleSyllable = [msgAlphabet[i]];
                            i++;

                        }
                    }

                    // 자음 바로 뒤 모음 - 앞글자에 붙인다.
                    else if (Utils.charMedials.indexOf(msgAlphabet[i]) !== -1 && Utils.charInitials.indexOf(msgAlphabet[i - 1]) !== -1) {
                        singleSyllable.push(msgAlphabet[i]);
                        i++;
                    }
                    // 겹모음 - 앞글자에 붙인다.
                    else if (i > 1 && Utils.charInitials.indexOf(msgAlphabet[i - 2]) !== -1 && Utils.charMedials.indexOf(msgAlphabet[i - 1]) !== -1) {
                        var tmp = true;
                        if (Utils.objectIn([msgAlphabet[i-1], msgAlphabet[i]], Utils.doubleVowel)) {
                            singleSyllable.push(msgAlphabet[i]);
                            tmp = false;
                            i++;
                        }

                        if (tmp) {
                            divideSyllable.push(singleSyllable);
                            singleSyllable = [msgAlphabet[i]];
                            i++;
                        }
                    }
                    // 나머지 케이스
                    else {
                        divideSyllable.push(singleSyllable);
                        singleSyllable = [msgAlphabet[i]];
                        i++;
                    }

                }

            }
            //마지막 문자 밀어넣기
            if (singleSyllable.length>0) divideSyllable.push(singleSyllable);

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
    tooMuchDoubleEnd: (msg, isStrong= false) => {
        const newMsg = msg.split("").filter(x=> (/[가-힣]/.test(x))); // 한글만 추출해서 리스트 표현
        const endPos = newMsg.map(x=> x.charCodeAt()%28); // 받침 코드 확인
        // 받침없음 - 16 -> ㄼ ->27, ㄽ->0, ㅎ->15
        // isStrong 여부에 따라 포괄적인 받침 - ㄳ, ㄵ, ㄶ, ㄺ, ㄻ, ㄼ, ㄽ, ㄾ, ㄿ, ㅀ, ㅄ  전체 잡을것인가 아님 부정적 받침 ㄳ, ㄺ, ㄻ, ㅄ만 잡을 것인가 확인
        const doubleEnd = isStrong? [19, 21, 22, 25, 26, 27, 0, 1, 2, 3, 6]: [19,25, 26, 6]
        let doubleEndPos = []; // 받침 위치
        // 연속 숫자 확인
        let tmp = 0;
        for (let i in endPos) {
            tmp = doubleEnd.indexOf(endPos[i])>-1 ? tmp+1:0;
            doubleEndPos.push(tmp)
        }
        const cnt = doubleEndPos.filter(x=>x>0).length; // 겹받침 총 갯수
        const contCnt = Math.max(...doubleEndPos); // 겹받침 최대 연속 갯수

        // 연속 3개 이상 또는 겹받침 3개가 있는 경우
        if (contCnt>2 && (newMsg.length/cnt)<=3) {
            let posVal = doubleEndPos.map((x,y)=> [x,y]).filter(x=>x[0]>0).map(x=>x[1]); // 겹받침이 있는 경우의 포지션 정보 추출
            let txtVal = posVal.map(x=> newMsg[x]);
            return {val:true, pos: posVal, txt: txtVal};
        }
        else {
            return {val:false, pos:[], txt:[]};
        }
    },

    // 단문자타입 확인하는 함수
    checkCharType: (char, antispoof=false) => {
        if (/^[가-힣]$/.test(char)) return 'h'; // 한글 낱자
        else if (['ㄸ', 'ㅃ', 'ㅉ'].indexOf(char)>-1) return 'i'; // 초성 전용
        else if (HO.charInitials.indexOf(char)>-1)  return 'c'; // 초성/종성 공용
        else if (/^[ㄱ-ㅎ]$/.test(char)) return 'f'; // 종성전용
        else if (/^[ㅏ-ㅣ]$/.test(char)) return 'v'; // 모음
        else {
            // antispoof 있으면 antispoof 기준으로 캐릭터 분류
            if (antispoof) {
                if (Object.keys(Utils.similarConsonant).indexOf(char)>-1) return 'd'; // 유사자음
                else if (Object.keys(Utils.similarVowel).indexOf(char)>-1) return 'w'; // 유사모음
                else if (/^\s+/.test(char)) return 's';
                else return 'e';
            }
            // antispoof 없으면 발음 기준 적용
            else {
                if (/^[aeiou]+$/.test(char)) return 'ev';
                else if (/^[yw]$/.test(char)) return 'eh';
                else if (/^[bcdfghjklmnpqrstvxz]+$/.test(char)) return 'ec';
                else if (/^\s+/.test(char)) return 's';
                else return 'e';
            }
        }
            },

    // 영어변환 한글로 하기. 최대한 일대일 대응으로만 잡아보자.
    engToKo: (msg, isMap=false) => {
        let msgSplit = msg.toLowerCase().split('');
        let i = 0;
        let korTypeObj = {} // 키 타입 확인
        for (let key in HO.alphabetPronounceMapping) {
            let partObj = HO.alphabetPronounceMapping[key]
            let partRes = []
            for (let key2 in partObj) {
                partRes = partRes.concat(partObj[key2])
            }
            korTypeObj[key] = partRes
        }

        let newMsgSplit = []; // 원소 형식은 [(발음),(조건), (원음)], 조건은 '초', '중', '종', '낱', '기'
        // msgSplit 영어한글 합치기 원칙.
        while (i < msgSplit.length) {
            let letter = msgSplit[i]; // 단어 체크
            // 반모음-> 이중모음 체크
            if (['y', 'w'].indexOf(letter) > -1) {
                let seq = i < msgSplit.length - 1 ? msgSplit[i + 1] : '';
                //
                if (['a', 'e', 'i', 'o', 'u'].indexOf(seq) > -1) {
                    let joined = msgSplit[i] + msgSplit[i + 1];
                    let secondJoined = i < msgSplit.length - 2 ? joined + msgSplit[i + 2] : 'xxx'; // yae 같은 모음 찾기 위해서
                    if (korTypeObj.doubleVowels.indexOf(secondJoined) > -1) {
                        newMsgSplit.push([secondJoined, '중']);
                        i += 3;
                    } else {
                        newMsgSplit.push([joined, '중']);
                        i += 2;
                    }
                } else {
                    if (letter === 'y') {
                        newMsgSplit.push(['y', '중']);
                        i++;
                    } else { // w 다
                        // 음에 모음 아닌 것이 오면 w는 무시한다.
                        i++;
                    }
                }
            }
            // 모음 체크
            else if (['a', 'e', 'i', 'o', 'u'].indexOf(letter) > -1 || /[ㅏ-ㅣ]/.test(letter)) {
                // eui 경우
                if (i < msgSplit.length - 2 && msgSplit.slice(i, i + 3).join("") === 'eui') {
                    newMsgSplit.push(['eui', '중']);
                    i += 3;
                } else {
                    let seq = i < msgSplit.length - 1 ? msgSplit[i + 1] : '';
                    // 알파벳 2개 모음
                    if (korTypeObj.vowels.indexOf(letter + seq) > -1) {
                        newMsgSplit.push([letter + seq, '중']);
                        i += 2;
                    }
                    // 나머지- 단모음.
                    else {
                        newMsgSplit.push([letter, '중']);
                        i++;
                    }
                }
            }
            // 자음 알파벳 또는 자음 낱자 체크 - 받침 확인이 필요함.
            else if (/^[a-z]$/.test(letter) || /[ㄱ-ㅎ]/.test(letter)) {
                // 받침이 올 때는 반드시 모음 뒤에 온다.
                if (newMsgSplit.length > 0 && newMsgSplit[newMsgSplit.length - 1][1] === '중') {
                    let seq = i < msgSplit.length - 1 ? msgSplit[i + 1] : ''; // 뒤의 낱자
                    let nextSeq = i < msgSplit.length - 2 ? msgSplit[i + 2] : ''; // 뒤의 뒤의 낱자
                    // seq가 모음 -> 초성으로 처리
                    if (/[aeiouy]/.test(seq) || (seq === 'w' && /[aeiou]/.test(nextSeq))) {
                        // 중성+x+중성은 ㄱ받침 + ㅅ음가를 차지하기에 특수하게 처리
                        if (letter === 'x') {
                            newMsgSplit.push(['x', '종']);
                            newMsgSplit.push(['x', '초']);
                            i++;
                        } else {
                            newMsgSplit.push([letter, '초']);
                            i++;
                        }
                    }
                    // seq가 자음, nextSeq가 모음 - 예외적인 몇몇 자음 빼고는 letter는 종성, seq는 초성처리
                    else if (/[a-z]/.test(seq) && /[^aeiouyw]/.test(seq) && /[aeiouyw]/.test(nextSeq)) {
                        let joined = letter + seq;
                        if (['ch', 'zh', 'sh', 'th'].indexOf(joined) > -1) {
                            newMsgSplit.push([joined, '초']);
                        } else {
                            newMsgSplit.push([letter, '종']);
                            newMsgSplit.push([seq, '초']);
                        }
                        i += 2;
                    }
                    // 나머지 seq가 자음일 때
                    else if (/[a-z]/.test(seq) && /[^aeiouyw]/.test(seq)) {
                        // letter+seq가 받침자음 형성 가능하면 받침처리
                        if (korTypeObj.endConsonants.indexOf(letter + seq) > -1) {
                            newMsgSplit.push([letter + seq, '종']);
                            i += 2;
                        }
                        // 나머지는 그냥 letter만 받침처리
                        else {
                            if (korTypeObj.endConsonants.indexOf(letter) > -1) {
                                newMsgSplit.push([letter, '종']);
                            }
                            i++; // 받침 여부와 무관하게
                        }
                    }
                    // 나머지 - seq가 자음도 모음도 아님 - 받침일 때에는 처리. 받침 아닐 때에는 무시
                    else {
                        if (korTypeObj.endConsonants.indexOf(letter) > -1) {
                            newMsgSplit.push([letter, '종']);
                        }
                        i++; // 받침 여부와 무관하게
                    }
                }
                // 중성 뒤에 오지 않으면 초성임.
                else {
                    let seq = i < msgSplit.length - 1 ? msgSplit[i + 1] : '';  // 다음 문자
                    if (korTypeObj.consonants.indexOf(letter + seq) > -1) {
                        newMsgSplit.push([letter + seq, '초']);
                        i += 2;
                    } else {
                        newMsgSplit.push([letter, '초']);
                        i++;
                    }
                }
            }
            // 낱자 처리 확인.
            else if (/[가-힣]/.test(letter)) {
                newMsgSplit.push([letter, '낱']);
                i++;
            }
            // 나머지 - 기타
            else {
                newMsgSplit.push([letter, '기']);
                i++;
            }

        }

        // 메시지 조작.
        i = 0;
        while (i<newMsgSplit.length) {
            // 초성 다음에 초성이 오면 중성 ['', '중'] 끼워넣기
            if (i<newMsgSplit.length-1 && newMsgSplit[i][1]==='초' && newMsgSplit[i+1][1]==='초') {
                newMsgSplit.splice(i+1, 0, ['', '중']);
                i+=2;
            }
            // 초성 아닌 것 다음에 중성이 오면 초성 ['', '초'] 끼워넣기
            else if (i<newMsgSplit.length-1 && newMsgSplit[i][1]!=='초' && newMsgSplit[i+1][1] ==='중') {
                newMsgSplit.splice(i+1, 0, ['', '초']);
                i+=2;
            }
            // 초성 b,c,d,g,l,m,n,p,q,r,t,x,z 바로 다음에 한글 낱자가 올 경우 지정된 낱자로 대체
            else if (i<newMsgSplit.length-1 && newMsgSplit[i][1] ==='초' && Object.keys(Utils.singlePronounce).indexOf(newMsgSplit[i][0])>-1 && newMsgSplit[i+1][1]==='낱') {
                newMsgSplit[i] = [Utils.singlePronounce[newMsgSplit[i][0]], '낱', newMsgSplit[i][0]]; // 3번째 리스트에 원본 보존
                i++
            }
            // 특수한 낱자들 다음에 한글 낱자나 기타가 올 경우 낱자로 대체
            else if (i<newMsgSplit.length-1&& newMsgSplit[i][1] === '기' && Object.keys(Utils.singlePronounce).indexOf(newMsgSplit[i][0])>-1 && ['낱', '기'].indexOf(newMsgSplit[i+1][1])>-1 ) {
                newMsgSplit[i] = [Utils.singlePronounce[newMsgSplit[i][0]], '낱', newMsgSplit[i][0]]; // 3번째 리스트에 원본 보존
                i++
            }
            // 나머지는 건드리지 않기
            else {
                i++;
            }
        }

        // 마지막으로 newMsgSplit을 이용해서 결과 메시지 유도하기
        newMsgSplit = newMsgSplit.map((x, idx)=> {
            // 영어 초중종, 혹은 아무것도 없는 것만 바꾸어보자.
            if (/[a-z]/.test(x[0]) || x[0]==='') {
                switch(x[1]) {
                    case '초':
                        let cObj = Utils.alphabetPronounceMapping.consonants;
                        // x[1]이 c일 때는 다음 모음에 따라 발음 결정
                        if (x[1]==='c') {
                            let seq = idx<newMsgSplit.length-1? newMsgSplit[idx+1][0]: '';
                            if (['e', 'i'].indexOf(seq)>-1) {
                                return ['ㅅ', '초', 'c'];
                            }
                            else {
                                return ['ㅋ', '초', 'c'];
                            }
                        }
                        else {
                            for (let key in cObj) {
                                if (cObj[key].indexOf(x[0])>-1) {
                                    return [key, '초', x[0]];
                                }
                            }
                            return x;
                        }
                        break;
                    case '중':
                        let vObj = Utils.alphabetPronounceMapping.vowels;
                        let dObj = Utils.alphabetPronounceMapping.doubleVowels;
                        for (let key in vObj) {
                            if (vObj[key].indexOf(x[0])>-1) {
                                return [key, '중', x[0]];
                            }
                        }
                        for (let key in dObj) {
                            if (dObj[key].indexOf(x[0])>-1) {
                                return [key, '중', x[0]];
                            }
                        }
                        return x;
                        break;
                    case '종':
                        let eObj = Utils.alphabetPronounceMapping.endConsonants;
                        for (let key in eObj) {
                            if (eObj[key].indexOf(x[0])>-1) {
                                return [key, '종', x[0]];
                            }
                        }
                        return x;
                        break;
                    default:
                        return x;
                }
            }
            return x;
        })

        // newMsgSplit을 이용해서 메시지 합성
        if (isMap) {
            let resObj = {}; // 결과 추가
            let j = 0; // 위치 추가
            let key='', val='', valList=[]; // 키, 값, 값 리스트 추가
            for (let k=0; k<newMsgSplit.length; k++) {
                let partList = newMsgSplit[k];
                switch(partList[1]) {
                    // 낱자거낙 기타면 정직하게 글자 추가
                    case '낱':
                    case '기':
                        key = partList.length===3? partList[2]: partList[0];
                        val = partList[0];
                        if (resObj[key]) {
                            resObj[key].index.push(j);
                        }
                        else {
                            resObj[key] = {value: val, index: [j]}
                        }
                        j+=key.length;
                        break;
                    // 초성일 때는 그냥 키값이랑 추가
                    case '초':
                        key = partList.length ===3? partList[2]: partList[0];
                        valList = [partList[0]]; // 우선 리스트로 처리
                        break;
                    // 중성일 때는 다음이 종성이 아닐 때는 추가. 종성일 때는 넘어가자
                    case '중':
                        key = partList.length ===3 ? key+partList[2]: key+partList[0];
                        valList.push(partList[0]);
                        // 종성이 바로 뒤에 안 올 때는 오브젝트 처리
                        if (k === newMsgSplit.length-1 || newMsgSplit[k+1][1] !== '종') {
                            if (resObj[key]) {
                                resObj[key].index.push(j);
                            }
                            else {
                                resObj[key] = {value: Hangul.assemble(valList), index: [j]}
                            }
                            j +=key.length;
                        }
                        break;
                    // 종성일 때는 바로 조립
                    case '종':
                        key = partList.length ===3 ? key+partList[2]: key+partList[0];
                        valList.push(partList[0]);
                        if (resObj[key]) {
                            resObj[key].index.push(j);
                        }
                        else {
                            resObj[key] = {value: Hangul.assemble(valList), index: [j]}
                        }
                        j +=key.length;
                        break;
                }
            }
            return resObj;

        }
        else {
            return Hangul.assemble(newMsgSplit.map(x=>x[0])); // newMsgSplit의 자, 모, 낱자만 모은 뒤 assemble 함수로 메시지 조합.
        }

    },

    // position vector에서 map의 original position을 찾아보기
    originalPosition: (map, positionList=[]) => {
        const parsed = Utils.parseMap(map);
        const originalLength = parsed.joinedMessage.length;
        const parsedLength = parsed.joinedParsedMessage.length;
        console.log('OBJ_TEST', positionList)
        positionList = positionList.filter(x=> x<parsedLength); // parsedLenght보다 짧게 잡아서 에러 방지.
        const originalPosition = parsed.messageIndex.concat([originalLength]); // 인덱스에 마지막 리스트 넣기
        const originalRange = Utils.grabCouple(originalPosition); // 범위 형태로 출력
        let res = []
        for (let idx in originalRange) {
            // positionList 안에 있는 원소들만 찾아보자
            let lix = originalRange[idx];
            if (ObjectOperation.objectIn(Number(idx), positionList)) {
                res = res.concat(Array.from(Array(lix[1]-lix[0]).keys()).map(x => x+lix[0]));
            }
        }
        return res;
    }

}

export default Utils;
