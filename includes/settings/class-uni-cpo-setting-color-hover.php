<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/*
* Uni_Cpo_Setting_Color_Hover class
*
*/

class Uni_Cpo_Setting_Color_Hover extends Uni_Cpo_Setting implements Uni_Cpo_Setting_Interface {

	/**
	 * Init
	 *
	 */
	public function __construct() {
		$this->setting_key  = 'color_hover';
		$this->setting_data = array(
			'title' => esc_html__( 'Hover Color', 'uni-cpo' ),
			'class' => array( 'builderius-setting-colorpick' ),
			'value' => '{{- data }}'
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
            <div class="uni-modal-row uni-colour-picker-default uni-clear">
				<?php echo $this->generate_field_label_html() ?>
                <div class="uni-modal-row-second">
					<?php echo $this->generate_text_html(); ?>
                </div>
            </div>
        </script>
		<?php
	}

}