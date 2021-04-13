import Tetrapod from '../tetrapod';
import Hangul from 'hangul-js';
import Bias from '../bias/bias';

// 명령어로 입력되는 메시지를 가져옵니다.
/*
let word = process.argv
for(let i=1;i<=2;i++) word.shift()
word = word.join(' ')
*/


// Tetrapod.defaultLoad()
// console.log(Tetrapod.nativeFind("시발", true))
// console.log(Tetrapod.alphabetToKo('ㄱH^ㅣ불 완전 쨩나', true))
console.log("1", Tetrapod.find('시발', true));
// console.log(Tetrapod.recursiveList(Hangul.disassemble('존문가')));
// console.log(Hangul.disassemble('지```존'));
console.log(Tetrapod.alphabetToKo("다 LH꺼야", true));
console.log(Tetrapod.parseMap(Tetrapod.alphabetToKo("다 LH꺼야", true)));
// console.log(Tetrapod.dropIung('씨브얼', false));
// console.log(Hangul.assemble(Hangul.disassemble("ㄱㅜ라")));
// console.log(Tetrapod.alphabetToKo("개^ㅗ리 ㄱ-마L해 이 멍개", true));
// console.log(Tetrapod.joinMap(Tetrapod.alphabetToKo("LH똔LH쓰안", true), Tetrapod.dropiung(Tetrapod.alphabetToKo("LH똔LH쓰안"), true)));
// console.log(Tetrapod.dropiung('고아테에마알라', true))
let targetWord = '바보'
// Tetrapod.find('발씨', true)
// console.log(Tetrapod.fix('발씨', 'X'));
// console.log(Tetrapod.alphabetToKo('ㄱH^H77|'));
// console.log(Tetrapod.tooMuchDoubleEnd('정말 감삾핪닚닶'));
// console.log(Tetrapod.find('가젖 상같은 톲슶틊샚', true, 0, false, false));
// console.log(Tetrapod.getDefaultData());
// Tetrapod.find('wlfkfgkwlak', true, 15,true);
// console.log(message.replace(new RegExp(search, 'gi'), replace))
// console.log(Tetrapod.fix('바bo', 'x'));
// console.log(Tetrapod.nativeFind('싀발', true))
// console.log(Bias.recursiveComponent([['바', 'ba', 'va'], ['보', 'bo', 'vo']]));

/**
 * @description
 * 정상단어 오탐지 해결된 사례
 *
 * - 발표장에는 박능후 보건
 * - 호텔총지배인 l상무보 승진
 * - 1상무보 승진 백지호
 * - 안녕하세요 나간 미애야
 */

/*
const test = (word)=>{
    console.time('탐색시간: ')
    console.log(Tetrapod.find(word))
    console.timeEnd('탐색시간: ')
}

*/
