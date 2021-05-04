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

// console.log(Tetrapod.isKindChar("길","기", "리" ))


let initTime = new Date().getTime()
Tetrapod.defaultLoad()
// Tetrapod.loadFile(
//     './resource/klleon/bad-words.json',
//     './resource/klleon/normal-words.json',
//     './resource/klleon/soft-search-words.json',
//     './resource/klleon/macros.json',
// )
console.log("걸린 시간:::", new Date().getTime()-initTime)
initTime = new Date().getTime()
// console.log("1", require("../resource/dictionary/bad-words.json").badwords)
// console.log(Tetrapod.getDefaultData().badWords)
console.log("\n\n======================")
// console.log(Tetrapod.isExistBadWord('지랄'))
// console.log(Tetrapod.nativeFind("시발", true))
// console.log(Tetrapod.antispoof('ㄱH^ㅣ불 완전 쨩나', true))

// Bias.buildHelper(`kr-badwords`, targetWord, false)
// console.log(Utils.lengthSplit("아니 정말 긴 메시지가 짜증나게 기네. 에휴...", 10))
// console.log(Utils.dropDouble("시발 한남충 씨발", true, false))
console.log(Utils.antispoof("죽을래", true))
console.log(Tetrapod.fix("죽을래"))
console.log('\n\n\n\n==========================')
// console.log(Utils.antispoof("^|발 한남충 씨발", false))
// console.log(Tetrapod.find("^|발 한남충 씨발", true, 0, false, true));
// Tetrapod.defaultSaveAllData()

// console.log(Utils.dropDouble("시발 저 한남충 시발", true));
// console.log(Utils.parseMap(Utils.dropDouble("시발 저 한남충 시발", true)));
// console.log(Tetrapod.countBad("시발 저 한남충 시발", true));
// console.log(Tetrapod.objectInclude([1,2], [2,1]))
// console.log(Tetrapod.find("시발시발시발", true))
// console.log(Tetrapod.find("^ㅣ바2놈", true,0,false,true))
// console.log(Tetrapod.nativeFind(Tetrapod.parseMap(Tetrapod.antispoof('시발시발^ㅣ발', true)), true, true));
// console.log("1", Tetrapod.nativeFind(Tetrapod.antispoof('시발 왕이 나셨도다 새끼줄', true), true, true));
// console.log(Tetrapod.recursiveList(Hangul.disassemble('존문가')));
// console.log(Hangul.disassemble('지```존'));
// console.log(Tetrapod.antispoof("다 LH꺼야", true));
// console.log(Tetrapod.dropDouble('씨브얼', false));
// console.log(Hangul.assemble(Hangul.disassemble("ㄱㅜ라")));
// console.log(Tetrapod.antispoof("개^ㅗ리 ㄱ-마L해 이 멍개", true));
// console.log(Tetrapod.joinMap(Tetrapod.antispoof("LH똔LH쓰안", true), Tetrapod.dropDouble(Tetrapod.antispoof("LH똔LH쓰안"), true)));
// console.log(Tetrapod.dropDouble('고아테에마알라', true))
// let targetWord = '바보'
// Tetrapod.find('발씨', true)
// console.log(Tetrapod.fix('발씨', 'X'));
// console.log(Tetrapod.antispoof('ㄱH^H77|'));
// console.log(Tetrapod.tooMuchDoubleEnd('정말 감삾핪닚닶'));
// console.log(Tetrapod.find('가젖 상같은 톲슶틊샚', true, 0, false, false));
// console.log(Tetrapod.getDefaultData());
// Tetrapod.find('wlfkfgkwlak', true, 15,true);
// console.log(message.replace(new RegExp(search, 'gi'), replace))
// console.log(Tetrapod.fix('바bo', 'x'));
// console.log(Tetrapod.nativeFind('싀발', true))
// console.log(Tetrapod.recursiveComponent([['바', 'ba', 'va'], ['보', 'bo', 'vo']]));


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

*받침 -> 받침: ["*받침"]
*/


// console.log("text", Tetrapod.fix("즤랄 왕이 나셨도다 ㄱHㅅH끼", '$', {antispoof:true, isOriginal:true}))
// console.log(Tetrapod.nativeFind("존병"))
// console.log(Tetrapod.nativeFind( Utils.dropDouble("십발 정말 값삾핪닚닶", true) , true, true))
// console.log("걸린 시간:::", new Date().getTime()-initTime)
initTime = new Date().getTime()
console.log("\n\n================")
// console.log(Bias.recursiveComponent([["*별"], ["사랑", "사귐"]],
//     {}, {"별":["벌", "별", "뻘", "뼐", "펄", [["펼"], ["", "써"]]]}
//     ))
// console.log(Bias.recursiveList(["*별"],
//     {"별":["벌", "별", "뻘", "뼐", "펄", "펼"]} ))
// console.log(Tetrapod.fix("tlqkf dhkddl sktuTehek", "X", {qwertyToDubeol:true}))

// console.log("지?랄?염병 테스트", Tetrapod.isExistBadWord("지!랄!염병"))
// console.log(Utils.dropDouble("밥옵", true, true))
// Bias.buildHelper('kr-fword', "지랄")
// console.log(Tetrapod.recursiveComponent([["바"], ["*보"]], {"보":["*보", "*봉"]}))
// console.log(Utils.filterList(["1", 2, "사기"], "string"))
// console.log(Tetrapod.isKindChar("즤", "지"))

// console.log(Utils.objectEqual([Hangul.disassemble("즤")[0], Hangul.disassemble("즤")[2]], Hangul.disassemble("지")))

// console.log(Tetrapod.nativeFind("지뢀염병", true))
// console.log(Tetrapod.isKindChar("뢀", "랄"))

console.log("걸린 시간:::", new Date().getTime()-initTime)

// console.log(Utils.objectInclude(['지', '병'], ["지", "염", "병", "룡"], true))
// console.log(Utils.objectInclude(["지","병"], ["병","지"], true))
// console.log(Utils.objectInclude(["지","병"], ["병","지"], false))
// console.log(Tetrapod.wordInclude("지뢀염병", "지!랄!염병"))
// console.log(Tetrapod.isKindChar("즤", "지"))
// console.log(Tetrapod.assembleHangul(["가ㅈㅣ", "구라", "개굴ㅣ"]))
// console.log(Tetrapod.find("^l바2롬", true, 0, false, true))

// console.log("걸린 시간:::", new Date().getTime()-initTime)
initTime = new Date().getTime()

console.log(Tetrapod.nativeFind(Utils.dropDouble("야 이 우리왕 아주 짜증나 죽겠어. 에휴에휴!!! 질알.", true), true, true, true))
console.log("걸린 시간:::", new Date().getTime()-initTime)
initTime = new Date().getTime()
console.log(Tetrapod.fix("야 이 우리왕 아주 짜증나 죽겠어. 에휴에휴!! 질알!", "*", {dropDouble:true}))
console.log("걸린 시간:::", new Date().getTime()-initTime)

console.log(Tetrapod.nativeFind("지지"))


//   Tetrapod.defaultSaveAllData()
