import "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-home";
import "@arcgis/map-components/components/arcgis-fullscreen";
import "@arcgis/map-components/components/arcgis-expand";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-layer-list";

import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-slider";
import "@esri/calcite-components/components/calcite-button";
import "@esri/calcite-components/components/calcite-card";
import "@esri/calcite-components/components/calcite-label";

import WebScene from "@arcgis/core/WebScene";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import Glow from "@arcgis/core/webscene/Glow";

class DemoSfConstruction extends HTMLElement {
  static tagName = "demo-sf-construction";

  #cleanup: Array<() => void> = [];

  connectedCallback(): void {
    const root = this.attachShadow({ mode: "open" });

    root.innerHTML = `
      <style>
        html,
        body {
          height: 100%;
          margin: 0;
        }

        :host {
          display: block;
          height: 100%;
        }

        arcgis-scene {
          width: 100%;
          height: 100%;
        }

        #titleDiv {
          font-weight: 400;
          font-style: normal;
          font-size: 1.2019rem;
          padding: 10px;
          background: var(--calcite-color-foreground-1);
        }

        #footer {
          display: flex;
          flex-direction: row;
          --calcite-color-brand: #9e9e9e;
          --calcite-color-brand-hover: #ededed;
        }

        #years-block,
        #play-block {
          flex: 1;
          flex-grow: 1;
        }

        #slider-block {
          flex: 5;
          flex-grow: 10;
        }

        #sliderValue {
          display: flex;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          font-size: 300%;
        }

        #sliderInnerContainer {
          justify-content: center;
          padding: 0 20px;
          margin-top: 20px;
          width: 100%;
        }

        #playButton {
          margin-top: 20px;
          padding-left: 10px;
          width: 110px;
        }

        .controls-card {
          width: 260px;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .row calcite-button:first-child::part(native) {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        .row calcite-button:last-child::part(native) {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        .subsection {
          margin-top: 12px;
        }
      </style>

      <calcite-shell id="appShell">
        <arcgis-scene resize-align="top-left">
          <div slot="top-left" id="titleDiv">San Francisco Construction</div>
          <arcgis-home slot="top-left"></arcgis-home>
          <arcgis-fullscreen slot="top-right"></arcgis-fullscreen>
          <arcgis-expand slot="bottom-left" expand-icon="list-bullet">
            <arcgis-legend legend-style="classic"></arcgis-legend>
          </arcgis-expand>

          <arcgis-expand slot="top-right" id="layerListExpand" hidden>
            <arcgis-layer-list></arcgis-layer-list>
          </arcgis-expand>

          <arcgis-expand slot="top-right" expand-icon="halo">
            <calcite-card class="controls-card">
              <span slot="heading">Glow</span>

              <div class="row">
                <calcite-button id="naturalBtn" appearance="solid" width="full">Natural</calcite-button>
                <calcite-button id="glowBtn" appearance="outline" width="full">Glow</calcite-button>
              </div>

              <div id="glowControls" hidden class="subsection">
                <calcite-label>
                  Intensity
                  <calcite-slider id="glowIntensity" min="0" max="1" step="0.01" value="0.7" label-handles></calcite-slider>
                </calcite-label>
              </div>
            </calcite-card>
          </arcgis-expand>
        </arcgis-scene>

        <div id="footer" slot="footer">
          <calcite-block id="years-block" expanded label="current year">
            <span id="sliderValue">1901</span>
          </calcite-block>

          <calcite-block id="slider-block" label="slider block" expanded>
            <div id="sliderInnerContainer">
              <calcite-slider
                id="yearsSlider"
                value="1906"
                label-ticks
                ticks="175"
                max-label="2025"
                max="2025"
                min-label="1901"
                min="1901"
              ></calcite-slider>
            </div>
          </calcite-block>

          <calcite-block label="play button block" id="play-block" expanded>
            <calcite-button id="playButton" appearance="transparent" icon-start="play">Play</calcite-button>
          </calcite-block>
        </div>
      </calcite-shell>
    `;

    void this.#initialize(root);
  }

  disconnectedCallback(): void {
    for (const dispose of this.#cleanup.splice(0)) {
      dispose();
    }
  }

  async #initialize(root: ShadowRoot): Promise<void> {
    const sliderValue = root.getElementById("sliderValue") as HTMLElement;
    const playButton = root.getElementById("playButton") as any;
    const slider = root.getElementById("yearsSlider") as any;
    const viewElement = root.querySelector("arcgis-scene") as any;

