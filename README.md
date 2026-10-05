# Beardedguy Studio Website

Portfolio website for Beardedguy Studio, with responsive HTML pages, shared CSS and JavaScript, local image and video assets, and a PHP contact form.

## Local preview

From this directory, with PHP installed:

```sh
php -S 127.0.0.1:8010
```

Open http://127.0.0.1:8010/index.html. No build step is required.

## Website files

- `index.html`: homepage.
- `work.html`: links to websites, motion, branding and apparel.
- `about.html` and `contact.html`: studio information and enquiries.
- `styles.css` and `script.js`: shared styles and interactions.
- `assets/`: images, icons and local portfolio videos.
- `send-contact.php`: contact-form handler.

## Contact form and hosting

The contact form uses PHP's `mail()` function. Sending requires a PHP-capable host with an outbound mail service configured, and sender addresses authorized for the domain. Starting the local preview alone does not configure email delivery.

GitHub Pages can serve the static pages but cannot execute the PHP contact handler. This repository stores the website source; creating or pushing to it does not deploy the website.

Local design-reference screenshots, development folders and credentials are excluded from version control.
