// to test given codes use npm run experiment
import ObjectOperation from "../components/ObjectOperation"
import Utils from "../components/Utils";
import Tetrapod from "../tetrapod";
import Hangul from "hangul-js"
import fs from 'fs';
import * as HO from "../components/HangulObjects";

// 테스트 시도
// 우선 기본적으로 Utils의 함수들부터 실험해봅시다.
console.log(Hangul.assemble(['ㅜ', 'ㅣ']))
let testList1 = ['가', ['내리', '다', '수'], [1, 4]]
console.log('거짓임:::', Utils.objectEqual(testList1, ['가', ['내리', '다', '수'], ['1', '4']])) // 거짓
console.log('참임:::', Utils.objectEqual(testList1, ['가', ['내리', '다', '수'], [1, 4]])) // 참
// 두 번째 실험 - objectIn -
console.log('참임:::', Utils.objectIn(['내리', '다', '수'], testList1)) // 참
// 세 번째 실험 - productList
let testList2 = Utils.productList([['가불', '가방', '사이좋게', '적용'], ['기술', '기능'], ['', ' 사용하기', ' 중단하기']])
console.log('testList2 원소 확인하기')
for (let elem of testList2) {
    console.log(elem);
}
// 이제 본격적으로 실험해보자
console.log()
console.log('tetrapod 유틸리티 실험')
console.log(Utils.wordToArray('가!ㄱ,ㅓ라+ 아니'))
console.log()
console.log('lengthSplit 실험')
let longSentence = '옛날에 서로 우애가 좋은 형제가 살았습니다. 어느날 형제는 금덩어리를 발견했습니다.'
let split = Utils.lengthSplit(longSentence, 12);
console.log(split.length);
for (let idx in split) {
    console.log(idx*6, ':', split[idx])
}
console.log()
console.log(Utils.wordToArray('가!ㄴㅏ+닥로ㄱ,ㅏ'))
// console.log('recursiveComponent 실험') // 오류가 있다.
// let recur = [['1', '2', '3', [['a', 'b', 'c'], ['x','y','z']], ['가', '나', [['다', '마'], ['라','바']]]]];
// console.log(Utils.recursiveComponent(recur))

console.log('disassemble 실험')
console.log(Utils.disassemble('없쟈 완젼 짜증나짂', 'key', true))
console.log(Utils.disassemble('없쟈 완젼 짜증나짂', 'part', true))
console.log(Utils.disassemble('없쟈 완젼 짜증나짂', 'sound', true))
console.log(Utils.disassemble('없쟈 완젼 짜증나짂'))
console.log()
// 각종 맵이 잘 작동하는지 확인해보자
console.log('qwertyToDubeol 테스트')
let testQwerty = Utils.qwertyToDubeol('dnflskfk가 가장 wkdkfkdtmfjqwl dksgdmsep? dho? 난 멀라.', true)
console.log('PARSING')
let parsed = Utils.parseMap(testQwerty)
console.log(parsed)
console.log('RESERVING')
console.log(Utils.reserveMap(parsed))

// antispoof 테스트
console.log('antispoof 테스트')
let testAntispoof = Utils.antispoof('ㄱH같이 ㅂy2고 저0스0같ㅇl 쓴다', true)
let parsed2 = Utils.parseMap(testAntispoof)
console.log(parsed2)
console.log('RESERVING')
console.log(Utils.reserveMap(parsed2))

