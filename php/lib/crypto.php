<?php
function hashword($str, $salt) {
     return hash('sha256', hash('sha256', $str) . $salt);
}

function salt($length) {
     $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
     $charactersLength = strlen($characters);
     $randomString = '';
     for ($i = 0; $i < $length; $i++) {
          $randomString .= $characters[rand(0, $charactersLength - 1)];
     }
     return $randomString;
}

function encrypt_decrypt($action, $string) {

     $output = false;
     $encrypt_method = "AES-256-CBC";

     $secret_key     = 'rRzweEZzr6RBJDnQ';
     $secret_iv      = 'uNq2Bu65fDUxBVvD';

     $key = hash('sha256', $secret_key);

     $iv = substr(hash('sha256', $secret_iv), 0, 16);

     if ($action == 'encrypt') {
          $output = openssl_encrypt($string, $encrypt_method, $key, 0, $iv);
          $output = base64_encode($output);
     } else if ($action == 'decrypt') {
          $output = openssl_decrypt(base64_decode($string), $encrypt_method, $key, 0, $iv);
     }

     return $output;
}

function uuid() {
    return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
        mt_rand( 0, 0xffff ),
        mt_rand( 0, 0x0fff ) | 0x4000,
        mt_rand( 0, 0x3fff ) | 0x8000,
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
}

?>
