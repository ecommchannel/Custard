import { CustardModule, STEP_CONTACT_INFORMATION } from "@discolabs/custard-js";
export class changeMarketingText extends CustardModule {
    id() {
        return 'marketing-text';
    }
    steps() {
        return [STEP_CONTACT_INFORMATION];
    }
    selector() {
        return '[data-buyer-accepts-marketing]';
    }
    setup() {
        this.$element.find('.checkbox__label').html(this.options.html_templates.marketing_text);
    }
}