// dropDouble 테스트
console.log('DROPDOUBLE 테스트')
console.log('joinedSyllable', Utils.joinedSyllable('바','알'), Utils.joinedSyllable('삶', '하'))
console.log(Utils.dropDouble("ql이바알놈아!!", true, false))
console.log('')
console.log(Utils.dropDouble("시이바알놈아!!", true, false));
console.log('originalPosition 테스트')
console.log(Utils.originalPosition(Utils.qwertyToDubeol('dnflskfk akstp wjdakf rnlcksgek', true), [2,3,4,6,7,8]));
// dropDouble + simplify
console.log('DROPDOUBLE + Simplify 테스트')
let ddMap = Utils.dropDouble('아아아주 아아아주 복잡호아안 메에시이이이쥩', true, false)
let ddsMap = Utils.dropDouble('아아아주 아아아주 복잡호아안 메에시이이이쥩', true, true)
console.log(ddMap)
console.log(Utils.parseMap(ddMap, true)) // dropDouble은 reassemble 조건 반드시 켜서 사용.
console.log('simplify')
console.log(ddsMap)
console.log(Utils.parseMap(ddsMap, true)) // dropDouble은 reassemble 조건 반드시 켜서 사용.
console.log('')
//tooMuchDoubleEnd 테스트
console.log('tooMuchDoubleEnd 테스트');
console.log(Utils.tooMuchDoubleEnd('젊은 사람들아 값없이 지네'))
console.log(Utils.tooMuchDoubleEnd('젊읆 사랆듦앎 값없이 짒넶'))
console.log(Utils.tooMuchDoubleEnd('너 앍줎 없다.'))

// engToKo 테스트
let testPronounce = Utils.engToKo('dolai, dol-ai네 jarangoro jarang하지말자', true)
console.log(Utils.parseMap(testPronounce))
console.log('RESERVING')
console.log(Utils.reserveMap(Utils.parseMap(testPronounce)))

let obj = new Tetrapod();
obj.loadFile()

// console.log(obj.findNormalWordPositions('흰색 옷은 아름답다', false))
let newTime = new Date().getTime()
console.log('시발 정발 나쁘게 구네 ::: TEST:::\n', JSON.stringify(obj.nativeFind("시발 정말 나쁘게 구네")))
console.log("걸린시간:::", new Date().getTime() - newTime)
console.log(obj.find("시발 정말 나쁘게 구네", true))
console.log('nativeFind obj 테스트')
console.log('secondTest')
console.log(obj.nativeFind(Utils.msgToMap("아주 짜즚잆 낪닚다 상쾌핪짒 앉넶"), true, true, true))

console.log(obj.nativeFind(Utils.msgToMap("너 앍줎 없다."), true, true, true))
console.log(obj.find("좆밥이네 아줎 싫어 새꺄", true))
console.log("걸린시간:::", new Date().getTime() - newTime)
// console.log(obj.nativeFind(testMap, true, true, true))
// console.log(obj.fix(Utils.dropDouble('시이바알놈, 나 버려놓고 즈이랄하지 마라', true), '*', true))
// // console.log('oneWordFind 테스트')
// // console.log('test!!!', Utils.objectIn(['시', '발!'], obj.parsedBadWords))
// // console.log(obj.oneWordFind(['시', '발!'], Utils.dropDouble("시파알놈아", true), obj.badWordsMap, true, true, true, true))
// // console.log(obj.isExistBadWord('시발!'))
// // console.log("걸린시간:::", new Date().getTime() - newTime)
// // console.log(Utils.parseMap(Utils.dropDouble('고아테이마알라', true)))
// // console.log(obj.getOriginalPosition(Utils.dropDouble('고아테이마알라', true), [0,2,4]))

// 필터 켜기 실험
console.log('필터 켜기 전에 단어 확인', obj.parsedBadWords.length, Object.keys(obj.badWordsMap).length, obj.badWords[0].length)
obj.adjustFilter([],[],['qwerty'],false);
console.log('engBadWordsCheck 테스트!!!')
console.log('필터 켜기 후에 단어 확인', obj.parsedBadWords.length, Object.keys(obj.badWordsMap).length, obj.badWords[0].length)
console.log('필터 켜고 단어 테스트 재확인')
console.log(obj.find('whwehlfk 이 qudtlsdk', true));
console.log('qwerty테스트 완료!,countBad 실험');
console.log(obj.countBad('whwehlfk 이 qudtlsdk'));
// 포지션 벡터로 확인해보자
console.log(obj.engBadWordsCheck(['시', '발!'], 'tlvkfshadk'));
console.log()
console.log('antispoof 테스트')
obj.adjustFilter([],[],['antispoof'],false);
console.log('단어 확인할 수 있는지 engBadWordsCheck로 테스트')
console.log(obj.engBadWordsCheck(['시', '발!'], '^l발롬'))
console.log(obj.find('^ㅣ바2 샛77l'))
console.log(obj.countBad('^ㅣ바2 샛77l'))
console.log()
console.log('pronounce 테스트 겸 dropDoubleCheck 테스트')
obj.adjustFilter([], [], ['pronounce'], true)
console.log(obj.find('sibal sakki!! 너 조용히 해라', true))
console.log(obj.countBad('sibal sakki!! 너 조용히 해라'));
obj.adjustFilter([], [], [], false)