    let animation: { remove: () => void } | null = null;

    const themes = {
      purple: {
        startColor: "#0ff",
        midColor: "#f0f",
        endColor: "#404",
      },
      red: {
        startColor: "#ffffb2",
        midColor: "#fd8d3c",
        endColor: "#bd0026",
      },
    };

    const currentTheme: keyof typeof themes = "purple";

    const baseLayer = new SceneLayer({
      portalItem: { id: "9ef96fb7b95a43a1aed1c653367defd7" } as any,
      title: "SF buildings",
    });

    const emissiveLayer = new SceneLayer({
      portalItem: { id: "9ef96fb7b95a43a1aed1c653367defd7" } as any,
      title: "Built in selected year",
      definitionExpression: "1=0",
      renderer: {
        type: "simple",
        symbol: {
          type: "mesh-3d",
          symbolLayers: [
            {
              type: "fill",
              material: {
                color: themes[currentTheme].startColor,
                emissive: { strength: 1, source: "color" },
                colorMixMode: "replace",
              },
            },
          ],
        },
        legendOptions: { showLegend: false },
      } as any,
    });

    const webscene = new WebScene({
      portalItem: { id: "82795d129ef042b198baf7b4cc157c9f" } as any,
      layers: [baseLayer, emissiveLayer],
    });

    viewElement.map = webscene;

    const fullscreenElement = root.querySelector("arcgis-fullscreen") as any;
    const appShell = root.getElementById("appShell") as HTMLElement;
    fullscreenElement.element = appShell;

