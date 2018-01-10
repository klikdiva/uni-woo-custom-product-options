<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/*
* Uni_Cpo_Setting_Cpo_Date_Type class
*
*/

class Uni_Cpo_Setting_Cpo_Date_Type extends Uni_Cpo_Setting implements Uni_Cpo_Setting_Interface {

	/**
	 * Init
	 *
	 */
	public function __construct() {
		$this->setting_key  = 'cpo_date_type';
		$this->setting_data = array(
			'title'             => __( 'Type of field', 'uni-cpo' ),
			'is_tooltip'        => true,
			'desc_tip'          => __( 'Choose between "single" and "range" datepicker', 'uni-cpo' ),
			'options'           => array(
				'single' => __( 'Single', 'uni-cpo' ),
				'range'  => __( 'Range', 'uni-cpo' )
			),
			'js_var'            => 'data'
		);
		add_action( 'wp_footer', array( $this, 'js_template' ), 10 );
	}


	/**
	 * A template for the module
	 *
	 * @since 1.0
	 * @return string
	 */
	public function js_template() {
		?>
        <script id="js-builderius-setting-<?php echo $this->setting_key; ?>-tmpl" type="text/template">
            <div class="uni-modal-row uni-clear">
				<?php echo $this->generate_field_label_html(); ?>
                <div class="uni-modal-row-second uni-clear">
                    <div class="uni-setting-fields-wrap-2 uni-clear">
						<?php
						echo $this->generate_radio_html();
						?>
                    </div>
                </div>
            </div>
        </script>
		<?php
	}

}
