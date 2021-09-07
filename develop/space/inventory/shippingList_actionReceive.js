(function () {
  'use strict';

  kintone.events.on('app.record.create.show', function (event) {
    event.record.prj_aNum.disabled = true;
    //コピー元の「prj_aNum」の値をsessionStorageの値を代入
    event.record.prj_aNum.value = sessionStorage.getItem('prj_aNum');
    event.record.shipType.value = sessionStorage.getItem('shipType');
    event.record.tarDate.value = sessionStorage.getItem('tarDate');
    event.record.instName.value = sessionStorage.getItem('instName');
    event.record.instName.lookup = true;
    //キャンセルした時の処理
    var cancel_btn = document.getElementsByClassName('gaia-ui-actionmenu-cancel');
    cancel_btn[0].addEventListener('click', function () {
      window.close();
    }, false);
    //反映したあとはsessionStorageの中身を削除
    sessionStorage.removeItem('prj_aNum');
    sessionStorage.removeItem('shipType');
    sessionStorage.removeItem('tarDate');
    sessionStorage.removeItem('instName');
    return event;
  });
  
})();