<?php
$recipientEmail = 'info@n-vil.com';
$fromEmail = 'info@n-vil.com';
$fromName = 'Beardedguy Studio Website';

function clean_input($value) {
    return trim(str_replace(array("\r", "\n"), ' ', $value ?? ''));
}

function respond($ok, $message, $status = 200) {
    http_response_code($status);

    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    $requestedWith = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
    if (stripos($accept, 'application/json') !== false || strtolower($requestedWith) === 'xmlhttprequest') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array('ok' => $ok, 'message' => $message));
        exit;
    }

    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Contact - Beardedguy Studio</title><link rel="stylesheet" href="styles.css"></head><body><main class="page-section"><h1>' . ($ok ? 'Message sent' : 'Message not sent') . '</h1><p>' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</p><p><a class="pill-link" href="contact.html">Back to contact</a></p></main></body></html>';
    exit;
}

$allowedOrigins = array(
    'https://ncassar-dotcom.github.io',
    'https://n-vil.com',
    'https://www.n-vil.com',
    'http://127.0.0.1:8010',
    'http://localhost:8010'
);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Vary: Origin');
header('Cache-Control: no-store');

if ($origin !== '') {
    if (!in_array($origin, $allowedOrigins, true)) {
        respond(false, 'This website is not allowed to submit enquiries.', 403);
    }
    header('Access-Control-Allow-Origin: ' . $origin);
}

// The GitHub-hosted form makes a preflight request before its POST.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    header('Access-Control-Max-Age: 600');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST, OPTIONS');
    respond(false, 'Please send the form from the contact page.', 405);
}

foreach (array('name', 'email', 'project', 'message') as $field) {
    if (isset($_POST[$field]) && !is_string($_POST[$field])) {
        respond(false, 'Please provide valid enquiry details.', 422);
    }
}

$name = clean_input($_POST['name'] ?? '');
$email = clean_input($_POST['email'] ?? '');
$project = clean_input($_POST['project'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    respond(false, 'Please fill in your name, email, and message.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.', 422);
}

if (strlen($name) > 200 || strlen($email) > 254 || strlen($project) > 200 || strlen($message) > 10000) {
    respond(false, 'Please shorten your enquiry and try again.', 422);
}

$subject = 'Website enquiry from ' . $name;
$body = "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "Project type: {$project}\n\n";
$body .= "Message:\n{$message}\n";

$headers = array(
    'From: ' . $fromName . ' <' . $fromEmail . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion()
);

$sent = mail($recipientEmail, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(false, 'Sorry, the message could not be sent. Please email info@n-vil.com directly.', 500);
}

respond(true, 'Thank you. Your enquiry has been sent.');
