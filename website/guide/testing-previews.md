# Testing link previews

## 1. Look at the HTML

The quickest test: request a page with the user agent of a crawler and look at the tags.

```bash
curl -s -A "facebookexternalhit/1.1" http://localhost:3000/my-page | grep -E "<title>|og:|twitter:"
```

Check that:

- the title, description and image match the page;
- there is only one `<title>`;
- `og:url` and `og:image` are absolute URLs.

You can also open `view-source:http://localhost:3000/my-page` in the browser. Do not use the developer tools ("Inspect"): they show the page after JavaScript has run, not what crawlers see.

## 2. Use the debuggers of the platforms

The page and its image must be reachable from the internet.

| Platform | Tool |
|---|---|
| Facebook, Messenger, WhatsApp, Instagram | [Sharing Debugger](https://developers.facebook.com/tools/debug/) |
| LinkedIn | [Post Inspector](https://www.linkedin.com/post-inspector/) |
| All platforms, preview only | [opengraph.xyz](https://www.opengraph.xyz/) |
| Google rich results (JSON-LD) | [Rich Results Test](https://search.google.com/test/rich-results) |

On the Facebook debugger, click **Scrape Again** after each change: Facebook keeps the previous result in cache.

WhatsApp uses the same crawler as Facebook. It also caches previews: when testing, add a parameter to the link (`?v=2`) to get a fresh preview.

## 3. Test from your machine with a tunnel

To test before deploying, expose your local server with a tunnel:

- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/) (free, no account): `cloudflared tunnel --url http://localhost:3000`
- [ngrok](https://ngrok.com/): `ngrok http 3000`

Things to know:

- **Images must be public too.** If your images are served by a local API, expose it with a second tunnel and use its URL for the images.
- **Multi-tenant apps** that find the customer from the subdomain will see the domain of the tunnel (`abc123.ngrok-free.app`). Map it to a test customer in your data while testing.
- **Free ngrok domains** show a warning page to browsers. Crawlers are not affected, but your app may fail to call an API exposed through ngrok from the browser. Send the `ngrok-skip-browser-warning` header in your API calls while testing.
- **Vite in middleware mode** blocks unknown domains: see [Development with Vite](./vite-dev#opening-the-dev-server-through-a-tunnel).
