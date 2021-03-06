<div class="header">
    Account: <?php echo $GLOBALS['session']->get('shout', 'curaccount_name'); ?>
</div>

<div id="conferenceList">
    <table width="100%" cellspacing="0" class="striped">
        <tr>
            <td class="uheader">Name</td>
            <td class="uheader">Room Number</td>
            <td class="uheader">PIN</td>
            <td class="uheader">Options</td>
        </tr>
        <?php
            $url = Horde::url("conferences.php");
            $editurl = $url->copy()->add('action', 'edit');
            $deleteurl = $url->copy()->add('action', 'delete');
            foreach ($conferences as $roomno => $info) {
                $editurl->add(array('roomno' => $roomno));
                ?>
                <tr class="item">
                    <td>
                        <?php echo Horde::link($editurl); echo $info['name']; echo '</a>'; ?>
                    </td>
                    <td>
                        <?php echo Horde::link($editurl); echo $roomno; echo '</a>'; ?>
                    </td>
                    <td>
                        <?php echo $info['pin']; ?>
                    </td>
                    <td>
                        <?php echo $info['options']; ?>
                    </td>
                </tr>
                <?php
            }
        ?>
    </table>
</div>
<ul id="controls">
    <?php
    $addurl = Horde::url('conferences.php')->add('action', 'add');
    ?>
    <li><a class="horde-create" href="<?php echo $addurl; ?>">
        <?php echo Horde::img('conference-add.png'); ?>&nbsp;New Conference Room
        </a>
    </li>
</ul>
