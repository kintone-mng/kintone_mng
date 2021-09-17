(function () {
  kintone.events.on(['app.record.edit.show','app.record.chreate.show'], function(event){
    setBtn('btn_calculation','原価算出');
    $('#btn_calculation').on('click', function(){
      console.log(event);
      var arrivalListValue=event.record.arrivalList.value;
      // 平均レート計算
      var remittanceListValue=event.record.remittanceList.value;
      var rateTotal=0;
      for(var x in remittanceListValue){
        rateTotal=Number(rateTotal)+Number(remittanceListValue[x].value.late.value)
      }
      event.record.averageRate.value=orgRound(rateTotal/remittanceListValue.length,100);
      // 外貨から単価割り出し＆単価計の合計
      let unitpricetotal=0;
      for(var y in arrivalListValue){
        // 単価（￥）
        var unitprice=arrivalListValue[y].value.unitPrice_foreign.value*event.record.averageRate.value
        arrivalListValue[y].value.unitPrice.value=unitprice;
        // 単価計（￥）
        let unitpricesubtotal=arrivalListValue[y].value.unitPrice.value*arrivalListValue[y].value.arrivalNum.value
        arrivalListValue[y].value.unitPriceSubtotal.value=unitpricesubtotal;
        // 単価計（￥）の合計（sys_unitPricetotal）
        unitpricetotal=Number(unitpricetotal)+Number(unitpricesubtotal);
      }
      event.record.sys_unitPricetotal.value=unitpricetotal;
      for(var i in arrivalListValue){
        // 単価計（￥）取得
        let unitpricesubtotal=arrivalListValue[i].value.unitPriceSubtotal.value;
        // 入荷数取得
        let arrivalnum=arrivalListValue[i].value.arrivalNum.value;
        // 構成比
        let compratio=orgRound(unitpricesubtotal/event.record.sys_unitPricetotal.value*100,10);
        arrivalListValue[i].value.compRatio.value=compratio;
        // 追加原価（外貨）
        let addicost_foreign=event.record.devCost_foreign.value*compratio/100;
        arrivalListValue[i].value.addiCost_foreign.value=addicost_foreign;
        // 追加原価（￥）
        let addicost=event.record.averageRate.value*addicost_foreign;
        arrivalListValue[i].value.addiCost.value=addicost;
        // 追加単価（￥）
        let addiunitcost=addicost/arrivalnum;
        arrivalListValue[i].value.addiUnitCost.value=addiunitcost;
        // 追加原価（経費）
        let addiexpenses=event.record.totalExpenses.value*compratio/100;
        arrivalListValue[i].value.addiExpenses.value=addiexpenses;
        // 按分原価（経費）単価
        let addiUnitexpenses=addiexpenses/arrivalnum;
        arrivalListValue[i].value.addiUnitExpenses.value=addiUnitexpenses;
        // 原価計
        let totalunitcost=orgRound(Number(arrivalListValue[i].value.unitPrice.value)+Number(addiunitcost)+Number(addiUnitexpenses),1);
        arrivalListValue[i].value.totalUnitCost.value=totalunitcost;
        // 原価合計
        let totalcost=totalunitcost*arrivalnum;
        arrivalListValue[i].value.totalCost.value=totalcost;
      }
      kintone.app.record.set(event);
    });
    return event;
  });
})();
function orgRound(value, base) {
  return Math.round(value * base) / base;
}
function orgCeil(value, base) {
  return Math.ceil(value * base) / base;
}
function orgFloor(value, base) {
  return Math.floor(value * base) / base;
}