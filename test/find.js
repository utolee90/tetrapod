import Tetrapod from '../tetrapod';
import Utils from '../components/Utils';
import Hangul from 'hangul-js';
import Bias from '../bias/bias';

// 명령어로 입력되는 메시지를 가져옵니다.
/*
let word = process.argv
for(let i=1;i<=2;i++) word.shift()
word = word.join(' ')
*/

// 첫 번째 테스트 - Utils의 함


let initTime = new Date().getTime()

let Tester = new Tetrapod()
// 테스트 사용시에는 우선 파일부터 호출한다.
Tester.loadFile()

console.log("걸린 시간:::", new Date().getTime()-initTime)
initTime = new Date().getTime()

// 함수 사용시에는 클래스 Tetrapod가 아닌 호출된 클래스 Tester를 사용해야 한다.
console.log(Tester.nativeFind(Utils.msgToMap('시발점 죽일놈'), true, true))
console.log('test', Tester.findNormalWordPositions('시발점 죽일놈'));

// Utils.js 사용할 때에는 다음과 같이 사용한다.
console.log(Utils.qwertyToDubeol('dudwkdhk tjRdls aptlwlfmf 한글로 바꿔봅시다'));



// // console.log("1", require("../resource/dictionary/bad-words.json").badwords)
// // console.log(Tetrapod.getDefaultData().badWords)
// console.log("\n\n======================")
// // console.log(Tetrapod.isExistBadWord('지랄'))
// // console.log(Tetrapod.nativeFind("시발", true))
// // console.log(Tetrapod.antispoof('ㄱH^ㅣ불 완전 쨩나', true))
//
// // Bias.buildHelper(`kr-badwords`, targetWord, false)
// // console.log(Utils.lengthSplit("아니 정말 긴 메시지가 짜증나게 기네. 에휴...", 10))
// // console.log(Utils.dropDouble("시발 한남충 씨발", true, false))
// console.log(Utils.antispoof("죽0ㅡㄹ래", true))
// console.log(Tetrapod.fix("죽을래"))
// console.log('\n\n\n\n==========================')
// // console.log(Utils.antispoof("^|발 한남충 씨발", false))
// // console.log(Tetrapod.find("^|발 한남충 씨발", true, 0, false, true));
// // Tetrapod.defaultSaveAllData()
//
// // console.log(Utils.dropDouble("시발 저 한남충 시발", true));
// // console.log(Utils.parseMap(Utils.dropDouble("시발 저 한남충 시발", true)));
// // console.log(Tetrapod.countBad("시발 저 한남충 시발", true));
// // console.log(Tetrapod.objectInclude([1,2], [2,1]))
// // console.log(Tetrapod.find("시발시발시발", true))
// // console.log(Tetrapod.find("^ㅣ바2놈", true,0,false,true))
// // console.log(Tetrapod.nativeFind(Tetrapod.parseMap(Tetrapod.antispoof('시발시발^ㅣ발', true)), true, true));
// // console.log("1", Tetrapod.nativeFind(Tetrapod.antispoof('시발 왕이 나셨도다 새끼줄', true), true, true));
// // console.log(Tetrapod.recursiveList(Hangul.disassemble('존문가')));
// // console.log(Hangul.disassemble('지```존'));
// // console.log(Tetrapod.antispoof("다 LH꺼야", true));
// // console.log(Tetrapod.dropDouble('씨브얼', false));
// // console.log(Hangul.assemble(Hangul.disassemble("ㄱㅜ라")));
// // console.log(Tetrapod.antispoof("개^ㅗ리 ㄱ-마L해 이 멍개", true));
// // console.log(Tetrapod.joinMap(Tetrapod.antispoof("LH똔LH쓰안", true), Tetrapod.dropDouble(Tetrapod.antispoof("LH똔LH쓰안"), true)));
// // console.log(Tetrapod.dropDouble('고아테에마알라', true))
// // let targetWord = '바보'
// // Tetrapod.find('발씨', true)
// // console.log(Tetrapod.fix('발씨', 'X'));
// // console.log(Tetrapod.antispoof('ㄱH^H77|'));
// // console.log(Tetrapod.tooMuchDoubleEnd('정말 감삾핪닚닶'));
// // console.log(Tetrapod.find('가젖 상같은 톲슶틊샚', true, 0, false, false));
// // console.log(Tetrapod.getDefaultData());
// // Tetrapod.find('wlfkfgkwlak', true, 15,true);
// // console.log(message.replace(new RegExp(search, 'gi'), replace))
// // console.log(Tetrapod.fix('바bo', 'x'));
// // console.log(Tetrapod.nativeFind('싀발', true))
// // console.log(Tetrapod.recursiveComponent([['바', 'ba', 'va'], ['보', 'bo', 'vo']]));
//
//
// /**
//  * @description
//  * 정상단어 오탐지 해결된 사례
//  *
//  * - 발표장에는 박능후 보건
//  * - 호텔총지배인 l상무보 승진
//  * - 1상무보 승진 백지호
//  * - 안녕하세요 나간 미애야
//  */
//
// /*
// const test = (word)=>{
//     console.time('탐색시간: ')
//     console.log(Tetrapod.find(word))
//     console.timeEnd('탐색시간: ')
// }
//
// *받침 -> 받침: ["*받침"]
// */
//