    const onSliderInput = (e: any) => {
      stopAnimation();
      setYear(e.target.value);
    };
    slider.addEventListener("calciteSliderInput", onSliderInput);
    this.#cleanup.push(() =>
      slider.removeEventListener("calciteSliderInput", onSliderInput),
    );

    const onPlayClick = () => {
      playButton.iconStart === "pause" ? stopAnimation() : startAnimation();
    };
    playButton.addEventListener("click", onPlayClick);
    this.#cleanup.push(() =>
      playButton.removeEventListener("click", onPlayClick),
    );

    await viewElement.viewOnReady();
    const view = viewElement.view as any;

    view.environment.lighting.glow = new Glow({ intensity: 0.4 });

    const emissiveLV = await view.whenLayerView(emissiveLayer);

    function createBaseRenderer(currentYear: number): any {
      return {
        type: "simple",
        symbol: {
          type: "mesh-3d",
          symbolLayers: [
            {
              type: "fill",
              material: {
                color: "white",
                colorMixMode: "replace",
              },
            },
          ],
        },
        visualVariables: [
          {
            type: "opacity",
            field: "yrbuilt",
            stops: [
              { opacity: 1, value: currentYear - 1 },
              { opacity: 0, value: currentYear },
            ],
            legendOptions: { showLegend: false },
          },
          {
            type: "color",
            field: "yrbuilt",
            legendOptions: { title: "Year built" },
            stops: [
              {
                value: currentYear,
                color: themes[currentTheme].startColor,
                label: `in ${currentYear}`,
              },
              {
                value: currentYear - 25,
                color: themes[currentTheme].midColor,
                label: `~${currentYear - 25}`,
              },
              {
                value: currentYear - 50,
                color: themes[currentTheme].endColor,
                label: `before ${currentYear - 50}`,
              },
            ],
          },
        ],
      };
    }

    function setYear(value: string | number): void {
      const year = Math.floor(Number(value));
      sliderValue.textContent = String(year);
      slider.value = year;

      baseLayer.renderer = createBaseRenderer(year);
      emissiveLayer.definitionExpression = `yrbuilt = ${year}`;
    }

    function startAnimation(): void {
      stopAnimation();
      animation = animate(Number(slider.value));
      playButton.iconStart = "pause";
      playButton.textContent = "Pause";
    }

    function stopAnimation(): void {
      if (animation) {
        animation.remove();
        animation = null;
      }
      playButton.iconStart = "play";
      playButton.textContent = "Play";
    }

    function sleep(ms: number): Promise<void> {
      return new Promise((r) => setTimeout(r, ms));
    }

    function animate(startValue: number): { remove: () => void } {
      let animating = true;
      let year = Math.floor(startValue);

      const minYear = Number(slider.min);
      const maxYear = Number(slider.max);
      const stepYears = 1;

      const minMs = 1000;

      (async () => {
        while (animating) {
          const t0 = performance.now();

          setYear(year);

          await reactiveUtils.whenOnce(
            () => !emissiveLV.updating && !view.updating,
          );

          const elapsed = performance.now() - t0;
          const remaining = minMs - elapsed;
          if (remaining > 0) await sleep(remaining);

          year += stepYears;
          if (year > maxYear) year = minYear;
        }
      })().catch(() => {});

      return { remove: () => (animating = false) };
    }

    setYear(Number(slider.value));

    const addLayerList = (): void => {
      const layerListEl = root.querySelector("arcgis-layer-list") as any;
      layerListEl.listItemCreatedFunction = (event: any) => {
        const { item } = event;

        const container = document.createElement("div");
        container.style.width = "100%";

        const label = document.createElement("div");
        label.textContent = "Emissive strength";
        label.style.marginBottom = "0.25rem";

        const sliderEl = document.createElement("calcite-slider") as any;
        sliderEl.min = 0;
        sliderEl.max = 20;
        sliderEl.value = 1;
        sliderEl.step = 0.1;
        sliderEl.precision = 2;
        sliderEl.labelHandles = true;
        sliderEl.labelTicks = true;

        sliderEl.addEventListener("calciteSliderInput", () => {
          const value = Number(sliderEl.value);

          if (item.layer.type == "graphics") {
            item.layer.graphics.items.forEach((it: any) => {
              const sym = it.symbol.clone();
              sym.symbolLayers.forEach((sl: any) => {
                if (sl.material?.emissive) {
                  sl.material.emissive.strength = value;
                } else {
                  sl.material = {
                    emissive: { strength: value },
                  };
                }
              });

              it.symbol = sym;
            });
          } else {
            const r = item.layer.renderer.clone();
            let symbols: any[];
            if (r.type === "unique-value") {
              symbols = r.symbols;
            } else {
              symbols = [r.symbol];
            }
            symbols.forEach((sym) => {
              sym.symbolLayers.forEach((sl: any) => {
                if (sl.material?.emissive) {
                  sl.material.emissive.strength = value;
                }
              });
            });
            item.layer.renderer = r;
          }
        });

        container.appendChild(label);
        container.appendChild(sliderEl);

        item.panel = {
          content: container,
          icon: "sliders-horizontal",
          title: "Change emissive strength",
        };
      };

      const layerListExpand = root.getElementById("layerListExpand") as any;
      const onKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case "2":
            layerListExpand.hidden = !layerListExpand.hidden;
            break;
        }
      };
      window.addEventListener("keydown", onKeyDown);
      this.#cleanup.push(() =>
        window.removeEventListener("keydown", onKeyDown),
      );
    };

    addLayerList();

    {
      const naturalBtn = root.querySelector("#naturalBtn") as any;
      const glowBtn = root.querySelector("#glowBtn") as any;
      const glowControls = root.querySelector("#glowControls") as HTMLElement;
      const glowIntensitySlider = root.querySelector("#glowIntensity") as any;
      glowIntensitySlider.value =
        view.environment.lighting.glow?.intensity ?? 0.5;

      function toggleGlow(enableGlow: boolean): void {
        naturalBtn.appearance = enableGlow ? "outline" : "solid";
        glowBtn.appearance = enableGlow ? "solid" : "outline";
        glowControls.hidden = !enableGlow;

        const intensity = Number(glowIntensitySlider.value);

        view.environment.lighting.glow = enableGlow
          ? new Glow({ intensity })
          : null;
      }

      const onNatural = () => toggleGlow(false);
      const onGlow = () => toggleGlow(true);
      const onGlowSlider = () => {
        if (glowControls.hidden) return;
        toggleGlow(true);
      };

      naturalBtn.addEventListener("click", onNatural);
      glowBtn.addEventListener("click", onGlow);
      glowIntensitySlider.addEventListener("calciteSliderInput", onGlowSlider);

      this.#cleanup.push(() =>
        naturalBtn.removeEventListener("click", onNatural),
      );
      this.#cleanup.push(() => glowBtn.removeEventListener("click", onGlow));
      this.#cleanup.push(() =>
        glowIntensitySlider.removeEventListener(
          "calciteSliderInput",
          onGlowSlider,
        ),
      );

      toggleGlow(Boolean(view.environment.lighting.glow));
    }
  }
}

if (!customElements.get(DemoSfConstruction.tagName)) {
  customElements.define(DemoSfConstruction.tagName, DemoSfConstruction);
}

export { DemoSfConstruction };
