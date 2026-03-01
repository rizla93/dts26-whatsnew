import { Router } from "@vaadin/router";

import "@esri/calcite-components/components/calcite-select";
import "@esri/calcite-components/components/calcite-option";

import { DEMOS } from "../demos/manifest.ts";

class LandingPage extends HTMLElement {
  static tagName = "landing-page";

  #resizeObserver: ResizeObserver | null = null;
  #onWindowResize: (() => void) | null = null;

  disconnectedCallback(): void {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;

    if (this.#onWindowResize) {
      window.removeEventListener("resize", this.#onWindowResize);
      this.#onWindowResize = null;
    }
  }

  connectedCallback(): void {
    const root = this.attachShadow({ mode: "open" });

    const baseUrl = import.meta.env.BASE_URL ?? "/";

    root.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }

        .bg {
          height: 100%;
          width: 100%;
          background-image: url('${baseUrl}home.png');
          background-size: contain;
          background-position: center bottom;
          background-repeat: no-repeat;
          box-sizing: border-box;

          position: relative;
        }

        .panel {
          position: absolute;
          top: calc(50% + 12px);
          left: calc(var(--image-left, 0px) + var(--panel-inset, 120px));
          right: 16px;
          max-width: 520px;
          transform: translateY(-50%);
        }

        calcite-select {
          width: 100%;
        }
      </style>

      <div class="bg">
        <div class="panel">
          <calcite-select id="demo-select" placeholder="Select a demo" label="Demos">
            <calcite-option value="" selected>Select a demo</calcite-option>
            ${DEMOS.map((d) => `<calcite-option value="${d.path}">${d.label}</calcite-option>`).join("")}
          </calcite-select>
        </div>
      </div>
    `;

    const select = root.getElementById("demo-select") as unknown as {
      value: string;
      addEventListener: Function;
    } | null;

    const bgEl = root.querySelector(".bg") as HTMLElement | null;
    if (bgEl) {
      let imgW = 0;
      let imgH = 0;

      const updateVars = () => {
        if (!imgW || !imgH) return;

        const W = bgEl.clientWidth;
        const H = bgEl.clientHeight;
        if (!W || !H) return;

        const r = imgW / imgH;
        const w = Math.min(W, H * r);
        const h = w / r;
        const x = (W - w) / 2;
        const y = H - h;

        bgEl.style.setProperty("--image-left", `${x}px`);
        bgEl.style.setProperty("--image-top", `${y}px`);
        bgEl.style.setProperty("--image-width", `${w}px`);
        bgEl.style.setProperty("--image-height", `${h}px`);

        // When the image is letterboxed (non-fullscreen / different aspect ratio),
        // nudge the panel a bit closer to the image edge.
        bgEl.style.setProperty("--panel-inset", x > 0 ? "100px" : "120px");
      };

      const img = new Image();
      img.onload = () => {
        imgW = img.naturalWidth;
        imgH = img.naturalHeight;
        updateVars();
      };
      img.src = `${baseUrl}home.png`;

      this.#resizeObserver = new ResizeObserver(updateVars);
      this.#resizeObserver.observe(bgEl);

      this.#onWindowResize = updateVars;
      window.addEventListener("resize", updateVars);
    }

    select?.addEventListener("calciteSelectChange", () => {
      const value = (select as any).value as string;
      if (!value) return;
      const baseUrl = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
      Router.go(`${baseUrl}${value}`);
    });
  }
}

if (!customElements.get(LandingPage.tagName)) {
  customElements.define(LandingPage.tagName, LandingPage);
}

export { LandingPage };
