# ArcGIS Maps SDK for JavaScript Vite TypeScript template

📁 **[Click here to download this directory as a ZIP file](https://esri.github.io/jsapi-resources/zips/js-maps-sdk-vite.zip)** 📁

This template demonstrates how to use the [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest/) in a Vite TypeScript application.

## Get started

To quickly scaffold a new application using this template, run the following command in your terminal:

```bash
npx @arcgis/create -t vite
```

This template uses the following packages:

- [`@arcgis/core`](https://www.npmjs.com/package/@arcgis/core)
- [`@arcgis/map-components`](https://www.npmjs.com/package/@arcgis/map-components)
- [`@arcgis/charts-components`](https://www.npmjs.com/package/@arcgis/charts-components)
- [`@esri/calcite-components`](https://www.npmjs.com/package/@esri/calcite-components)

## TypeScript

This template is configured to use TypeScript. If you prefer to use JavaScript, you can:

- Remove the `tsconfig.json` file
- Update the file extensions from `.ts` to `.js`
- Remove the `typescript` dependency from `package.json`

## Resources

See the [Get started with npm guide](https://developers.arcgis.com/javascript/latest/get-started/#use-arcgiscreate) for full instructions.

## Deploy (GitHub Pages)

This repo includes a GitHub Actions workflow that builds and deploys the app to GitHub Pages.

- In your GitHub repo, go to **Settings → Pages** and set **Source** to **Deploy from a branch**.
- Select branch **gh-pages** and folder **/(root)**.
- Push to the `main` branch to trigger a deployment.
