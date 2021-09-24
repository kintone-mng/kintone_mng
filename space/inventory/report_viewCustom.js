(function () {
  'use strict';

  var events_ced = [
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show',
    'mobile.app.record.detail.show',
    'app.record.detail.show',
    'app.record.edit.show',
    'app.record.create.show'
  ];
  kintone.events.on(events_ced, function (event) {
    //サプテーブル編集不可＆行の「追加、削除」ボタン非表示
    // [].forEach.call(document.getElementsByClassName("subtable-operation-gaia"), function(button){ button.style.display='none'; });

    for (var i in event.record.forecastList.value) {
      event.record.forecastList.value[i].value.afterLeadTimeStock.disabled = true;
      event.record.forecastList.value[i].value.forecast_arrival.disabled = true;
      event.record.forecastList.value[i].value.forecast_mName.disabled = true;
      event.record.forecastList.value[i].value.forecast_mStock.disabled = true;
      event.record.forecastList.value[i].value.forecast_shipNum.disabled = true;
      event.record.forecastList.value[i].value.mLeadTime.disabled = true;
      event.record.forecastList.value[i].value.mOrderingPoint.disabled = true;
      event.record.forecastList.value[i].value.remainingNum.disabled = true;
    }

    function tabSwitch(onSelect) {
      switch (onSelect) {
        case '#概要':
          setFieldShown('totalInventoryAmount', true);
          setFieldShown('finishProduct', true);
          setFieldShown('inProcess', true);
          setFieldShown('totalAmountArrival', true);
          setFieldShown('acquisitionCost', true);
          setFieldShown('developmentCost', true);
          setFieldShown('subscription', true);
          setFieldShown('nonSalesAmount', true);
          setFieldShown('inventoryList', false);
          setFieldShown('forecastList', false);
          setSpaceShown('itemSortBtn', 'line', 'none');
          setSpaceShown('locationSortBtn', 'line', 'none');
          break;
        case '#在庫リスト':
          setFieldShown('totalInventoryAmount', false);
          setFieldShown('finishProduct', false);
          setFieldShown('inProcess', false);
          setFieldShown('totalAmountArrival', false);
          setFieldShown('acquisitionCost', false);
          setFieldShown('developmentCost', false);
          setFieldShown('subscription', false);
          setFieldShown('nonSalesAmount', false);
          setFieldShown('inventoryList', true);
          setFieldShown('forecastList', false);
          setSpaceShown('itemSortBtn', 'line', 'block');
          setSpaceShown('locationSortBtn', 'line', 'block');
          break;
        case '#製品別在庫残数':
          setFieldShown('totalInventoryAmount', false);
          setFieldShown('finishProduct', false);
          setFieldShown('inProcess', false);
          setFieldShown('totalAmountArrival', false);
          setFieldShown('acquisitionCost', false);
          setFieldShown('developmentCost', false);
          setFieldShown('subscription', false);
          setFieldShown('nonSalesAmount', false);
          setFieldShown('inventoryList', false);
          setFieldShown('forecastList', true);
          setSpaceShown('itemSortBtn', 'line', 'none');
          setSpaceShown('locationSortBtn', 'line', 'none');
          break;
      }
    }
    tabSwitch('#概要');
    tabMenu('tab_report', ['概要', '在庫リスト','製品別在庫残数']); //タブメニュー作成
    $('.tabMenu a').on('click', function () { //タブメニュークリック時アクション
      var idName = $(this).attr('href'); //タブ内のリンク名を取得
      tabSwitch(idName); //tabをクリックした時の表示設定
      return false;
    });
    return event;
  });

  //ソートボタン表示、処理
  kintone.events.on(['app.record.edit.show', 'app.record.create.show'], function (event) {
    setBtn('itemSortBtn', '商品順');
    setBtn('locationSortBtn', '拠点順');

    $('#itemSortBtn').on('click', function () {
      var eRecord = kintone.app.record.get();
      var table = eRecord.record.inventoryList.value
      table = sortItemTable(table, 'sys_code', true);

      kintone.app.record.set(eRecord);
    });

    $('#locationSortBtn').on('click', function () {
      var eRecord = kintone.app.record.get();
      var table = eRecord.record.inventoryList.value
      table = sortLocTable(table, 'sys_code', true);

      kintone.app.record.set(eRecord);
    });

    return event;
  });

  //差引数量０以下の時行を赤背景に
  kintone.events.on('app.record.detail.show', function (event) {

    const GET_FIELD_CODE = Object.values(cybozu.data.page.SCHEMA_DATA.subTable);
    var tableClass = 'subtable-' + GET_FIELD_CODE.find(_ => _.label === '在庫一覧').id
    var deductionData = []

    //テーブルデータ取得
    for (var i in event.record.inventoryList.value) {
      var deductionBody = {
        'rowNum': parseInt(i) + 1,
        'deductionNum': event.record.inventoryList.value[i].value.deductionNum.value,
        'location': event.record.inventoryList.value[i].value.stockLocation.value
      }
      deductionData.push(deductionBody);
    }

    //データ表示後動かす
    setTimeout(function () {
      for (var i in deductionData) {
        //差引数量マイナスのものを赤背景に
        if (parseInt(deductionData[i].deductionNum) < 0) {
          $('.' + tableClass + ' tr:nth-child(' + deductionData[i].rowNum + ')').css({
            'background-color': 'red'
          });
          $('.' + tableClass + ' tr:nth-child(' + deductionData[i].rowNum + ') td div').css({
            'color': 'white'
          })
        }
      }
    }, 5000);

    if (event.record.EoMcheck.value == '締切' || event.record.EoMcheck.value == '一時締切') {
      setTimeout(function () {
        for (var i in deductionData) {
          //差引数量0の文字色を青色に
          if (parseInt(deductionData[i].deductionNum) == 0) {
            $('.' + tableClass + ' tr:nth-child(' + deductionData[i].rowNum + ') td div').css({
              'color': 'blue',
              'font-weight': 'bold'
            });
          }

          //特定拠点の文字色を緑に
          if (deductionData[i].location == '〇〇〇〇') {
            $('.' + tableClass + ' tr:nth-child(' + deductionData[i].rowNum + ') td div').css({
              'color': 'green',
              'font-weight': 'bold'
            });
          }
        }
      }, 500);
    }

  });

  //商品順ソート関数
  var sortItemTable = function (table, orderBy, isDesc) {
    table.sort(function (a, b) {
      var v1 = a.value[orderBy].value;
      var v2 = b.value[orderBy].value;
      var pos = isDesc ? -1 : 1;
      if (v1 > v2) {
        return pos;
      }
      if (v1 < v2) {
        return pos * -1;
      }
    });
    return table;
  };

  //拠点順ソート関数
  var sortLocTable = function (table, orderBy, isDesc) {
    table.sort(function (a, b) {
      var codeCutterA = a.value[orderBy].value.lastIndexOf('-');
      var codeCutterB = b.value[orderBy].value.lastIndexOf('-');
      var v1 = a.value[orderBy].value.slice(codeCutterA + 1) + a.value[orderBy].value.substring(0, codeCutterA);
      var v2 = b.value[orderBy].value.slice(codeCutterB + 1) + b.value[orderBy].value.substring(0, codeCutterB);
      var pos = isDesc ? -1 : 1;
      if (v1 > v2) {
        return pos;
      }
      if (v1 < v2) {
        return pos * -1;
      }
    });
    return table;
  };
})();