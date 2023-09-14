import { Custard } from "@discolabs/custard-js";
import { changeMarketingText } from './marketing';
import { pickUpList } from './pickuplist';
import { ContactInformationInit } from './deliveryMethod';
window.custard = new Custard([changeMarketingText, pickUpList, ContactInformationInit]);