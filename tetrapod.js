import Hangul from 'hangul-js';
import Utils from './components/Utils';
import fs from 'fs';

// 기본 경로
let badWordDefaultPath = './resource/dictionary/bad-words.json'
let normalWordDefaultPath = './resource/dictionary/normal-words.json';
let macroDefaultPath = './resource/dictionary/macros.json';

// 클래스 정의 방식을 Tetrapod 오브젝트를 소환하는 방식으로 변경.
// 출력방법 let obj = new Tetrapod(); 소환 이후 obj에 함수 조작하는 방식으로 변경.
// badWords 데이터 조작을 위해 필요함.
class Tetrapod {

    // 사전데이터들을 배열형태로 저장해서 보관합니다. (json)

    constructor() {
        this.originalBadWordsData = {} // 원본 비속어 데이터. 기본값은 bad-words.json 데이터
        this.originalNormalWordsData = {} // 원본 정상단어 데이터. 기본값은 normal-words.json 데이터
        this.badWordMacros = {} // 원본 매크로 데이터. 기본값은 macro.json 데이터
        this.badWords = {
            0: [], 1:[], 2:[], 3:[], 4:[]
        }; // 비속어 - 수준별 분류
        this.typeofBadWords = {
            drug:[], insult:[], sexuality:[], violence:[]
        } // 비속어 타입별로 분류하기
        this.normalWords = [] // 정상단어
        this.exceptWords = [] // 정상단어에서 제외할 단어.

        // 빠른 비속어단어 확인을 위해 사전에 단어목록을 한글자씩 조각내놓고 사용합니다.
        // 예 : [시!발+] => [[시!],[발+]]
        this.parsedBadWords = [] // 모든 비속어 합쳐서 분류 완료
        this.badWordInfo = []; // 비속어 단어 정보. 각 원소에 [단어, 랭크, 타입] 형식으로 출력.

        // 비속어, 정상단어 활성/비활성화를 용이하게 하기 위해서 맵을 추가합니다. {단어:true -> 활성화}
        this.badWordsMap = {} // 비속어 맵. {단어:타입, 비활성화시 false}
        this.normalWordsMap = {}
        this.exceptWordsMap = {}

        // 로딩 시작 시점
        this.startTime = new Date().getTime(); // 시작시점 확인
        // 재파싱 필요 여부 체크
        this.preParsed = true;

        // 리스트 유형 확인
        this.badWordLevel = [] // [1,2,3,4]의 부분집합으로 선택. 기본값은 0번만 활성화
        this.typeCheck = [] // 비속여의 출력할 유형 확인. drug(약물), insult(모욕), sexuality(성적표현), violence(폭력) 중 선택 가능.
        this.checkOptions = [] // 비속어 추가 찾기 옵션 확인. qwerty(영자판 섞기), antispoof(문자섞기), pronounce(발음) 옵션 추가.
        this.dropDoubleCheck = false; // dropDouble로 축약화시킨 메시지도 검사하기 여부. 체크시 dd, dd+simplify된 메시지도 같이 검사.
    }


    // 비속어 데이터, 정상단어 데이터 불러오기. 데이터 개별 수정은 복잡하므로 이 함수로만 수정할 예정.
    load(inputWordsObject /* 오브젝트 형식으로 호출 */, disableAutoParse = true) {
        this.originalBadWordsData = inputWordsObject.originalBadWordsData;
        this.originalNormalWordsData = inputWordsObject.originalNormalWordsData;
        this.badWordMacros = inputWordsObject.badWordMacros;
        this.preParsed = false; // 재파싱 필요 여부 결정.
        this.startTime = new Date().getTime(); // 시작시점 재지정
        console.log("LOADING...");
        if (disableAutoParse != false) {
            this.parse();
        }
    }

    // 비속어 사전 파일 로딩함. path 지정하지 않으면 기본경로에서 가져옴.
    loadFile(
        badWordsPath = badWordDefaultPath,
        normalWordsPath = normalWordDefaultPath,
        macroPath = macroDefaultPath,
        disableAutoParse = true
    ) {
        const data = {
            originalBadWordsData: require(badWordsPath), // 비속어 데이터
            originalNormalWordsData: require(normalWordsPath),//정상 데이터
            badWordMacros: require(macroPath), //매크로 데이터
        }
        this.load(data, disableAutoParse); // 파일 호출
    }

    // 리스트 형식으로 된 BadWord 단어들을 wordToArray 이용해서 단어 조각낸 2차원배열로 풀어쓰기 [['시','발'], ...]
    parse() {
        console.log("Parsing Start", new Date().getTime() - this.startTime)

        let parsedMacros = this.badWordMacros;
        for(let idx in parsedMacros) {
            if (typeof parsedMacros[idx] ==='object') parsedMacros[idx] = this.recursiveList(parsedMacros[idx]);
        }

        // 우선 badWords, typeofBadWords, normalWords, exceptWords 파싱을 한다.
        // preParsed ->
        if (!this.preParsed) {
            this.badWords = {
                0: this.assembleHangul(this.recursiveList(this.originalBadWordsData.badWords, parsedMacros)),
                1: this.assembleHangul(this.recursiveList(this.originalBadWordsData.badWordsOne, parsedMacros)),
                2: this.assembleHangul(this.recursiveList(this.originalBadWordsData.badWordsTwo, parsedMacros)),
                3: this.assembleHangul(this.recursiveList(this.originalBadWordsData.badWordsThree, parsedMacros)),
                4: this.assembleHangul(this.recursiveList(this.originalBadWordsData.badWordsFour, parsedMacros))
            };
            this.typeofBadWords = {
                drug: this.assembleHangul(this.recursiveList(this.originalBadWordsData.drug, parsedMacros)), // 유형별 비속어 데이터 리스트로 풀기
                insult: this.assembleHangul(this.recursiveList(this.originalBadWordsData.insult, parsedMacros)),
                sexuality: this.assembleHangul(this.recursiveList(this.originalBadWordsData.sexuality, parsedMacros)),
                violence: this.assembleHangul(this.recursiveList(this.originalBadWordsData.violence, parsedMacros)),
            };
            this.normalWords = this.assembleHangul(this.recursiveList(this.originalNormalWordsData.dictionary, parsedMacros))
            this.exceptWords = this.assembleHangul(this.recursiveList(this.originalNormalWordsData.exception, parsedMacros));

            this.preParsed = true;
        }

        console.log("Data filled", new Date().getTime() - this.startTime);

        // 초기화 필요합니다.
        this.parsedBadWords = [];

        // badWords 매핑은 {0: [], 1: [], 2:[], 3:[], 4:[]}
        for (let index in this.badWords) {
            for (let wid in this.badWords[index]) {
                this.parsedBadWords.push([Utils.wordToArray(this.badWords[index][wid]), this.badWords[index][wid], index, 'etc']) // parsedBadWords에 단어 추가
            }
        }
        // 그 다음 각 단어에 타입 지정하기
        for (let idx in this.parsedBadWords) {
            let word = this.parsedBadWords[idx][1];
            if (this.typeofBadWords.drug.indexOf(word) > -1) {
                this.parsedBadWords[idx][3] = 'drug';
            } else if (this.typeofBadWords.insult.indexOf(word) > -1) {
                this.parsedBadWords[idx][3] = 'insult';
            } else if (this.typeofBadWords.sexuality.indexOf(word) > -1) {
                this.parsedBadWords[idx][3] = 'sexuality';
            } else if (this.typeofBadWords.violence.indexOf(word) > -1) {
                this.parsedBadWords[idx][3] = 'violence';
            }
        }

        console.log("before Sorting Words", new Date().getTime() - this.startTime)
        // parsedBadWords 단어 순서 정리한 후 badWordInfo  정보 추가
        console.log('valueTEST', this.parsedBadWords[0])
        this.parsedBadWords.sort((a, b) => a[1].length - b[1].length).reverse();


        // parsedBadWords에 맞추어 순서 삽입할 예정이므로 일단 비움. 개별적 sorting보다는 단순 삽입이 다 효율적임.
        this.badWords = {
            0:[], 1:[], 2:[], 3:[], 4:[]
        }
        this.typeofBadWords = {
            drug:[], insult:[], sexuality:[], violence:[]
        }
        this.badWordsMap = {} // 재구성을 할 예정이라 초기화한다
        this.normalWordsMap = {}
        this.exceptWordsMap = {}

        for (let ind in this.parsedBadWords) {
            // 비속어 수준별로 단어 추가
            let word = this.parsedBadWords[ind][1];

            switch(this.parsedBadWords[ind][2]) {
                case '0':
                    this.badWords['0'].push(word);
                    this.badWordsMap[word] = 'etc'; // 여기에 속한 단어는 무조건 비속어 검사대상이다.
                    break;
                case '1':
                    this.badWords['1'].push(word);
                    this.badWordsMap[word] = this.badWordLevel.indexOf(1)>-1?'etc':false;
                    break;
                case '2':
                    this.badWords['2'].push(word);
                    this.badWordsMap[word] = this.badWordLevel.indexOf(2)>-1?'etc':false;
                    break;
                case '3':
                    this.badWords['3'].push(word);
                    this.badWordsMap[word] = this.badWordLevel.indexOf(3)>-1?'etc':false;
                    break;
                case '4':
                    this.badWords['4'].push(word);
                    this.badWordsMap[word] = this.badWordLevel.indexOf(4)>-1?'etc':false;
                    break;
            }
            // 비속어 종류별로 단어 추가.
            switch(this.parsedBadWords[ind][3]) {
                case 'drug':
                    this.typeofBadWords['drug'].push(word);
                    if(this.badWordsMap[word] && this.typeCheck.indexOf('drug')>-1) this.badWordsMap[word] = 'drug';
                    break;
                case 'insult':
                    this.typeofBadWords['insult'].push(word);
                    if(this.badWordsMap[word] && this.typeCheck.indexOf('insult')>-1) this.badWordsMap[word] = 'insult';
                    break;
                case 'sexuality':
                    this.typeofBadWords['sexuality'].push(word);
                    if(this.badWordsMap[word] && this.typeCheck.indexOf('sexuality')>-1) this.badWordsMap[word] = 'sexuality';
                    break;
                case 'violence':
                    this.typeofBadWords['violence'].push(word);
                    if(this.badWordsMap[word] && this.typeCheck.indexOf('violence')>-1) this.badWordsMap[word] = 'violence';
                    break;
            }
        }

        // normalWords, ExceptWord도 소팅하기
        this.normalWords = Utils.sortMap(this.normalWords);
        this.exceptWords = Utils.sortMap(this.exceptWords);

        // normalWordsMap, exceptWordsMap 유도
        for (var word of this.normalWords) {
            this.normalWordsMap[word] = true;
        }
        for (var word of this.exceptWords) {
            this.exceptWordsMap[word] = true;
        }

        // 마지막으로 리스트 나누기로 유도하기...
        this.badWordInfo = this.parsedBadWords.map(x=> x.slice(1))
        this.parsedBadWords = this.parsedBadWords.map(x=>x[0])

        console.log("End of PARSING WORDS", new Date().getTime() - this.startTime)

    }

