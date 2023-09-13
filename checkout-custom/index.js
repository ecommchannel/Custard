import { Custard } from "@discolabs/custard-js";
import { changeMarketingText } from './marketing';
import { pickupstore } from './pickupstore';

window.custard = new Custard([changeMarketingText]);
window.custard = new Custard([pickupstore]);

