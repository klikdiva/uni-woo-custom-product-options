'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* UniCpo
----------------------------------------------------------*/

var UniCpo = void 0,
    cpoMakeInstance = void 0;

UniCpo = {
    addToCartAjax: unicpo.ajax_add_to_cart,
    addToCartBtnEl: {},
    addToCartBtnSelector: '.single_add_to_cart_button, button.product_type_simple',
    addedToCartMsg: jQuery('<div class="woocommerce-message"><a href="' + wc_add_to_cart_params.cart_url + '" class="button wc-forward">' + wc_add_to_cart_params.i18n_view_cart + '</a> ' + unicpo_i18n.added_to_cart + '</div>'),
    calc: unicpo.calc_on,
    calcBtn: unicpo.calc_btn_on,
    cpo: unicpo.cpo_on,
    isTaxable: unicpo.taxable,
    fileUploadEl: {},
    flatpickrCfg: {},
    isFlexContainer: jQuery('.flex-viewport').length > 0,
    isLayeredOn: unicpo.layered_on,
    isSilentValidationOn: unicpo.silent_validation_on,
    mainImageChangers: jQuery('.uni-cpo-image-changer').get().reverse(),
    mainImageDefData: {},
    mainImageEl: '',
    orderingDsblMsgEl: jQuery('.js-uni-cpo-ordering-disabled-notice'),
    priceTagEl: {},
    priceStartingEl: jQuery('<span class="js-cpo-price-starting"></span>'),
    priceCalculateEl: jQuery('<span class="js-cpo-calculating"></span>'),
    productFormEl: {},
    progressEl: {},
    priceSuffix: unicpo.price_vars.price_suffix,
    priceTaxSuffixStarting: unicpo.price_vars.price_tax_suffix,
    pricePostfix: unicpo.price_vars.price_postfix,
    priceStarting: unicpo.price_vars.starting_price,
    taxPriceSuffixElClass: '.woocommerce-price-suffix',
    _pid: 0,
    _ajax_sent: false,
    _init: function _init() {
        try {
            if (this.cpo) {
                this.addToCartBtnEl = jQuery(this.addToCartBtnSelector);
                if (!this.addToCartBtnEl.length) {
                    console.info('Uni CPO @', 'Add to cart button is not found');
                }
                this.productFormEl = this.addToCartBtnEl.closest('form');
                if (!this.productFormEl.length) {
                    console.info('Uni CPO @', 'Product form is not found');
                } else {
                    this.productFormEl.attr('data-parsley-focus', 'none');
                }
                if (this.addToCartAjax && this.addToCartBtnEl.length > 0) {
                    this.addToCartBtnEl.attr('type', 'button');
                    this.addToCartBtnEl.addClass('uni_cpo_ajax_add_to_cart');
                }
                this.priceTagEl = jQuery(unicpo.price_selector);
                if (!this.priceTagEl.length) {
                    console.info('Uni CPO @', 'Price tag html element is not found');
                }
                this.priceStartingEl.html(this.getProperPrice());
                this.priceCalculateEl.html(unicpo_i18n.calc_text);

                if (!this.calc) {
                    this.setBtnState(true);
                }
                if (this.calc && this.calcBtn) {
                    this.setBtnState(true);
                    this.setPriceTo({ price: this.priceStartingEl });
                    this.bindOnCalcBtnClick();
                }
                this.bindOnAddToCartClick();
                this.initTooltip();
                this.initRangeSlider();
                this.bindOnFileUploadClick();
                this.bindOnMatrixCellClick();

                // initial calculation
                var cpoObj = this;
                var interval = setInterval(function () {
                    if (document.readyState === 'complete') {
                        clearInterval(interval);
                        if (!cpoObj.calc || cpoObj.calc && !cpoObj.calcBtn) {
                            cpoObj.processFormData();
                        } else if (cpoObj.calc && cpoObj.calcBtn) {
                            cpoObj.collectData(true);
                        }
                        cpoObj.mainImageEl = cpoObj.getMainImageEl();
                        cpoObj.mainImageDefData = cpoObj.getMainImageDefData();
                        cpoObj.changeMainImage();
                        jQuery(document.body).trigger('uni_cpo_frontend_is_ready');
                    }
                }, 100);

                
/* Premium Code Stripped by Freemius */


                this.bindOnRadioImageTap();
                this.bindOnRadioColourClick();
                this.bindOnOptionSelected();
                this.bindMainImageChange();
            }
        } catch (e) {
            console.error(e);
        }
    },
    addToCart: function addToCart(fields) {
        var data = {
            action: 'uni_cpo_add_to_cart',
            security: unicpo.security,
            data: fields
        };
        //console.log(data);
        this.ajaxCall(data);
    },
    ajaxCall: function ajaxCall(data) {
        var cpoObj = this;
        var form = cpoObj.productFormEl[0];
        var $wc = jQuery('div.woocommerce').not('.widget');

        jQuery.ajax({
            url: unicpo.ajax_url,
            data: data,
            dataType: 'json',
            method: 'POST',
            beforeSend: function beforeSend() {
                cpoObj._blockForm(form);

                if (cpoObj.calc) {
                    cpoObj.setPriceTo({ price: cpoObj.priceCalculateEl, tax: 'hide' });
                }
                if (cpoObj.addToCartAjax) {
                    $wc.find('.woocommerce-message').slideToggle(500, function () {
                        jQuery(this).remove();
                    });
                }
                // Triggers an event - on before send ajax request
                jQuery(document.body).trigger('uni_cpo_options_data_ajax_before_send', [data.data]);
            },
            error: function error() {
                cpoObj._unblockForm(form, 'error');
                cpoObj.setPriceTo({ price: cpoObj.priceStartingEl });
            },
            success: function success(r) {
                //console.log(r);
                if (r.success) {
                    cpoObj._unblockForm(form, 'success');

                    if (typeof r.data.redirect !== 'undefined') {
                        window.location = r.data.redirect;
                        return;
                    }

                    unicpo.formatted_vars = r.data.formatted_vars;
                    unicpo.nice_names_vars = r.data.nice_names_vars;
                    jQuery.extend(unicpo.price_vars, r.data.price_vars);
                    jQuery.extend(unicpo.extra_data, r.data.extra_data);

                    if (typeof r.data.extra_data !== 'undefined' && typeof r.data.extra_data.order_product !== 'undefined' && r.data.extra_data.order_product === 'disabled') {
                        cpoObj.orderingDsblMsgEl.slideDown(300);
                        cpoObj.setBtnState(true);
                    } else {
                        cpoObj.orderingDsblMsgEl.hide();
                        cpoObj.setBtnState(false);
                    }

                    if (cpoObj.calc) {
                        var calcPrice = cpoObj.getProperPrice({ price: unicpo.price_vars.price, doRemoveSuffix: true });
                        cpoObj.setPriceTo({ price: calcPrice, tax: 'show' });
                    }

                    if (typeof r.data.fragments !== 'undefined') {
                        // Redirect to cart option
                        if (wc_add_to_cart_params.cart_redirect_after_add === 'yes') {
                            window.location = wc_add_to_cart_params.cart_url;
                            return;
                        }

                        $wc.html(cpoObj.addedToCartMsg);

                        jQuery.each(r.data.fragments, function (key, value) {
                            jQuery(key).replaceWith(value);
                        });

                        // Trigger event so themes can refresh other areas.
                        jQuery(document.body).trigger('uni_cpo_added_to_cart', [r.data]);
                    } else {
                        // Triggers an event - on successful ajax request
                        jQuery(document.body).trigger('uni_cpo_options_data_ajax_success', [data.data, r.data]);
                    }
                } else {
                    cpoObj._unblockForm(form, 'error');
                    if (cpoObj.calc) {
                        cpoObj.setPriceTo({ price: cpoObj.priceStartingEl });
                    }

                    if (r.product_url) {
                        window.location = response.product_url;
                        return;
                    }

                    // Triggers an event - on failure ajax request
                    jQuery(document.body).trigger('uni_cpo_options_data_ajax_fail', [data.data, r]);
                }
            }
        });
    },
    bindMainImageChange: function bindMainImageChange() {
        
/* Premium Code Stripped by Freemius */

    },
    bindOnAddToCartClick: function bindOnAddToCartClick() {
        var cpoObj = this;

        if (!this.addToCartAjax) {
            jQuery(document).on('click', this.addToCartBtnSelector, function (e) {
                e.preventDefault();
                cpoObj.formSubmission();
            });
        } else {
            jQuery(document).on('click', '.uni_cpo_ajax_add_to_cart', function (e) {
                e.preventDefault();
                cpoObj.formSubmission();
            });
        }
    },
    bindOnCalcBtnClick: function bindOnCalcBtnClick() {
        var cpoObj = this;
        jQuery(document).on('click', '.js-uni-cpo-calculate-btn', function () {
            if (cpoObj._ajax_sent) {
                return false;
            }
            cpoObj.processFormData();
        });
    },
    bindOnFileUploadClick: function bindOnFileUploadClick() {
        
/* Premium Code Stripped by Freemius */

    },
    bindOnOptionSelected: function bindOnOptionSelected() {
        var cpoObj = this;
        jQuery(document).on('change', unicpo.options_selector_change, function () {
            if (cpoObj._ajax_sent) {
                return false;
            }
            if (!cpoObj.calc || cpoObj.calc && !cpoObj.calcBtn) {
                cpoObj.processFormData();
            } else if (cpoObj.calc && cpoObj.calcBtn) {
                cpoObj.setBtnState(true);
                cpoObj.collectData(true);
            }
        });
    },
    bindOnRadioColourClick: function bindOnRadioColourClick() {
        
/* Premium Code Stripped by Freemius */

    },
    bindOnRadioImageTap: function bindOnRadioImageTap() {
        
/* Premium Code Stripped by Freemius */

    },
    bindOnMatrixCellClick: function bindOnMatrixCellClick() {
        
/* Premium Code Stripped by Freemius */

    },
    calculate: function calculate(fields) {
        var data = {
            action: 'uni_cpo_price_calc',
            security: unicpo.security,
            data: fields
        };

        this.ajaxCall(data);
    },
    changeMainImage: function changeMainImage() {
        
/* Premium Code Stripped by Freemius */

    },
    collectData: function collectData(isForConditional) {
        var formFields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var cpoObj = this;
        var fields = {};
        var $fieldsToProcess = jQuery(unicpo.options_selector).not('.uni-cpo-excluded-field');

        $fieldsToProcess.each(function () {
            if (!this.name) {
                return;
            }

            var el = this;
            //console.log(el);
            var $el = jQuery(el);
            var elType = el.type || el.tagName.toLowerCase();

            if ('checkbox' === elType) {
                var name = el.name.replace('[]', '');
                if (typeof fields[name] !== 'undefined') {
                    return;
                }
                fields[name] = jQuery.makeArray(fields[name]);

                jQuery('input[name="' + el.name + '"]:checked').each(function () {
                    fields[name].push(this.value);
                });
                fields[name + '_count'] = fields[name].length;
            } else if ('radio' === elType) {
                if (jQuery('input[name="' + el.name + '"]:checked').length) {
                    if (true === $el.prop('checked')) {
                        fields[el.name] = $el.val();
                    }
                } else {
                    fields[el.name] = '';
                }
            } else if ('select-one' === elType) {
                fields[el.name] = $el.val();
            } else if ('number' === elType || 'text' === elType) {
                if ($el.hasClass('js-uni-cpo-field-datepicker')) {
                    var fp = document.getElementById(el.name + '-field')._flatpickr;
                    if (fp.selectedDates.length) {
                        var startDate = moment(fp.selectedDates[0]);
                        fields[el.name] = startDate.format('Y-MM-DD');
                        fields[el.name + '_start'] = startDate.format('Y-MM-DD');
                        if (fp.selectedDates[1]) {
                            var endDate = moment(fp.selectedDates[1]);
                            fields[el.name] = startDate.format('Y-MM-DD') + ' - ' + endDate.format('Y-MM-DD');
                            fields[el.name + '_end'] = endDate.format('Y-MM-DD');
                            fields[el.name + '_duration'] = endDate.diff(startDate, 'days');
                            if ($el.hasClass('js-datepicker-mode-days')) {
                                fields[el.name + '_duration'] = fields[el.name + '_duration'] + 1;
                            }
                        }
                    }
                } else if ($el.hasClass('js-uni-cpo-field-range_slider')) {
                    var slider = $el.data('ionRangeSlider');
                    if ('double' === slider.options.type) {
                        var values = $el.val().split('-');
                        fields[el.name] = $el.val();
                        fields[el.name + '_from'] = values[0];
                        fields[el.name + '_to'] = values[1];
                    } else {
                        fields[el.name] = $el.val();
                        fields[el.name + '_from'] = $el.val();
                        fields[el.name + '_to'] = $el.val();
                    }
                } else {
                    if (!cpoObj.isNumber($el.val())) {
                        var val = $el.val().replace(/,/, '.');
                        $el.val(val);
                        fields[el.name] = $el.val();
                    } else {
                        fields[el.name] = $el.val();
                    }
                    fields[el.name + '_count_spaces'] = fields[el.name].length;
                    var withoutSpaces = $el.val().replace(/ /g, '');
                    fields[el.name + '_count'] = withoutSpaces.length;
                }
            } else if ('textarea' === elType) {
                fields[el.name] = $el.val();
                fields[el.name + '_count_spaces'] = fields[el.name].length;
                var _withoutSpaces = $el.val().replace(/ /g, '');
                fields[el.name + '_count'] = _withoutSpaces.length;
            } else if ('hidden' === elType) {
                if ($el.hasClass('js-uni-cpo-field-file_upload')) {
                    var data = $el.data();
                    fields[el.name] = $el.val();
                    if (typeof data.imageWidth !== 'undefined') {
                        fields[el.name + '_width'] = parseInt(data.imageWidth);
                    }
                    if (typeof data.imageHeight !== 'undefined') {
                        fields[el.name + '_height'] = parseInt(data.imageHeight);
                    }
                } else {
                    fields[el.name] = $el.val();
                }
            } else {
                fields[el.name] = $el.val();
            }

            // Triggers an event - for each field
            if (isForConditional) {
                jQuery(document.body).trigger('uni_cpo_option_data_for_conditional', [fields, $el]);
            } else {
                jQuery(document.body).trigger('uni_cpo_option_data_before_validate', [fields, $el]);
            }
        });

        if (isForConditional) {
            var cpoFields = jQuery(document.body).triggerHandler('uni_cpo_options_data_for_conditional', [fields]);
            if (typeof cpoFields !== 'undefined') {
                fields = cpoFields;
            }
            if (!_.isEqual(formFields, fields)) {
                return cpoObj.collectData(true, fields);
            }
        } else {
            var _cpoFields = jQuery(document.body).triggerHandler('uni_cpo_options_data_before_validate', [fields]);
            if (typeof _cpoFields !== 'undefined') {
                fields = _cpoFields;
            }
        }

        return fields;
    },
    colorify: function colorify(optionName, hex) {
        var cpoObj = this;
        var $layer = jQuery('#palette-layer-' + optionName);

        if ($layer.length > 0) {
            var colorRgb = cpoObj.hexToRgb(hex);

            // gets main product image size
            var width = $layer.width();
            var height = $layer.height();

            // gets original image size
            var $fakeImg = jQuery('<img>').css('display', 'none').appendTo('body');
            $fakeImg[0]['src'] = $layer[0].src;

            var w = $fakeImg.width();
            var h = $fakeImg.height();
            $fakeImg.remove();

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = w;
            canvas.height = h;

            ctx.drawImage($layer.get(0), 0, 0);
            var imgd = ctx.getImageData(0, 0, w, h);
            var pix = imgd.data;
            var unique_color = [colorRgb.r, colorRgb.g, colorRgb.b];

            // Loops through all of the pixels and modifies the components.
            for (var i = 0, n = pix.length; i < n; i += 4) {
                pix[i] = unique_color[0];
                pix[i + 1] = unique_color[1];
                pix[i + 2] = unique_color[2];
            }

            ctx.putImageData(imgd, 0, 0);

            // put the new image to the DOM
            $layer.attr('src', canvas.toDataURL('image/png'));
            $layer.attr('width', width);
            $layer.attr('height', height);
        }
    },
    formSubmission: function formSubmission() {
        var cpoObj = this;

        // validates the form
        cpoObj.productFormEl.parsley({
            excluded: '[disabled], .qty, .uni-cpo-excluded-field'
        }).validate();

        if (cpoObj.productFormEl.parsley().isValid()) {
            var $excludeFromFormSubmission = jQuery('.uni-cpo-excluded-field');
            $excludeFromFormSubmission.each(function () {
                jQuery(this).prop('disabled', true);
            });

            // regular form submission or via ajax
            if (!cpoObj.addToCartAjax) {
                cpoObj.productFormEl.submit();
            } else {
                var data = {};
                jQuery.each(cpoObj.productFormEl.serializeArray(), function (index, item) {
                    if (item.name.indexOf('[]') !== -1) {
                        item.name = item.name.replace('[]', '');
                        data[item.name] = jQuery.makeArray(data[item.name]);
                        data[item.name].push(item.value);
                    } else {
                        data[item.name] = item.value;
                    }
                });
                //console.log(data);
                cpoObj.addToCart(data);
            }

            $excludeFromFormSubmission.each(function () {
                jQuery(this).prop('disabled', false);
            });
        }
    },
    getMainImageDefData: function getMainImageDefData() {
        
/* Premium Code Stripped by Freemius */

    },
    getMainImageEl: function getMainImageEl() {
        var $image = jQuery(unicpo.image_selector).find('.woocommerce-product-gallery__image');
        return $image.length > 0 ? $image.not('.clone').first() : '';
    },
    getFormattedFormData: function getFormattedFormData() {
        var pid = jQuery('.js-cpo-pid').val();
        var $prodQtyInput = this.productFormEl.find('.input-text.qty');
        var prodQty = $prodQtyInput.val() ? $prodQtyInput.val() : 1;
        var fields = {};
        fields['product_id'] = pid;
        fields['quantity'] = parseInt(prodQty);
        fields = jQuery.extend(fields, this.collectData(false));
        return fields;
    },
    handlePluploadInit: function handlePluploadInit(uploader) {
        
/* Premium Code Stripped by Freemius */

    },
    handlePluploadError: function handlePluploadError(uploader, error) {
        
/* Premium Code Stripped by Freemius */

    },
    handlePluploadFileFiltered: function handlePluploadFileFiltered(uploader, file) {},
    handlePluploadFilesAdded: function handlePluploadFilesAdded(uploader, files) {
        
/* Premium Code Stripped by Freemius */

    },
    handlePluploadBeforeUpload: function handlePluploadBeforeUpload(uploader, file) {
        
/* Premium Code Stripped by Freemius */

    },
    handlePluploadUploadProgress: function handlePluploadUploadProgress(uploader, file) {
        
/* Premium Code Stripped by Freemius */

    },
    handlePluploadChunkUploaded: function handlePluploadChunkUploaded(uploader, file, r) {
        var parsedResponse = JSON.parse(r.response);
        if (!parsedResponse.success) {
            var slug = uploader.settings.multipart_params.slug;
            var $option = jQuery('#' + slug + '-field');
            uploader.stop();
            $option.parsley().addError('file-upload', { message: parsedResponse.data.error });
            window.UniCpo.position($option, 0);
        }
    },
    handlePluploadFileUploaded: function handlePluploadFileUploaded(uploader, file, r) {
        
/* Premium Code Stripped by Freemius */

    },
    hexToRgb: function hexToRgb(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    initRangeSlider: function initRangeSlider() {
        
/* Premium Code Stripped by Freemius */

    },
    initTooltip: function initTooltip() {
        jQuery('.uni-builderius-container').tooltip({
            items: '[data-tip]',
            show: {
                effect: 'show',
                duration: 0
            },
            hide: {
                effect: 'fad',
                duration: 0
            },
            close: function close() {
                jQuery('.ui-helper-hidden-accessible').remove();
            },
            position: {
                my: 'center bottom',
                at: 'center top-10',
                collision: 'none',
                using: function using(position, feedback) {
                    jQuery(this).css(position);
                    jQuery(this).addClass('vertical-bottom horizontal-center');
                }
            },
            content: function content() {
                return jQuery(this).attr('data-tip');
            }
        });
    },
    isNumber: function isNumber(val) {
        return !isNaN(parseFloat(val)) && isFinite(val);
    },
    position: function position(el, delay) {
        var time = void 0;
        var $parent = el;
        var $list = void 0;

        if (typeof delay !== 'undefined') {
            time = delay;
        } else {
            time = 300;
        }

        if (el.hasClass('uni-module')) {
            $list = el.find('.parsley-errors-list');
        } else {
            $list = jQuery('#parsley-id-' + $parent.data('parsley-id'));
            if ($parent.attr('type') === 'hidden') {
                $parent = jQuery('' + el.data('parsley-class-handler'));
            }
        }

        if (!el.hasClass('parsley-error') && typeof el.data('parsley-errors-container') !== 'undefined' && typeof el.data('parsley-class-handler') !== 'undefined' && el.attr('type') !== 'hidden') {

            $parent = jQuery('' + el.data('parsley-class-handler'));
            $list = jQuery('[id="parsley-id-multiple-' + $parent.attr('id') + '"]');
        }

        var width = $parent.outerWidth();

        setTimeout(function () {
            $list.position({
                of: $parent,
                my: 'left top',
                at: 'left bottom',
                collision: 'none'
            });
            $list.css({
                'max-width': width,
                'opacity': 1
            });
        }, time);
    },
    processFormData: function processFormData() {
        if (!this.addToCartBtnEl.length) {
            return false;
        }

        var cpoObj = this;
        var formValid = false;

        cpoObj.collectData(true);
        if (this.calc) {
            cpoObj.setPriceTo({ price: cpoObj.priceStartingEl });
        }

        // Triggers an event - on form data process has been started
        jQuery(document.body).trigger('uni_cpo_form_data_process_start', [cpoObj]);

        // validates
        cpoObj.productFormEl.parsley({ excluded: '[disabled], .qty, .uni-cpo-excluded-field' }).validate();
        if (cpoObj.productFormEl.parsley().isValid()) {
            formValid = true;
        }

        var fields = cpoObj.getFormattedFormData(false);

        // validates again
        cpoObj.productFormEl.parsley({ excluded: '[disabled], .qty, .uni-cpo-excluded-field' }).validate();
        if (cpoObj.productFormEl.parsley().isValid()) {
            formValid = true;
        }

        if (formValid && fields['product_id']) {
            jQuery(document.body).trigger('uni_cpo_options_data_after_validate_event', [fields]);
            if (!cpoObj.calc) {
                cpoObj.setBtnState(false);
            }
            if (cpoObj.calc && !cpoObj.calcBtn) {
                cpoObj.setBtnState(true);
            }
            if (cpoObj.calc) {
                cpoObj.calculate(fields);
            }
        } else {
            cpoObj.setBtnState(true);
            jQuery(document.body).trigger('uni_cpo_options_data_not_valid_event', [fields]);
        }
    },
    replaceMainImageData: function replaceMainImageData(data) {
        
/* Premium Code Stripped by Freemius */

    },
    parsleyRemoveError: function parsleyRemoveError(el) {
        el.parsley().removeError('file-limit');
        el.parsley().removeError('file-type');
        el.parsley().removeError('file-size');
        el.parsley().removeError('file-custom');
        el.parsley().removeError('file-upload');
    },
    setBtnState: function setBtnState(state) {
        this.addToCartBtnEl.prop('disabled', state);
        jQuery(document.body).trigger('uni_cpo_set_btn_state_event', [state]);
    },
    setPriceTo: function setPriceTo(_ref) {
        var price = _ref.price,
            _ref$tax = _ref.tax,
            tax = _ref$tax === undefined ? 'starting' : _ref$tax;

        var cpoObj = this;
        var $el = cpoObj.priceTagEl;
        $el.parent().each(function () {
            if (jQuery(this)[0].tagName === 'DEL') {
                jQuery(this).find($el).show();
            } else {
                jQuery(this).find($el).html(price).show();
                if (cpoObj.isTaxable && tax !== 'hide') {
                    var $taxSuffixEl = jQuery(this).find(cpoObj.taxPriceSuffixElClass);
                    var $newTaxSuffixEl = jQuery(cpoObj.getProperTaxSuffix(tax));
                    $taxSuffixEl.replaceWith($newTaxSuffixEl);
                    $newTaxSuffixEl.show();
                    $newTaxSuffixEl.find('span').show();
                } else {
                    jQuery(this).find(cpoObj.taxPriceSuffixElClass).hide();
                }
                var cloned = price;
                if ((typeof price === 'undefined' ? 'undefined' : _typeof(price)) === 'object') {
                    cloned = price.clone();
                }
                jQuery(document.body).trigger('uni_cpo_set_price_event', [cloned]);
            }
        });
    },
    showFirstThumbOnImageChange: function showFirstThumbOnImageChange() {
        
/* Premium Code Stripped by Freemius */

    },
    getProperPrice: function getProperPrice() {
        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref2$price = _ref2.price,
            price = _ref2$price === undefined ? '' : _ref2$price,
            _ref2$doRemoveSuffix = _ref2.doRemoveSuffix,
            doRemoveSuffix = _ref2$doRemoveSuffix === undefined ? false : _ref2$doRemoveSuffix;

        var initPrice = this.priceStarting && !price ? this.priceStarting : price ? price : unicpo.price_vars.price;
        
/* Premium Code Stripped by Freemius */


        return initPrice;
    },
    getProperTaxSuffix: function getProperTaxSuffix(tax) {
        if (tax === 'starting') {
            return this.priceTaxSuffixStarting;
        } else if (tax === 'show') {
            return unicpo.price_vars.price_tax_suffix;
        }
    },
    template: _.memoize(function (id) {
        var compiled = void 0;
        var options = {
            evaluate: /\{#([\s\S]+?)#\}/g,
            interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
            escape: /\{\{([^\}]+?)\}\}(?!\})/g,
            variable: 'data'
        };

        return function (data) {
            compiled = compiled || _.template(jQuery('#cpo-tmpl-' + id).html(), options);
            return compiled(data);
        };
    }),
    _blockForm: function _blockForm(el) {
        this._ajax_sent = true;
        jQuery(el).block({
            message: '<div data-loader="circle"></div>',
            css: {
                width: 'auto',
                border: '0px'
            },
            overlayCSS: {
                background: '#fff',
                opacity: 0.6
            }
        });
    },
    _unblockForm: function _unblockForm(el, type) {
        this._ajax_sent = false;
        jQuery(el).unblock();
    }
};

