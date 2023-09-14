import { CustardModule, STEP_CONTACT_INFORMATION } from "@discolabs/custard-js";
export class pickUpList extends CustardModule {
    id() {
        return 'pickup-list';
    }
    steps() {
        return [STEP_CONTACT_INFORMATION];
    }
    selector() {
        return '[data-pickup-tab-content]';
    }
    setup() {
        this.$element.find('[data-pickup-tab-content]').html(this.options.html_templates.pickup_list);
    }
}