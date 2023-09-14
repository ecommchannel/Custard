import { CustardModule, STEP_CONTACT_INFORMATION } from "@discolabs/custard-js";
export class pickUpList extends CustardModule {
    id() {
        return 'pickup-list';
    }
    steps() {
        return [STEP_CONTACT_INFORMATION];
    }
    selector() {
        return '[data-delivery-pickup-info]';
    }
    setup() {
        this.$element.find('.content-box .content-box__row').html(this.options.html_templates.pickup_list);

    }
}