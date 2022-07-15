// to test given codes use npm run experiment
import ObjectOperation from "../components/ObjectOperation"
import Utils from "../components/Utils";
import Tetrapod from "../tetrapod";
import Hangul from "hangul-js"
import fs from 'fs';
import * as HO from "../components/HangulObjects";

// fs.writeFile('./TEST.txt', 'TESTING', 'utf-8', function() {console.log("WRITTEN!")})

// console.log(Utils.engToKo('구라da drga C팔'))
// console.log(Utils.engToKo('구라da drga C팔', true))
// 비속어 데이터 불러오기
let obj = new Tetrapod();
obj.loadFile()

// console.log(obj.findNormalWordPositions('흰색 옷은 아름답다', false))
let newTime = new Date().getTime()
// console.log('시발 정발 나쁘게 구네 ::: TEST:::\n', JSON.stringify(obj.nativeFind("시발 정말 나쁘게 구네")))
// console.log("걸린시간:::", new Date().getTime() - newTime)
// console.log(obj.find("시발 정말 나쁘게 구네", true))
// console.log('nativeFind obj 테스트')
console.log(obj.nativeFind(Utils.qwertyToDubeol("wlfkfgkwl 마라고 정말 짱나네", true), true, true, true))
console.log("걸린시간:::", new Date().getTime() - newTime)
// console.log('oneWordFind 테스트')
// console.log('test!!!', Utils.objectIn(['시', '발!'], obj.parsedBadWords))
// console.log(obj.oneWordFind(['시', '발!'], Utils.dropDouble("시파알놈아", true), obj.badWordsMap, true, true, true, true))
// console.log(obj.isExistBadWord('시발!'))
// console.log("걸린시간:::", new Date().getTime() - newTime)
// console.log(Utils.parseMap(Utils.dropDouble('고아테이마알라', true)))
// console.log(obj.getOriginalPosition(Utils.dropDouble('고아테이마알라', true), [0,2,4]))
obj.adjustFilter([],[],['qwerty'],false);
console.log('engBadWordsCheck 테스트!!!')
// console.log('몽땅 사라졌나???', obj.parsedBadWords.length, Object.keys(obj.badWordsMap).length, obj.badWords[0].length)
console.log(obj.engBadWordsCheck(['시', '발!'], 'tlvkfshadk'))
obj.adjustFilter([],[],['antispoof'],false);
console.log(obj.engBadWordsCheck(['시', '발!'], '^l발롬'))
// console.log(obj.parseFromList(['구라', '괴!물!정', '곳간', '미창고']))
// // 전체 치환하기 - Utils.replaceAll
// // console.log('replaceAll 테스트');
// // console.log(Utils.replaceAll('가랑비에, 옷, 젖는 줄도 모르고, 정말', ',', '-'));
// // // 단어 포지션 찾아주기 - Utils.getPositionAll(message, search, isString)
// // console.log('getPositionAll 테스트');
// // console.log('isString 옵션 켜기 : ', Utils.getPositionAll('가장 큰 나라는 러시아', '나라')); // 첫 위치와 끝 위치
// // console.log('isString 옵션 끄기 : ', Utils.getPositionAll('가장 작은 나라는 바티칸', '나라', false)); // 첫 위치만 표시
// // console.log('중복 : ', Utils.getPositionAll('가나는 가장 가난 가나', '가나', false));
// // console.log('단어 없으면 :', Utils.getPositionAll('문자왔숑', '구')); // 단어 없으면 빈 리스트 출력
// // console.log('lengthSplit 테스트', Utils.lengthSplit('정말 긴 문장을 만들어봤습니다. 숫자로 나누어볼게요.', 10))
// // console.log(Utils.wordToArray('가+나!다?라'))
// console.log(Utils.parseMap({씨:{value:"시", index:[0]}, 브얼:{value:"벌", index:[1]}}));
// console.log(Utils.qwertyToDubeol("rkskrksk 정말 나빠요", true));
// console.log(Utils.qwertyToDubeol('djqt어요'))
// console.log(Utils.objectEqual(['ㄱ', 'ㄱ'], ['ㄱ', 'ㄱ']), 'TEST')
// console.log(Utils.makeDouble('ㄱ','ㄱ'))
// console.log(Utils.antispoof('ㄱH^H^77|'))
// console.log(Utils.antispoof('ㄱH^H^77ㅗㅣ',true))
// console.log(Utils.recursiveComponent([[1,2],[3,4,5]]))
// console.log(Utils.dropDouble('빱브오쮜', true, true))

// let testMsg = '삵얽릸 살어릿았닶'
// console.log(testMsg, Utils.tooMuchDoubleEnd(testMsg))
// console.log(obj.find('정말 값삾핪닚다'))
// // console.log("\n\n======================")
// // console.log(Tetrapod.findNormalWordPositions("십발 정말 값삾핪닚닶"))
// // console.log("\n\n======================")
// // console.log(Utils.parseMap(Utils.dropDouble("십발 정말 값삾핪닚닶", true)))
// // console.log("\n\n======================")
// // // console.log(Tetrapod.nativeFind( Utils.dropDouble("십발 정말 값삾핪닚닶", true) , true, true))
// // console.log(Utils.parseMap(Utils.dropDouble("시발롬", true)))
// // console.log("\n\n======================")
// // console.log(Utils.dropDouble("십발 정말 값삾핪닚닶", true))
//
// // console.log(Utils.antispoof("야 이 우리왕 아주 짜증나 죽겠어. 에휴에후!! 질알.", true))
// //
// // console.log(Utils.parseMap(Utils.antispoof("야 이 우리왕 아주 짜증나 죽겠어. 에휴에후!! 질알.", true)))
// // // console.log(Utils.parseMap(Utils.antispoof("죽을래", true)))
// // console.log(Tetrapod.isKindChar("지", "자"))
//
