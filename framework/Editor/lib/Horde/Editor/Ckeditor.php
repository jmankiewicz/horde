<?php
/**
 * The Horde_Editor_Ckeditor:: class provides a WYSIWYG editor for use
 * in the Horde Framework.
 *
 * Copyright 2009-2010 The Horde Project (http://www.horde.org/)
 *
 * See the enclosed file COPYING for license information (LGPL). If you
 * did not receive this file, see http://www.fsf.org/copyleft/lgpl.html.
 *
 * @author   Michael Slusarz <slusarz@horde.org>
 * @category Horde
 * @package  Editor
 */
class Horde_Editor_Ckeditor extends Horde_Editor
{
    /**
     * @param array $params  The following configuration parameters:
     * <pre>
     * 'basic' - (boolean) Load "basic" editor (a small javascript stub that
     *           will download the full code on demand)?
     * 'config' - (array) The javascript config hash used to indiciate the
     *            config for this editor instance.
     * 'id' - (string) The ID of the text area to turn into an editor. If
     *        empty, won't automatically load the editor.
     * 'no_notify' - (boolean) Don't output JS code automatically. Code will
     *               instead be stored for access via getJS().
     * </pre>
     */
    public function initialize(array $params = array())
    {
        if (!$this->supportedByBrowser()) {
            return;
        }

        $params = array_merge(array(
            'config' => array()
        ), $params);

        $ck_file = empty($params['basic'])
            ? 'ckeditor.js'
            : 'ckeditor_basic.js';
        $ck_path = $GLOBALS['registry']->get('jsuri', 'horde') . '/ckeditor/';

        /* Globally disable spell check as you type. */
        $params['config']['scayt_autoStartup'] = false;

        $params['config'] = Horde_Serialize::serialize($params['config'], Horde_Serialize::JSON);

        if (empty($params['no_notify'])) {
            Horde::addScriptFile($ck_path . $ck_file, null, array('external' => true));
            if (isset($params['id'])) {
                Horde::addInlineScript('CKEDITOR.replace("' . $params['id'] . '",' . $params['config'] . ')', 'load');
            }
        } else {
            $this->_js = '<script type="text/javascript" src="' . htmlspecialchars($ck_path) . $ck_file . '"></script>';
            if (isset($params['id'])) {
                $this->_js .= Horde::wrapInlineScript(array('CKEDITOR.replace("' . $params['id'] . '",' . $params['config'] . ')'), 'load');
            }
        }
    }

    /**
     * Does the current browser support this driver.
     *
     * @return boolean  True if the browser supports the editor.
     */
    public function supportedByBrowser()
    {
        if (!$this->_browser) {
            return true;
        }

        switch ($this->_browser->getBrowser()) {
        case 'webkit':
        case 'msie':
        case 'mozilla':
        case 'opera':
            // MSIE: 5.5+
            // Firefox: 1.5+
            // Opera: 9.5+
            // Safari: 3.0+
            return $this->_browser->hasFeature('rte');

        default:
            return false;
        }
    }
}
