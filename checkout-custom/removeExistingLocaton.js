import { CustardModule, STEP_CONTACT_INFORMATION } from "@discolabs/custard-js";
export class removeExisting extends CustardModule {
    id() {
        return 'remove-existing';
    }
    steps() {
        return [STEP_CONTACT_INFORMATION];
    }
    selector() {
        return '[data-pickup-tab-content]';
    }
    setup() {
        setInterval(() => {
            this.$element.find('.content-box .content-box__row').html(this.options.html_templates.remove_existing);
        }, 100);

    }
}