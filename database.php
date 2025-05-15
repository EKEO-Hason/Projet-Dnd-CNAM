<?php
/**
 * Configuration de la base de donnÃ©es
 * Ce fichier contient les paramÃ¨tres de connexion Ã  la base de donnÃ©es
 */

// Informations de connexion Ã  la base de donnÃ©es
define('DB_HOST', '127.0.0.1'); // Ou '127.0.0.1' puisque MySQL est sur le mÃªme VPS
define('DB_NAME', 'JDR'); // Le nom de votre base de donnÃ©es
define('DB_USER', 'root'); // Votre utilisateur MySQL
define('DB_PASSWORD', 'TEST'); // Remplacez par votre mot de passe
define('DB_CHARSET', 'utf8mb4');    // Encodage de caractÃ¨res

/**
 * Fonction pour Ã©tablir une connexion Ã  la base de donnÃ©es
 * @return PDO|null Instance PDO ou null en cas d'Ã©chec
 */
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        return new PDO($dsn, DB_USER, DB_PASSWORD, $options);
    } catch (PDOException $e) {
        // En production, utiliser un systÃ¨me de log au lieu d'afficher l'erreur
        error_log('Erreur de connexion Ã  la base de donnÃ©es : ' . $e->getMessage());
        return null;
    }
}
