// import { CustardModule, STEP_CONTACT_INFORMATION } from "@discolabs/custard-js";
// export class pickUpList extends CustardModule {
//     id() {
//         return 'pickup-list';
//     }
//     steps() {
//         return [STEP_CONTACT_INFORMATION];
//     }
//     selector() {
//         return '[data-delivery-pickup-info]';
//     }
//     setup() {
//         this.$element.find('.section__content1').html(this.options.html_templates.pickup_list);
//     }
// }

import {
    CustardModule,
    STEP_SHIPPING_METHOD,
    STEP_PAYMENT_METHOD,
} from "@discolabs/custard-js";

export class ShippingInformation extends CustardModule {
    id() {
        return "shipping-information-custom";
    }

    steps() {
        return [STEP_SHIPPING_METHOD];
    }

    selector() {
        return ".section--shipping-method";
    }

    setup() {
        if (window.maintenance_mode == false) {
            const buildItemsParams = function () {
                const dataString = window.CartItems.reduce(
                    (prev, curr, currIndex) =>
                        prev +
                        curr.sku +
                        " | " +
                        curr.quantity +
                        (currIndex === window.CartItems.length - 1 ? "" : ","),
                    ""
                );
                return `PartnoOrOptionValueAndQty=${encodeURIComponent(dataString)}`;
            };
            const baseUrl = `https://omniproxy.goldenabc.com/api/endpoints/getinventorybyproductpartnooroptionvalue/call?AffiliateExternalID=` + window.affiliate_id + `&SupplierFullNames=ALL&ProcessingOptions=SearchByUPC%3Dfalse&${buildItemsParams()}`;
            const hiddenClass = "hidden";
            const continueBtnSelector = "#continue_button";
            const continueContentSelector = "[data-continue-button-content]";
            const loadingClass = "btn--loading";
            const disabledClass = "disabled";
            const namespace = "shipping-infomation";

            const updateContinueBtnText = (text = "") => {
                const continueBtnQuery = this.$(continueBtnSelector);
                const localText =
                    text || window.translation
                        ? window.translation.continue_button_with_remove
                        : "";
                continueBtnQuery.find(continueContentSelector).html(localText);
                continueBtnQuery.addClass("remove-unavailable-items-and-continue-btn");
            };

            /**
             * Build the product table
             * @param {*} items
             * @param {*} isAv
             * @returns
             */
            const buildTableProduct = (items = [], isAv) => {
                const tableRow = items.reduce((prev, curr) => {
                    return (
                        prev +
                        this.options.html_templates.table_product_row
                            .replace(/%image%/g, curr.image)
                            .replace(/%quantity%/g, curr.quantity)
                            .replace(/%title%/g, curr.title)
                            .replace(/%variant_title%/g, curr.variant_title)
                            .replace(/%delete%/g, isAv ? hiddenClass : "")
                    );
                }, "");
                return this.options.html_templates.pickup_options_items_shipping
                    .replace(/%tr%/g, tableRow)
                    .replace(
                        /%item%/g,
                        isAv ? "" : `data-items='${JSON.stringify(items)}'`
                    );
            };
            /**
             * Build remove item object
             */
            const buildUpdateObject = function (items = []) {
                return items.reduce((prev, curr) => {
                    return { ...prev, [Number(curr.variant_id)]: 0 };
                }, {});
            };
            /**
             * Remove unavailable items
             * @param {*} items
             */
            const removeUnavItemAndContinue = (items) => {
                const updateObject = buildUpdateObject(items);
                const params = {
                    method: "POST",
                    data: { updates: updateObject },
                    url: "/cart/update.js",
                    dataType: "json",
                    beforeSend: () => {
                        this.$(continueBtnSelector).addClass(
                            `${loadingClass} ${disabledClass}`
                        );
                    },
                    success: (res) => {
                        let iframe = document.createElement("iframe");
                        iframe.setAttribute(
                            "src",
                            `${window.location.origin}/checkout/?step=${STEP_PAYMENT_METHOD}`
                        );
                        iframe.style.display = "none";
                        document.body.appendChild(iframe);
                        setTimeout(() => {
                            this.$("[data-shipping-method-form]").submit();
                        }, 2000);
                    },
                    error: (err) => {
                        alert("There was a problem removing unavailable item.");
                        this.$(continueBtnSelector).removeClass(
                            `${loadingClass} ${disabledClass}`
                        );
                        this.$(continueBtnSelector).off("click." + namespace);
                    },
                };
                this.$.ajax(params);
            };

            const getUnavProducts = (ProductSupplier = []) => {
                return ProductSupplier.map((pro) => {
                    const cartItem = CartItems.find(
                        (item) => item.sku == pro.ProductPartNo
                    );
                    if (pro.ProductQTY < cartItem.quantity) {
                        return cartItem;
                    }
                    return null;
                }).filter((item) => !!item);
            };
            /**
             * Get the poscode from the address
             */
            const getPostCodeAndCountryStr = () => {
                return `SourcePostalCode=${this.options.address.zip}&SourceCountry=${this.options.address.country}`;
            };
            /**
             * Build the location parameters
             */
            const buildUrlFromLocation = function () {
                return `SearchRadias=1609344&${getPostCodeAndCountryStr()}`;
            };

            const getInventoryByLocation = async function () {
                const cartItemsStr = buildItemsParams();
                const locationStr = buildUrlFromLocation();
                const defaultFetchData = {
                    AffiliateExternalID: window.affiliate_id,
                };
                const defaulFetchString =
                    new URLSearchParams(defaultFetchData).toString() +
                    "&ProcessingOptions=AllItemsAvailable%3Dfalse%7CDistanceMetric%3D1%7CShowOnlyPickupLocation=false";
                const baseUrl =
                    "https://omniproxy.goldenabc.com/api/endpoints/getproductinventoryaroundlocation/call";
                const url = `${baseUrl}?${defaulFetchString}&${cartItemsStr}&${locationStr}`;
                const response = await fetch(url);
                const text = await response.text();
                var xmlText = text;
                var x2js = new X2JS();
                var jsonObj = x2js.xml_str2json(xmlText);
                const { ProductSuppliers = {} } = jsonObj;
                const { ProductSupplier = [] } = ProductSuppliers;
                return Array.isArray(ProductSupplier)
                    ? ProductSupplier
                    : [ProductSupplier];
            };
            /**Get the product from the supplier */
            const getProductFromSupplier = function (supplier = {}) {
                const { Products = {} } = supplier;
                const { Product } = Products;
                if (Product) {
                    return Array.isArray(Product) ? Product : [Product];
                }
                return [];
            };
            const sortingSupplier = (a, b) => {
                const product1 = getProductFromSupplier(a);
                const porduct2 = getProductFromSupplier(b);
                if (product1.length === porduct2.length) {
                    return a.SupplierDistance - b.SupplierDistance;
                }
                return porduct2.length - product1.length;
            };
            const getNearestStore = async () => {
                const suppliers = (await getInventoryByLocation()) || [];
                return suppliers.sort(sortingSupplier)[0];
            };
            const onAjaxSuccess = (unavProducts = []) => {
                const html = buildTableProduct(unavProducts, true);

                this.$element.append(html);
                updateContinueBtnText();
                this.$(continueBtnSelector).on("click." + namespace, (evt) => {
                    evt.preventDefault();
                    removeUnavItemAndContinue(unavProducts);
                });
            };

            const handleUnav = (Supplier = {}, nearesSupplier) => {
                const Product = getProductFromSupplier(Supplier);
                let nearestSupplierProduct = [];
                if (nearesSupplier) {
                    nearestSupplierProduct = getProductFromSupplier(nearesSupplier);
                }
                if (Product || nearestSupplierProduct) {
                    const willUseProduct =
                        nearestSupplierProduct.length > Product.length
                            ? nearestSupplierProduct
                            : Product;
                    const unavProducts = getUnavProducts(willUseProduct) || [];
                    if (unavProducts.length) {
                        onAjaxSuccess(unavProducts);
                    }
                    this.$element.find(".section__content").removeClass(hiddenClass);
                    this.$element.find(".section__header").removeClass(hiddenClass);
                } else {
                    displayShippingNoneFound();
                }
                removeBtnLoading();
            };

            const displayShippingNoneFound = () => {
                this.$element.append(this.options.html_templates.shippingNoneFound);
                this.$element.find(".ption-none-found").classList.remove("hidden");
            };

            const removeBtnLoading = () => {
                const continueBtnQuery = this.$(continueBtnSelector);
                continueBtnQuery.removeClass(`${loadingClass} ${disabledClass}`);
            };
            this.$.ajax({
                url: baseUrl,
                method: "GET",
                dataType: "text",
                beforeSend: () => {
                    const continueBtnQuery = this.$(continueBtnSelector);
                    continueBtnQuery.addClass(`${loadingClass} ${disabledClass}`);
                    this.$element.find(".section__content").addClass(hiddenClass);
                    this.$element.find(".section__header").addClass(hiddenClass);
                },
                success: async (res) => {
                    var x2js = new X2JS();
                    var jsonObj = x2js.xml_str2json(res);
                    const { ProductSuppliers = {} } = jsonObj;
                    const {
                        ProductSupplier,
                        Response: { ResponseHasErrors = "false" },
                    } = ProductSuppliers;
                    const nearestStore = await getNearestStore();
                    if (!ProductSupplier || ResponseHasErrors === "true") {
                        if (this.options.shipping_address_zip) {
                            if (!nearestStore) {
                                displayShippingNoneFound();
                            } else {
                                handleUnav(nearestStore);
                            }
                        }
                    } else {
                        handleUnav(ProductSupplier, nearestStore);
                    }
                },
            });
        }
    }
}
