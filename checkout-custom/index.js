import { Custard } from "@discolabs/custard-js";
import { changeMarketingText } from './marketing';
import { removeExisting } from './removeExistingLocaton';
import { pickUpList } from './pickuplist';
import { Payment } from './payment';

window.custard = new Custard([changeMarketingText, removeExisting, pickUpList, Payment]);