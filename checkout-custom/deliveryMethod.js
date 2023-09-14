import { CustardModule, STEP_CONTACT_INFORMATION } from "@discolabs/custard-js";
export class deliveryMethod extends CustardModule {
    id() {
        return 'delivery-method';
    }
    steps() {
        return [STEP_CONTACT_INFORMATION];
    }
    selector() {
        return '[data-shipping-address]';
    }
    setup() {
        this.$element.find('.delivery-method-list').html(this.options.html_templates.delivery_method);
    }
}