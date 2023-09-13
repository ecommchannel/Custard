import { CustardModule, STEP_CONTACT_INFORMATION } from "@discolabs/custard-js";
export class pickupstore extends CustardModule {
    id() {
        return 'pickup-store';
    }
    steps() {
        return [STEP_CONTACT_INFORMATION];
    }
    selector() {
        return '[data-pickup-tab-content]';
    }
    setup() {
        this.$element.find('.checkbox__label').html(this.options.html_templates.pickup_store);
    }
}