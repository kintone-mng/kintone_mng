(function() {
  'use strict';
  //商品情報取得＆繰り返し利用
  var getDEVdata=api_getRecords(sysid.INV.app_id.device);

  //新規拠点作成時アクション
  kintone.events.on('app.record.create.show', function(event) {
    //品目一覧を取得し、品目在庫一覧に格納
    getDEVdata.then(function(resp){
      var eRecord=kintone.app.record.get();
      //反転して格納
      var tarRecords=resp.records.reverse();
      //各拠点情報を当アプリの拠点リストに格納する
      //最初の空白の1行目を削除
      eRecord.record.mStockList.value.splice(0, 1);
      //上から行を追加実行（参考：http://www.htmq.com/js/array_reverse.shtml）
      //aml: auto model list
      for(var aml in tarRecords){
        eRecord.record.mStockList.value.push({//unshift({
          value: {
            mCode: {
              value: tarRecords[aml].mCode.value,
              type: 'SINGLE_LINE_TEXT'
            },
            mName: {
              value: tarRecords[aml].mName.value,
              type: 'SINGLE_LINE_TEXT'
            },
            mStock: {
              value: '',
              type: 'NUMBER'
            }
          }
        });
        eRecord.record.mStockList.value[aml].value.mCode.disabled=true;
        eRecord.record.mStockList.value[aml].value.mName.disabled=true;
        eRecord.record.mStockList.value[aml].value.mStock.disabled=true;
        kintone.app.record.set(event);
      }
      kintone.app.record.set(eRecord);
    }).catch(function(error){
      console.log(error);
      console.log('品目データを取得できませんでした。'+error.message);
    });
    return event;
  });



  //新規保存時アクション
  kintone.events.on('app.record.create.submit', function(event) {
    //品目情報を拠点リストに転送
    getDEVdata.then(function(resp){
      var tarRecords=resp.records;

      //商品管理アプリの拠点リストに上書きするデータ作成
      var NewPrdInfo={
        'app': sysid.INV.app_id.device,
        'records':[]
      };
      //sud: set unit data
      for (var sud in tarRecords){
        var records_set={
          'id': tarRecords[sud].$id.value,
          'record': {
            'uStockList': tarRecords[sud].uStockList
          }
        };
        var addRowData={
          'value': {
            'uCode': event.record.uCode,
            'uName': event.record.uName
          }
        };
        records_set.record.uStockList.value.push(addRowData);
        NewPrdInfo.records.push(records_set);
      }
      return kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', NewPrdInfo);
    }).then(function(resp){
      //転送成功
      console.log('put data to device is success');
    }).catch(function(error){
      //event error
      console.log(error);
      alert('品目データ更新失敗'+error.message);
    });
  });
})();
