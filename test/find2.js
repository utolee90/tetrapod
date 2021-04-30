// to test given codes use npm run experiment
import ObjectOperation from "../components/ObjectOperation"
import Utils from "../components/Utils";
import Tetrapod from "../tetrapod";
import Hangul from "hangul-js"

console.log()
console.log( Utils.dropDouble("없닶", true))
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

console.log(Utils.antispoof("야 이 우리왕 아주 짜증나 죽겠어. 에휴에후!! 질알.", true))

console.log(Utils.parseMap(Utils.antispoof("야 이 우리왕 아주 짜증나 죽겠어. 에휴에후!! 질알.", true)))
console.log(Utils.parseMap(Utils.antispoof("죽을래", true)))
