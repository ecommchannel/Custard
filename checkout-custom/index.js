import { Custard } from "@discolabs/custard-js";
import { changeMarketingText } from './marketing';
import { ContactInformationInit } from './deliveryMethod';
window.custard = new Custard([changeMarketingText, ContactInformationInit]);