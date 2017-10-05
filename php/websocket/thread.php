<?php
//thread.php
    class Part extends Threaded{ public function run(){} }
    $parts = new Part();

    for($i=0;$i<4;$i++) $parts[] = $i;
?>
