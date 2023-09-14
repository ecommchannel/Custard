import {
    CustardModule,
    STEP_CONTACT_INFORMATION,
    STEP_PAYMENT_METHOD,
} from "@discolabs/custard-js";

export class ContactInformationInit extends CustardModule {
    id() {
        return "contact-information";
    }

    steps() {
        return [STEP_CONTACT_INFORMATION];
    }

    selector() {
        return "[data-delivery-pickup-info]";
    }

    setup() {
        const hiddenClass = "hidden";
        const loadingClass = "btn--loading";
        const disabledClass = "btn--disabled";
        const namespace = "load-location-btn";
        const btnSelector = "[data-load-location-btn]";
        const pickupOptionNotFoundSelector = "[data-pickup-options-none-found]";
        const locationListSelector = "[data-location-list-display]";
        const sectionContentQuery = this.$element.find(".section__content");
        const shippingInputSelector = "[data-delivery-radio-button]";
        const continueBtnSelector = "#continue_button";
        const btnDisabledBtnClass = "btn--disabled";
        const locationItemInputSelector = "[data-location-items]";
        const itemlListSelector = "[data-item-list]";
        const optionItemSelector = "[data-option-item]";
        const continueContentSelector = "[data-continue-button-content]";
        const stepFooterSelector = ".step__footer";
        const pickUpSelector = "#checkout_pick_up_in_store_selected";
        const contactInformationFormSelector = "[data-customer-information-form]";
        const deliveryInputSelector = "#checkout_id_delivery-shipping";
        const pickUpInputSelector = "#checkout_id_delivery-pickup";
        const addressFieldsSelector = ".address-fields";
        const pickupOptionAdditonalDetailSelector =
            ".pickup-options-additional-details";
        const pannelPickupSelector = "#panel-pickup";
        const defaultFetchData = {
            AffiliateExternalID: "2216",
        };
        const defaulFetchString =
            new URLSearchParams(defaultFetchData).toString() +
            "&ProcessingOptions=AllSuppliers=true|AllItemsAvailable%3Dfalse%7CDistanceMetric%3D1%7CShowOnlyPickupLocation=true";
        const baseUrl =
            "https://omniproxy.goldenabc.com/api/endpoints/getproductinventoryaroundlocation/call";
        let cartItemsInventoriesAtDC;
        /**
         * Async Get the inventory
         * @property {string} geocode
         * @return {Promise}
         */
        const getInventoryByLocation = async function () {
            const cartItemsStr = buildUrlFromCartItems();
            const locationStr = buildUrlFromLocation();
            const url = `${baseUrl}?${defaulFetchString}&${cartItemsStr}&${locationStr}`;
            var jsonObj = {};
            try {
                const response = await fetch(url);
                const text = await response.text();
                var xmlText = text;
                var x2js = new X2JS();
                jsonObj = x2js.xml_str2json(xmlText);
            } catch (err) {
                console.log('err in get inventories by location', err)
            }
            return jsonObj;
        };
        const getAllSupplier = async function () {
            var result;
            try {
                const url =
                    "https://omnistorelocations.goldenabc.com/storelocations/Shopify/Api/GetStoreLocations?brand=penshoppe";
                const response = await fetch(url);
                const json = await response.json();
                return json.message;
            } catch (err) {
                console.log('err on fetch all store locations', err)
            }
        };
        /**
         * Build the productpartno parameters
         * @returns
         */
        const buildUrlFromCartItems = function () {
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
        /**
         * Build the location parameters
         */
        const buildUrlFromLocation = function () {
            const searchRadias = getSearchRadiasStr();
            return `${searchRadias}&${getPostCodeAndCountryStr()}`;
        };
        /**
         * Get the search radius from the address from
         * @returns
         */
        const getSearchRadiasStr = function () {
            let result = "";
            if (window.localStorage.getItem("address")) {
                const address = JSON.parse(window.localStorage.getItem("address"));
                const radiusValue = address.radias;
                return `SearchRadias=${radiusValue || 20000}`;
            }
            return `SearchRadias=20000`;
        };
        /**
         * Get the poscode from the address
         */
        const getPostCodeAndCountryStr = function () {
            const address = JSON.parse(window.localStorage.getItem("address"));
            return `SourcePostalCode=${address.postcode || address.zip
                }&SourceCountry=${address.country || "Philippines"}`;
        };
        /**
         * Build Inventory Option
         * @params
         * @returns {string}
         */
        const buildInventoryListHtml = async function (ProductSupplier = []) {
            let localSuppliers = [...ProductSupplier]
            let result = "";
            for (var i = 0, l = localSuppliers.length; i < l; i++) {
                const curr = localSuppliers[i];
                // result += await buildIventoryOption(curr);
                const obj = await buildIventoryOption(curr);
                curr.html_str = obj.html_str;
                curr.hasUnAv = obj.hasUnAv;
            }
            localSuppliers.sort((a, b) => {
                const hasUnAv1 = Number(a.hasUnAv);
                const hasUnAv2 = Number(b.hasUnAv);
                const isAll1 = Number(a.isAllItemsAvailable)
                const isAll2 = Number(b.isAllItemsAvailable)
                if (isAll1 == isAll2) {
                    if (hasUnAv1 === hasUnAv2) {
                        return Number(a.SupplierDistance) - Number(b.SupplierDistance);
                    }
                    return hasUnAv1 - hasUnAv2;
                }
                return hasUnAv1 - hasUnAv2;
            })
            result = localSuppliers.reduce((prev, curr) => prev + curr.html_str, '')
            return result;
        };

        const lookUpCartItem = function (products = [], sku = "") {
            return products.some(
                ({ ProductPartNo }) => String(sku) === String(ProductPartNo)
            );
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
            return this.options.html_templates.table_product
                .replace(/%tr%/g, tableRow)
                .replace(
                    /%item%/g,
                    isAv
                        ? `data-shipped-items='${JSON.stringify(items)}'`
                        : `data-items='${JSON.stringify(items)}'`
                );
        };
        const buildItemsParams = function (items) {
            const dataString = items.reduce(
                (prev, curr, currIndex) =>
                    prev +
                    curr.sku +
                    " | " +
                    curr.quantity +
                    (currIndex === items.length - 1 ? "" : ","),
                ""
            );
            return `PartnoOrOptionValueAndQty=${encodeURIComponent(dataString)}`;
        };
        const getOptionItems = async function (items = []) {
            const baseUrl = `https://omniproxy.goldenabc.com/api/endpoints/getinventorybyproductpartnooroptionvalue/call?AffiliateExternalID=2216&SupplierFullNames=2137&ProcessingOptions=SearchByUPC%3Dfalse&${buildItemsParams(
                items
            )}`;
            const response = await fetch(baseUrl);
            const text = await response.text();
            var xmlText = text;
            var x2js = new X2JS();
            var jsonObj = x2js.xml_str2json(xmlText);
            let shippedProductObject = {};
            let unAvailableProductObject = {};
            const {
                ProductSuppliers: { ProductSupplier },
            } = jsonObj;
            if (Array.isArray(ProductSupplier)) {
                ProductSupplier.map((productSup) => {
                    let Product = productSup.Products.Product;
                    Product = Array.isArray(Product) ? Product : [Product];
                    getShippedNUnavItems(
                        Product,
                        unAvailableProductObject,
                        shippedProductObject
                    );
                });
            } else {
                let Product = jsonObj.ProductSuppliers.ProductSupplier.Products.Product;
                Product = Array.isArray(Product) ? Product : [Product];
                getShippedNUnavItems(
                    Product,
                    unAvailableProductObject,
                    shippedProductObject
                );
            }
            return {
                shippedProduct: Object.values(shippedProductObject),
                unAvailableProduct: Object.values(unAvailableProductObject),
            };
        };
        const getShippedNUnavItemsBK = (
            Product = [],
            unAvailableProductObject,
            shippedProductObject,
            unAvItems
        ) => {
            if (Product.length) {
                Product.map((pro) => {
                    const cartItem = CartItems.find(
                        (item) => item.sku == pro.ProductPartNo
                    );
                    if (pro.ProductQTY < cartItem.quantity) {
                        if (!shippedProductObject[cartItem.variant_id]) {
                            unAvailableProductObject[cartItem.variant_id] = cartItem;
                        }
                    } else {
                        shippedProductObject[cartItem.variant_id] = {
                            ...cartItem,
                            isShipped: true,
                        };
                        delete unAvailableProductObject[cartItem.variant_id];
                    }
                });
            }
        };
        const getShippedNUnavItems = (
            Product = [],
            unAvailableProductObject,
            shippedProductObject,
            unAvItems = []
        ) => {
            if (unAvItems.length) {
                unAvItems.map(cartItem => {
                    const isAvailable = qualifyCartItem(Product, cartItem);
                    if (isAvailable) {

                        shippedProductObject[cartItem.variant_id] = {
                            ...cartItem,
                            isShipped: true,
                        };
                        delete unAvailableProductObject[cartItem.variant_id];
                    } else {
                        if (!shippedProductObject[cartItem.variant_id]) {
                            unAvailableProductObject[cartItem.variant_id] = cartItem;
                        }
                    }
                })
            }
        };
        /**
         * Build the Option item product table
         * @param {*} products
         * @returns
         */
        const buildOptionItems = async (products = []) => {
            const localProducts = [...products];
            let availableProduct = [];
            let unAvailableProduct = [];
            let shippedProduct = [];
            window.CartItems.map((item) => {
                const isAvailable = qualifyCartItem(localProducts, item);
                if (isAvailable) {
                    availableProduct.push(item);
                } else {
                    unAvailableProduct.push(item);
                }
            });
            if (unAvailableProduct.length) {
                const optionItems = await getOptionItemsNew(unAvailableProduct);
                shippedProduct = optionItems.shippedProduct;
                unAvailableProduct = optionItems.unAvailableProduct;
            }

            let result = this.options.html_templates.pickup_options_items;
            if (shippedProduct.length) {
                const availableTable = buildTableProduct(shippedProduct, true);
                result = result.replace(/%av_table%/g, availableTable);
            } else {
                result = result
                    .replace(/%av_table%/g, "")
                    .replace(/%items_av%/g, "hidden");
            }
            if (unAvailableProduct.length) {
                const unAvailableTable = buildTableProduct(unAvailableProduct);
                result = result.replace(/%unav_table%/g, unAvailableTable);
            } else {
                result = result.replace(/%items_unav%/g, "hidden");
            }
            if (unAvailableProduct.length === products.length) {
                result = "";
            }
            return { html_str: result, hasUnAv: unAvailableProduct && unAvailableProduct.length };
        };
        const convertSpecialCharacter = (str = "") => str.replace(/"/g, "");
        const qualifyCartItem = (products = [], cartItem) => {
            const product = products.find(
                (pro) =>
                    String(cartItem.sku) === String(pro.ProductPartNo) &&
                    Number(cartItem.quantity) <= Number(pro.ProductQTY)
            );

            return product;
        };
        /**
         * Build the inventory option html
         * @param {*} obj
         * @returns
         */
        const buildIventoryOption = async (obj = {}) => {
            const {
                SupplierAddress,
                SupplierCity,
                SupplierFullName,
                SupplierPostalCode,
                SupplierStateProvince,
                SupplierCompanyName,
                Note,
                isAllItemsAvailable,
            } = obj;
            let {
                Products: { Product },
            } = obj;
            let optionItems = null;
            Product = Array.isArray(Product) ? Product : [Product];
            /**Check if all items available */
            let result = this.options.html_templates.pickup_option
                .replace(/%id%/g, SupplierFullName)
                .replace(/%title%/g, SupplierCompanyName)
                .replace(/%city%/g, SupplierCity)
                .replace(/%street%/g, convertSpecialCharacter(SupplierAddress))
                .replace(/%zip%/g, SupplierPostalCode)
                .replace(/%province%/g, SupplierStateProvince)
                .replace(/%items_av%/g, isAllItemsAvailable ? "" : hiddenClass)
                .replace(/%some_items_av_title%/g, isAllItemsAvailable ? hiddenClass : "")
                .replace(/%some_items_av_subtext%/g, isAllItemsAvailable ? hiddenClass : "%some_items_av_subtext%")
                // .replace(/%isAll%/g, isAllItemsAvailable ? "is-all" : "")
                .replace(/%sla%/g, isAllItemsAvailable ? window.sla.all_av : (Note || 'Click & Collect within 2 days'));
            if (isAllItemsAvailable) {
                result = result.replace(/%isAll%/g, 'is-all')
            } else {
                optionItems = await buildOptionItems(Product);
                if (!optionItems.hasUnAv) {
                    result = result.replace(/%some_items_av_subtext%/g, hiddenClass);
                } else {
                    result = result.replace(/%items_av_subtext%/g, hiddenClass);
                }
                if (optionItems && optionItems.html_str) {
                    result += optionItems.html_str;
                    if (optionItems.hasUnAv) {
                        result = result.replace(/%isAll%/g, 'error')
                    }
                } else {
                    result = '';
                }
            }
            return { html_str: result, hasUnAv: isAllItemsAvailable ? false : optionItems.hasUnAv };
        };
        /**
         * Hanlder clicking continue btn
         * @param {Event} evt
         */
        const onClickContinueBtn = async (evt) => {
            const self = this.$(continueBtnSelector);
            const isPickUp = this.$(pickUpSelector).val() == "true";
            const dataItems = this.$("[data-items]:visible").data("items");
            const dataShippedItems = this.$("[data-shipped-items]:visible").data(
                "shipped-items"
            );
            self.addClass(`${loadingClass} ${disabledClass}`);
            let res;
            evt.preventDefault();
            if (isPickUp) {
                self.addClass(`${loadingClass} ${disabledClass}`);
                res = await updateItemFullfilledByDC(dataShippedItems)
                if (dataItems) {
                    res = await removeUnavItemAndContinue(dataItems, res);
                }
            } else {
                res = await updateItemFullfilledByDC(null, res);
            }
            cachedCartItems(res ? res.items : {});
            cacheAddress();
            const _res = await getCartItems();
            reloadCartItemsNGoToPayment(true);
        };
        /**
         * @typedef {object} Address
         * @property {string} province
         * @property {string} prov_id
         * @property {string} zip
         * @property {string} city
         * @property {string} city_id
         * @property {string} barangay
         * @property {string} brgy_id
         * @property {string} radias
         */
        /**
         * Save address in localStorage
         * @returns {null}
         */
        const cacheAddress = () => {
            let /** @type Address */ obj = {}
            const provinceEl = this.$('#checkout_shipping_address_province');
            const cityEl = this.$('#custom-city-select');
            const brgyEl = this.$('#custom-bangaray-select');
            const zipEl = this.$('#checkout_shipping_address_zip');
            const province = provinceEl.find('option:selected').text();
            const prov_id = provinceEl.val();
            const city = cityEl.val();
            const barangay = brgyEl.val();
            const zip = zipEl.val();

            // Only save new address when all the property is not null
            if (province && city && barangay && zip) {
                const /** @type {Address} */currentAddress = JSON.parse(window.localStorage.getItem('address'));
                const { radias } = currentAddress ? currentAddress : "20000";
                const /** @type Address */ address = { province, prov_id, city, city_id: city, barangay, brgy_id: barangay, radias, zip }

                window.localStorage.setItem('address', JSON.stringify(address))
            }
        }
        const getCartItems = async () => {
            const res = await fetch(window.location.origin + "/cart.js");
            return await res.json();
        };
        const updateItemFullfilledByDC = async (dataShippedItems) => {
            let res;
            const { items } = await getCartItems();
            const _items = items.map((item, index) => {
                return {
                    id: item.key,
                    quantity: item.quantity,
                    properties: {
                        _fulfilled_by_dc: getFullfilledByDC(item, dataShippedItems),
                    },
                };
            });
            // try to add ifram to reload the cart every time call the json.
            for (var i = 0, l = _items.length; i < l; i++) {
                const item = _items[i];
                try {
                    res = await fetch(window.location.origin + "/cart/change.js", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(item),
                    });
                    res = await res.json();
                } catch (e) {
                    console.log(e);
                }
            }
            return res;
        };
        const reloadCartItemsNGoToPayment = (shouldRedirect) => {
            let iframe = document.createElement("iframe");
            iframe.setAttribute(
                "src",
                `${window.location.href}?step=contact_information`
            );
            iframe.style.display = "none";
            if (shouldRedirect) {
                iframe.onload = () =>
                    setTimeout(() => {
                        goToPaymentStep();
                    }, 1000);
            }
            document.body.appendChild(iframe);
        };
        const cachedCartItems = (items = []) =>
            window.localStorage.setItem("cachedItems", JSON.stringify(items));
        const goToPaymentStep = () =>
            this.$("[data-customer-information-form]").submit();
        const getFullfilledByDC = (cartItem, dataShippedItems) => {
            if (!dataShippedItems) {
                return false;
            }
            const shippedItem = dataShippedItems.some(
                (shippedItem) => shippedItem.sku === cartItem.sku
            );
            return shippedItem;
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
        const removeUnavItemAndContinue = async (items) => {
            const updateObject = buildUpdateObject(items);
            let res;
            res = await fetch("https://" + Shopify.Checkout.apiHost + "/cart/update.js", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ updates: updateObject }),
            });
            res = await res.json();
            return res;
        };
        /**Sorting the Supplier by the product qty and the supplier distance */
        const sortingSupplier = (a, b) => {
            const number1 = Number(a.isAllItemsAvailable);
            const number2 = Number(b.isAllItemsAvailable);
            if (number1 === number2) {
                return Number(a.SupplierDistance) - Number(b.SupplierDistance);
            }
            return number2 - number1;
        };
        const getSuppliers = async (inventoryObj = []) => {
            if (!this.allSupplier) {
                this.allSupplier = await getAllSupplier();
            }
            const { ProductSuppliers = {} } = inventoryObj;
            let { ProductSupplier = [] } = ProductSuppliers;
            if (!Array.isArray(ProductSupplier)) {
                ProductSupplier = [ProductSupplier];
            }
            let result = ProductSupplier.map((obj) => {
                const foundSupplier = this.allSupplier.find((sup) => {
                    return sup.siteId === Number(obj.SupplierFullName);
                });
                const SupplierNote = getSupplierNote(foundSupplier);
                return {
                    ...obj,
                    SupplierCompanyName: foundSupplier ? foundSupplier.Title : "",
                    Note: SupplierNote,
                    isAllItemsAvailable: qualifyProduct(obj),
                };
            });
            result = result.sort(sortingSupplier);
            return result;
        };
        const getSupplierNote = (sup = {}) => {
            const { Notes = "" } = sup;
            return Notes.split(",")[0].trim();
        };
        /**
         * Handle clicking show location button
         * @param {*} evt
         */
        const onClickShowOptionBtn = async (evt) => {
            const self = this.$(evt.target);
            self.addClass(`${loadingClass} ${disabledClass}`);
            const inventory = await getInventoryByLocation();
            cartItemsInventoriesAtDC = cartItemsInventoriesAtDC || await getCartItemsInventoriesFromDC();
            let ProductSupplier = (await getSuppliers(inventory)) || [];
            const isEmptyData = !ProductSupplier.length;
            if (isEmptyData) {
                this.$(pickupOptionNotFoundSelector).removeClass(hiddenClass);
            } else {
                const InventoryList = this.$(locationListSelector);
                ProductSupplier = Array.isArray(ProductSupplier)
                    ? ProductSupplier
                    : [ProductSupplier];
                const inventoryHtml = await buildInventoryListHtml(ProductSupplier);
                if (inventoryHtml) {
                    InventoryList.html(inventoryHtml);
                    InventoryList.removeClass(hiddenClass);
                } else {
                    this.$(pickupOptionNotFoundSelector).removeClass(hiddenClass);
                }
            }
            self
                .addClass(hiddenClass)
                .removeClass(`${loadingClass} ${disabledClass}`);
        };
        /**Get UnAvPro
         * @return {boolean}
         */
        const qualifyProduct = (supplier) => {
            const _products = getProductFromSupplier(supplier);
            return _products.every((pro) => {
                return window.CartItems.find((item) => {
                    return String(item.sku) === String(pro.ProductPartNo) && Number(item.quantity) <= Number(pro.ProductQTY);
                });
            });
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
        const getPickupPanelSelector = () => {
            if (this.$(pannelPickupSelector).length) {
                return pannelPickupSelector;
            }
            return "[data-delivery-pickup-info]";
        };
        const appendStoreAdditionalFields = (input) => {
            const $element = this.$(getPickupPanelSelector());
            const template =
                this.options.html_templates.pickupStoreDetailsAdditionalFields
                    .replace(/%title%/g, input.dataset.locationTitle)
                    .replace(/%id%/g, input.dataset.locationHandle)
                    .replace(/%street%/g, input.dataset.locationStreet)
                    .replace(/%city%/g, input.dataset.locationCity)
                    .replace(/%province%/g, input.dataset.locationProvince)
                    .replace(/%zip%/g, input.dataset.locationZip)
                    .replace(/%timestamp%/g, new Date());

            this.$(pickupOptionAdditonalDetailSelector).remove();
            $element.append(template);
        };
        /**
         * Handle clicking option item
         * @param {*} evt
         */
        const onCLickLocationInput = (evt) => {
            const el = this.$(evt.target);
            const elWrapperQuery = el.closest(optionItemSelector);
            const nextListItemQuery = elWrapperQuery.next("[data-item-list]");
            const isAll =
                !nextListItemQuery.length ||
                (nextListItemQuery.length &&
                    nextListItemQuery.find(".unav-list").hasClass("hidden"));

            const allItemList = elWrapperQuery.siblings(itemlListSelector);
            allItemList.addClass(hiddenClass);
            const elItemList = elWrapperQuery.next(itemlListSelector);
            elItemList.removeClass(hiddenClass);
            setBtnDisabled(false);
            if (!isAll) {
                updateContinueBtnText(
                    "",
                    elItemList.find("[data-items]").data("items"),
                    elItemList.find("[data-shipped-items]").data("shipped-items")
                );
            } else {
                updateContinueBtnText(window.translation.continue_to_payment);
            }
            this.$(stepFooterSelector).removeClass(hiddenClass);
            appendStoreAdditionalFields(evt.target);
            window.CheckoutSupplierId = el.data("location-handle");
        };

        /**
         * Handle clicking shipping input
         * @param {*} evt
         */
        const onClickShippingInput = (evt) => {
            const el = this.$(evt.target);
            const isPickup = el.val() === "delivery-pickup";
            setBtnDisabled(isPickup);
            this.$(stepFooterSelector)[isPickup ? "addClass" : "removeClass"](
                hiddenClass
            );
            this.$(continueBtnSelector).attr("type", isPickup ? "button" : "button");
            clearPickupInformation();
        };
        const clearPickupInformation = () => {
            const names = [
                "checkout[attributes][pickup_store_id]",
                "checkout[attributes][pickup_store_title]",
                "checkout[attributes][pickup_store_street]",
                "checkout[attributes][pickup_store_city]",
                "checkout[attributes][pickup_store_province]",
                "checkout[attributes][pickup_store_zip]",
                "checkout[attributes][pickup_timestamp]",
            ];
            names.map((name) => {
                const node = document.querySelector(`[name="${name}"]`);
                if (node) {
                    node.value = "";
                }
            });
            window.CheckoutSupplierId = "";
            // Un check store id
            const pickUpStoreIdInput = this.$('input[type="hidden"][name="checkout[attributes][pickup_store_id]"]');
            pickUpStoreIdInput.val("")
        };
        /**
         * Set the propery of continue button
         * @param {*} flag
         * @param {*} query
         */
        const setBtnDisabled = (flag, query) => {
            const continueBtnQuery = query || this.$(continueBtnSelector);
            continueBtnQuery[flag ? "addClass" : "removeClass"](
                btnDisabledBtnClass
            ).prop("disabled", flag);
        };

        /**
         * Update the continue button text
         * @param {*} text
         * @param {*} items
         */
        const updateContinueBtnText = (text = "", unAvItems, shippedItems) => {
            const continueBtnQuery = this.$(continueBtnSelector);
            const localText =
                text ||
                (window.translation
                    ? window.translation.continue_button_with_remove
                    : "");
            continueBtnQuery.find(continueContentSelector).html(localText);
        };

        const getOptionItemsNew = async function (unAvItems = []) {
            let shippedProductObject = {};
            let unAvailableProductObject = {};
            const jsonObj = cartItemsInventoriesAtDC;
            const {
                ProductSuppliers: { ProductSupplier },
            } = jsonObj;
            if (Array.isArray(ProductSupplier)) {
                ProductSupplier.map((productSup) => {
                    let Product = productSup.Products.Product;
                    Product = Array.isArray(Product) ? Product : [Product];
                    getShippedNUnavItems(
                        Product,
                        unAvailableProductObject,
                        shippedProductObject,
                        unAvItems
                    );
                });
            } else {
                let Product = jsonObj.ProductSuppliers.ProductSupplier.Products.Product;
                Product = Array.isArray(Product) ? Product : [Product];
                getShippedNUnavItems(
                    Product,
                    unAvailableProductObject,
                    shippedProductObject,
                    unAvItems
                );
            }
            return {
                shippedProduct: Object.values(shippedProductObject),
                unAvailableProduct: Object.values(unAvailableProductObject),
            };
        };
        const getCartItemsInventoriesFromDC = async function () {
            const baseUrl = `https://omniproxy.goldenabc.com/api/endpoints/getinventorybyproductpartnooroptionvalue/call?AffiliateExternalID=2216&SupplierFullNames=2137&ProcessingOptions=SearchByUPC%3Dfalse&${buildItemsParams(
                window.CartItems
            )}`;
            var jsonObj = {};
            try {

                const response = await fetch(baseUrl);
                const text = await response.text();
                var xmlText = text;
                var x2js = new X2JS();
                jsonObj = x2js.xml_str2json(xmlText);
            } catch (err) {
                console.log(`error why get items from dc`, err);
            }
            return jsonObj;
        }
        sectionContentQuery.append(
            this.options.html_templates.address_finder_no_location
        );
        sectionContentQuery.append(this.options.html_templates.settings);
        sectionContentQuery.append(this.options.html_templates.location_list);
        sectionContentQuery.append(this.options.html_templates.load_location_btn);
        sectionContentQuery.append(
            this.options.html_templates.pickup_options_not_found
        );

        this.$(document)
            .off(`click.${namespace}`)
            .on(`click.${namespace}`, btnSelector, onClickShowOptionBtn)
            .off(`click.${namespace}-shipping`)
            .on(
                `click.${namespace}-shipping`,
                shippingInputSelector,
                onClickShippingInput
            )
            .off(`click.${namespace}-option`)
            .on(
                `click.${namespace}-option`,
                locationItemInputSelector,
                onCLickLocationInput
            )
            .off(`click.${namespace}-continue`)
            .on(
                `click.${namespace}-continue`,
                continueBtnSelector,
                onClickContinueBtn
            )
            .on("page:load page:change", function () {
                window.addressFinderModal = new theme.Modals('AddressFinder', 'address-finder');
            });;

        this.$(addressFieldsSelector).prepend(
            this.options.html_templates.existingAttributes
        );
        //Fix Delivery method
        const isPickUp = this.$(pickUpSelector).val() == "true";
        if (isPickUp) {
            this.$(deliveryInputSelector).removeAttr("checked");
        } else {
            this.$(pickUpInputSelector).removeAttr("checked");
        }
        // Display showlocationbtn
        if (window.localStorage.getItem("address")) {
            this.$(btnSelector).removeClass(hiddenClass);
        }

    }
}
