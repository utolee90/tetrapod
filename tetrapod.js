import Hangul from 'hangul-js';
import Utils from './components/Utils';
import fs from 'fs';

// 사전데이터들을 배열형태로 저장해서 보관합니다. (json)
var badWords = [] // 비속어
var typeofBadWords = {} // 비속어 타입별로 분류하기
var normalWords = [] // 정상단어
var softSearchWords = [] // 저속한 단어
var exceptWords = [] // 정상단어에서 제외할 단어.
var badWordMacros = {} // 반복적으로 사용하는 매크로 정의하기.

// 빠른 비속어단어 확인을 위해 사전에
// 단어목록을 한글자씩 조각내놓고 사용합니다.
var parsedBadWords = []
var parsedSoftSearchWords = []
var parsedDrugWords = []
var parsedInsultWords = []
var parsedSexualityWords = []
var parsedViolenceWords = []

// 유동적인 비속어 목록 관리를 위해 이미 배열에
// 특정 단어가 존재하는지를 확인하기위해 해시맵을 사용합니다.
var badWordsMap = {}
var normalWordsMap = {}
var softSearchWordsMap = {}
var exceptWordsMap = {}
var typeofBadWordsMap = {drug:{}, insult:{}, sexuality:{}, violence:{}}


class Tetrapod {

    // badWord, 정상단어, softSearchWord 불러오기
    static load(inputBadwords, inputDictionary, inputSoftSearchWords, inputExceptWords, inputTypeofBadWords, inputBadWordMacros, disableAutoParse = true) {
        badWords = inputBadwords
        normalWords = inputDictionary
        softSearchWords = inputSoftSearchWords
        exceptWords = inputExceptWords
        typeofBadWords = inputTypeofBadWords
        badWordMacros = inputBadWordMacros

        if (disableAutoParse != false) {
            this.parse()
            this.mapping()
            this.sortAll()
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
            exceptWords: require(normalWordsPath).exception,
            softSearchWords: require(softSearchWordsPath).badwords,
            typeofBadWords: {
                drug: require(badWordsPath).drug,
                insult:require(badWordsPath).insult,
                sexuality: require(badWordsPath).sexuality,
                violence: require(badWordsPath).violence
            },
            badWordMacros: require(badWordsPath).macros,
        }
        this.load(data.badWords, data.normalWords, data.softSearchWords, data.exceptWords, data.typeofBadWords, data.badWordMacros)
    }

    // 기본 비속어 사전의 목록 로드
    static defaultLoad() {
        let data = this.getDefaultData()
        // console.log(Object.keys(data))
        this.load(data.badWords, data.normalWords, data.softSearchWords, data.exceptWords, data.typeofBadWords, data.badWordMacros)
    }

    static showBadWordsMap() {
        console.log(badWordsMap)
    }

    // 리스트 형식으로 된 BadWord 단어들을 wordToArray 이용해서 1차원 배열로 풀어쓰기.
    static parse() {
        parsedBadWords = []
        parsedSoftSearchWords = []
        parsedDrugWords = []
        parsedInsultWords = []
        parsedSexualityWords = []
        parsedViolenceWords =[]
        for (let index in softSearchWords) {
            if (!Utils.objectIn(Utils.wordToArray(softSearchWords[index]), parsedSoftSearchWords))
                parsedSoftSearchWords.push(Utils.wordToArray(softSearchWords[index]))
        }
        // softSearchWords에 들어가지 않는 단어들만 집어넣기
        for (let index in typeofBadWords.drug) {
            if (
                !Utils.objectIn(Utils.wordToArray(typeofBadWords.drug[index]), parsedDrugWords)
                && !Utils.objectIn(Utils.wordToArray(typeofBadWords.drug[index]), parsedSoftSearchWords)
            )
                parsedDrugWords.push(Utils.wordToArray(typeofBadWords.drug[index]))
        }
        for (let index in typeofBadWords.insult) {
            if (
                !Utils.objectIn(Utils.wordToArray(typeofBadWords.insult[index]), parsedInsultWords)
                && !Utils.objectIn(Utils.wordToArray(typeofBadWords.insult[index]), parsedSoftSearchWords)
            )
                parsedInsultWords.push(Utils.wordToArray(typeofBadWords.insult[index]))
        }
        for (let index in typeofBadWords.sexuality) {
            if (
                !Utils.objectIn(Utils.wordToArray(typeofBadWords.sexuality[index]), parsedSexualityWords)
                && !Utils.objectIn(Utils.wordToArray(typeofBadWords.sexuality[index]), parsedSoftSearchWords)
            )
                parsedSexualityWords.push(Utils.wordToArray(typeofBadWords.drug[index]))
        }
        for (let index in typeofBadWords.violence) {
            if (
                !Utils.objectIn(Utils.wordToArray(typeofBadWords.violence[index]), parsedViolenceWords)
                && !Utils.objectIn(Utils.wordToArray(typeofBadWords.violence[index]), parsedViolenceWords)
            )
                parsedViolenceWords.push(Utils.wordToArray(typeofBadWords.violence[index]))
        }


        // softSearchWords나 위의 분류에 들어가지 않은 단어들만 집어넣게 변경.
        for (let index in badWords) {
            if (
                !Utils.objectIn(Utils.wordToArray(badWords[index]), parsedBadWords)
                && !Utils.objectIn(Utils.wordToArray(badWords[index]), parsedSoftSearchWords)
                && !Utils.objectIn(Utils.wordToArray(badWords[index]), parsedDrugWords)
                && !Utils.objectIn(Utils.wordToArray(badWords[index]), parsedInsultWords)
                && !Utils.objectIn(Utils.wordToArray(badWords[index]), parsedSexualityWords)
                && !Utils.objectIn(Utils.wordToArray(badWords[index]), parsedViolenceWords)
            )
                parsedBadWords.push(Utils.wordToArray(badWords[index]))
        }


        // 단어의 길이 역순으로 정렬
        parsedBadWords.sort((a,b)=> a.length-b.length).reverse();
        parsedSoftSearchWords.sort((a,b)=> a.length-b.length).reverse();
        parsedDrugWords.sort((a,b)=> a.length-b.length).reverse();
        parsedInsultWords.sort((a,b)=> a.length-b.length).reverse();
        parsedSexualityWords.sort((a,b)=> a.length-b.length).reverse();
        parsedViolenceWords.sort((a,b)=> a.length-b.length).reverse();

    }

    static showParsedSoftSearchWords() {
        console.log(parsedSoftSearchWords);
    }

    // 목록을 맵으로 지정.
    static mapping() {
        badWordsMap = {}
        normalWordsMap = {}
        softSearchWordsMap = {}
        exceptWordsMap = {}
        typeofBadWordsMap = {drug:{}, insult:{}, sexuality:{}, violence:{}}

        for (let word of badWords)
            badWordsMap[word] = true
        for (let word of normalWords)
            normalWordsMap[word] = true
        for (let word of softSearchWords)
            softSearchWordsMap[word] = true
        for (let word of exceptWords)
            exceptWordsMap[word] = true
        for (let word of typeofBadWords.drug)
            typeofBadWordsMap.drug[word] = true
        for (let word of typeofBadWords.insult)
            typeofBadWordsMap.insult[word] = true
        for (let word of typeofBadWords.sexuality)
            typeofBadWordsMap.sexuality[word] = true
        for (let word of typeofBadWords.violence)
            typeofBadWordsMap.violence[word] = true
    }

