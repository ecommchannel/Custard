import { Custard } from "@discolabs/custard-js";
import { changeMarketingText } from './marketing';
import { pickUpList } from './pickuplist';
window.custard = new Custard([changeMarketingText, pickUpList]);