    // 비속어 수준 및 타입 조절. 변수 사용하지 않으면 현재 수준 출력.
    // 사용방법 : adjustFilter([1], ['insult'], ['qwerty'], false) ->
    adjustFilter(level = this.badWordLevel, type = this.typeCheck, checkOptions = this.checkOptions, dropDoubleCheck = this.dropDoubleCheck) {
        this.badWordLevel = Array.isArray(level) ? level :this.badWordLevel;
        this.typeCheck = Array.isArray(type) ? type :this.typeCheck;
        this.checkOptions = Array.isArray(checkOptions)? checkOptions: this.checkOptions;
        this.dropDoubleCheck = dropDoubleCheck;
        this.parse(); // 워딩은 재파싱으로 조절한다.
        console.log('체크 중인 비속어 수준:::', level);
        console.log('출력할 비속어 유형:::', type);
        console.log('추가 검사 중인 영자혼합 유형:::',checkOptions);
        console.log('중복음 단축된 메시지 검사 여부:::', dropDoubleCheck);
    }

    // 비교시간 단축을 위한 테크닉.
    // 리스트들의 목록 List에 대해 리스트 elem이 List 안에 있는지 판별하기.
    testInList(elem, List) {
        // 우선 길이가 같은 tempList만 추출하기
        let sameLengthList = List.filter(x=>(x.length=== elem.length))

        // 각 원소에 대해 objectEqual을 이용해서 체크하기
        for (let i in List) {
            sameLengthList = sameLengthList.filter(x=> (Utils.objectEqual(List[i], x[i])))
            if (sameLengthList.length ===0 ) return false;
        }
        // 리스트 안에 있으면 true, 없으면 false
        if (sameLengthList.length>0) return true;
        else return false;
    }

    // 사용자 정의 데이터 불러오기
    getLoadedData() {
        return {
            badWords: this.badWords, // 비속어 수준별 리스트
            normalWords: this.normalWords, // 정상단어 리스트
            exceptWords: this.exceptWords, // 예외단어 리스트
            typeofBadWords: this.typeofBadWords, // 비속어 유형별 리스트
            parsedBadWords: this.parsedBadWords, // 모든 비속어 합쳐서 분류 완료
            badWordInfo: this.badWordInfo, // 비속어 단어 정보. 각 원소에 [단어, 랭크, 타입] 형식으로 출력.
            badWordsMap: this.badWordsMap, // badWordsMap - 비속어 사용 여부 체크 맵. 필터 강도에 따라 사용여부를 껐다 켰다 할 수 있음.
            normalWordsMap: this.normalWordsMap, // normalWordsMap - 정상 단어 사용 여부 체크 맵
            exceptWordsMap: this.exceptWordsMap // exceptWordsMap - 예외단어 사용 여부 체크 맵
        }
    }

    // 데이터 저장하기 - 현재 작동하지 않음.
    saveAllData(badWordsPath=badWordDefaultPath, normalWordsPath = normalWordDefaultPath, badWordMacrosPath = macroDefaultPath, isAsync=false) {
        this.parse();
        this.saveBadWordsData(badWordsPath, isAsync)
        this.saveNormalWordsData(normalWordsPath, isAsync)
        this.saveBadWordMacros(badWordMacrosPath, isAsync)
    }

    // 매크로 저장
    saveBadWordMacros(path, isAsync) {
        let data = JSON.stringify(this.badWordMacros, null, 4);
        if (isAsync) fs.writeFile(path, data, 'utf-8', (err) => {if (err) {console.log(err)}})
        else fs.writeFileSync(path, data, 'utf-8',(err) => {if (err) {console.log(err)}})
    }

    // 비속어 데이터 출력
    saveBadWordsData(path, isAsync) {
        let data = JSON.stringify(this.originalBadWordsData, null, 4)
        if(isAsync) fs.writeFile(path, data, 'utf-8', (err) => {if (err) {console.log(err)}})
        else fs.writeFileSync(path, data, 'utf-8', (err) => {if (err) {console.log(err)}})
    }

    // 정상단어 출력
    saveNormalWordsData(path, isAsync) {
        let data = JSON.stringify(this.originalNormalWordsData, null, 4)
        if(isAsync) fs.writeFile(path, data, 'utf-8', (err) => {if (err) {console.log(err)}})
        else fs.writeFileSync(path, data, 'utf-8', (err) => {if (err) {console.log(err)}})
    }

    // 메시지에 비속어가 들어갔는지 검사.
     isBad(message, includeSoft=false, fromList = undefined) {
        if (fromList === undefined) {
            if (includeSoft === true)
                return (this.nativeFind(message, false).found.length >0 ||
                    this.nativeFind(message, false).tooMuchDoubleEnd.val
                );
            else
                return this.nativeFind(message, false).found.length>0;
        }
            // fromList가 리스트 형식으로 주어지면 includeSoft와 무관하게 fromList 안에 있는 함수만 검출
        // fromList는 단어 리스트 또는 파싱된 단어 리스트 중 하나 입력 가능.
        else if (Array.isArray(fromList)) {
            return (this.nativeFind(message, false, false, false, fromList).found.length > 0)
        }
    }

    // 메시지에 비속어가 몇 개 있는지 검사.
     countBad(message) {

        if (this.dropDoubleCheck) {
            let searchResult = this.find(message, true, 0);
            // totalResult
            let bad = 0;
            // originalTotalResult
            let bad2 = 0;
            for (var x of searchResult.totalResult) {
                bad += x.positions.length
            }
            for (x of searchResult.originalTotalResult) {
                bad2 += x.positions.length
            }

            return {bad: Math.max(bad, bad2), end:searchResult.endResult.length};
        }
        else {
            return {
                bad: this.find(message, true, 0).totalResult.length,
                end: this.find(message, true, 0).endResult.length,
            };
        }

    }

