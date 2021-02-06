import Tetrapod from '../tetrapod';
import Hangul from 'hangul-js';
import Bias from '../bias/bias';

// 명령어로 입력되는 메시지를 가져옵니다.
/*
let word = process.argv
for(let i=1;i<=2;i++) word.shift()
word = word.join(' ')
*/

Tetrapod.defaultLoad()

// console.log(Tetrapod.find('ㅅㅂ 왕이 나셨도다! 새끼줄!', true));
// console.log(Tetrapod.recursiveList(Hangul.disassemble('존문가')));
// console.log(Hangul.disassemble('지```존'));
// console.log(Tetrapod.isBad('지는 신랄하게 공격'));
// let message = '우리 나라 만세!'
// let search = '나라';
// let replace = '민족';
let targetWord = '바보'
Bias.buildHelper(`kr-badwords`, targetWord, false);
// console.log(message.replace(new RegExp(search, 'gi'), replace))
// console.log(Tetrapod.fix('바bo', 'x'));

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