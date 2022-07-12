// to test given codes use npm run experiment
import ObjectOperation from "../components/ObjectOperation"
import Utils from "../components/Utils";
import Tetrapod from "../tetrapod";
import Hangul from "hangul-js"

// 비속어 데이터 불러오기
Tetrapod.defaultLoad();
// 전체 치환하기 - Utils.replaceAll
// console.log('replaceAll 테스트');
// console.log(Utils.replaceAll('가랑비에, 옷, 젖는 줄도 모르고, 정말', ',', '-'));
// // 단어 포지션 찾아주기 - Utils.getPositionAll(message, search, isString)
// console.log('getPositionAll 테스트');
// console.log('isString 옵션 켜기 : ', Utils.getPositionAll('가장 큰 나라는 러시아', '나라')); // 첫 위치와 끝 위치
// console.log('isString 옵션 끄기 : ', Utils.getPositionAll('가장 작은 나라는 바티칸', '나라', false)); // 첫 위치만 표시
// console.log('중복 : ', Utils.getPositionAll('가나는 가장 가난 가나', '가나', false));
// console.log('단어 없으면 :', Utils.getPositionAll('문자왔숑', '구')); // 단어 없으면 빈 리스트 출력
// console.log('lengthSplit 테스트', Utils.lengthSplit('정말 긴 문장을 만들어봤습니다. 숫자로 나누어볼게요.', 10))
// console.log(Utils.wordToArray('가+나!다?라'))
console.log(Utils.parseMap({씨:{value:"시", index:[0]}, 브얼:{value:"벌", index:[1]}}));
console.log(Utils.qwertyToDubeol("rkskrksk 정말 나빠요", true));
console.log(Utils.qwertyToDubeol('djqt어요'))
console.log(Utils.objectEqual(['ㄱ', 'ㄱ'], ['ㄱ', 'ㄱ']), 'TEST')
console.log(Utils.makeDouble('ㄱ','ㄱ'))
console.log(Utils.antispoof('ㄱH^H^77|'))
console.log(Utils.antispoof('ㄱH^H^77ㅗㅣ',true))
console.log(Utils.recursiveComponent([[1,2],[3,4,5]]))
console.log(Utils.dropDouble('빱브오쮜', true, true))
let testMsg = '삵얽릸 살어릿았닶'
console.log(testMsg, Utils.tooMuchDoubleEnd(testMsg))
console.log(Tetrapod.find('정말 값삾핪닚다'))
// console.log(Hangul.disassemble('개새끼', true).map(x=>Hangul.assemble(x)).join(''))
// // Tetrapod.loadFile(
// //     './resource/sample/bad-words.json',
// //     './resource/klleon/normal-words.json',
// //     './resource/klleon/soft-search-words.json',
// //     './resource/klleon/macros.json',
// // )

// console.log("\n\n======================")
// console.log(Tetrapod.findNormalWordPositions("십발 정말 값삾핪닚닶"))
// console.log("\n\n======================")
// console.log(Utils.parseMap(Utils.dropDouble("십발 정말 값삾핪닚닶", true)))
// console.log("\n\n======================")
// // console.log(Tetrapod.nativeFind( Utils.dropDouble("십발 정말 값삾핪닚닶", true) , true, true))
// console.log(Utils.parseMap(Utils.dropDouble("시발롬", true)))
// console.log("\n\n======================")
// console.log(Utils.dropDouble("십발 정말 값삾핪닚닶", true))

// console.log(Utils.antispoof("야 이 우리왕 아주 짜증나 죽겠어. 에휴에후!! 질알.", true))
//
// console.log(Utils.parseMap(Utils.antispoof("야 이 우리왕 아주 짜증나 죽겠어. 에휴에후!! 질알.", true)))
// // console.log(Utils.parseMap(Utils.antispoof("죽을래", true)))
// console.log(Tetrapod.isKindChar("지", "자"))

