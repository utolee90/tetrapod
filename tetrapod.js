import Hangul from 'hangul-js';
import Utils from './components/Utils';

// 사전데이터들을 배열형태로 저장해서 보관합니다. (json)
var badWords = []
var normalWords = []
var softSearchWords = []

// 빠른 비속어단어 확인을 위해 사전에
// 단어목록을 한글자씩 조각내놓고 사용합니다.
var parsedBadWords = []
var parsedSoftSearchWords = []

// 유동적인 비속어 목록 관리를 위해 이미 배열에
// 특정 단어가 존재하는지를 확인하기위해 해시맵을 사용합니다.
var badWordsMap = {}
var normalWordsMap = {}
var softSearchWordsMap = {}


class Tetrapod {

    // badWord, 정상단어, softSearchWord 불러오기
    static load(inputBadwords, inputDictionary, inputSoftSearchWords, disableAutoParse) {
        badWords = inputBadwords
        normalWords = inputDictionary
        softSearchWords = inputSoftSearchWords

        if (disableAutoParse != false) {
            Tetrapod.parse()
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
        parsedSoftSearchWords = []
        for (let index in badWords) {
            if (!Utils.objectIn(Utils.wordToArray(badWords[index]), parsedBadWords))
                parsedBadWords.push(Utils.wordToArray(badWords[index]))
        }
        for (let index in softSearchWords) {
            if (!Utils.objectIn(Utils.wordToArray(softSearchWords[index]), parsedSoftSearchWords))
                parsedSoftSearchWords.push(Utils.wordToArray(softSearchWords[index]))
        }
    }

    static parseMap(map) {
        return Utils.parseMap(map);
    }

    static showParsedSoftSearchWords() {
        console.log(parsedSoftSearchWords);
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
            // totalResult
            let bad = 0;
            // softResult
            let soft = 0;
            // originalTotalResult
            let bad2 = 0;
            // originalSoftResult
            let soft2 = 0;
            for (var x of searchResult.totalResult) {
                bad += x.positions.length
            }
            for (var x of searchResult.softResult) {
                soft += x.positions.length
            }
            for (var x of searchResult.originalTotalResult) {
                bad2 += x.positions.length
            }
            for (var x of searchResult.originalSoftResult) {
                soft2 += x.positions.length
            }

            return {bad: Math.max(bad, bad2), soft: Math.max(soft, soft2), end:searchResult.endResult.length};
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
        let originalTotalResult = []; // isStrong을 참으로 했을 때 결과 수집
        let originalSoftResult = []; // isStrong을 참으로 했을 때 결과 수집

        //보조 메시지
        let message2Map = {};
        let message2 = ''
        let message3Map = {}
        let message3 = ''
        let message4Map = {}
        let message4 = ''
        let message5Map = {}
        let message5 = ''

        if (needEnToKo === true && isStrong === false) { // 만약 한영 검사가 필요하면...
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

        if (!isStrong) {
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

        }
        else {
            let currentResult = this.nativeFind(message3Map, needMultipleCheck, true);
            let currentResult2 = this.nativeFind(message4Map, needMultipleCheck, true, true);
            tooMuchEnds.push(currentResult.tooMuchDoubleEnd);

            if (needMultipleCheck) {
                for (var index =0; index<currentResult.founded.length; index++) {
                    if (currentResult.founded !==[] && totalResult.map(v=>v.value).indexOf(currentResult.founded[index]) ===-1)
                        originalTotalResult = [...originalTotalResult, {value:currentResult.founded[index], positions:currentResult.positions[index]}];
                }
                for (index =0; index< currentResult.softSearchFounded.length; index++) {
                    if (currentResult.softSearchFounded!==[] && softResult.map(v=>v.value).indexOf(currentResult.softSearchFounded[index]===-1)) {
                        originalSoftResult = [...originalSoftResult, {value:currentResult.softSearchFounded[index], positions: currentResult.softSearchPositions[index]}]
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
                    originalTotalResult = [...originalTotalResult, currentResult.founded];
                    originalSoftResult = [...originalSoftResult, currentResult.softSearchFounded];
                }
                if (currentResult2 !== null){
                    totalResult = [...totalResult, currentResult2.founded];
                    softResult = [...softResult, currentResult2.softSearchFounded];
                }

            }

        }
        // 결과값 - 보기 좋게 출력.
        let endResult = [];
        let originalResult = {};

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

        if (isStrong) originalResult = {originalTotalResult, originalSoftResult};

        return {totalResult, softResult, endResult, ...originalResult};
    }

    // 메시지의 비속어를 콘솔창으로 띄워서 찾기.
    static nativeFind(message, needMultipleCheck, isMap = false, isReassemble = false) {

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
            // 맵을 파싱해서 찾아보자.
            originalMessageList = Utils.parseMap(message).messageList;
            // console.log(message);
            originalMessage = originalMessageList.join("");
            // dropIung일 때에는 바ㅂ오 ->밥오로 환원하기 위해 originalMessage를 한글 조합으로
            originalMessage = isReassemble ? Hangul.assemble(Hangul.disassemble(originalMessage)): originalMessage;
            originalMessageSyllablePositions =  Utils.parseMap(message).messageIndex;
            newMessage = Utils.parseMap(message).parsedMessage.join("");
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
        for (let softSearchWord of parsedSoftSearchWords) {

            // 단순히 찾는 것으로 정보를 수집하는 것이 아닌 위치를 아예 수집해보자.
            // findCount 형태 : {바: [1,8], 보:[2,7,12]}등
            let findCount = {}
            // 저속한 단어 수집 형태. 이 경우는 [[1,2], [8,7]]로 수집된다.
            let softSearchWordPositions = []


            // 저속한 단어들을 한 단어씩
            // 순회하며 존재여부를 검사합니다.
            for (let character of softSearchWord) {

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
                for (let usedSoftSearchWordPositions of softSearchWordPositions) {
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

                                    tempSoftSearchWordOriginalPositions.push(originalMessageSyllablePositions[pos] + k);
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
                    // isReassemble 옵션은 dropIung에서 받침을 뒷 글자에 강제로 붙이는 경우에 대비해서 조합해준다.
                    console.log(`원문: ${originalMessage}`);
                    console.log(`변환된 문장: ${newMessage}`);
                    console.log(`발견된 저속한 표현: [${softSearchWord.join()}]`)
                    console.log(`발견된 저속한 표현 원문: [${originalSoftSearchWords}]`)
                    console.log(`발견된 저속한 표현 위치: [${softSearchWordPositions}]`)
                    console.log(`발견된 저속한 표현 원래 위치: [${softSearchWordOriginalPositions}]`)
                    console.log('\n')
                    foundedSoftSearchWords.push(softSearchWord.join(''))
                    foundedSoftSearchWordPositions.push(softSearchWordPositions)
                    foundedSoftSearchOriginalWords.push(originalSoftSearchWords);
                    foundedSoftSearchWordOriginalPositions.push(softSearchWordOriginalPositions);
                }
                else {
                    console.log(`원문: ${newMessage}`)
                    console.log(`발견된 저속한 표현: [${softSearchWord.join()}]`)
                    console.log(`발견된 저속한 표현 위치: [${softSearchWordPositions}]`)
                    console.log('\n')
                    foundedSoftSearchWords.push(softSearchWord.join(''))
                    foundedSoftSearchWordPositions.push(softSearchWordPositions)
                }

            }


            // 반복 줄이기 위해 강제 탈출.
            if (needMultipleCheck === false && foundedSoftSearchWords.length>0) break;

        }


        // 비속어 단어를 한 단어씩 순회합니다.
        for (let badWord of parsedBadWords) {

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

                // console.log('wordPosition', wordPosition)
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
                            console.log('포지션 중복 확인')
                            tmpTF =false;
                        }
                        // posix 최댓값이나 최솟값이 비속어 표현 사이에 끼어버린 경우 - 아예 비속어로 ) )합치기

                        if (Math.min(...tempBadWordPositions) <= Math.min(...softSearchPosition) &&  Math.min(...softSearchPosition)  <= Math.max(...tempBadWordPositions) ) {
                            tmpTF = true;
                            badWord = Utils.removeMultiple([...badWord, ...foundedSoftSearchWords[foundedSoftSearchWordPositions.indexOf(positions)] ])
                            tempBadWordPositions = Utils.removeMultiple([...tempBadWordPositions, ...softSearchPosition])
                        }
                        else if (Math.min(...tempBadWordPositions) <= Math.max(...softSearchPosition) && Math.max(...softSearchPosition)  <= Math.max(...tempBadWordPositions) ) {
                            tmpTF = true;
                            badWord = Utils.removeMultiple([...foundedSoftSearchWords[foundedSoftSearchWordPositions.indexOf(positions)], ...badWord]);
                            badWordPositions = Utils.removeMultiple([...softSearchPosition, ...tempBadWordPositions ]);
                        }
                        // 만약 비속어와 저속한 표현 사이에 숫자, 알파벳, 공백밖에 없으면 비속어로 합치기
                        else if  ( Math.max(...tempBadWordPositions) < Math.min(...softSearchPosition ) ) {
                            let inter0 = Math.max(...tempBadWordPositions);
                            let inter1 = Math.min(...softSearchPosition);
                            if (newMessage.slice(inter0 + 1, inter1).match(/^[0-9A-Za-z\s~!@#$%^&*()_\-+\\|\[\]{};:'"<,>.?/]*$/ )) {
                                tmpTF = true;
                                badWord = [...badWord, ...foundedSoftSearchWords[foundedSoftSearchWordPositions.indexOf(positions)]];
                                tempBadWordPositions = [...tempBadWordPositions, ...softSearchPosition];
                            }
                        }
                        else if  ( Math.max(...softSearchPosition) < Math.min(...tempBadWordPositions) ) {
                            let inter0 = Math.max(...softSearchPosition);
                            let inter1 = Math.min(...tempBadWordPositions);
                            if (newMessage.slice(inter0+1, inter1).match(/^[0-9A-Za-z\s~!@#$%^&*()_\-+\\|\[\]{};:'"<,>.?/]*$/) ) {
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
                            for (var k =0; k <originalMessageList[Number(pos)].length; k++) {

                                tempBadWordOriginalPositions.push( originalMessageSyllablePositions[pos] + k);
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
                    console.log('\n')
                    foundedBadWords.push(badWord.join(''))
                    foundedBadWordPositions.push(badWordPositions)
                    foundedBadOriginalWords.push(originalBadWords);
                    foundedBadWordOriginalPositions.push(badWordOriginalPositions);
                }
                else {
                    console.log(`원문: ${newMessage}`)
                    console.log(`발견된 비속어: [${badWord.join()}]`)
                    console.log(`발견된 비속어 위치: [${badWordPositions}]`)
                    console.log('\n')
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
    static fix(message, replaceCharacter, condition= {enToKo:false, alphabetToKo:false, dropIung:false}) {

        let fixedMessage = "";
        let fixedMessageList = [];
        // condition
        if (condition.enToKo) {
            fixedMessageList = Utils.parseMap(Utils.enToKo(message, true)).parsedMessage
        }
        else if (condition.alphabetToKo) {
            fixedMessageList = Utils.parseMap(Utils.alphabetToKo(message, true)).parsedMessage
        }
        else if (condition.dropIung) {
            fixedMessageList = Utils.parseMap(Utils.dropIung(message, true)).parsedMessage
        }
        else {
            fixedMessage = message
            fixedMessageList = fixedMessage.split("")
        }

        console.log(fixedMessage)
        console.log(fixedMessageList)

        let foundedBadWords = Tetrapod.find(message, true).totalResult;

        replaceCharacter = (replaceCharacter === undefined) ? '*' : replaceCharacter
        for (let index1 in foundedBadWords) {
            let foundedBadWord = foundedBadWords.map(v=>v.value)[index1]

            for (let positions of foundedBadWords[index1].positions) {
               // 포지션 벡터의 숫자들을 이용해 대체한다.
                for (let position of positions) {
                   fixedMessageList.splice(position, 1, replaceCharacter)
               }
            }
            fixedMessage = fixedMessageList.join("");
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
