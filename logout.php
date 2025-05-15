<?php
/**
 * Script de dÃ©connexion
 * DÃ©truit la session et redirige vers la page de connexion
 */

// Inclure le fichier de configuration
require_once '../config/config.php';

// DÃ©truire toutes les variables de session
$_SESSION = array();

// DÃ©truire le cookie de session si nÃ©cessaire
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// DÃ©truire la session
session_destroy();

// Rediriger vers la page de connexion
redirect('index.php');
