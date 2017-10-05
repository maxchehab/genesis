#!/usr/bin/env php
<?php
require_once('./websockets.php');

class echoServer extends WebSocketServer {
	//protected $maxBufferSize = 1048576; //1MB... overkill for an echo server, but potentially plausible for other applications.
	public $tunnels = array();

	protected function process($user, $message) {
		echo $user->cookie . " : " . $message . "\n";
	//	array_push($user->query, $message);

		/*while (@ ob_end_flush()); // end all output buffers if any
			$proc = popen($message, 'r');
			while (!feof($proc)){
    				$contents = fread($proc, 4096);
				$this->send($user, $contents);
    				@ flush();
			}*/
	}

	protected function connected($user) {
		$array = explode('; ', $user->headers["cookie"]);
		$headers = array();
		array_walk($array, function (&$value,$key) use (&$headers) {
    			$splitted = explode("=",$value);
    			$headers[ $splitted[0] ] = $splitted[1];
		});

		$user->cookie = $headers["genesis_session"];
		echo $headers["genesis_session"] . "\n";
		$tunnels[$user->cookie] = new Tunnel($user, $this);
		print_r($tunnels);
	}

	protected function closed($user) {
		// Do nothing: This is where cleanup would go, in case the user had any sort of
		// open files or other objects associated with them.  This runs after the socket
		// has been closed, so there is no need to clean up the socket itself here.
	}
}

class Tunnel extends Thread{
	public $user;
     public $server;
	function __construct($user, $server){
		$this->user = $user;
		$this->server = $server;

		$server->send($user, "you have been created!");
		echo "Created tunnel\n";
	}
}


$echo = new echoServer("0.0.0.0", "61599");
try {
	$echo->run();
}
catch (Exception $e) {
	$echo->stdout($e->getMessage());
}
