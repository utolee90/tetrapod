import Utils from "../components/Utils";
import Tetrapod from "../tetrapod";
import fs from 'fs';

// 고추로 실험해보자. 얼마나 많이 모이는지 확인
// 다른 단어 병신
let isKindByeongsin = []
let testTime = new Date().getTime();
for (let i=44032; i<55204; i++) {
    let firstChar = String.fromCharCode(i);
    let tested = false;
    if (Utils.isKindChar(firstChar, '병', '신')) {
        for (let j=44032; j<55204; j++) {
            let secondChar = String.fromCharCode(j);
            if (Utils.isKindChar(secondChar, '신', '')) {
                isKindByeongsin.push(firstChar+secondChar);
                tested = true;
            }
        }
    }
    if (Utils.isKindChar(firstChar, '븅', '신')) {
        for (let j=44032; j<55204; j++) {
            let secondChar = String.fromCharCode(j);
            if (Utils.isKindChar(secondChar, '신', '') && isKindByeongsin.indexOf(firstChar+secondChar) === -1) {
                isKindByeongsin.push(firstChar+secondChar);
                tested=true;
            }
        }
    }
    if(tested) {console.log('one', new Date().getTime() - testTime);}
}
let resString = isKindByeongsin.join("\n")
fs.writeFile('./test/byeongsin.txt', resString, 'utf-8', (err)=> {console.log(err);})