    // 맵 정렬하기
    static sortBadWordsMap() {
        badWordsMap = Utils.sortMap(badWordsMap)
        typeofBadWordsMap = {
            drug: Utils.sortMap(typeofBadWordsMap.drug),
            insult: Utils.sortMap(typeofBadWordsMap.insult),
            sexuality: Utils.sortMap(typeofBadWordsMap.sexuality),
            violence: Utils.sortMap(typeofBadWordsMap.violence),
        }
        badWords = Object.keys(badWordsMap);
        typeofBadWords = {
            drug : Object.keys(typeofBadWordsMap.drug),
            insult : Object.keys(typeofBadWordsMap.insult),
            sexuality : Object.keys(typeofBadWordsMap.sexuality),
            violence : Object.keys(typeofBadWordsMap.violence)
        }

    }

    static sortNormalWordsMap() {
        normalWordsMap = Utils.sortMap(normalWordsMap)
        exceptWordsMap = Utils.sortMap(exceptWordsMap)
        normalWords = Object.keys(normalWordsMap)
        exceptWords = Object.keys(exceptWordsMap)
    }

    static sortSoftSearchWordsMap() {
        softSearchWordsMap = Utils.sortMap(softSearchWordsMap)
        softSearchWords = Object.keys(softSearchWordsMap)
    }

    static sortAll() {
        this.sortBadWordsMap()
        this.sortNormalWordsMap()
        this.sortSoftSearchWordsMap()
    }

    // 기본 데이터 불러오기
    static getDefaultData() {
        let badWordMacros = require('./resource/dictionary/bad-words.json').macros

        return {
            badWords: this.recursiveList(require('./resource/dictionary/bad-words.json').badwords, badWordMacros),
            normalWords: this.recursiveList(require('./resource/dictionary/normal-words.json').dictionary, badWordMacros),
            exceptWords: this.recursiveList(require('./resource/dictionary/normal-words.json').exception, badWordMacros),
            softSearchWords: this.recursiveList(require('./resource/dictionary/soft-search-words.json').badwords, badWordMacros),
            typeofBadWords: {
                drug: this.recursiveList(require('./resource/dictionary/bad-words.json').drug, badWordMacros),
                insult: this.recursiveList(require('./resource/dictionary/bad-words.json').insult, badWordMacros),
                sexuality: this.recursiveList(require('./resource/dictionary/bad-words.json').sexuality, badWordMacros),
                violence : this.recursiveList(require('./resource/dictionary/bad-words.json').violence, badWordMacros),
            },
            badWordMacros
        }
    }

    // 사용자 정의 데이터 불러오기
    static getLoadedData() {
        return {
            badWords: badWords,
            normalWords: normalWords,
            exceptWords: exceptWords,
            softSearchWords: softSearchWords,
            typeofBadWords : typeofBadWords,
            badWordMacros: badWordMacros,
        }
    }

    // 데이터 저장
    static defaultSaveAllData() {
        !fs.existsSync('./resource/klleon/') && fs.mkdirSync('./resource/klleon');
        this.saveAllData('./resource/klleon/bad-words.json', './resource/klleon/normal-words.json', './resource/klleon/soft-search-words.json', false)
    }

    static saveAllData(badWordsPath, normalWordsPath, softSearchWordsPath, isAsync) {
        this.saveBadWordsData(badWordsPath, isAsync)
        this.saveNormalWordsData(normalWordsPath, isAsync)
        this.saveSoftSearchWordsData(softSearchWordsPath, isAsync)
    }

    static saveBadWordsData(path, isAsync) {
        this.sortBadWordsMap()

        let data = JSON.stringify({
            badwords: badWords,
            drug: typeofBadWords.drug,
            insult: typeofBadWords.insult,
            sexuality: typeofBadWords.sexuality,
            violence: typeofBadWords.violence,
            macros: badWordMacros
        }, null, 4)

        if(isAsync) fs.writeFile(path, data)
        else fs.writeFileSync(path, data)
    }

    static saveNormalWordsData(path, isAsync) {
        this.sortNormalWordsMap()

        let data = JSON.stringify({
            dictionary: normalWords,
            exception: exceptWords
        }, null, 4)

        if(isAsync) fs.writeFile(path, data)
        else fs.writeFileSync(path, data)
    }

    static saveSoftSearchWordsData(path, isAsync) {
        this.sortSoftSearchWordsMap()

        let data = JSON.stringify({
            badwords: softSearchWords
        }, null, 4)

        if(isAsync) fs.writeFile(path, data)
        else fs.writeFileSync(path, data)
    }


    // 메시지에 비속어가 들어갔는지 검사
    static isBad(message, includeSoft=false) {
        if (includeSoft === true)
            return (this.find(message, false).totalResult.length != 0 ||
                this.find(message, false).softResult.length != 0 ||
                this.find(message, false).endResult.length != 0
            );
        else return this.find(message, false).totalResult.length != 0;
    }

