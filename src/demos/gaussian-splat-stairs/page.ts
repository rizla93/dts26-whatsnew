import "@arcgis/map-components/components/arcgis-scene";

import Map from "@arcgis/core/Map";
import GaussianSplatLayer from "@arcgis/core/layers/GaussianSplatLayer";
import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D";

class DemoGaussianSplatStairs extends HTMLElement {
  static tagName = "demo-gaussian-splat-stairs";

  #cleanup: Array<() => void> = [];

  connectedCallback(): void {
    const root = this.attachShadow({ mode: "open" });

    root.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }

        arcgis-scene {
          width: 100%;
          height: 100%;
        }
      </style>

      <arcgis-scene
        basemap="satellite"
        ground="world-elevation"
      ></arcgis-scene>
    `;

    void this.#initialize(root);
  }

  disconnectedCallback(): void {
    for (const dispose of this.#cleanup.splice(0)) {
      dispose();
    }
  }

  async #initialize(root: ShadowRoot): Promise<void> {
    const sceneEl = root.querySelector("arcgis-scene") as any;

    const map = new Map({
      basemap: "satellite",
      ground: "world-elevation" as any,
    });

    const splatLayer = new GaussianSplatLayer({
      portalItem: {
        id: "3b52697d0ddd40aabfbc1395b16b8819",
      },
    } as any);
    map.add(splatLayer);

    sceneEl.map = map;

    sceneEl.camera = {
      position: {
        spatialReference: {
          latestWkid: 3857,
          wkid: 102100,
        },
        x: -9059554.812369758,
        y: 3333267.1048831563,
        z: 26.905173858627677,
      },
      heading: 70.87308587064831,
      tilt: 82.01987006064257,
    };
    await sceneEl.viewOnReady();

    const view = sceneEl.view as any;

    await splatLayer.load();
    await view.whenLayerView(splatLayer);

    const measurement = new AreaMeasurement3D({ view });
    view.ui.add(measurement, "top-right");
    this.#cleanup.push(() => measurement.destroy());
  }
}

if (!customElements.get(DemoGaussianSplatStairs.tagName)) {
  customElements.define(
    DemoGaussianSplatStairs.tagName,
    DemoGaussianSplatStairs,
  );
}

export { DemoGaussianSplatStairs };
