<?php
/**
 * Page de traitement du formulaire de connexion
 * Ce script vÃ©rifie les identifiants de l'utilisateur et crÃ©e la session
 */

// Inclure le fichier de configuration
require_once '../config/config.php';

// VÃ©rifier si le formulaire a Ã©tÃ© soumis
if ($_SERVER["REQUEST_METHOD"] == "POST") {
   
    // VÃ©rifier le token CSRF
    if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token']) ||
        $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        $_SESSION['error_message'] = "Erreur de validation du formulaire. Veuillez rÃ©essayer.";
        redirect('index.php');
    }
   
    // RÃ©cupÃ©rer les donnÃ©es du formulaire
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
   
    // Validation de base
    if (empty($username) || empty($password)) {
        $_SESSION['error_message'] = "Tous les champs sont obligatoires.";
        redirect('index.php');
    }
   
    try {
        // Connexion Ã  la base de donnÃ©es
        $db = getDbConnection();
       
        if (!$db) {
            throw new Exception("Impossible de se connecter Ã  la base de donnÃ©es");
        }
       
        // Rechercher l'utilisateur dans la base de donnÃ©es
        $stmt = $db->prepare("SELECT id, nom, prenom, login, mot_de_passe, role, actif FROM UTILISATEUR WHERE login = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
       
        // VÃ©rifier si l'utilisateur existe, s'il est actif et si le mot de passe est correct
        if ($user && $user['actif'] && password_verify($password, $user['mot_de_passe'])) {
            // Authentification rÃ©ussie
           
            // RÃ©gÃ©nÃ©rer l'ID de session pour prÃ©venir la fixation de session
            session_regenerate_id(true);
           
            // Stocker les informations de session
            $_SESSION['logged_in'] = true;
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_nom'] = $user['nom'];
            $_SESSION['user_prenom'] = $user['prenom'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['login_time'] = time();
            $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];
           
            // Mettre Ã  jour la date de derniÃ¨re connexion
            $updateStmt = $db->prepare("UPDATE UTILISATEUR SET date_derniere_connexion = CURRENT_DATE() WHERE id = ?");
            $updateStmt->execute([$user['id']]);
           
            // Redirection vers le tableau de bord
            redirect('dashboard.php');
        } elseif ($user && !$user['actif']) {
            // Compte dÃ©sactivÃ©
            $_SESSION['error_message'] = "Votre compte est dÃ©sactivÃ©. Veuillez contacter l'administrateur.";
            redirect('index.php');
        } else {
            // Authentification Ã©chouÃ©e
            $_SESSION['error_message'] = "Identifiant ou mot de passe incorrect";
            redirect('index.php');
        }
    } catch (Exception $e) {
        // Log l'erreur dans un fichier plutÃ´t que de l'afficher
        error_log('Erreur de connexion: ' . $e->getMessage());
        $_SESSION['error_message'] = "Erreur de connexion au serveur. Veuillez rÃ©essayer plus tard.";
        redirect('index.php');
    }
} else {
    // Si quelqu'un tente d'accÃ©der directement Ã  login.php
    redirect('index.php');
}
