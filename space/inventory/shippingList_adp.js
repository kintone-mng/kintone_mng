(function () {
  'use strict';

  //拠点情報取得＆繰り返し利用
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    var nStatus = event.nextStatus.value;

    if (nStatus === "集荷待ち") {
      //パラメータsNumInfoにjsonデータ作成
      var sNumInfo = {
        'app': sysid.DEV.app.sNum,
        'records': []
      };

      var shipTable = event.record.deviceList.value;
      var shipInstName = event.record.instName.value;
      var shipShipment = event.record.shipment.value;


      if (shipShipment === '矢倉倉庫') {
        for (var i in shipTable) {
          var ship_mcode = shipTable[i].value.mCode.value;
          var ship_shipnum = shipTable[i].value.shipNum.value;
          var ship_sn = shipTable[i].value.sNum.value;
          //get serial numbers
          var get_sNums = ship_sn.split(/\r\n|\n/);
          //except Boolean
          var sNums = get_sNums.filter(Boolean);

          for (var y in sNums) {
            var snRecord = {
              'sNum': {
                'value': sNums[y]
              },
              'mCode': {
                'value': ship_mcode
              },
              'instName': {
                'value': shipInstName
              },
              'shipment': {
                'value': shipShipment
              }
            };
            sNumInfo.records.push(snRecord);
          }
        }

        var setSNinfo = new kintone.api(kintone.api.url('/k/v1/records', true), 'POST', sNumInfo);
      } else {
        for (var i in shipTable) {
          var ship_mcode = shipTable[i].value.mCode.value;
          var ship_shipnum = shipTable[i].value.shipNum.value;
          var ship_sn = shipTable[i].value.sNum.value;
          //get serial numbers
          var get_sNums = ship_sn.split(/\r\n|\n/);
          //except Boolean
          var sNums = get_sNums.filter(Boolean);

          for (var y in sNums) {
            var snRecord = {
              'updateKey': {
                'field': 'sNum',
                'value': sNums[y]
              },
              'record': {
                'mCode': {
                  'value': ship_mcode
                },
                'instName': {
                  'value': shipInstName
                },
                'shipment': {
                  'value': shipShipment
                }
              }
            };
            sNumInfo.records.push(snRecord);
          }
        }

        var setSNinfo = new kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', sNumInfo);
      }

      return setSNinfo.then(function (resp) {
        console.log(resp);
      }).catch(function (error) {
        console.error(error);
      });
    }
  });

  kintone.events.on(['app.record.edit.show', 'app.record.create.show'], function (event) {
    setBtn('calBtn', '計算');

    $('#calBtn').on('click', function () {
      var eRecord = kintone.app.record.get();
      var shipTable = eRecord.record.deviceList.value;

      //品目コードがTRT-DYの時のみ
      if(String(shipTable[0].value.mCode.value).match(/TRT-DY/)){
        
      }

      var lengthStr = '';
      var openType = '';
      var methodType = '';
      var shipNum = '';

      var numRegExp = new RegExp(/^([1-9]\d*|0)$/);
      var openRegExp = new RegExp(/^[sw]/i);
      var methodRegExp = new RegExp(/壁付[sw]|天井/i);

      var railSpecs = (String(shipTable[0].value.sNum.value)).split(/,\n|\n/);

      for (var i in railSpecs) {
        if (numRegExp.test(railSpecs[i])) {
          lengthStr = railSpecs[i];

          shipTable[0].value.sNum.error = null;
        } else {
          shipTable[0].value.sNum.error = '入力形式が間違えています';
        }

        if (openRegExp.test(railSpecs[i])) {
          if (railSpecs[i].length === 1) {
            openType = railSpecs[i];
            openType = openType.toLowerCase();

            shipTable[0].value.sNum.error = null;
          } else {
            shipTable[0].value.sNum.error = '入力形式が間違えています';
          }
        } else {
          shipTable[0].value.sNum.error = '入力形式が間違えています';
        }

        if (methodRegExp.test(railSpecs[i])) {
          if (railSpecs[i].match(/壁付s/i)) {
            methodType = '壁付s';
          } else if (railSpecs[i].match(/壁付w/i)) {
            methodType = '壁付w';
          } else {
            methodType = '天井';
          }
          shipTable[0].value.sNum.error = null;
        } else {
          shipTable[0].value.sNum.error = '入力形式が間違えています';
        }
      }

      if (numRegExp.test(shipTable[0].value.shipNum.value)) {
        shipNum = shipTable[0].value.shipNum.value;
        shipTable[0].value.shipNum.error = null;
      } else {
        shipTable[0].value.shipNum.error = '入力形式が間違えています';
      }

      var spec = {
        rLength: lengthStr,
        rType: openType,
        rMethod: methodType,
        shipNum: shipNum
      }

      var railItems = railConf(spec);
      
      for (var ril in railItems) {
        shipTable.push({
          value: {
            mCode: {
              type: "SINGLE_LINE_TEXT",
              value: JSON.stringify(railItems[ril].value.mCode.value).replace(/\"/g, '')
            },
            mName: {
              type: "SINGLE_LINE_TEXT",
              value: JSON.stringify(railItems[ril].value.mName.value).replace(/\"/g, '')
            },
            mType: {
              type: "SINGLE_LINE_TEXT",
              value: JSON.stringify(railItems[ril].value.mType.value).replace(/\"/g, '')
            },
            mVendor: {
              type: "SINGLE_LINE_TEXT",
              value: JSON.stringify(railItems[ril].value.mVendor.value).replace(/\"/g, '')
            },
            sNum: {
              type: "MULTI_LINE_TEXT",
              value: JSON.stringify(railItems[ril].value.sNum.value).replace(/\"/g, '')
            },
            shipMemo: {
              type: "SINGLE_LINE_TEXT",
              value: JSON.stringify(railItems[ril].value.shipMemo.value).replace(/\"/g, '')
            },
            shipNum: {
              type: "NUMBER",
              value: JSON.stringify(railItems[ril].value.shipNum.value).replace(/\"/g, '')
            }
          }
        });
      }

      console.log(shipTable);
      kintone.app.record.set(eRecord);
    });

    return event;
  });


})();