    // 메시지에 비속어가 몇 개 있는지 검사.
    static countBad(message, isStrong=false) {

        if (isStrong) {
            let searchResult = this.find(message, true, 0, false, true);
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
                bad: this.find(message, true, 0, false).totalResult.length,
                soft: this.find(message, true, 0, false).softResult.length,
                end: this.find(message, true, 0, false).endResult.length,
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
            message4Map = Utils.dropIung(message3, true, true);
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
                let currentResultDrug = this.nativeFind(messages[index1], needMultipleCheck, false, false, "drug")
                let currentResultInsult = this.nativeFind(messages[index1], needMultipleCheck, false, false, "insult")
                let currentResultSexuality = this.nativeFind(messages[index1], needMultipleCheck, false, false, "sexuality")
                let currentResultViolence = this.nativeFind(messages[index1], needMultipleCheck, false, false, "violence")
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
                    for (index2 = 0; index2 <= currentResultDrug.founded.length - 1; index2++) {
                        if (currentResultDrug.founded !== [] && totalResult.map(v=>v.value).indexOf(currentResultDrug.founded[index2])===-1)
                            totalResult = [...totalResult, {value:currentResultDrug.founded[index2], positions:currentResultDrug.positions[index2], type:"drug"}];
                    }
                    for (index2 = 0; index2 <= currentResultInsult.founded.length - 1; index2++) {
                        if (currentResultInsult.founded !== [] && totalResult.map(v=>v.value).indexOf(currentResultInsult.founded[index2])===-1)
                            totalResult = [...totalResult, {value:currentResultInsult.founded[index2], positions:currentResultInsult.positions[index2], type:"insult"}];
                    }
                    for (index2 = 0; index2 <= currentResultSexuality.founded.length - 1; index2++) {
                        if (currentResultSexuality.founded !== [] && totalResult.map(v=>v.value).indexOf(currentResultSexuality.founded[index2])===-1)
                            totalResult = [...totalResult, {value:currentResultSexuality.founded[index2], positions:currentResultSexuality.positions[index2], type:"sexuality"}];
                    }
                    for (index2 = 0; index2 <= currentResultViolence.founded.length - 1; index2++) {
                        if (currentResultViolence.founded !== [] && totalResult.map(v=>v.value).indexOf(currentResultViolence.founded[index2])===-1)
                            totalResult = [...totalResult, {value:currentResultViolence.founded[index2], positions:currentResultViolence.positions[index2], type:"violence"}];
                    }
                } else {
                    if (currentResult !== null){
                        totalResult = [...totalResult, currentResult.founded];
                        softResult = [...softResult, currentResult.softSearchFounded];
                    }
                    if (currentResultDrug !== null) {
                        totalResult = [...totalResult, currentResultDrug.founded];
                    }
                    if (currentResultInsult !== null) {
                        totalResult = [...totalResult, currentResultInsult.founded];
                    }
                    if (currentResultSexuality !== null) {
                        totalResult = [...totalResult, currentResultSexuality.founded];
                    }
                    if (currentResultViolence !== null) {
                        totalResult = [...totalResult, currentResultViolence.founded];
                    }
                }
            }
            // enToKo를 잡을 때
            if (totalResult.length ===0 && needEnToKo === true) {
                let currentResult = this.nativeFind(message2Map, needMultipleCheck, true);
                let currentResultDrug = this.nativeFind(message2Map,needMultipleCheck, true, false, "drug")
                let currentResultInsult = this.nativeFind(message2Map, needMultipleCheck,true, false, "insult")
                let currentResultSexuality = this.nativeFind(message2Map,needMultipleCheck, true, false, "sexuality")
                let currentResultViolence = this.nativeFind(message2Map,needMultipleCheck, true, false, "violence")
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
                    for (var index = 0; index <= currentResultDrug.founded.length - 1; index++) {
                        if (currentResultDrug.founded !== [] && totalResult.map(v=>v.value).indexOf(currentResultDrug.founded[index])===-1)
                            totalResult = [...totalResult, {value:currentResultDrug.founded[index], positions:currentResultDrug.positions[index], type:"drug"}  ];
                    }
                    for (var index = 0; index <= currentResultInsult.founded.length - 1; index++) {
                        if (currentResultInsult.founded !== [] && totalResult.map(v=>v.value).indexOf(currentResultInsult.founded[index])===-1)
                            totalResult = [...totalResult, {value:currentResultInsult.founded[index], positions:currentResultInsult.positions[index], type:"insult"}  ];
                    }
                    for (var index = 0; index <= currentResultSexuality.founded.length - 1; index++) {
                        if (currentResultSexuality.founded !== [] && totalResult.map(v=>v.value).indexOf(currentResultSexuality.founded[index])===-1)
                            totalResult = [...totalResult, {value:currentResultSexuality.founded[index], positions:currentResultSexuality.positions[index], type:"sexuality"}  ];
                    }
                    for (var index = 0; index <= currentResultViolence.founded.length - 1; index++) {
                        if (currentResultViolence.founded !== [] && totalResult.map(v=>v.value).indexOf(currentResultViolence.founded[index])===-1)
                            totalResult = [...totalResult, {value:currentResultViolence.founded[index], positions:currentResultViolence.positions[index], type:"violence"}  ];
                    }
                } else {
                    if (currentResult !== null){
                        totalResult = [...totalResult, currentResult.founded];
                        softResult = [...softResult, currentResult.softSearchFounded];
                    }
                    if (currentResultDrug !== null) {
                        totalResult = [...totalResult, currentResultDrug.founded];
                    }
                    if (currentResultInsult !== null) {
                        totalResult = [...totalResult, currentResultInsult.founded];
                    }
                    if (currentResultSexuality !== null) {
                        totalResult = [...totalResult, currentResultSexuality.founded];
                    }
                    if (currentResultViolence !== null) {
                        totalResult = [...totalResult, currentResultViolence.founded];
                    }
                }

            }

        }
        else {
            let currentResult = this.nativeFind(message3Map, needMultipleCheck, true);
            let currentResultDrug = this.nativeFind(message3Map, needMultipleCheck, true, false, "drug")
            let currentResultInsult = this.nativeFind(message3Map, needMultipleCheck, true, false, "insult")
            let currentResultSexuality = this.nativeFind(message3Map, needMultipleCheck, true, false, "sexuality")
            let currentResultViolence = this.nativeFind(message3Map, needMultipleCheck, true, false, "violence")

            let currentResult2 = this.nativeFind(message4Map, needMultipleCheck, true, true);
            let currentResultDrug2 = this.nativeFind(message4Map,needMultipleCheck, true, true, "drug")
            let currentResultInsult2 = this.nativeFind(message4Map, needMultipleCheck, true, true, "insult")
            let currentResultSexuality2 = this.nativeFind(message4Map, needMultipleCheck, true, true, "sexuality")
            let currentResultViolence2 = this.nativeFind(message4Map, needMultipleCheck, true, true, "violence")
            tooMuchEnds.push(currentResult.tooMuchDoubleEnd);

            if (needMultipleCheck) {
                for (var index =0; index<currentResult.founded.length; index++) {
                    if (currentResult.founded !==[] && originalTotalResult.map(v=>v.value).indexOf(currentResult.founded[index]) ===-1)
                        originalTotalResult = [...originalTotalResult, {value:currentResult.founded[index], positions:currentResult.positions[index]}];
                }
                for (index =0; index< currentResult.softSearchFounded.length; index++) {
                    if (currentResult.softSearchFounded!==[] && softResult.map(v=>v.value).indexOf(currentResult.softSearchFounded[index]===-1)) {
                        originalSoftResult = [...originalSoftResult, {value:currentResult.softSearchFounded[index], positions: currentResult.softSearchPositions[index]}]
                    }
                }
                for (var index =0; index<currentResultDrug.founded.length; index++) {
                    if (currentResultDrug.founded !==[] && originalTotalResult.map(v=>v.value).indexOf(currentResultDrug.founded[index]) ===-1)
                        originalTotalResult = [...originalTotalResult, {value:currentResultDrug.founded[index], positions:currentResultDrug.positions[index], type:"drug"}];
                }
                for (var index =0; index<currentResultInsult.founded.length; index++) {
                    if (currentResultInsult.founded !==[] && originalTotalResult.map(v=>v.value).indexOf(currentResultInsult.founded[index]) ===-1)
                        originalTotalResult = [...originalTotalResult, {value:currentResultInsult.founded[index], positions:currentResultInsult.positions[index], type:"insult"}];
                }
                for (var index =0; index<currentResultSexuality.founded.length; index++) {
                    if (currentResultSexuality.founded !==[] && originalTotalResult.map(v=>v.value).indexOf(currentResultSexuality.founded[index]) ===-1)
                        originalTotalResult = [...originalTotalResult, {value:currentResultSexuality.founded[index], positions:currentResultSexuality.positions[index], type:"sexuality"}];
                }
                for (var index =0; index<currentResultViolence.founded.length; index++) {
                    if (currentResultViolence.founded !==[] && originalTotalResult.map(v=>v.value).indexOf(currentResultViolence.founded[index]) ===-1)
                        originalTotalResult = [...originalTotalResult, {value:currentResultViolence.founded[index], positions:currentResultViolence.positions[index], type:"violence"}];
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
                for (var index =0; index<currentResultDrug2.founded.length; index++) {
                    if (currentResultDrug2.founded !==[] && totalResult.map(v=>v.value).indexOf(currentResultDrug2.founded[index]) ===-1)
                        totalResult = [...totalResult, {value:currentResultDrug2.founded[index], positions:currentResultDrug.positions[index], type:"drug"}];
                }
                for (var index =0; index<currentResultInsult2.founded.length; index++) {
                    if (currentResultInsult2.founded !==[] && totalResult.map(v=>v.value).indexOf(currentResultInsult2.founded[index]) ===-1)
                        totalResult = [...totalResult, {value:currentResultInsult2.founded[index], positions:currentResultInsult2.positions[index], type:"insult"}];
                }
                for (var index =0; index<currentResultSexuality2.founded.length; index++) {
                    if (currentResultSexuality2.founded !==[] && totalResult.map(v=>v.value).indexOf(currentResultSexuality2.founded[index]) ===-1)
                        totalResult = [...totalResult, {value:currentResultSexuality2.founded[index], positions:currentResultSexuality2.positions[index], type:"sexuality"}];
                }
                for (var index =0; index<currentResultViolence2.founded.length; index++) {
                    if (currentResultViolence2.founded !==[] && totalResult.map(v=>v.value).indexOf(currentResultViolence2.founded[index]) ===-1)
                        totalResult = [...totalResult, {value:currentResultViolence2.founded[index], positions:currentResultViolence2.positions[index], type:"violence"}];
                }

            }
            else {
                if (currentResult !== null){
                    originalTotalResult = [...originalTotalResult, currentResult.founded];
                    originalSoftResult = [...originalSoftResult, currentResult.softSearchFounded];
                }
                if (currentResultDrug !==null) originalTotalResult = [...originalTotalResult, currentResultDrug.founded];
                if (currentResultInsult !==null) originalTotalResult = [...originalTotalResult, currentResultInsult.founded];
                if (currentResultSexuality !==null) originalTotalResult = [...originalTotalResult, currentResultSexuality.founded];
                if (currentResultViolence !==null) originalTotalResult = [...originalTotalResult, currentResultViolence.founded];

                if (currentResult2 !== null){
                    totalResult = [...totalResult, currentResult2.founded];
                    softResult = [...softResult, currentResult2.softSearchFounded];
                }
                if (currentResultDrug2 !==null) totalResult = [...originalTotalResult, currentResultDrug.founded];
                if (currentResultInsult2 !==null) originalTotalResult = [...originalTotalResult, currentResultInsult.founded];
                if (currentResultSexuality2 !==null) originalTotalResult = [...originalTotalResult, currentResultSexuality.founded];
                if (currentResultViolence2 !==null) originalTotalResult = [...originalTotalResult, currentResultViolence.founded];

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
    static nativeFind(message, needMultipleCheck, isMap = false, isReassemble = false, type="") {

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
            for(let searchedPosition of searchedPositions) {
                if(searchedPosition !== -1) {
                    // 정상단어 예외 포지션을 찾습니다.
                    for (let index2 in exceptWords) {
                        let exceptionPositions = Utils.getPositionAll(newMessage, exceptWords[index2])
                        if (!Utils.objectIn(searchedPosition, exceptionPositions))
                            normalWordPositions[searchedPosition] = true
                    }
                }
            }
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
            let isSkip = false;
            // 별 갯수 관련
            let parserLength = 0;

            // 이미 더 긴 단어에서 욕설을 찾았다면 그냥 넘어가보자.
            for (let alreadyFounded of foundedSoftSearchWords) {
                if (Utils.objectInclude(softSearchWord, alreadyFounded.split(""))) {
                    isSkip = true; break;
                }
            }

            if(isSkip) continue;


            // 저속한 단어들을 한 단어씩
            // 순회하며 존재여부를 검사합니다.
            // character 형식 - 단어도 있을 수 있으나 뒤에 아무개 문자 !, ?가 포함될 수 있음.
            for (let character of softSearchWord) {

                let mainCharacter = character[0]
                let parserCharacter = character[1] // ! 또는 ?
                parserLength = parserCharacter === "!" ? character.length -2 : character.length-1; // ? 개수 추정.

                let softSearchOneCharacter = String(mainCharacter).toLowerCase();

                // 일단 저속한 단어의 리스트를 정의해서 수집한다. 또한 뒤의 ? 개수도 추정.
                findCount[softSearchOneCharacter] = []
                findCount[softSearchOneCharacter+"?"] = parserLength;

                // 저속한 단어의 글자위치를 수집합니다.

                // 메시지 글자를 모두 반복합니다.
                for (let index in newMessage) {

                    // 정상적인 단어의 글자일경우 검사하지 않습니다.
                    // 적발된 단어가 모두 정상포지션에 자리잡힌 경우 잡지 않는다.
                    if (typeof normalWordPositions[Number(index)] != 'undefined') continue

                    // 단어 한글자라도 들어가 있으면
                    // 찾은 글자를 기록합니다.
                    let unsafeOneCharacter = String(newMessage[index]).toLowerCase()
                    // parserCharacter가 ?이면 동일 낱자뿐 아니라 유사 낱자에 해당하는 경우도 모두 수집한다.
                    if (parserCharacter==="?") {
                        // isKindChar 함수 활용
                        if (this.isKindChar(unsafeOneCharacter, softSearchOneCharacter)) {
                            findCount[softSearchOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문단에서 전부 수집한다.
                        }

                    }
                    else {
                        if (softSearchOneCharacter === unsafeOneCharacter) {
                            findCount[softSearchOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문단에서 전부 수집한다.
                        }
                    }

                }
            }


            // 단어 포지션 리스트
            let positionsList = Utils.filterList(Object.values(findCount), "object")
            let astList = Utils.filterList(Object.values(findCount), "number")
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

                // positionInterval - 숫자 포지션 구간을 표시함.
                let positionInterval = Utils.grabCouple(tempSoftSearchWordPositions)

                for(let diffRangeIndex in positionInterval){

                    // 글자간 사이에 있는 모든 글자를 순회합니다.
                    let diff = ''
                    let tempCnt = astList[diffRangeIndex]
                    for(let diffi = positionInterval[diffRangeIndex][0]+1; diffi <= (positionInterval[diffRangeIndex][1]-1); diffi++){

                        if (tempCnt>0) {
                            if (/[가-힣]/.test(newMessage[diffi])) tempCnt--;
                            else if (newMessage[diffi]=== " ") {tempCnt = 0; diffi +=newMessage[diffi];}
                            else diff += newMessage[diffi]
                        }
                        else {
                            diff += newMessage[diffi]
                        }

                    }

                    if(isShuffled && !isNeedToPass){
                        // 뒤집힌 단어의 경우엔 자음과 모음이
                        // 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.
                        if(!this.shuffledMessageFilter(diff, false, true))
                            isNeedToPass = true
                    }
                    else {
                        // 순서가 뒤집히지 않았을 때는 한글의 길이가 충분히 길거나 정상단어가 글자 사이에 쓰인 경우 비속어에서 배제합니다.
                        if (this.shuffledMessageFilter(diff,true, true)>3) isNeedToPass = true;
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

                // 기존에 발견돤 단어와 낱자가 겹쳐도 pass.
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

        // type에 따라 리스트 변경
        let typeofBadWordsList = []
        switch(type) {
            case "drug":
                typeofBadWordsList = parsedDrugWords
                break;
            case "insult":
                typeofBadWordsList = parsedInsultWords
                break;
            case "sexuality":
                typeofBadWordsList = parsedSexualityWords
            case "violence":
                typeofBadWordsList = parsedViolenceWords
            default:
                typeofBadWordsList = parsedBadWords
        }

        // 비속어 단어를 한 단어씩 순회합니다.

        for (let badWord of typeofBadWordsList) {



            // 단순히 찾는 것으로 정보를 수집하는 것이 아닌 위치를 아예 수집해보자.
            // findCount 형태 : {시: [1,8], 발:[2,7,12]}등
            let findCount = {}
            // 나쁜 단어 수집 형태. 이 경우는 [[1,2], [8,7]]로 수집된다.
            let badWordPositions = []
            // 별 갯수 관련
            let parserLength = 0;

            let isSkip = false;
            // 이미 더 긴 단어에서 욕설을 찾았다면 그냥 넘어가보자.
            for (let alreadyFounded of foundedBadWords) {
                // console.log(badWord, alreadyFounded.split(""))
                if (Utils.objectInclude(badWord, alreadyFounded.split(""))) {

                    isSkip = true; break;
                }
            }

            if(isSkip) continue;

            // 비속어 단어를 한글자씩
            // 순회하며 존재여부를 검사합니다.
            for (let character of badWord) {

                let mainCharacter = character[0]
                let parserCharacter = character[1] // ! 또는 ?

                parserLength = parserCharacter === "!" ? character.length -2 : character.length-1; // ? 개수 추정.

                let badOneCharacter = String(mainCharacter).toLowerCase();

                // 일단 비속어 단어의 리스트를 정의해서 수집한다.
                findCount[badOneCharacter] = []
                findCount[badOneCharacter+"?"] = parserLength;

                // 비속어 단어의 글자위치를 수집합니다.

                // 메시지 글자를 모두 반복합니다.
                for (let index in newMessage) {

                    // 정상적인 단어의 글자일경우 검사하지 않습니다.
                    if (typeof normalWordPositions[Number(index)] != 'undefined') continue

                    // 단어 한글자라도 들어가 있으면
                    // 찾은 글자를 기록합니다.
                    let unsafeOneCharacter = String(newMessage[index]).toLowerCase()

                    if (parserCharacter==="!") {
                        // isKindChar 함수 활용

                        if (this.isKindChar(unsafeOneCharacter, badOneCharacter)) {
                            findCount[badOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문단에서 전부 수집한다.
                        }

                    }
                    else {
                        if (badOneCharacter === unsafeOneCharacter) {
                            findCount[badOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문단에서 전부 수집한다.
                        }
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
            let positionsList = Utils.filterList(Object.values(findCount), "object");
            // 단어 뒤의 ? 갯수
            let astList = Utils.filterList(Object.values(findCount), "number")
            // 낱자 포지션 맵
            let possibleWordPositions = Utils.productList(positionsList);

            // badWord의 원래 포지션 찾기
            let badWordOriginalPositions = [];
            let originalBadWords = [];
            // let tempBadWordPositions = []; // 임시 Bad Word Position. 여기에 대해서 수행한다
            //


            // j개수만큼 반복하기
            for (let wordPosition of possibleWordPositions) {

                // console.log('wordPosition', wordPosition)
                // 단어 첫글자의 위치 잡기

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

                let positionInterval = Utils.grabCouple(tempBadWordPositions)

                for(let diffRangeIndex in positionInterval){

                    let tempCnt = astList[diffRangeIndex];

                    // 글자간 사이에 있는 모든 글자를 순회합니다.
                    let diff = ''
                    for(let diffi = positionInterval[diffRangeIndex][0]+1; diffi <= (positionInterval[diffRangeIndex][1]-1); diffi++){
                        if (tempCnt>0) {
                            if (/[가-힣]/.test(newMessage[diffi])) tempCnt--;
                            else if (newMessage[diffi]=== " ") {tempCnt = 0; diffi +=newMessage[diffi];}
                            else diff += newMessage[diffi]
                        }
                        else {
                            diff += newMessage[diffi]
                        }
                    }

                    if(isShuffled && !isNeedToPass){
                        // 뒤집힌 단어의 경우엔 자음과 모음이
                        // 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.
                        if(!this.shuffledMessageFilter(diff, false, true))
                            isNeedToPass = true
                    }
                    else {
                        // 순서가 뒤집히지 않았을 때는 한글의 길이가 충분히 길거나 정상단어가 글자 사이에 쓰인 경우 비속어에서 배제합니다.
                        if (this.shuffledMessageFilter(diff,true, true)>3) isNeedToPass = true;
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
                            // console.log('포지션 중복 확인')
                            tmpTF =false;
                        }
                        // posix 최댓값이나 최솟값이 비속어 표현 사이에 끼어버린 경우 - 아예 비속어로 ) )합치기

                        // if (Math.min(...tempBadWordPositions) <= Math.min(...softSearchPosition) &&  Math.min(...softSearchPosition)  <= Math.max(...tempBadWordPositions) ) {
                        //     tmpTF = true;
                        //     badWord = Utils.removeMultiple([...badWord, ...foundedSoftSearchWords[foundedSoftSearchWordPositions.indexOf(positions)] ])
                        //     tempBadWordPositions = Utils.removeMultiple([...tempBadWordPositions, ...softSearchPosition])
                        // }
                        // else if (Math.min(...tempBadWordPositions) <= Math.max(...softSearchPosition) && Math.max(...softSearchPosition)  <= Math.max(...tempBadWordPositions) ) {
                        //     tmpTF = true;
                        //     badWord = Utils.removeMultiple([...foundedSoftSearchWords[foundedSoftSearchWordPositions.indexOf(positions)], ...badWord]);
                        //     badWordPositions = Utils.removeMultiple([...softSearchPosition, ...tempBadWordPositions ]);
                        // }
                        // // 만약 비속어와 저속한 표현 사이에 숫자, 알파벳, 공백밖에 없으면 비속어로 합치기
                        // else if  ( Math.max(...tempBadWordPositions) < Math.min(...softSearchPosition ) ) {
                        //     let inter0 = Math.max(...tempBadWordPositions);
                        //     let inter1 = Math.min(...softSearchPosition);
                        //     if (newMessage.slice(inter0 + 1, inter1).match(/^[0-9A-Za-z\s~!@#$%^&*()_\-+\\|\[\]{};:'"<,>.?/]*$/ )) {
                        //         tmpTF = true;
                        //         badWord = [...badWord, ...foundedSoftSearchWords[foundedSoftSearchWordPositions.indexOf(positions)]];
                        //         tempBadWordPositions = [...tempBadWordPositions, ...softSearchPosition];
                        //     }
                        // }
                        // else if  ( Math.max(...softSearchPosition) < Math.min(...tempBadWordPositions) ) {
                        //     let inter0 = Math.max(...softSearchPosition);
                        //     let inter1 = Math.min(...tempBadWordPositions);
                        //     if (newMessage.slice(inter0+1, inter1).match(/^[0-9A-Za-z\s~!@#$%^&*()_\-+\\|\[\]{};:'"<,>.?/]*$/) ) {
                        //         tmpTF = true;
                        //         badWord = [...foundedSoftSearchWords[foundedSoftSearchWordPositions.indexOf(positions)], ...badWord];
                        //         tempBadWordPositions = [...softSearchPosition, ...tempBadWordPositions];
                        //     }
                        // }

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

    // 비속어 리스트가 주어졌을 때 비속어 리스트 안에서 검사하기.
    static nativeFindFromList(message, parsedWordsList, needMultipleCheck=false, isMap=false, isReassemble=false) {
        let normalWordPositions = {}
        let foundedBadWords = []
        let foundedBadOriginalWords = []
        let foundedBadWordPositions = []
        let foundedBadWordOriginalPositions = []; // isMap에서 original 단어 위치
        let originalMessageList = [];
        let originalMessageSyllablePositions = []; // 원래 음가 위치

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

        // 주어진 파싱된 비속어 리스트에서 한 단어식 순회합니다.
        for (let badWord of parsedWordsList) {

            // 단순히 찾는 것으로 정보를 수집하는 것이 아닌 위치를 아예 수집해보자.
            // findCount 형태 : {바: [1,8], 보:[2,7,12]}등
            let findCount = {}
            // 저속한 단어 수집 형태. 이 경우는 [[1,2], [8,7]]로 수집된다.
            let badWordPositions = []
            // 별 갯수 세기
            let parserLength = 0;

            let isSkip = false;
            // 이미 더 긴 단어에서 욕설을 찾았다면 그냥 넘어가보자.
            for (let alreadyFounded of foundedBadWords) {
                if (Utils.objectInclude(badWord, alreadyFounded.split(""))) {
                    isSkip = true; break;
                }
            }

            if(isSkip) continue;


            // 저속한 단어들을 한 단어씩
            // 순회하며 존재여부를 검사합니다.
            for (let character of badWord) {

                let mainCharacter = character[0]
                let parserCharacter = character[1] // !, ? 또는 undefined
                parserLength = parserCharacter==="!"? character.length-2 : character.length-1
                let badOneCharacter = String(mainCharacter).toLowerCase();

                // 일단 저속한 단어의 리스트를 정의해서 수집한다.
                findCount[badOneCharacter] = []
                findCount[badOneCharacter+"?"] = parserLength

                // 저속한 단어의 글자위치를 수집합니다.

                // 메시지 글자를 모두 반복합니다.
                for (let index in newMessage) {

                    // 정상적인 단어의 글자일경우 검사하지 않습니다.
                    // 적발된 단어가 모두 정상포지션에 자리잡힌 경우 잡지 않는다.
                    if (typeof normalWordPositions[Number(index)] != 'undefined') continue

                    // 단어 한글자라도 들어가 있으면
                    // 찾은 글자를 기록합니다.
                    let unsafeOneCharacter = String(newMessage[index]).toLowerCase()
                    if (parserCharacter==="!") {
                        // isKindChar 함수 활용
                        if (this.isKindChar(unsafeOneCharacter, badOneCharacter)) {
                            findCount[badOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문단에서 전부 수집한다.
                        }

                    }
                    else {
                        if (badOneCharacter === unsafeOneCharacter) {
                            findCount[badOneCharacter].push(Number(index)) // 하나만 수집하지 않고 문단에서 전부 수집한다.
                        }
                    }

                }
            }


            // 단어 포지션 리스트
            let positionsList = Utils.filterList(Object.values(findCount), "object");
            // 단어 뒤의 ? 갯수
            let astList = Utils.filterList(Object.values(findCount), "number")
            // 낱자 포지션 맵
            let possibleWordPositions = Utils.productList(positionsList);

            // badWord의 원래 포지션 찾기
            let badWordOriginalPositions = [];
            let originalBadWords = [];


            // 단어 포지션 리스트에서 for문을 돌려보자.
            for (let wordPosition of possibleWordPositions) {

                let tempBadWordPositions = [...wordPosition];

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
                let positionInterval = Utils.grabCouple(tempBadWordPositions)

                for(let diffRangeIndex in positionInterval){

                    let tempCnt = astList[diffRangeIndex]

                    // 글자간 사이에 있는 모든 글자를 순회합니다.
                    let diff = ''
                    for(let diffi =positionInterval[diffRangeIndex][0]+1; diffi <= (positionInterval[diffRangeIndex][1]-1); diffi++){
                        if (tempCnt>0 && /[가-힣]/.test(newMessage[diffi])) tempCnt--;
                        else diff += newMessage[diffi];
                    }

                    if(isShuffled && !isNeedToPass){
                        // 뒤집힌 단어의 경우엔 자음과 모음이
                        // 한글글자가 글자사이에 쓰인 경우 비속어에서 배제합니다.
                        if(!this.shuffledMessageFilter(diff, false, true))
                            isNeedToPass = true
                    }
                    else {
                        // 순서가 뒤집히지 않았을 때는 한글의 길이가 충분히 길거나 정상단어가 글자 사이에 쓰인 경우 비속어에서 배제합니다.
                        if (this.shuffledMessageFilter(diff,true, true)>3) isNeedToPass = true;
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

                // 해당 저속한 표현을 발견은 하였지만,
                // 사람이 인지하지 못할 것으로 간주되는 경우
                // 해당 발견된 저속한 표현을 무시합니다.
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


                // 만약 중첩 테스트 통과되면 badWordPosition에 추가
                if (tmpTF) {
                    let tempBadWordOriginalPositions = [];
                    badWordPositions.push(tempBadWordPositions);

                    if (isMap) {

                        for (var pos of tempBadWordPositions) {
                            for (var k =0; k <originalMessageList[Number(pos)].length; k++) {

                                tempBadWordOriginalPositions.push(originalMessageSyllablePositions[pos] + k);
                            }
                        }
                        // 원문 찾기
                        let originalBadWord = "";
                        for (var l of tempBadWordOriginalPositions) {
                            originalBadWord +=originalMessage[l];
                        }

                        // 나쁜단어 위치 삽입, 원운 위치,

                        badWordOriginalPositions.push(tempBadWordOriginalPositions);
                        originalBadWords.push(originalBadWord);

                    }

                }


            }
            if (badWordPositions.length>0) {

                if (isMap) {
                    // isReassemble 옵션은 dropIung에서 받침을 뒷 글자에 강제로 붙이는 경우에 대비해서 조합해준다.
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

        let isMapAdded = {};
        if (isMap) {
            isMapAdded = {
                originalFounded: needMultipleCheck ? foundedBadOriginalWords : foundedBadOriginalWords.slice(0).slice(0),
                originalPositions: needMultipleCheck ? foundedBadWordOriginalPositions : foundedBadWordOriginalPositions.slice(0).slice(0),
            };
        }

        // 결과 출력
        return {
            founded: needMultipleCheck? foundedBadWords : foundedBadWords.slice(0),
            positions: needMultipleCheck? foundedBadWordPositions : foundedBadWordPositions.slice(0).slice(0),
            ...isMapAdded
        }

    }

    // 비속어를 결자처리하는 함수
    static fix(message, replaceCharacter, condition= {enToKo:false, alphabetToKo:false, dropIung:false, fixSoft:false, isOriginal:false}) {

        let fixedMessage = "";
        let fixedMessageList = [];
        let fixedMessageIndex = []
        let fixedMessageObject = {}
        // condition
        if (condition.enToKo) {
            fixedMessageObject = this.nativeFind(Utils.enToKo(message, true), true, true)
            fixedMessageList = condition.isOriginal ? Utils.parseMap(Utils.enToKo(message, true)).messageList : Utils.parseMap(Utils.enToKo(message, true)).parsedMessage
            fixedMessageIndex = Utils.parseMap(Utils.enToKo(message, true)).messageIndex;
            // fixedMessage = fixedMessageList.join("")
        }
        else if (condition.dropIung) {
            fixedMessageObject = this.nativeFind(Utils.dropIung(message, true), true, true, true)
            fixedMessageList = condition.isOriginal? Utils.parseMap(Utils.dropIung(message, true)).messageList:Utils.parseMap(Utils.dropIung(message, true)).parsedMessage
            fixedMessageIndex = Utils.parseMap(Utils.dropIung(message, true)).messageIndex;
            // fixedMessage = fixedMessageList.join("")
        }
        else if (condition.alphabetToKo) {
            fixedMessageObject = this.nativeFind(Utils.alphabetToKo(message, true), true, true)
            fixedMessageList = condition.isOriginal? Utils.parseMap(Utils.alphabetToKo(message, true)).messageList: Utils.parseMap(Utils.alphabetToKo(message, true)).parsedMessage
            fixedMessageIndex = Utils.parseMap(Utils.alphabetToKo(message, true)).messageIndex;
            // fixedMessage = fixedMessageList.join("")
        }
        else {``
            fixedMessageObject = this.nativeFind(Utils.alphabetToKo(message, true), true, true)
            fixedMessageList = Utils.parseMap(Utils.alphabetToKo(message, true)).parsedMessage
            fixedMessage = fixedMessageList.join("")
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
                    for (let positions of obj.positions) {
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

    // 어떤 단어가 비속어 목록에 포함된지 체크
    static isExistNormalWord(word) {
        return (typeof(normalWordsMap[word]) != 'undefined')
    }

    // 정상 단어를 목록에 추가. - 배열
    static addNormalWords(words) {
        for (let wordsIndex in words) {
            let word = words[wordsIndex]
            if (word.length == 0) continue

            if (this.isExistNormalWord(word)) continue

            normalWordsMap[word] = true
            normalWords.push(word)
        }
    }

    // 정상단어 삭제
    static deleteNormalWords(words) {
        for (let wordsIndex in words) {
            let word = words[wordsIndex]
            if (!this.isExistNormalWord(word)) continue

            delete(normalWordsMap[word])

            for (let mapIndex = normalWords.length - 1; mapIndex >= 0; mapIndex--) {
                if (normalWords[mapIndex] === word) {
                    normalWords.splice(mapIndex, 1)
                    break
                }
            }
        }
    }


    // 비속어 여부 파악하기
    static isExistBadWord(word, type="") {
        switch(type) {
            case 'drug':
            case 'insult':
            case 'sexuality':
            case 'violence':
                return (typeofBadWords[type][word] !== "undefined")
            default:
                return (typeof badWordsMap[word] != 'undefined')
        }
    }

    // 비속어 추가 -> 리스트 입력시에 리스트 추가
    static addBadWords(words, type) {
        switch(type) {
            case 'drug':
            case "insult":
            case "sexuality":
            case "violencc":
                for (let wordsIndex in Words) {
                    let word = words[wordsIndex]
                    if (word.length ===0 ) continue
                    if (this.isExistBadWord(word, type)) continue
                }

        }
        for (let wordsIndex in words) {
            let word = words[wordsIndex]
            if (word.length == 0) continue

            if (this.isExistBadWord(word)) continue

            badWordsMap[word] = true
            badWords.push(word)
        }
    }

    static deleteBadWords(words) {
        for (let wordsIndex in words) {
            let word = words[wordsIndex]
            if (!this.isExistBadWord(word)) continue

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

            if (this.isExistSoftSearchWord(word)) continue

            softSearchWordsMap[word] = true
            softSearchWords.push(word)
        }
    }

    static deleteSoftSearchWords(words) {
        for (let wordsIndex in words) {
            let word = words[wordsIndex]
            if (!this.isExistSoftSearchWord(word)) continue

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

    // 유사 낱자 검사. 낱자에 가? 형태로 표현되었을 경우 가뿐 아니라 각, 간 등 다 포함.
    // char : 낱자
    // comp : 낱자. comp?에 char가 포함되는 경우 true, 아닌 경우 false를 반환한다.
    static isKindChar(char, comp) {
        let charDisassemble = Hangul.disassemble(char)
        let compDisassemble = Hangul.disassemble(comp)
        let res = false;
        let simEnd = {"ㄱ": ["ㄱ", "ㅋ", "ㄲ"], "ㄷ":["ㄷ", "ㅌ", "ㅅ", "ㅆ", "ㅈ", "ㅊ"], "ㅂ":["ㅂ", "ㅍ"], "ㅅ":["ㄷ", "ㅌ", "ㅅ", "ㅆ", "ㅈ", "ㅊ"],
            "ㅈ":["ㄷ", "ㅌ", "ㅅ", "ㅆ", "ㅈ", "ㅊ"], "ㅊ":["ㄷ", "ㅌ", "ㅅ", "ㅆ", "ㅈ", "ㅊ"]}

        //우선 앞글자가 비교대상의 모든 낱자를 포함하는 경우. 즉 가? -> 각 등 모두 포함.
        if (Utils.objectInclude(compDisassemble, charDisassemble, true)) {
            res = true;
        }
        // 닥 -> 닭도 포함.
        else if (compDisassemble.length ===3 && charDisassemble.length ===4 &&
        Utils.objectEqual(compDisassemble, [charDisassemble[0], charDisassemble[1], charDisassemble[3]])) {
            res = true;
        }
        // 받침 발음이 유사한 경우
        else if (compDisassemble.slice(0,2) === charDisassemble.slice(0,2) && Object.keys(simEnd).indexOf(compDisassemble[2])!==-1 &&
        simEnd[compDisassemble[2]].indexOf(charDisassemble[2])!== -1) {
            res = true;
        }
        else if (compDisassemble.slice(0,3) === charDisassemble.slice(0,3) && Object.keys(simEnd).indexOf(compDisassemble[3])!==-1 &&
            simEnd[compDisassemble[3]].indexOf(charDisassemble[3])!== -1) {
            res = true;
        }
        // 지 ->즤처럼 단모음을 늘린 이중모음을 잡아낼 때 사용
        else if (Utils.objectEqual(compDisassemble.slice(0,2), [charDisassemble[0], charDisassemble[2]])) {
            // ㅚ는 예외처리하기.
            if (charDisassemble[1]!== "ㅗ" || charDisassemble[2]!=="ㅣ") {
                res = true;
            }
        }

        return res;
    }

    //어떤 단어가 다른 단어에 포함되는지 체크하기
    static wordInclude(inc, exc) {
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
            let astLength = parserChar==="!"? inc[incCnt].length-2: inc[incCnt].length-1; // ? 갯수

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

    // 한글 조합 함수. 각 원소들을 Hangul.assemble(Hangul.disassemble())로 조합하는데 사용합니다.
    static assembleHangul(elem) {
        return Utils.listMap(elem, x=>(Hangul.assemble(Hangul.disassemble(x))));
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
    static recursiveComponent (data, variable={}, nonParsedVariable = null) {
        // data : array.

        console.log('recursiveComponent() start')

        // 데이터의 전항 후항을 순회합니다.
        for(let i=0;i<=1;i++){

            // 데이터의 모든 항목을 순회합니다.
            for(let itemIndex in data[i]){
                let item = data[i][itemIndex]

                console.log("item LIST:::", item)

                // 데이터 항목이 배열인 경우
                // 재귀 컴포넌트 해석을 진행합니다.
                if(Array.isArray(item)){
                    let solvedData = this.recursiveComponent(item, variable, nonParsedVariable)
                    data[i][itemIndex] = null
                    data[i] = data[i].concat(solvedData)
                    data[i] = this.assembleHangul(data[i])

                } else if(!Array.isArray(item) && typeof item === 'object'){

                    // 부가 함수를 사용한 경우
                    // 지정된 함수가 반환하는 리스트를 반영합니다.
                    data[i] = data[i].concat(this.recursiveComponent(item, variable, nonParsedVariable))
                    data[i] = this.assembleHangul(data[i])

                } else if(typeof item === 'string' && item[0] === '*'){

                    // 만약 변수를 사용했다면 (단어 앞에 *로 시작) 해당 부분을
                    // 변수의 리스트로 대치합니다.
                    console.log("item", item)
                    let varName = item.slice(1);
                    // console.log(item, `함수호출됨: ${varName}`)

                    // 엘레멘트 이름이 "*사랑"일 때, 여기서 variable의 변수는 {"사랑":(리스트)} 형식으로 정의할 수 있다.
                    console.log("varName", varName)

                    if(typeof variable[varName] !== 'undefined'){
                        console.log(`1함수호출됨: ${varName}`)

                        data[i] = data[i].concat(variable[varName])
                        data[i] = this.assembleHangul(data[i])
                    }
                    // 아니면 nonParsedVariable에서 변수가 있는지 확인해보기.
                    else {
                        console.log(`2함수호출됨: ${varName}`)
                        // 만약 변수 안에서 변수를 참조한 경우
                        // 필요한 부분의 변수만 파싱하여 해당 리스트를 구성합니다.
                        if(nonParsedVariable !== null){
                            console.log(`2함수진행됨: ${varName}`)
                            let parsedHeaderVariable = this.recursiveList(nonParsedVariable[varName], nonParsedVariable, true)
                            data[i] = data[i].concat(parsedHeaderVariable)
                            data[i] = this.assembleHangul(data[i])
                            console.log(`2함수결과:`)
                            console.log(parsedHeaderVariable.length)
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
        console.log('recursiveComponent() end')
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

    static recursiveList (list, variable = null, isVariableParse = false, defaultType = 'string') {
        console.log('recursiveList() start')

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
            console.log("ITEMINDEX:::", list[itemIndex])
            let item = list[itemIndex]

            if(typeof item === defaultType){

                // 그냥 문자열이면 바로 리스트에 반영합니다.
                // *로 시작하지 않는 경우 - 한글 분해 후 재조합.
                if(item[0] !== '*'){
                    rebuild.push(Hangul.assemble(Hangul.disassemble(item)))
                }
                else {

                    // 만약 변수를 사용했다면 해당 부분을
                    // 변수의 리스트를 반영합니다.
                    let varName = item.slice(1);
                    if(typeof parsedVaraible[varName] !== 'undefined' && !isVariableParse){
                        rebuild = rebuild.concat(parsedVaraible[varName])
                        rebuild = this.assembleHangul(rebuild)
                    }else{
                        if(isVariableParse){

                            // 정의된 변수가 없는데 변수가 들어갔으면
                            // 해당 변수만 별개로 해석하여 리스트에 첨부합니다.
                            let parsedHeaderVariable = this.recursiveList(variable[varName], variable, true)
                            rebuild = rebuild.concat(parsedHeaderVariable)
                            rebuild = this.assembleHangul(rebuild)
                        }else{
                            throw new Error(`${varName} 음절 변수를 찾을 수 없습니다.`)
                        }
                    }
                }

            }else if(Array.isArray(item) && typeof item === 'object'){

                // 데이터 항목이 배열인 경우
                // 재귀 컴포넌트 해석을 진행합니다.
                rebuild = rebuild.concat(this.recursiveComponent(item, parsedVaraible, variable))
                rebuild = this.assembleHangul(rebuild)
            }else{

                // 부가 함수를 사용한 경우
                // 지정된 함수가 반환하는 리스트를 반영합니다.
                rebuild = rebuild.concat(this.additionalType(item, parsedVaraible, variable))
                rebuild = this.assembleHangul(rebuild)
            }
        }
        console.log('recursiveList() end')
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
    static additionalType(component, parsedVaraible, nonParsedVariable = null){
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
                    console.log(item)
                    list.push(Hangul.assemble(item))
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
