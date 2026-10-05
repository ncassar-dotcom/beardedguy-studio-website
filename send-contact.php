<?php
$recipientEmail = 'info@n-vil.com';
$fromEmail = 'website@n-vil.com';
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Please send the form from the contact page.', 405);
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

$subject = 'Website enquiry from ' . $name;
$body = "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "Project type: {$project}\n\n";
$body .= "Message:\n{$message}\n";

$headers = array(
    'From: ' . $fromName . ' <' . $fromEmail . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion()
);

$sent = mail($recipientEmail, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(false, 'Sorry, the message could not be sent. Please email info@n-vil.com directly.', 500);
}

respond(true, 'Thank you. Your enquiry has been sent.');
