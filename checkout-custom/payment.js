import { CustardModule, STEP_PAYMENT_METHOD } from "@discolabs/custard-js";
export class Payment extends CustardModule {
    id() {
        return 'payment';
    }
    steps() {
        return [STEP_PAYMENT_METHOD];
    }
    selector() {
        return '[data-step="' + STEP_PAYMENT_METHOD + '"]';
    }
    setup() {
        this.$element.find('.review-block__content').append(this.options.html_templates.pickupReviewDetailsBlock);
    }
}

