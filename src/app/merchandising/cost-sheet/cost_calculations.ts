export class CostCalculations{


    constructor(){}

    static calculateLabourCost(smv_value, factory_cpm_value){    

        let labourCost = Number(smv_value) * Number(factory_cpm_value);

        return labourCost;
    }

    static calculateCorporateCost(smv_value, front_cpm_value){
        let corporateCost = Number(smv_value) * Number(front_cpm_value);

        return corporateCost;
    }

    static calculateRequiredQty(order_qty_value, conpc_value, wastage_value){

        let req_qty = order_qty_value * conpc_value;
        let tot_req_qty = ((req_qty * wastage_value)/100 + req_qty);

        return tot_req_qty;
    }

    static calculateItemValue(req_qty_value, unitprice_value){

        let total_value = req_qty_value * unitprice_value;

        return total_value;
    }

    static calculateFinanceCost(finPerc_value, totRmCost_value){

        let financeCost = (totRmCost_value/100)*finPerc_value;

        return financeCost;
    }

    static calculateEPM(fob_value, RM_value, SMV_value){

        let epmValue = (fob_value - RM_value)/SMV_value;

        return epmValue;

    }

    static calculateNP(fob_value, totalCost){

        let npValue = ((fob_value - totalCost)/fob_value)*100;

        return npValue;

    }

    static calculateManufacturingCost(totRMCost_value, labourCost_value){

        let manufacturingCost = totRMCost_value + labourCost_value;
        return manufacturingCost;
    }

    static calculateTotalCost(manuCost_value, financeCost_value, corporateCost_value){
        
        let totalCost = manuCost_value + financeCost_value + corporateCost_value;

        return totalCost
    }

    


} 
