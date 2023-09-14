import { Custard } from "@discolabs/custard-js";
import { changeMarketingText } from './marketing';
import { pickUpList } from './pickuplist';
import { deliveryMethod } from './deliveryMethod';
window.custard = new Custard([changeMarketingText, pickUpList, deliveryMethod]);