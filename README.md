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

The contact form posts to `https://www.n-vil.com/send-contact.php`. The handler uses PHP's `mail()` function, sending from and to `info@n-vil.com` and setting Reply-To to the visitor's email. Sending requires the n-vil.com host's outbound mail service to be configured and authorized for this domain. Starting the local preview alone does not configure email delivery.

Upload `send-contact.php` into the n-vil.com document root using cPanel File Manager, replacing the previous handler after keeping a backup outside the public web root. The updated handler permits requests from the GitHub Pages origin and handles browser preflight requests. It must be uploaded separately whenever it changes; GitHub Pages only deploys the static frontend. No mailbox password belongs in this repository or in the frontend.

GitHub Pages can serve the static pages but cannot execute the PHP contact handler. This repository stores the website source; creating or pushing to it does not deploy the website.

Local design-reference screenshots, development folders and credentials are excluded from version control.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-pages.yml` deploys the static website on pushes to `main`, or when started manually from GitHub Actions. Enable GitHub Pages with GitHub Actions as the publishing source first. The repository must be public or on a GitHub plan that supports private Pages repositories.

The deployment includes HTML, CSS, JavaScript and `assets/`. It excludes PHP source and repository-only files. Email is handled separately by the n-vil.com PHP endpoint, which must have the current handler uploaded through cPanel before the GitHub Pages contact form can work.

Once deployment succeeds, the website address is https://ncassar-dotcom.github.io/beardedguy-studio-website/.
