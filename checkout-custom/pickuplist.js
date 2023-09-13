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
        this.$element.find('.section__content1').html(this.options.html_templates.pickup_list);
    }
}