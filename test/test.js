/* 이 자바스크립트 설정은 벡터 스킨을 사용하는 사용자에게 적용됩니다 */

/* [[Category:Wikipedia scripts]]
이 스크립트는 Minecraft Wiki의 Majr의 goToTop.js를
(http://minecraftwiki.net/wiki/User:Majr/goToTop.js/)
리브레 위키의 사용자 Utolee90이 자유위키에서 재가공해서 만들었습니다. 이를 큰숲백과에서 큰숲식으로 다시 재가공 하였습니다.
*/
/* 위로 올라가는 버튼을 만듭니다. */
$( function() {
    'use strict';

    $( 'body' ).append( '<span id="to-top" >▲</span>' );
    var $topButton = $( '#to-top' );

    $topButton.css( {
        'background':'#5B5',
        'width':'24px',
        'color': '#FFF',
        'position': 'fixed',
        'bottom': '5px',
        'left': '20px',
        'z-index': '10',
        'cursor': 'pointer',
        'transition': 'bottom 0.5s',
        '-webkit-transition': 'bottom 0.5s',
        'user-select': 'none',
        '-webkit-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none'
    } ).click( function() {
        $( 'html, body' ).animate( { scrollTop: 0 }, 'slow' );
    } );

    $( window ).scroll( function() {

    } );
} );
/* 아래 버튼을 만듭니다. */
$( function() {
    'use strict';

    $( 'body' ).append( '<span id="to-bottom" >▼</span>' );
    var $bottomButton = $( '#to-bottom' );
    var height=document.body.scrollHeight;
    var hminus=document.body.scrollHeight-"640";
    $bottomButton.css( {
        'background':'#5B5',
        'width':'24px',
        'color': '#FFF',
        'z-index': '10',
        'position': 'fixed',
        'bottom': '5px',
        'left': '50px',
        'cursor': 'pointer',
        'transition': 'bottom 0.5s',
        '-webkit-transition': 'bottom 0.5s',
        'user-select': 'none',
        '-webkit-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none'
    } ).click( function() {
        $( 'html, body' ).animate( { scrollTop:height}, 'slow' );
    } );

    $( window ).scroll( function() {

    } );
} );

/* 랜덤문서 보내기 버튼을 만듭니다. */

$( function() {
    'use strict';

    $( 'body' ).append( '<span id="to-random">?</span>' );
    var $randomButton = $( '#to-random' );
    var height=document.body.scrollHeight;
    var hminus=document.body.scrollHeight-"640";
    $randomButton.css( {
        'background':'#5B5',
        'width':'24px',
        'color': '#FFF',
        'position': 'fixed',
        'z-index': '10',
        'bottom': '5px',
        'left': '80px',
        'cursor': 'pointer',
        'transition': 'bottom 0.5s',
        '-webkit-transition': 'bottom 0.5s',
        'user-select': 'none',
        '-webkit-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none'
    } ).click( function() {
        location.href="https://bigforest.miraheze.org/wiki/Special:Random/"
    } );

    $( window ).scroll( function() {

    } );
} );

/* 편집 버튼을 만듭니다. */
if(wgNamespaceNumber>=0){
    $( function() {
        'use strict';

        $( 'body' ).append( '<span id="to-editpage">E</span>' );
        var $editButton = $( '#to-editpage' );
        $editButton.css( {
            'background':'#5B5',
            'width':'24px',
            'color': '#FFF',
            'position': 'fixed',
            'z-index': '10',
            'bottom': '5px',
            'left': '110px',
            'cursor': 'pointer',
            'transition': 'bottom 0.5s',
            '-webkit-transition': 'bottom 0.5s',
            'user-select': 'none',
            '-webkit-user-select': 'none',
            '-moz-user-select': 'none',
            '-ms-user-select': 'none'
        } ).click( function() {
            if (wgAction != 'edit ' )
                location.href="https://bigforest.miraheze.org/w/index.php?action=edit&title="+wgRelevantPageName; }
        );

        $( window ).scroll( function() {

        } );
    } );

    /* 문서 역사 버튼을 만듭니다. */

    $( function() {
        'use strict';

        $( 'body' ).append( '<span id="to-history" >H</span>' );
        var $historyButton = $( '#to-history' );

        $historyButton.css( {
            'background':'#5B5',
            'width':'24px',
            'color': '#FFF',
            'position': 'fixed',
            'bottom': '5px',
            'z-index': '10',
            'left': '140px',
            'cursor': 'pointer',
            'transition': 'bottom 0.5s',
            '-webkit-transition': 'bottom 0.5s',
            'user-select': 'none',
            '-webkit-user-select': 'none',
            '-moz-user-select': 'none',
            '-ms-user-select': 'none'
        } ).click( function() {
            location.href="https://bigforest.miraheze.org/w/index.php?action=history&title="+wgRelevantPageName;
        } );

        $( window ).scroll( function() {

        } );
    } );
}

// 사이드바 밀어내기 버튼 추가
$(function() {
    'use strict';

    function toggleFunc() {
        $("#mw-panel, #p-personal ul.vector-menu-content-list, .mw-body, #left-navigation, #folded-link, #footer").css('transition', '0.5s');
        $("#mw-panel, #p-personal ul.vector-menu-content-list, .mw-body, #left-navigation, #folded-link, #footer").toggleClass('folded');
        $("a#folded-link")[0].innerText = $("a#folded-link").is(".folded")?"[사이드바]":"[화면 확장]";
    }
    $('#p-personal ul.vector-menu-content-list').append("<li id='folded-button'><a id='folded-link' href='javascript:void(0)' onclick='toggleFunc()'>[화면 확장]</a></li>");

});