// // // 전체 치환하기 - Utils.replaceAll
// // // console.log('replaceAll 테스트');
// // // console.log(Utils.replaceAll('가랑비에, 옷, 젖는 줄도 모르고, 정말', ',', '-'));
// // // // 단어 포지션 찾아주기 - Utils.getPositionAll(message, search, isString)
// // // console.log('getPositionAll 테스트');
// // // console.log('isString 옵션 켜기 : ', Utils.getPositionAll('가장 큰 나라는 러시아', '나라')); // 첫 위치와 끝 위치
// // // console.log('isString 옵션 끄기 : ', Utils.getPositionAll('가장 작은 나라는 바티칸', '나라', false)); // 첫 위치만 표시
// // // console.log('중복 : ', Utils.getPositionAll('가나는 가장 가난 가나', '가나', false));
// // // console.log('단어 없으면 :', Utils.getPositionAll('문자왔숑', '구')); // 단어 없으면 빈 리스트 출력
// // // console.log('lengthSplit 테스트', Utils.lengthSplit('정말 긴 문장을 만들어봤습니다. 숫자로 나누어볼게요.', 10))
// // // console.log(Utils.wordToArray('가+나!다?라'))
// // console.log(Utils.parseMap({씨:{value:"시", index:[0]}, 브얼:{value:"벌", index:[1]}}));
// // console.log(Utils.qwertyToDubeol("rkskrksk 정말 나빠요", true));
// // console.log(Utils.qwertyToDubeol('djqt어요'))
// // console.log(Utils.objectEqual(['ㄱ', 'ㄱ'], ['ㄱ', 'ㄱ']), 'TEST')
// // console.log(Utils.makeDouble('ㄱ','ㄱ'))
// // console.log(Utils.antispoof('ㄱH^H^77|'))
// // console.log(Utils.antispoof('ㄱH^H^77ㅗㅣ',true))
// // console.log(Utils.recursiveComponent([[1,2],[3,4,5]]))
// // console.log(Utils.dropDouble('빱브오쮜', true, true))
//
// // let testMsg = '삵얽릸 살어릿았닶'
// // console.log(testMsg, Utils.tooMuchDoubleEnd(testMsg))
// // console.log(obj.find('정말 값삾핪닚다'))
// // // console.log("\n\n======================")
// // // console.log(Tetrapod.findNormalWordPositions("십발 정말 값삾핪닚닶"))
// // // console.log("\n\n======================")
// // // console.log(Utils.parseMap(Utils.dropDouble("십발 정말 값삾핪닚닶", true)))
// // // console.log("\n\n======================")
// // // // console.log(Tetrapod.nativeFind( Utils.dropDouble("십발 정말 값삾핪닚닶", true) , true, true))
// // // console.log(Utils.parseMap(Utils.dropDouble("시발롬", true)))
// // // console.log("\n\n======================")
// // // console.log(Utils.dropDouble("십발 정말 값삾핪닚닶", true))
// //
// // // console.log(Utils.antispoof("야 이 우리왕 아주 짜증나 죽겠어. 에휴에후!! 질알.", true))
// // //
// // // console.log(Utils.parseMap(Utils.antispoof("야 이 우리왕 아주 짜증나 죽겠어. 에휴에후!! 질알.", true)))
// // // // console.log(Utils.parseMap(Utils.antispoof("죽을래", true)))
// // // console.log(Tetrapod.isKindChar("지", "자"))
// //
