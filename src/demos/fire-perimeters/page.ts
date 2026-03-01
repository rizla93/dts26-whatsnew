import "@arcgis/map-components/components/arcgis-scene";

import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import WebScene from "@arcgis/core/WebScene";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import LineSymbol3D from "@arcgis/core/symbols/LineSymbol3D";
import Glow from "@arcgis/core/webscene/Glow";
import PathSymbol3DLayer from "@arcgis/core/symbols/PathSymbol3DLayer";

class DemoFirePerimeters extends HTMLElement {
  static tagName = "demo-fire-perimeters";

  connectedCallback(): void {
    const root = this.attachShadow({ mode: "open" });

    root.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }

        html,
        body {
          height: 100%;
          margin: 0;
        }

        arcgis-scene {
          width: 100%;
          height: 100%;
        }

        .title {
          position: absolute;
          top: 100px;
          left: 20px;
          pointer-events: none;
        }

        .title h1 {
          font-size: 3rem;
          line-height: 3rem;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: rgb(242, 99, 22);
          margin: 0;
          padding: 0;
          text-shadow: 0 0 10px black;
        }

        .title .date {
          text-transform: uppercase;
          color: rgb(50, 50, 50);
          background: rgba(255, 255, 255, 0.8);
          width: fit-content;
          padding: 2px 5px;
          font-size: 1.3rem;
          letter-spacing: 2px;
          margin: 0 0 10px;
          text-shadow: none;
        }

        .title p {
          margin: 0;
          padding: 0;
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
          text-shadow: 0 0 5px black;
        }
      </style>

      <arcgis-scene id="scene"></arcgis-scene>

      <div class="title">
        <h1>Woolsey</h1>
        <p class="date">November 2018</p>
        <p>96,949 Acres Burned</p>
        <p>1,643 Structures Lost</p>
        <p>3 Deaths</p>
      </div>
    `;

    void this.#initialize(root);
  }

  async #initialize(root: ShadowRoot): Promise<void> {
    const sceneEl = root.getElementById("scene") as any;

    sceneEl.map = new WebScene({
      portalItem: {
        id: "49cc4d6ad8124b469505c4819a74875b",
      } as any,
    });

    await sceneEl.viewOnReady();

    const view = sceneEl.view as any;
    if (view?.ui) {
      view.ui.components = [];
    }

    // Apply glow in the scene-component style
    if (view?.environment?.lighting) {
      view.environment.lighting.glow = new Glow({ intensity: 0.3 });
    }

    const firesLayer = new FeatureLayer({
      url: "https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/WoolseyFire/FeatureServer",
      elevationInfo: {
        mode: "relative-to-ground",
        offset: 0,
      } as any,
      renderer: new SimpleRenderer({
        symbol: new LineSymbol3D({
          symbolLayers: [
            new PathSymbol3DLayer({
              width: 10,
              height: 50,
              cap: "round",
              join: "round",
              material: {
                color: [252, 140, 3, 1],
                emissive: { strength: 20, source: "color" },
              },
            }),
          ],
        }),
      }),
    });

    sceneEl.map.add(firesLayer);
  }
}

if (!customElements.get(DemoFirePerimeters.tagName)) {
  customElements.define(DemoFirePerimeters.tagName, DemoFirePerimeters);
}

export { DemoFirePerimeters };
