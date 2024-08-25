import mongoose from "mongoose";
import Inventory from "../../models/inventory";
import constants from "../../utils/constants";
import Product from "../../models/product";

export const createProducts = async (
    productDetail: any,
    units: any,
    locationId: any
  ) => {
    try {
      const currentInventoryOfCompA: any = await Inventory.findOne({
        productId: new mongoose.Types.ObjectId(
          productDetail.base_paint_one.productId
        ),
        locationId: locationId,
        isDeleted: false,
      });
  
      const componentAdetail: any = await Product.findOne({
        _id: new mongoose.Types.ObjectId(productDetail.base_paint_one.productId),
        isDeleted: false,
      });
  
      const currentInventoryOfCompB: any = await Inventory.findOne({
        productId: new mongoose.Types.ObjectId(
          productDetail.base_paint_two.productId
        ),
        locationId: locationId,
        isDeleted: false,
      });
  
      const componentBdetail: any = await Product.findOne({
        _id: new mongoose.Types.ObjectId(productDetail.base_paint_two.productId),
        isDeleted: false,
      });
  
      if (!componentAdetail || !componentBdetail) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: `missing details for component A or Component B`,
        };
      }
  
      const currentTinterInventory: any[] = await Promise.all(
        productDetail.tinters.map(
          async (tinter: any) =>
            await Inventory.findOne({
              productId: new mongoose.Types.ObjectId(tinter.productId),
              locationId: locationId,
              isDeleted: false,
            })
        )
      );
  
      if (currentTinterInventory.includes(null)) {
        return {
          statusCode: constants.code.dataNotFound,
          message: "Product not found",
          status: constants.status.statusFalse,
        };
      }
  
      const alterQuantityOfCompA = units * productDetail?.base_paint_one?.weight.value;
      const alterQuantityOfCompB = units * productDetail.base_paint_two?.weight?.value;
      let alterQuantityOfTinters: any;
  
      for (const [index, currentQuantityOfTinter] of currentTinterInventory.entries()) {
        alterQuantityOfTinters = units * productDetail.tinters[index]?.weight?.value;
  
        if (alterQuantityOfTinters > currentQuantityOfTinter.totalWeight.totalActualQuantity) {
          //find the tinter detail to show te name of insufficient tinter
          const tinter: any = await Product.findOne({
            _id: new mongoose.Types.ObjectId(currentQuantityOfTinter?.productId),
          });
          throw {
            statusCode: constants.code.dataNotFound,
            message: `Insufficient quantity of  ${tinter?.name} need ${Math.ceil(
              alterQuantityOfTinters - currentQuantityOfTinter.totalWeight.totalActualQuantity
            )} litres more`,
          };
        }
        //  await updateInventoryInFIFO(currentQuantityOfTinter, alterQuantityOfTinters);
      }
  
      if (alterQuantityOfCompA > currentInventoryOfCompA?.totalWeight?.totalActualQuantity) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: `Insufficient Quantity of ${
            componentAdetail.name
          }, need ${Math.ceil(
            alterQuantityOfCompA - currentInventoryOfCompA?.totalWeight?.totalActualQuantity
          )} litres more`,
        };
      } else if (
        alterQuantityOfCompB > currentInventoryOfCompB?.totalWeight?.totalActualQuantity
      ) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: `Insufficient Quantity of ${
            componentBdetail.name
          }, need ${Math.ceil(
            alterQuantityOfCompB - currentInventoryOfCompB?.totalWeight?.totalActualQuantity
          )} litres more`,
        };
      }
  
      //for updation of quantity of tinters using anothor loop to firstly verify that both tinters are
      // available in sufficient quantity in inventory after that start the db transaction
      for (let i = 0; i < currentTinterInventory.length; i++) {
        await updateInventoryInFIFO(
          currentTinterInventory[i],
          alterQuantityOfTinters,
          "tinter"
        );
      }
  
      await updateInventoryInFIFO(currentInventoryOfCompA, alterQuantityOfCompA, `CompA`);
      const updatedComponentB: any = await updateInventoryInFIFO(
        currentInventoryOfCompB,
        alterQuantityOfCompB,
        `CompB`
      );
      if (!updatedComponentB) {
        return {
          status: constants.status.statusFalse,
          outputBatchNumber: null,
          message: constants.message.internalServerError,
        };
      } else {
        return {
          status: constants.status.statusTrue,
          outputBatchNumber: updatedComponentB.outputbatchNumber,
          message: constants.message.success,
        };
      }
    } catch (error: any) {
      console.log("err1",error);
      
      return { status: constants.status.statusFalse, message: error.message };
    }
  };
  
 export const updateInventoryInFIFO = async (
    inventory: any,
    requiredUnits: number,
    productType: string
  ) => {
    try {
      let outputProductBatchNumber: any = null;
      if (inventory.reservedUnit.value >= requiredUnits) {
        inventory.reservedUnit.value -= requiredUnits;
        if (productType == `CompB`) {
          outputProductBatchNumber = inventory?.batch[0]?.batchNumber;
          inventory.reservedUnit.batchNumber= inventory?.batch[0]?.batchNumber;
        }
      } else {
        let remainingUnits = requiredUnits - inventory.reservedUnit.value;
        let remainingPacks = Math.ceil(
          remainingUnits / inventory.batch[0].quantityInPack
        );
        inventory.reservedUnit.value = 0;
  
        inventory.batch.sort(
          (a: any, b: any) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
  
        let totalRemovedPacks:any = 0;
  
        for (const batch of inventory.batch) {
          if (remainingPacks <= 0) break;
          const packsToRemove = Math.min(batch.numberOfunits, remainingPacks);
  
          //update nmbr of units ,batchQuantity , productQuantity in each batch
  
          batch.numberOfunits -= packsToRemove;
          batch.weight.batchQuantity -= packsToRemove * batch.packSize;
          batch.weight.productQuantity -= packsToRemove * batch.quantityInPack;
  
          totalRemovedPacks += packsToRemove;
          remainingPacks -= packsToRemove;
  
          if (batch.numberOfunits <= 0 && inventory.batch.length > 1) {
            inventory.batch = inventory.batch.filter(
              (b: any) => b.batchNumber !== batch.batchNumber
            );
          }
        }
        //update totalBatchQuantity,reservedUnit,totalActualQuantity,totalPacks in main inventory
  
        if (productType == `CompB`) {
          outputProductBatchNumber = inventory?.batch[0]?.batchNumber;
          inventory.reservedUnit.batchNumber = outputProductBatchNumber;
        }
        const adjustedReservedUnitValue: any = Number(
          (
            totalRemovedPacks * inventory.batch[0].quantityInPack -
            remainingUnits
          ).toFixed(3)
        );
        inventory.reservedUnit.value = Math.max(0, adjustedReservedUnitValue);
  
        inventory.totalWeight.totalBatchQuantity -=
          totalRemovedPacks * inventory.batch[0].packSize.toFixed(3);
        inventory.totalWeight.totalActualQuantity -=
          totalRemovedPacks * inventory.batch[0].quantityInPack.toFixed(3);
        inventory.totalWeight.totalPacks -= totalRemovedPacks.toFixed(3);
      }
  
     
    //  const  savedInventory:any = await inventory.save()
    //   if (!savedInventory) {
    //     throw {
    //       status: constants.status.statusFalse,
    //       message: `Error in saving inventory for ${productType}`,
    //     };
    //   } else {
    //     return {
    //       status: constants.status.statusTrue,
    //       outputbatchNumber: outputProductBatchNumber,
    //     };
    //   }

    const savedInventory = await Inventory.findByIdAndUpdate(
      inventory._id,
      {
        $set: {
          batch: inventory.batch,
          reservedUnit: inventory.reservedUnit,
          totalWeight: inventory.totalWeight,
        },
      },
      { new: true }
    );

    if (!savedInventory) {
      throw {
        status: constants.status.statusFalse,
        message: `Error in saving inventory for ${productType}`,
      };
    } else {
      return {
        status: constants.status.statusTrue,
        outputbatchNumber: outputProductBatchNumber,
      };
    }
  } catch (error: any) {
    console.log(error);
    return false;
  }

  };
