import { Custard } from "@discolabs/custard-js";
import { changeMarketingText } from './marketing';
import { ShippingInformation } from './pickuplist';
window.custard = new Custard([changeMarketingText, ShippingInformation]);