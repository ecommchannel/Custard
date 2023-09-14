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
        this.$element.find('[data-delivery-pickup-info], .section__content').append(this.options.html_templates.pickup_list);

    }
}