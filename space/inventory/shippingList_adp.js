(function() {
  'use strict';
  //拠点情報取得＆繰り返し利用
  var getSNUMdata=api_getRecords(sysid.DEV.app.sNum);

  kintone.events.on('app.record.detail.process.proceed',function(event){
    getSNUMdata.then(function(resp){
      var tarRecords=resp.records;
      var nStatus = event.nextStatus.value;

      if(nStatus==="集荷待ち"){
        //パラメータsNumInfoにjsonデータ作成
        var sNumInfo={
          'app': sysid.DEV.app.sNum, 
          'records': []
        };
        
        var shipTable=event.record.deviceList.value;
        var shipInstName=event.record.instName.value;
        var shipShipment=event.record.shipment.value;
  
  
        if(shipShipment === '矢倉倉庫'){
          for (var i in shipTable){
            var ship_mcode=shipTable[i].value.mCode.value;
            var ship_shipnum=shipTable[i].value.shipNum.value;
            var ship_sn=shipTable[i].value.sNum.value;
            //get serial numbers
            var get_sNums=ship_sn.split(/\r\n|\n/);
            //except Boolean
            var sNums=get_sNums.filter(Boolean);
            
            for(var y in sNums){
              var snRecord={
                'sNum':{'value':sNums[y]},
                'mCode':{'value':ship_mcode},
                'instName':{'value':shipInstName},
                'shipment':{'value':shipShipment}
              };
              sNumInfo.records.push(snRecord);
            }
          }
    
          var setSNinfo= new kintone.api(kintone.api.url('/k/v1/records', true), 'POST', sNumInfo);
        }else{
          for (var i in shipTable){
            var ship_mcode=shipTable[i].value.mCode.value;
            var ship_shipnum=shipTable[i].value.shipNum.value;
            var ship_sn=shipTable[i].value.sNum.value;
            //get serial numbers
            var get_sNums=ship_sn.split(/\r\n|\n/);
            //except Boolean
            var sNums=get_sNums.filter(Boolean);
            
            for(var y in sNums){      
              var snRecord={
                'id': tarRecords[y].getId(),
                'record':{
                  'sNum':{'value':sNums[y]},
                  'mCode':{'value':ship_mcode},
                  'instName':{'value':shipInstName},
                  'shipment':{'value':shipShipment}
                }
              };
              sNumInfo.records.push(snRecord);
            }
          }
  
          console.log(sNumInfo);
    
          var setSNinfo= new kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', sNumInfo);
        }
  
        return setSNinfo.then(function(resp){
          alert('update success');
        }).catch(function(error){
          alert('update error'+error.message);
          console.log(error)
        });
      }
      
    });
  });
})();
