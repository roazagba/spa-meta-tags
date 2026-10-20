/**
 * Example: SPA deployed as static files, on any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3, etc.),
 * without any Node server.
 *
 * After `vite build`, this plugin writes one copy of index.html per route, with its own meta tags:
 *
 *   dist/index.html            ->  https://example.com/
 *   dist/about/index.html      ->  https://example.com/about/
 *   dist/projects/index.html   ->  https://example.com/projects/
 *
 * Static servers serve these files as is, so crawlers get the right tags for each page,
 * and the SPA still boots normally in the browser.
 *
 * The pages are read from your routes file, loaded with Vite: it can import .vue, .jsx or .tsx
 * components. Put the SEO data of each page in its route:
 *
 *   // src/router/routes.js
 *   export const routes = [
 *     { path: '/', component: Home, meta: { seo: { title: 'My Site', description: 'Welcome' } } },
 *     { path: '/about', component: () => import('../pages/About.vue'), meta: { seo: { title: 'About' } } },
 *     { path: '/blog', children: [
 *       { path: 'first-post', component: Post, meta: { seo: { title: 'First post', type: 'article' } } },
 *     ] },
 *   ]
 *
 *   // vite.config.js
 *   import { staticMetaPages } from './plugins/static-meta-pages.js'
 *
 *   export default defineConfig({
 *     plugins: [
 *       vue(),
 *       staticMetaPages({
 *         siteUrl: 'https://example.com',
 *         routes: './src/router/routes.js',
 *         defaults: { siteName: 'My Site', image: 'https://example.com/og-image.jpg' },
 *       }),
 *     ],
 *   })
 *
 * Dynamic routes (/projects/:id) and catch-all routes are skipped. Use the `pages` option
 * when the pages come from data (an API, markdown files, JSON files, etc.).
 */
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'
import { buildSeoTags, injectSeoTags, mergeSeo } from 'spa-meta-tags'

/**
 * @typedef {{ path: string, seo: import('spa-meta-tags').SeoData }} StaticPage
 */

/**
 * @param {object} options
 * @param {string} options.siteUrl Absolute URL of the site, without trailing slash
 * @param {string} [options.routes] Routes file, relative to the project root
 * @param {string} [options.routesExport] Export of the routes file holding the routes. Defaults to `routes`, then `default`
 * @param {(route: object) => import('spa-meta-tags').SeoData | undefined} [options.getSeo]
 *   SEO data of a route. Defaults to `route.meta.seo` (Vue Router), then `route.handle.seo` (React Router)
 * @param {() => StaticPage[] | Promise<StaticPage[]>} [options.pages] Additional pages, for example built from data
 * @param {import('spa-meta-tags').SeoData} [options.defaults] Data shared by every page
 * @returns {import('vite').Plugin}
 */
export function staticMetaPages (options) {
  const get_seo = options.getSeo ?? (route => route.meta?.seo ?? route.handle?.seo)
  let config

  /**
   * Flattens the nested routes into pages, skipping the dynamic ones
   */
  function routesToPages (routes, parent_path = '') {
    return routes.flatMap(route => {
      const route_path = route.path?.startsWith('/')
        ? route.path
        : `${parent_path.replace(/\/$/, '')}/${route.path ?? ''}`

      const children = Array.isArray(route.children) ? routesToPages(route.children, route_path) : []
      const seo = get_seo(route)
      const is_dynamic = /[:*]/.test(route_path)

      return seo && !is_dynamic ? [{ path: route_path, seo }, ...children] : children
    })
  }

  /**
   * Loads the routes file with Vite, so that it can import components (.vue, .jsx, etc.)
   */
  async function loadRoutes () {
    const server = await createServer({
      configFile: config.configFile,
      root: config.root,
      mode: config.mode,
      logLevel: 'error',
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'custom',
    })

    try {
      const module = await server.ssrLoadModule(path.resolve(config.root, options.routes))
      const routes = options.routesExport ? module[options.routesExport] : (module.routes ?? module.default)

      if (!Array.isArray(routes)) {
        throw new TypeError(`${options.routes} must export an array of routes (export const routes = [...])`)
      }

      return routes
    } finally {
      await server.close()
    }
  }

  return {
    name: 'static-meta-pages',
    apply: 'build',

    configResolved (resolved_config) {
      config = resolved_config
    },

    async closeBundle () {
      // SSR build of the same project: nothing to generate
      if (config.build.ssr) return

      const out_dir = path.resolve(config.root, config.build.outDir)
      const template = fs.readFileSync(path.join(out_dir, 'index.html'), 'utf8')

      const pages = [
        ...(options.routes ? routesToPages(await loadRoutes()) : []),
        ...(options.pages ? await options.pages() : []),
      ]

      for (const page of pages) {
        const page_path = page.path.replace(/^\/+|\/+$/g, '')

        // Static servers redirect /about to /about/ (it is a directory): use the final URL
        const url = `${options.siteUrl}/${page_path ? `${page_path}/` : ''}`

        const tags = buildSeoTags(mergeSeo({ url }, options.defaults, page.seo))
        const file = path.join(out_dir, page_path, 'index.html')

        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, injectSeoTags(template, tags))
      }

      this.info(`meta tags generated for ${pages.length} pages`)
    },
  }
}
