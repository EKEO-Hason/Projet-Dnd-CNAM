<?php

header('Content-Type: application/json');

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        echo file_get_contents('../boardstate.json');
        break;

    case 'POST':
        $data = file_get_contents('php://input');
        $dataArray = json_decode($data, true);
        $id = $dataArray["id"];
        $boardState = json_decode(file_get_contents('../boardstate.json'), true);
        if (isset($boardState["boardElements"][$id])) {
            $boardState["boardElements"][$id] = $dataArray;
            file_put_contents('../boardstate.json', json_encode($boardState, JSON_PRETTY_PRINT));
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(404); // Not Found
            echo json_encode(['status' => 'error', 'message' => 'Element not found']);
        }
        break;

    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        break;
}