cpoMakeInstance = function cpoMakeInstance() {
    return Object.create(UniCpo);
};
window.UniCpo = cpoMakeInstance();

// init
window.UniCpo._init();

/* Custom ParsleyJS validators
----------------------------------------------------------*/

window.Parsley.addValidator('maxFileSize', {
    validateString: function validateString(_value, maxSize, parsleyInstance) {
        if (!window.FormData) {
            console.log('The browser does not support this feature');
            return true;
        }
        if (0 === maxSize) {
            maxSize = unicpo.max_file_size;
        }
        var files = parsleyInstance.$element[0].files;
        return files.length !== 1 || files[0].size <= maxSize * 1024;
    },
    requirementType: 'integer',
    messages: {
        en: unicpo_i18n.max_file_size
    }
});

window.Parsley.addValidator('mimeType', {
    validateString: function validateString(value, requirement, parsleyInstance) {

        var files = parsleyInstance.$element[0].files;
        if (0 === files.length) {
            return true;
        }

        if ('' === requirement) {
            requirement = unicpo.mime_type;
        }
        var allowedMimeTypes = requirement.replace(/\s/g, '').split(',');
        return allowedMimeTypes.indexOf(files[0].type) !== -1;
    },
    requirementType: 'string',
    messages: {
        en: unicpo_i18n.mime_type
    }
});

window.Parsley.on('field:error', function () {
    if (window.UniCpo.isSilentValidationOn) {
        this.removeError('required');
    }
    window.UniCpo.position(this.$element);
});