    // 메시지에 비속어 찾기 - 배열로 처리함.
     find(message, needMultipleCheck=false, splitCheck=15, qwertyToDubeol=false, isStrong=false) {
        // 욕설 결과 집합
        let totalResult = [] // 전체 추가
        let tooMuchEnds = [] // 비속어 받침 체크
        let originalTotalResult = []; // isStrong을 참으로 했을 때 dropDouble, dropDouble+simplify 결과 추가

         if (this.checkOptions.indexOf('qwerty')>-1) {
             let qwertyMap = Utils.qwertyToDubeol(message, true);
         }
         if (this.checkOptions.indexOf('antispoof')>-1) {
             let antispoofMap = Utils.antispoof(message, true);
         }

        // 보조 메시지
        let message2Map = {};
        let message3Map = {}
        let message3 = ''
        let message4Map = {}


        if (qwertyToDubeol === true && isStrong === false) { // 만약 한영 검사가 필요하면...
            message2Map = Utils.qwertyToDubeol(message, true);
        }
        if (isStrong === true) { // 문자열을 악용한 것까지 잡아보자.
            message3Map = Utils.antispoof(message, true);
            message3 = Utils.antispoof(message, false);
            message4Map = Utils.dropDouble(message3, true, false);
        }

        if (splitCheck === undefined) splitCheck = 15
        var messages = (splitCheck != 0) ? Utils.lengthSplit(message, splitCheck) : [message];


        // 메시지 나누어서 확인하기.

        if (!isStrong) {
            for (var index1 = 0; index1 <= messages.length - 1; index1++) {
                let currentResult = this.nativeFind(messages[index1], needMultipleCheck)
                tooMuchEnds.push(currentResult.tooMuchDoubleEnd);

                // 중복체크가 포함될 때에는 각 단어를 모두 추가해준다.
                if (needMultipleCheck) {
                    for (var index2 = 0; index2 <= currentResult.found.length - 1; index2++) {
                        if (currentResult.found !== [] && totalResult.map(v=>v.value).indexOf(currentResult.found[index2])===-1)
                            totalResult = [...totalResult, {value:currentResult.found[index2], positions:currentResult.positions[index2]}];
                    }
                } else {
                    if (currentResult !== null){
                        totalResult = [...totalResult, currentResult.found];
                    }
                }
            }
            // qwertyToDubeol를 잡을 때
            if (totalResult.length ===0 && qwertyToDubeol === true) {
                let currentResult = this.nativeFind(message2Map, needMultipleCheck, true);
                tooMuchEnds.push(currentResult.tooMuchDoubleEnd);

                if (needMultipleCheck) {

                    for (var index = 0; index <= currentResult.found.length - 1; index++) {
                        if (currentResult.found !== [] && totalResult.map(v=>v.value).indexOf(currentResult.found[index])===-1)
                            totalResult = [...totalResult, {value:currentResult.found[index], positions:currentResult.positions[index]}  ];
                    }
                } else {
                    if (currentResult !== null){
                        totalResult = [...totalResult, currentResult.found];
                    }
                }
            }
        }
        else {
            let currentResult = this.nativeFind(message3Map, needMultipleCheck, true);
            let currentResult2 = this.nativeFind(message4Map, needMultipleCheck, true, true);
            tooMuchEnds.push(currentResult.tooMuchDoubleEnd);

            if (needMultipleCheck) {
                for (index =0; index<currentResult.found.length; index++) {
                    if (currentResult.found !==[] && originalTotalResult.map(v=>v.value).indexOf(currentResult.found[index]) ===-1)
                        originalTotalResult = [...originalTotalResult, {value:currentResult.found[index], positions:currentResult.positions[index]}];
                }
                for (index =0; index<currentResult2.found.length; index++) {
                    if (currentResult2.found !==[] && totalResult.map(v=>v.value).indexOf(currentResult2.found[index]) ===-1)
                        totalResult = [...totalResult, {value:currentResult2.found[index], positions:currentResult2.positions[index]}];
                }
            }
            else {
                if (currentResult !== null){
                    originalTotalResult = [...originalTotalResult, currentResult.found];
                }
                if (currentResult2 !== null){
                    totalResult = [...totalResult, currentResult2.found];
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

        if (isStrong) originalResult = {originalTotalResult};

        return {totalResult, endResult, ...originalResult};
    }

    // 메시지의 비속어를 콘솔창으로 띄워서 찾기.
    // message - 메시지(isMap이 false) 혹은 메시지 매핑(isMap이 true). needMultipleCheck
    nativeFind(message, needMultipleCheck, isMap = false, isReassemble = false, parsedWordsList=null) {

        const wordTypeValue = {
            drug: "약물", etc:"", insult:"모욕적 표현", sexuality:"성적인 표현", violence:"폭력적 표현"
        }

        let foundBadWords = []; // 찾은 비속어 단어 결과.
        let foundBadWordPositions = [] // 찾은 비속어 단어의 원래 위치
        let originalFoundBadWords = []; // map으로 주어졌을 때 원래 단어.
        let originalFoundBadWordPositions = []; // isMap에서 original 단어 위치
        let originalMessageList = []; // isMap 사용시 원래 메시지에서 parseMap으로 유도되는 메시지 목록
        let originalMessageSyllablePositions = []; // isMap 사용시 원래 메시지에 parseMap으로 유도되는 메시지의 위치 정보

        // Map으로 주어지면 newMessage에 대해 찾는다.
        let originalMessage = ""; // isMap일 때 매핑의 원문 정보.
        let newMessage =""; // isMap일 때는 매핑에 의해 변환된 메시지.

        if (isMap) {
            // 맵을 파싱해서 찾아보자.
            originalMessageList = Utils.parseMap(message).messageList;
            originalMessage = originalMessageList.join("");
            // dropDouble일 때에는 바ㅂ오 ->밥오로 환원하기 위해 originalMessage를 한글 조합으로
            originalMessage = isReassemble ? this.assembleHangul(originalMessage, false): originalMessage;
            originalMessageSyllablePositions =  Utils.parseMap(message).messageIndex;
            newMessage = Utils.parseMap(message).parsedMessage.join("");
        }
        else {
            newMessage = message;
        }

        // 정상단어의 포지션을 찾습니다.
        // 형식 : [[1,2,3], [4,5,6],...]
        let normalWordPositions = this.findNormalWordPositions(newMessage, false)

        // 매핑 사용하기
        let parsedBadWords;
        let parsedBadWordsMap = {};

        // 단순 단어 리스트일 때 -> wordArray 사용
        if (Array.isArray(parsedWordsList) && typeof parsedWordsList[0] === "string") {
            let parsedMapList = this.parseFromList(parsedWordsList);
            parsedBadWords = parsedMapList[0];
            parsedWordsList = parsedMapList[1];
            for(var word of parsedWordsList) {
                parsedBadWordsMap[word] = 'etc';
            }
        }
        // 낱자로 구별된 리스트일 때
        else if (Array.isArray(parsedWordsList) && Array.isArray(parsedWordsList[0]) && typeof parsedWordsList[0][0]==="string") {
            let parsedMapList = this.parseFromList(parsedWordsList.map(x=>x.join('')));
            parsedBadWords = parsedMapList[0];
            parsedWordsList = parsedMapList[1];
            for (var word of parsedWordsList) {
                parsedBadWordsMap[word] = 'etc';
            }
        }
        // 나머지 경우 -
        else {
            parsedBadWords = this.parsedBadWords;
            parsedBadWordsMap = this.badWordsMap;
        }

        // 비속어 단어를 한 단어씩 순회합니다. parsedBadWords의 idx를 사용해 보자.
        for (let idx in parsedBadWords) {

            let badWord = parsedBadWords[idx]; // badWord -> parsedBadWords 기준
            let badWordValue = badWord.join(""); // badWordValue -> 단어 붙이기.

            // 단순히 찾는 것으로 정보를 수집하는 것이 아닌 위치를 아예 수집해보자.
            let findLetterPosition = {}; // findLetterPosition 형태 : {시: [1,8], 발:[2,7,12]}등
            let badWordPositions = []; // 나쁜 단어 수집 형태. 이 경우는 [[1,2], [8,7]]로 수집된다.
            let wordType = parsedBadWordsMap[badWordValue]; // 단어 타입.
            if(!wordType) continue; // 단어 체크가 안될 때는 넘어간다.

            // 비속어 단어를 한 글자씩 순회하며 존재여부를 검사합니다.
            for (let character of badWord) {

                let mainCharacter = character[0] // 핵심 글자
                let parserCharacter = ['!', '+'].indexOf(character[1])>-1 ? character[1]: '' // ! 또는 +

                // 뒤의 낱자 수집
                let nextCharacter = (badWord.indexOf(character) < badWord.length-1)
                    ? badWord[ badWord.indexOf(character)+1 ][0].toLowerCase(): "" // 뒤의 낱자 수집.

                let badOneCharacter = String(mainCharacter).toLowerCase(); // 소문자로 통일합니다.

                // 일단 비속어 단어의 리스트를 정의해서 수집한다.
                findLetterPosition[badOneCharacter] = [] // 리스트

                // 비속어 단어의 글자위치를 수집합니다.
                // 메시지 글자를 모두 반복합니다.
                for (let index in newMessage) {

                    // 단어 한글자라도 들어가 있으면 찾은 글자를 기록합니다.
                    let unsafeOneCharacter = String(newMessage[index]).toLowerCase()


                    // parserCharacter가 !이면 유사문자를 활용하는 함수인 isKindChar 활용
                    if (parserCharacter==="!") {
                        if (this.isKindChar(unsafeOneCharacter, badOneCharacter, nextCharacter)) {
                            findLetterPosition[badOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문장에서 전부 수집한다.
                        }
                    }
                    // parserCharacter가 +이면 unsafeOneCharacter가 badOneCharacter의 자모를 모두 포함하는지 확인.
                    else if (parserCharacter === "+") {
                        if ( Utils.objectInclude( Hangul.disassemble(badOneCharacter), Hangul.disassemble(unsafeOneCharacter), true) ) {
                            findLetterPosition[badOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문장에서 전부 수집한다.
                        }
                    }
                    // 나머지 경우 - 문자가 동일할 때에만 수집.
                    else {
                        if (badOneCharacter === unsafeOneCharacter) {
                            findLetterPosition[badOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문단에서 전부 수집한다.
                        }
                    }

                }
            }

            // 이제 badWord를 찾아보자. 어떻게? findCount에서...

            // 단어 포지션 - 키값이 단글자로 된 애들만 수집.
            let positionsList = Utils.filterList(Object.values(findLetterPosition), "object");
            let possiblePositions = Utils.productList(positionsList);

            // badWord의 원래 포지션 찾기
            let badWordOriginalPositions = [];
            let originalBadWords = [];

            // 비속어에서 가능한 글자조합 모두 검사하기
            for (let position of possiblePositions) {

                // 단어 첫글자의 위치 잡기
                let tempBadWordPositions = [...position]; // 복사. 다만 wordPosition과 안 겹치게

                // 넘어갈 필요가 있는지 확인해보기
                let isNeedToPass = false;
                // 순서가 바뀌었는지도 체크해보자.
                let isShuffled = false

                // 정상단어와 체크. wordPosition이 정상단어 리스트 안에 들어가면 패스
                for (var normalList of normalWordPositions) {
                    if (Utils.objectInclude(position, normalList, false)) {
                        isNeedToPass = true; break;
                    }
                }

                // 포지션 체크. 단어에서 뒤에 올 글자가 앞에 올 글자보다 3글자 이상 앞에 오면 isNeedToPass를 띄운다.
                for (var pos =0; pos<position.length; pos++) {
                    for (var pos1 =0; pos1<pos; pos1++) {
                        if (position[pos1] - position[pos]<-3) {
                            isNeedToPass = true; break;
                        }
                    }
                }

                // 포지션을 순서대로 정렬했는데 순서가 달라진다면 글자가 섞여있는 것으로 간주합니다.
                let sortedPosition = tempBadWordPositions.slice().sort((a, b) => a - b)
                if( !Utils.objectEqual(sortedPosition, tempBadWordPositions) ){
                    isShuffled = true;
                    tempBadWordPositions = sortedPosition; // 순서대로 정렬한 값을 추출한다.
                }

                // TODO
                // 발견된 각 문자 사이의 거리 및 사람이 인식할 가능성 거리의 계산
                // (3글자가 각각 떨어져 있을 수도 있음)
                // 글자간 사이들을 순회하여서 해당 비속어가 사람이 인식하지 못할 정도로 퍼져있다거나 섞여있는지를 확인합니다.

                let positionInterval = Utils.grabCouple(tempBadWordPositions); // [1,3,4]-> [[1,3], [3,4]]

                // 각 글자 인덱스 구간을 수집한다.
                for(let diffRangeIndex in positionInterval){

                    // 글자간 사이에 있는 모든 글자를 순회합니다.
                    let diff = ''
                    for(let diffi = positionInterval[diffRangeIndex][0]+1; diffi <= (positionInterval[diffRangeIndex][1]-1); diffi++){
                        diff += newMessage[diffi]
                    }

                    if(isShuffled && !isNeedToPass){
                        // 뒤집힌 단어의 경우엔 자음과 모음이 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.
                        if(!this.shuffledMessageFilter(diff, false, true))
                            isNeedToPass = true
                    }
                    else {
                        // 순서가 뒤집히지 않았을 때는 한글의 길이가 충분히 길거나 정상단어가 글자 사이에 쓰인 경우 비속어에서 배제합니다.
                        if (this.shuffledMessageFilter(diff,true, true)>3) isNeedToPass = true;
                        else {
                            for (let index in this.normalWords) {
                                if (diff.length === 0) break
                                let diffSearchedPositions = Utils.getPositionAll(diff, this.normalWords[index])
                                if (diffSearchedPositions.length > 1) {
                                    isNeedToPass = true;
                                }
                            }
                        }
                    }

                }

                // 기존에 발견돤 단어와 낱자가 겹쳐도 pass
                for (let usedBadWordPositions of badWordPositions) {
                    if (!Utils.isDisjoint(usedBadWordPositions, tempBadWordPositions) ) {
                        isNeedToPass = true; break;
                    }
                }

                // 해당 비속어를 발견은 하였지만,사람이 인지하지 못할 것으로 간주되는 경우 해당 발견된 비속어를 무시합니다.
                if(isNeedToPass) continue

                // 중복 비속어 체크하기.
                var tmpTF = true;
                for (let positions of foundBadWordPositions) {
                    // 다른 비속어와 포지션이 일치할 때 강제 종료
                    for (let badPosition of positions) {
                        if (Utils.objectInclude(tempBadWordPositions, badPosition)) {
                            tmpTF =false; break;
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
                            // 갯수 세기. isReassemble일 때에는 한글 낱자의 갯수만 센다.
                            let originalCount = originalMessageList[Number(pos)].length;
                            if (isReassemble) {
                                originalCount = originalMessageList[Number(pos)].split("").filter(x=>/[^ㄱ-ㅎㅏ-ㅣ]/.test(x)).length
                            }
                            for (let k =0; k <originalCount; k++) {
                                tempBadWordOriginalPositions.push( originalMessageSyllablePositions[pos] + k);
                            }
                        }
                        // 원문 찾기
                        let originalBadWord = originalMessage.split("").filter((val, idx)=> tempBadWordOriginalPositions.indexOf(idx)>-1).join("");
                        // for (var k of tempBadWordOriginalPositions) {
                        //     originalBadWord +=originalMessage[k];
                        // }
                        // 원소 넣기.
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
                    console.log(`발견된 비속어 유형: ${wordTypeValue[wordType]}`)
                    console.log(`발견된 비속어 원문: [${originalBadWords}]`)
                    console.log(`발견된 비속어 위치: [${badWordPositions}]`)
                    console.log(`발견된 비속어 원래 위치: [${badWordOriginalPositions}]`)
                    console.log('\n')
                    foundBadWords.push(badWord.join(''))
                    foundBadWordPositions.push(badWordPositions)
                    originalFoundBadWords.push(originalBadWords);
                    originalFoundBadWordPositions.push(badWordOriginalPositions);
                }
                else {
                    console.log(`원문: ${newMessage}`)
                    console.log(`발견된 비속어: [${badWord.join()}]`)
                    console.log(`발견된 비속어 유형: ${wordTypeValue[wordType]}`)
                    console.log(`발견된 비속어 위치: [${badWordPositions}]`)
                    console.log('\n')
                    foundBadWords.push(badWord.join(''))
                    foundBadWordPositions.push(badWordPositions)
                }

            }
            // 반복 줄이기 위해 강제 탈출.
            if (needMultipleCheck === false && foundBadWords.length>0) break;
        }

        //부적절하게 겹받침 많이 사용했는지 여부 확인하기

        let tooMuchDouble ={val:false, pos:[], txt:[]};

        tooMuchDouble = {
            val: tooMuchDouble.val || Utils.tooMuchDoubleEnd(newMessage).val,
            pos: [...tooMuchDouble.pos, ...Utils.tooMuchDoubleEnd(newMessage).pos],
            txt: [...tooMuchDouble.txt, ...Utils.tooMuchDoubleEnd(newMessage).txt]
        }

        // 결과 출력하기 전에 뒤의 단어가 앞의 단어의 비속어를 모두 포함하는지 체크. 포함되는 앞의 단어는 결과에서 제거.
        let delIndex = []; // 지울 인덱스 찾기
        for (var idx in foundBadWordPositions) {
            let isSkip = false;
            for (var jdx =idx+1; jdx < foundBadWordPositions.length; jdx++) {
                if (Utils.objectInclude(foundBadWordPositions[idx], foundBadWordPositions[jdx], false)) {
                    delIndex.push(idx);
                    isSkip = true;
                    break;
                }
            }
            if (isSkip) continue;
        }
        for (var idx in delIndex) {
            delete foundBadWords[idx]
            delete foundBadWordPositions[idx]
            if (isMap) {
                delete originalFoundBadWords[idx]
                delete originalFoundBadWordPositions[idx]
            }
        }


        let isMapAdded = {};
        if (isMap) {
            isMapAdded = {
                originalFound: needMultipleCheck ? originalFoundBadWords : originalFoundBadWords.slice(0).slice(0),
                originalPositions: needMultipleCheck ? originalFoundBadWordPositions : originalFoundBadWordPositions.slice(0).slice(0),
            };
        }

        // 결과 출력
        return {
            found: needMultipleCheck? foundBadWords : foundBadWords.slice(0),
            positions: needMultipleCheck? foundBadWordPositions : foundBadWordPositions.slice(0).slice(0),
            //부적절하게 겹자음 받침을 많이 사용한 단어 적발.
            tooMuchDoubleEnd: tooMuchDouble,
            ...isMapAdded
        }
    }

    // 단어 리스트 하나에 대해 주어진 문장에서 비속어 검사하기
    oneWordFind(wordList, message, parsedBadWordsMap, needMultipleCheck, print=true, isMap = false, isReassemble = false) {

        const wordTypeValue = {
            drug: "약물", etc:"", insult:"모욕적 표현", sexuality:"성적인 표현", violence:"폭력적 표현"
        }

        // 결과값 형태
        let res = isMap? {
          found: '', position: [], originalFound: '', originalPosition: []
        }: {
            found: '', position: []
        };

        // Map으로 주어지면 newMessage에 대해 찾는다.
        let originalMessageList = [];
        let originalMessageSyllablePositions = [];
        let originalMessage = ""; // isMap일 때 매핑의 원문 정보.
        let newMessage =""; // isMap일 때는 매핑에 의해 변환된 메시지.
        let originalWords = [];// 단어 원문 찾기.
        let originalPositions = [];// 단어 위치 찾기


        if (isMap) {
            // 맵을 파싱해서 찾아보자.
            originalMessageList = Utils.parseMap(message).messageList;
            originalMessage = Utils.parseMap(message).messageList.join("");
            // dropDouble일 때에는 바ㅂ오 ->밥오로 환원하기 위해 originalMessage를 한글 조합으로
            originalMessage = isReassemble ? this.assembleHangul(originalMessage, false): originalMessage;
            originalMessageSyllablePositions =  Utils.parseMap(message).messageIndex;
            newMessage = Utils.parseMap(message).parsedMessage.join("");
        }
        else {
            newMessage = message;
        }

        // 정상단어의 포지션을 찾습니다.
        // 형식 : [[1,2,3], [4,5,6],...]
        let normalWordPositions = this.findNormalWordPositions(newMessage, false)

        let wordValue = wordList.join(""); // wordValue -> 단어 결과 확인.

        // 단순히 찾는 것으로 정보를 수집하는 것이 아닌 위치를 아예 수집해보자.
        let findLetterPosition = {}; // findLetterPosition 형태 : {시: [1,8], 발:[2,7,12]}등
        let wordPositions = []; // 나쁜 단어 수집 형태. 이 경우는 [[1,2], [8,7]]로 수집된다.
        let wordType = parsedBadWordsMap[wordValue]; // 단어 타입.
        // 단어 체크가 안될 때는 무시하고 빈 결과 출력
        if(!wordType) {console.log('NOOOOOO!'); return res;}

        // 비속어 단어를 한 글자씩 순회하며 존재여부를 검사합니다.
        for (let character of wordList) {

            let mainCharacter = character[0] // 핵심 글자
            let parserCharacter = ['!', '+'].indexOf(character[1])>-1 ? character[1]: '' // ! 또는 +

            // 뒤의 낱자 수집
            let nextCharacter = (wordList.indexOf(character) < wordList.length-1)
                ? wordList[ wordList.indexOf(character)+1 ][0].toLowerCase(): "" // 뒤의 낱자 수집.

            let badOneCharacter = String(mainCharacter).toLowerCase(); // 소문자로 통일. 리스트에 있는 비교대상

            // 일단 비속어 단어의 리스트를 정의해서 수집한다.
            findLetterPosition[badOneCharacter] = [] // 리스트

            // 비속어 단어의 글자위치를 수집합니다.
            // 메시지 글자를 모두 반복합니다.
            for (let index in newMessage) {

                // 단어 한글자라도 들어가 있으면 찾은 글자를 기록합니다.
                let unsafeOneCharacter = String(newMessage[index]).toLowerCase() // 원문에 있는 글자.

                // parserCharacter가 !이면 유사문자를 활용하는 함수인 isKindChar 활용
                // 원문의 unsafeOneCharacter가 비속어 필터의 키워드 글자 badOneCharacter의
                if (parserCharacter==="!") {
                    if (this.isKindChar(unsafeOneCharacter, badOneCharacter, nextCharacter)) {
                        findLetterPosition[badOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문장에서 전부 수집한다.
                    }
                }
                // parserCharacter가 +이면 unsafeOneCharacter가 badOneCharacter의 자모를 모두 포함하는지 확인.
                else if (parserCharacter === "+") {
                    if ( Utils.objectInclude( Hangul.disassemble(badOneCharacter), Hangul.disassemble(unsafeOneCharacter), true) ) {
                        findLetterPosition[badOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문장에서 전부 수집한다.
                    }
                }
                // 나머지 경우 - 문자가 동일할 때에만 수집.
                else {
                    if (badOneCharacter === unsafeOneCharacter) {
                        findLetterPosition[badOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문단에서 전부 수집한다.
                    }
                }

            }
        }

        // 단어 포지션 - 키값이 단글자로 된 애들만 수집.
        let positionsList = Utils.filterList(Object.values(findLetterPosition), "object");
        let possiblePositions = Utils.productList(positionsList);

        // 비속어에서 가능한 글자조합 모두 검사하기
        for (let position of possiblePositions) {

            // 단어 첫글자의 위치 잡기
            let tempWordPositions = [...position]; // 복사. 다만 wordPosition과 안 겹치게

            // 넘어갈 필요가 있는지 확인해보기
            let isNeedToPass = false;
            // 순서가 바뀌었는지도 체크해보자.
            let isShuffled = false

            // 정상단어와 체크. wordPosition이 정상단어 리스트 안에 들어가면 패스
            for (var normalList of normalWordPositions) {
                if (Utils.objectInclude(position, normalList, false)) {
                    isNeedToPass = true;
                    break;
                }
            }

            // 포지션 체크. 단어에서 뒤에 올 글자가 앞에 올 글자보다 3글자 이상 앞에 오면 isNeedToPass를 띄운다.
            for (var pos = 0; pos < position.length; pos++) {
                for (var pos1 = 0; pos1 < pos; pos1++) {
                    if (position[pos1] - position[pos] < -3) {
                        isNeedToPass = true;
                        break;
                    }
                }
            }

            // 포지션을 순서대로 정렬했는데 순서가 달라진다면 글자가 섞여있는 것으로 간주합니다.
            let sortedPosition = tempWordPositions.slice().sort((a, b) => a - b)
            if (!Utils.objectEqual(sortedPosition, tempWordPositions)) {
                isShuffled = true;
                tempWordPositions = sortedPosition; // 순서대로 정렬한 값을 추출한다.
            }

            // TODO
            // 발견된 각 문자 사이의 거리 및 사람이 인식할 가능성 거리의 계산
            // (3글자가 각각 떨어져 있을 수도 있음)
            // 글자간 사이들을 순회하여서 해당 비속어가 사람이 인식하지 못할 정도로 퍼져있다거나 섞여있는지를 확인합니다.

            let positionInterval = Utils.grabCouple(tempWordPositions); // [1,3,4]-> [[1,3], [3,4]]

            // 각 글자 인덱스 구간을 수집한다.
            for (let diffRangeIndex in positionInterval) {

                // 글자간 사이에 있는 모든 글자를 순회합니다.
                let diff = ''
                for (let diffi = positionInterval[diffRangeIndex][0] + 1; diffi <= (positionInterval[diffRangeIndex][1] - 1); diffi++) {
                    diff += newMessage[diffi]
                }

                if (isShuffled && !isNeedToPass) {
                    // 뒤집힌 단어의 경우엔 자음과 모음이 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.
                    if (!this.shuffledMessageFilter(diff, false, true))
                        isNeedToPass = true
                } else {
                    // 순서가 뒤집히지 않았을 때는 한글의 길이가 충분히 길거나 정상단어가 글자 사이에 쓰인 경우 비속어에서 배제합니다.
                    if (this.shuffledMessageFilter(diff, true, true) > 3) isNeedToPass = true;
                    else {
                        for (let index in this.normalWords) {
                            if (diff.length === 0) break
                            let diffSearchedPositions = Utils.getPositionAll(diff, this.normalWords[index])
                            if (diffSearchedPositions.length > 1) {
                                isNeedToPass = true;
                            }
                        }
                    }
                }

            }

            // 기존에 발견돤 단어와 낱자가 겹쳐도 pass
            for (let usedBadWordPositions of wordPositions) {
                if (!Utils.isDisjoint(usedBadWordPositions, tempWordPositions)) {
                    isNeedToPass = true;
                    break;
                }
            }

            // 해당 비속어를 발견은 하였지만,사람이 인지하지 못할 것으로 간주되는 경우 해당 발견된 비속어를 무시합니다.
            if (isNeedToPass) return res;

            wordPositions.push(tempWordPositions);

            // map일 때는 메시지 찾기
            if (isMap) {

                let originalWord = ''; // originalWord 단어 찾기
                let tempOriginalPosition = [];

                // 원문 위치 찾기
                for (var pos of tempWordPositions) {
                    console.log('t', pos, originalMessageList[Number(pos)])
                    let originalCount = originalMessageList[Number(pos)].length;
                    if (isReassemble) {
                        originalCount = originalMessageList[Number(pos)].split("").filter(x=> /[^ㄱ-ㅎㅏ-ㅣ]/.test(x)).length;
                    }
                    console.log('then', originalCount)
                    // 원문의 위치 추가
                    for (let k=0; k<originalCount; k++) {
                        tempOriginalPosition.push(originalMessageSyllablePositions[pos]+k);
                    }
                }
                // 원문 찾기
                originalWord = originalMessage.split("").filter((val, idx)=> tempOriginalPosition.indexOf(idx)>-1).join("");

                // 마지막으로 리스트 추가
                originalWords.push(originalWord)
                originalPositions.push(tempOriginalPosition)
            }
        }

        if (wordPositions.length>0) {

            if (isMap) {
                if (print) {
                    console.log(`원문: ${originalMessage}`);
                    console.log(`변환된 문장: ${newMessage}`);
                    console.log(`발견된 비속어: [${wordList.join('')}]`)
                    console.log(`발견된 비속어 유형: ${wordTypeValue[wordType]}`)
                    console.log(`발견된 비속어 원문: [${originalWords}]`)
                    console.log(`발견된 비속어 위치: [${wordPositions}]`)
                    console.log(`발견된 비속어 원래 위치: [${originalPositions}]`)
                    console.log('\n')
                }
                res.found = wordList.join('');
                res.position = wordPositions;
                res.originalFound = originalWords;
                res.originalPosition = originalPositions
            }
            else {
                if (print) {
                    console.log(`원문: ${newMessage}`)
                    console.log(`발견된 비속어: [${wordList.join()}]`)
                    console.log(`발견된 비속어 유형: ${wordTypeValue[wordType]}`)
                    console.log(`발견된 비속어 위치: [${wordPositions}]`)
                    console.log('\n')
                }
                res.found = wordList.join('');
                res.position = wordPositions;
            }
        }
        return res;
    }

    // 비속어를 결자처리하는 함수. isMap을 통해 유도해보자.
    fix(message, replaceCharacter, condition= {qwertyToDubeol:false, antispoof:false, dropDouble:false, fixSoft:false, isOriginal:false}) {

        let fixedMessage = "";
        let fixedMessageList = [];
        // let fixedMessageIndex = []
        let fixedMessageObject = {}
        // condition
        if (condition.qwertyToDubeol === true) {
            fixedMessageObject = this.nativeFind(Utils.qwertyToDubeol(message, true), true, true)
            fixedMessageList = condition.isOriginal ? Utils.parseMap(Utils.qwertyToDubeol(message, true)).messageList : Utils.parseMap(Utils.qwertyToDubeol(message, true)).parsedMessage
            // fixedMessageIndex = Utils.parseMap(Utils.qwertyToDubeol(message, true)).messageIndex;
            // fixedMessage = fixedMessageList.join("")
        }
        else if (condition.dropDouble=== true) {
            fixedMessageObject = this.nativeFind(Utils.dropDouble(message, true), true, true, true)
            fixedMessageList = condition.isOriginal? Utils.parseMap(Utils.dropDouble(message, true)).messageList:Utils.parseMap(Utils.dropDouble(message, true)).parsedMessage
            // fixedMessageIndex = Utils.parseMap(Utils.dropDouble(message, true)).messageIndex;
            // fixedMessage = fixedMessageList.join("")
        }
        else if (condition.antispoof === true) {
            fixedMessageObject = this.nativeFind(Utils.antispoof(message, true), true, true)
            fixedMessageList = condition.isOriginal? Utils.parseMap(Utils.antispoof(message, true)).messageList: Utils.parseMap(Utils.antispoof(message, true)).parsedMessage
            // fixedMessageIndex = Utils.parseMap(Utils.antispoof(message, true)).messageIndex;
            // fixedMessage = fixedMessageList.join("")
        }
        else {
            fixedMessageObject = this.nativeFind(Utils.msgToMap(message), true, true)
            fixedMessageList = Utils.parseMap(Utils.msgToMap(message)).parsedMessage
        }

        // console.log(fixedMessageObject)
        // console.log(fixedMessageList)

        replaceCharacter = (replaceCharacter === undefined) ? '*' : replaceCharacter

        // 원본 메시지가 아닌 변환된 메시지의 욕설을 숨김자 처리하려고 할 때
        if (!condition.isOriginal) {
            for (let index in fixedMessageList) {
                for (let positions of fixedMessageObject.positions) {
                    // object에서 position이 발견되는 경우 대체한다.
                    for (let position of positions)
                    {

                        if (position.indexOf(parseInt(index))!==-1) fixedMessageList[index] = replaceCharacter
                    }

                }
                if (condition.fixSoft) {
                    for (let positions of fixedMessageObject.positions) {
                        // object에서 position이 발견되는 경우 대체한다.
                        for (let position of positions)
                        {
                            if (position.indexOf(parseInt(index))!==-1) fixedMessageList[index] = replaceCharacter
                        }

                    }
                    if (fixedMessageObject.tooMuchDoubleEnd.pos.indexOf(index) !== -1)
                        fixedMessageList[index] = replaceCharacter
                }
            }
        }
        // 원본 메시지의 욕설을 숨김처리하려고 할 때
        else {
            for (let index in fixedMessageList) {
                for (let positions of fixedMessageObject.positions) {
                    // object에서 position이 발견되는 경우 대체한다.
                    for (let position of positions) {
                        if (position.indexOf(parseInt(index))!==-1) fixedMessageList[index] = replaceCharacter
                    }

                }
                if (condition.fixSoft) {
                    for (let positions of fixedMessageObject.positions) {
                        // object에서 position이 발견되는 경우 대체한다.
                        for (let position of positions) {

                            if (position.indexOf(parseInt(index))!==-1) fixedMessageList[index] = replaceCharacter
                        }
                    }
                    if (fixedMessageObject.tooMuchDoubleEnd.pos.indexOf(index.toString()) !== -1)
                        fixedMessageList[index] = replaceCharacter
                }
            }
        }

        fixedMessage = fixedMessageList.join("")

        return fixedMessage
    }

    // 메시지에서 정상단어 위치 찾는 맵
    // isMap 형식일 경우 {정상단어: [[정상단어포지션1], [정상단어포지션2],...],... } 형식으로 출력
    // isMap 형식이 아니면 message에서 정상단어의 낱자의 위치 리스트 형식으로 출력.
    // 선택자 ?, !는 일단 무시하는 것으로.
    findNormalWordPositions (message, isMap = true) {
        let exceptNormalPosition = []

        // 우선 exceptNormalPosition 찾기
        for (let exceptWord of this.exceptWords) {
            exceptNormalPosition = Utils.listUnion(exceptNormalPosition, Utils.getPositionAll(message, exceptWord))
        }
        // 숫자 정렬하기
        exceptNormalPosition.sort((a,b)=>(a-b))

        let wordPositionMap = {}

        // 정상단어 포지션 찾기
        for (let normalWord of this.normalWords) {
            let newNormalWord = normalWord.replace("!", "").replace("?", "")
            let i = message.indexOf(newNormalWord), indexes = []
            let tempList = [] // 저장용.
            while(i !==-1) {
                // 우선 단어 찾기
                indexes.push(i)
                for (var j =1; j<newNormalWord.length; j++) {
                    indexes.push(i+j)
                }
                // 포함되지 않을 때 tempList에 저장
                if (!Utils.objectInclude(indexes, exceptNormalPosition)) {
                    tempList.push(indexes)
                }
                // 인덱스값 초기화후 다시 찾기
                i = message.indexOf(newNormalWord, ++i)
                indexes = []
            }
            // 단어가 들어갔을 때 저장.
            if (tempList.length>0) wordPositionMap[normalWord] = tempList
        }

        // isMap일 때에는 {단어:[[위치1], [위치2],....], ...} 형식으로 출력
        if (isMap) return wordPositionMap;
        else {
            let  resList = []
            for (let lis of Object.values(wordPositionMap) ) {
                resList = Utils.listUnion(resList, Utils.listUnion(lis))
            }
            return resList.sort((a,b)=> (a-b))
        }

    }

    // 어떤 단어가 비속어 목록에 포함된지 체크
     isExistNormalWord(word) {
        return (typeof(this.normalWordsMap[word]) != 'undefined')
    }

    // 리스트 안에 있는지 판단하는 함수
    // 예시 : (봡보 => 바!보! True)
     wordIncludeType(word, comp) {
        let wordDisassemble = Utils.wordToArray(word), compDisassemble = Utils.wordToArray(comp);

        let res = true;
        if (wordDisassemble.length !== compDisassemble.length ) return false;
        else {
            // console.log(compDisassemble)
            for (let ind in compDisassemble) {
                // let wordType = wordDisassemble[ind][1]
                let compType = compDisassemble[ind][1]
                let nextChar = ""
                // console.log(compDisassemble.length, ind)
                if (ind < compDisassemble.length-1) nextChar = compDisassemble[Number(ind)+1].slice(0)[0]
                if (compType!=="!") {
                    if (wordDisassemble[Number(ind)][0] !== compDisassemble[Number(ind)][0]) res =false;
                }
                else {
                    if (! this.isKindChar(wordDisassemble[Number(ind)][0], compDisassemble[Number(ind)][0], nextChar)) res = false;
                }
                if (res === false) {return res;}
            }
            return true;
        }

    }

    // 비속어 여부 파악하기
     isExistBadWord(word) {
         return (typeof(this.badWordsMap[word]) != 'undefined')
    }

    // 뒤집힌 단어의 경우엔 자음과 모음이 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.-
     shuffledMessageFilter(message, isCount = false, isChar = false) {
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
                    else if (/^[,.!?:;"'&\-()0-9]$/.test(char)) {
                        continue;
                    }
                    // 다른 문자는 그냥 영단어 숫자 초기화.
                    else { tempCnt = 0; }
                }
            }
        }
        return isCount?cnt:(cnt === 0);
    }



    // 유사 낱자 검사. 낱자에 가! 형태로 표현되었을 경우 가뿐 아니라 각, 간 등 다 포함.
    // char : 낱자
    // comp : 낱자. comp!에 char가 포함되는 경우 true, 아닌 경우 false를 반환한다.
    // following : !뒤에 오는 낱자. 없으면 ""
    // 추가- this.strongerCheck가 true일 때에는 영어, 유사자형도 체크한다.
    isKindChar(char, comp, following="") {
        // 초성중성종성 분리 데이터 이용하기
        let charDisassemble = Utils.choJungJong(char)
        let compDisassemble = Utils.choJungJong(comp)
        let followDisassemble = following===""?{cho:[], jung:[], jong:[]}:Utils.choJungJong(following)
        let resi = false; // 초성 유사음
        let resm = false; // 중성 유사음
        let rese = false; // 종성 유사음

        // console.log(charDisassemble, compDisassemble, followDisassemble)

        const toothConsonant = Utils.toothConsonant;

        // 유사초성. 가 -> 까, 카
        const simInit = Utils.simInit;

        // 유사중성.  고 -> 거, 교
        const simMiddle = Utils.simMiddle;

        // 초성이 치음일 때 유사중성 for ㄷ,ㄸ,ㅅ,ㅆ,ㅈ,ㅊ,ㅉ,ㅌ 이 경우는 y복모음 구별불가인 특수 케이스
        const toothSimMiddle =  Utils.toothSimMiddle;
        // 유사종성
        const simEnd = Utils.simEnd;

        // 뒷글자에 의한 자음동화. 뒷글자가
        const jointConsonant = Utils.jointConsonant;

        //뒷글자에 의한 ㅣ 모음동화 잡아내기
        const jointVowel = Utils.jointVowel;

        //우선 유사초음 찾아내기. 밑바탕(!들어감) 자음의 유사자음 리스트 안에 원 자음이 들어가는 경우
        if (compDisassemble["cho"][0] === charDisassemble["cho"][0] || (simInit[compDisassemble["cho"][0]]!==undefined && simInit[compDisassemble["cho"][0]].indexOf( charDisassemble["cho"][0] )!== -1)) {
            resi = true;
        }

        // 유사중음 찾아내기. 치음의 경우

        if (Utils.objectEqual(compDisassemble["jung"], charDisassemble["jung"])) {
            resm = true;
        }
        else if (toothConsonant.indexOf(charDisassemble["cho"][0])!== -1 && Utils.objectIn(charDisassemble["jung"], toothSimMiddle[Hangul.assemble(compDisassemble["jung"])] ) === true) {
            resm = true;
        }
        else if (toothConsonant.indexOf(charDisassemble["cho"][0])=== -1 && Utils.objectIn(charDisassemble["jung"], simMiddle[Hangul.assemble(compDisassemble["jung"])] ) === true) {
            resm = true;
        }
        // 모음 동화 반영
        else if (followDisassemble["jung"].length>0 && Utils.objectIn( followDisassemble["jung"],[["ㅣ"], ["ㅡ","ㅣ"], ["ㅜ","ㅣ"]]) === true && Utils.objectIn( charDisassemble["jung"], jointVowel[Hangul.assemble(compDisassemble["jung"])]) === true) {
            resm = true;
        }

        // 유사종음 찾아내기.
        // 우선 두 글자 받침이 동일할 때는 무조건 OK
        if (Utils.objectEqual(compDisassemble["jong"], charDisassemble["jong"])) {
            rese = true;
        }
        else if (Utils.objectIn(charDisassemble["jong"], simEnd[compDisassemble["jong"]])) {
            rese = true;
        }
        // 또 comp 받침 글자를 char가 포함하는 경우 무조건 OK
        else if (compDisassemble["jong"].length>0 && Utils.objectInclude(compDisassemble["jong"], charDisassemble["jong"]) ) {
            rese = true;
        }
        // 자음동화. comp에 받침이 없을 때 받침 맨 뒷글자가 follow의 초성과 자음동화를 이룰 때
        else if (followDisassemble["cho"].length>0 && compDisassemble["jong"].length ===0 &&  charDisassemble["jong"].slice(-1)[0] === followDisassemble["cho"][0] ) {
            rese = true;
        }
        else if (followDisassemble["cho"].length>0 && compDisassemble["jong"].length ===0 && jointConsonant[ followDisassemble["cho"][0] ]!== undefined && jointConsonant[ followDisassemble["cho"][0] ].indexOf( charDisassemble["jong"].slice(-1)[0] ) !==-1 ) {
            rese = true;
        }

        return resi && resm && rese;
    }

    //어떤 단어가 다른 단어에 포함되는지 체크하기
    wordInclude(inc, exc) {
        // wordToArray 형태로 inc, exc 변환하기
        if (typeof inc === "string") inc = Utils.wordToArray(inc);
        else if (Array.isArray(inc)) inc = Utils.wordToArray(inc.join(""));

        if (typeof exc === "string") exc = Utils.wordToArray(exc);
        else if (Array.isArray(exc)) exc = Utils.wordToArray(exc.join(""));

        // 포함관계 체크하기
        let tempCnt = 0;
        let val = false;
        for (let incCnt in inc) {
            // inc 낱자 파싱
            let mainChar = inc[incCnt][0]; // 기본 낱자
            let parserChar = inc[incCnt][1]; // 파싱 낱자. ! 또는 ?
            let astLength = (parserChar==="!"|| parserChar==="+")? inc[incCnt].length-2: inc[incCnt].length-1; // ? 갯수

            while(tempCnt < exc.length) {
                // exc 낱자 파싱
                let excChar = exc[tempCnt][0] // 낱자
                let excParserChar = exc[tempCnt][1] // exc 파싱 낱자
                let excAstLength = excParserChar==="!"?exc[tempCnt].length-2:exc[tempCnt].length-1; // ext ? 갯수

                //낱자의 astLength는 exc 배열 낱자의 astLength보다 우선 짧아야 한다.
                if (astLength <= excAstLength){
                    // excParserChar가 !표시, 즉 유사 낱자 다 포함할 때.
                    if (excParserChar === "!" && parserChar !=="!") {
                        if (this.isKindChar(mainChar, excChar)) {
                            val = true;
                            if (incCnt<inc.length-1) tempCnt++;
                            break;
                        }
                        else tempCnt++;
                    }
                    else {
                        if (mainChar === excChar) {
                            val = true;
                            if (incCnt<inc.length-1) tempCnt++;
                            break;
                        }
                        else tempCnt++;
                    }
                }
                // tempCnt에서 astLength가 더 긴게 있다면 넘어가자
                else {
                    tempCnt++;
                }
            }
            // for 루프 탈출조건.
            if (tempCnt === exc.length) {
                val = false;
                break;
            }
        }
        return val;
    }

    // 한글 조합 함수. 각 원소들을 Hangul.assemble(Hangul.disassemble())로 조합하는데 사용합니다. isIgnoreComma 옵션은 파서 문자 ,를 무시할지 물어봅니다.
    assembleHangul(elem, isIgnoreComma = true) {
        return Utils.listMap(elem, x=>(
            isIgnoreComma ? Hangul.assemble(Hangul.disassemble(x)).replace(".,", "，").replace(",","").replace("，",",")
                : Hangul.assemble(Hangul.disassemble(x))
        ));
    }

    // 단어 리스트가 존재할 때 wordToArray로 배열하고 길이 역순으로 정렬:
    // ['가랑비', '나!무', '돼지갈비'] -> [[['돼','지','갈','비'], ['가','랑','비'], ['나!', '무']], ['돼지갈비', '가랑비', '나!무']]
     parseFromList(wordList) {
        let res  = []
        for (let word of wordList) {
            res.push([Utils.wordToArray(word), word])
        }
        res.sort((a,b) => (a[1].length-b[1].length)).reverse()
        return [res.map(x=>x[0]), res.map(x=> x[1])]
    }

    // 메시지 맵에서 수정된 맵의 포지션을 원본 맵에서 유도하기
    getOriginalPosition(messageMap, positionList) {
        const parsedMessage= Utils.parseMap(messageMap);
        const totalRes = parsedMessage.messageIndex;
        const joinedParsedMessage = this.assembleHangul(parsedMessage.messageList.join(""), false);
        let res = []
        for (let pos of positionList) {
            let firstIndex = totalRes[pos];
            let secondIndex = pos == totalRes.length-1 ? joinedParsedMessage.split('').length : totalRes[Number(pos)+1]
            let counted = Number(secondIndex) - Number(firstIndex);
            res = res.concat([...Array(counted).keys()].map(x=> x+firstIndex));
        }
        return res;
    }

    // 비속어 검사시 영어표현의 위치를 잡아내는 함수
    // 예시 : ([[지!,'랄'], ziral) =>[0,1,2,3,4] )
    // isMap일 때에는 {position: [], originalPosition: []} 형태로 출력
    // type :
    engBadWordsCheck(wordList, message, isMap = false, type) {
        let res = [] // 리스트 형태로 출력. 각 원소는 [1,2,4] 형식으로 출력함.
        let originalRes = [] // 원문의 위치 리스트 형태로 출력. isMap이 참일 때만 사용 가능
        let messageParse = isMap ? Utils.parseMap(message) : {messageList:[], messageIndex: [], parsedMessage:[]}
        let newMessage= isMap? this.assembleHangul(messageParse.parsedMessage.join(""), false): message; // 결과 메시지
        let msgMap;

        // 반복되는 프로세스를 callback으로 정리
        const joinProcess = (msgMap) => {
            let wordResult = this.oneWordFind(wordList, msgMap, this.badWordsMap, true, true, true);
            console.log(wordResult);
            res = res.concat(wordResult.originalPosition);
            // isMap일 때는 partRes를 이용해서
            if (isMap) {
                let partRes = wordResult.originalPosition;
                for (let position of partRes) {
                    let originalPosition = this.getOriginalPosition(message, position);
                    originalRes.push(originalPosition);
                }
            }
        }

        // 타입에 따라 작업 달라짐
        switch(type) {
            // 한영자 타입 섞기 테스트
            case 'qwerty':
                // console.log('qwertytest');
                msgMap = Utils.qwertyToDubeol(newMessage, true);
                joinProcess(msgMap);
                break;
            //
            case 'antispoof':
                // console.log('antispoof test');
                msgMap = Utils.antispoof(newMessage, true);
                joinProcess(msgMap);
                break;
            case 'pronounce':
                // console.log('engtoko test');
                msgMap = Utils.engToKo(newMessage, true);
                joinProcess(msgMap);
                break;
        }

        return isMap? {position: res, originalPosition: originalRes}: res;
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
     recursiveComponent (data, variable={}, nonParsedVariable = null) {
        // data : array.

        // console.log('recursiveComponent() start')

        // 데이터의 전항 후항을 순회합니다.
        for(let i=0;i<=1;i++){

            // 데이터의 모든 항목을 순회합니다.
            for(let itemIndex in data[i]){
                let item = data[i][itemIndex]

                // console.log("item LIST:::", item)

                // 데이터 항목이 배열인 경우
                // 재귀 컴포넌트 해석을 진행합니다.
                if(Array.isArray(item)){
                    let solvedData = this.recursiveComponent(item, variable, nonParsedVariable)
                    // console.log("SOLVEDDATA", solvedData)
                    data[i][itemIndex] = null
                    data[i] = data[i].concat(solvedData)
                    // data[i] = this.assembleHangul(data[i])

                } else if(!Array.isArray(item) && typeof item === 'object'){

                    // 부가 함수를 사용한 경우
                    // 지정된 함수가 반환하는 리스트를 반영합니다.
                    data[i] = data[i].concat(this.recursiveComponent(item, variable, nonParsedVariable))
                    // data[i] = this.assembleHangul(data[i])

                } else if(typeof item === 'string' && item[0] === '*'){

                    // 만약 변수를 사용했다면 (단어 앞에 *로 시작) 해당 부분을
                    // 변수의 리스트로 대치합니다.
                    // console.log("item", item)
                    let varName = item.slice(1);
                    // console.log(item, `함수호출됨: ${varName}`)

                    // 엘레멘트 이름이 "*사랑"일 때, 여기서 variable의 변수는 {"사랑":(리스트)} 형식으로 정의할 수 있다.
                    // console.log("varName", varName)

                    if(typeof variable[varName] !== 'undefined'){
                        //  console.log(`1함수호출됨: ${varName}`)

                        data[i] = data[i].concat(variable[varName])
                        // data[i] = this.assembleHangul(data[i])
                    }
                    // 아니면 nonParsedVariable에서 변수가 있는지 확인해보기.
                    else {
                        //  console.log(`2함수호출됨: ${varName}`)
                        // 만약 변수 안에서 변수를 참조한 경우
                        // 필요한 부분의 변수만 파싱하여 해당 리스트를 구성합니다.
                        if(nonParsedVariable !== null){
                            //   console.log(`2함수진행됨: ${varName}`)
                            let parsedHeaderVariable = this.recursiveList(nonParsedVariable[varName], nonParsedVariable, true)
                            data[i] = data[i].concat(parsedHeaderVariable)
                            // data[i] = this.assembleHangul(data[i])
                            //  console.log(`2함수결과:`)
                            //  console.log(parsedHeaderVariable.length)
                            if(parsedHeaderVariable.length == 0)
                                throw new Error (`${varName} 변수를 찾을 수 없습니다. 또는 변수 내부 길이가 0입니다.`)
                        }else{
                            throw new Error (`nonParsedVariable 전해받지 못함, ${varName} 변수를 찾을 수 없습니다.`)
                        }
                    }
                    data[i][itemIndex] = null
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
        // console.log('recursiveComponent() end')
        return solvedData
    }

    /**
     * 이 함수로 배열을 감싸면 비속어 단어 정의용
     * 데이터 표현 포멧을 바로 쓸 수 있게 해줍니다.
     *
     * @param {array} list
     * @param {object} variable { 키값: [list] } 형식으로 정의
     * @param {boolean} isVariableParse variable에서 list가 완전히 파싱됐는지 여부 확인
     * @param {string} defaultType
     *
     * @returns {array} solvedList
     */

     recursiveList (list, variable = null, isVariableParse = false, defaultType = 'string') {
        // console.log('recursiveList() start')

        // 변수단을 해석처리합니다.
        let parsedVaraible = {}

        // variable의 리스트가 완전히 파싱된 상태가 아니면 variable 리스트를 파싱해서 처리함.
        if(variable !== null && !isVariableParse){
            for(let varItemIndex in variable)
                parsedVaraible[varItemIndex] = this.recursiveList(variable[varItemIndex], variable, true)
        }

        // 코드단을 해석처리합니다.
        // 결과 리스트
        let rebuild = []
        // 리스트의 엘리먼트에 대해서
        for(let itemIndex in list){
            // console.log("ITEMINDEX:::", list[itemIndex])
            let item = list[itemIndex]

            if(typeof item === defaultType){

                // 그냥 문자열이면 바로 리스트에 반영합니다.
                // *로 시작하지 않는 경우 - 한글 분해 후 재조합.
                if(item[0] !== '*'){
                    rebuild.push(item)
                }
                else {

                    // 만약 변수를 사용했다면 해당 부분을
                    // 변수의 리스트를 반영합니다.
                    let varName = item.slice(1);
                    if(typeof parsedVaraible[varName] !== 'undefined' && !isVariableParse){
                        // console.log("\n\nParsedVariable", parsedVaraible[varName])
                        rebuild = rebuild.concat(parsedVaraible[varName])
                        // rebuild = this.assembleHangul(rebuild)
                    }else{
                        if(isVariableParse){

                            // 정의된 변수가 없는데 변수가 들어갔으면
                            // 해당 변수만 별개로 해석하여 리스트에 첨부합니다.
                            let parsedHeaderVariable = this.recursiveList(variable[varName], variable, true)
                            // console.log("\n\nParsedHeaderVariable", parsedHeaderVariable)
                            rebuild = rebuild.concat(parsedHeaderVariable)
                            // rebuild = this.assembleHangul(rebuild)
                        }else{
                            throw new Error(`${varName} 음절 변수를 찾을 수 없습니다.`)
                        }
                    }
                }

            }else if(Array.isArray(item) && typeof item === 'object'){

                // 데이터 항목이 배열인 경우
                // 재귀 컴포넌트 해석을 진행합니다.
                rebuild = rebuild.concat(this.recursiveComponent(item, parsedVaraible, variable))
                // rebuild = this.assembleHangul(rebuild)
            }else{

                // 부가 함수를 사용한 경우
                // 지정된 함수가 반환하는 리스트를 반영합니다.
                rebuild = rebuild.concat(this.additionalType(item, parsedVaraible, variable))
                // rebuild = this.assembleHangul(rebuild)
            }
        }
        // console.log('recursiveList() end')
        return rebuild
    }

    /**
     * 데이터를 가지고 있다가
     * 해당 데이터가 빌드될 때 어떻게 처리할지를
     * 함수를 통해 정의할 수 있습니다.
     *
     * 이 메소드 내 함수명을 정의함을 통해서
     * 빌드 과정에서 데이터에 간섭할 수 있습니다.
     *
     * @param {object} component
     * @param {object} parsedVaraible
     * @param {object} nonParsedVariable
     */
     additionalType(component, parsedVaraible, nonParsedVariable = null){
        console.log('additionalType() start')
        let list = []
        //let defaultList = this.recursiveComponent(component.data, parsedVaraible, nonParsedVariable)

        switch(component.type){
            case '단어병합':
                list = this.recursiveComponent(component.data, parsedVaraible, nonParsedVariable)
                break
            case '자모합성':
                for(let item of this.recursiveComponent(component.data, parsedVaraible, nonParsedVariable)){
                    item = item.split('')
                    // console.log(item)
                    list.push(item)
                }
                break
        }

        /* 아래부터는 공통기능을 구현합니다. */

        // 생성된 리스트 중 일부 단어 배제 기능
        if(typeof component['exclude'] !== 'undefined'){
            let preList = []
            for(let item of list){
                if(component['exclude'].indexOf(item) === -1)
                    preList.push(item)
            }
            list = preList
        }

        console.log('additionalType() end')
        return list
    }
}

module.exports = Tetrapod
