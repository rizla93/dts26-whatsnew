import { Router } from "@vaadin/router";

import "@esri/calcite-components/components/calcite-select";
import "@esri/calcite-components/components/calcite-option";

import { DEMOS } from "../demos/manifest.ts";

class LandingPage extends HTMLElement {
  static tagName = "landing-page";

  connectedCallback(): void {
    const root = this.attachShadow({ mode: "open" });

    root.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }

        .bg {
          height: 100%;
          width: 100%;
          background-image: url('/home.png');
          background-size: contain;
          background-position: center bottom;
          background-repeat: no-repeat;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .panel {
          width: min(520px, calc(100vw - 32px));
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

    select?.addEventListener("calciteSelectChange", () => {
      const value = (select as any).value as string;
      if (!value) return;
      Router.go(value);
    });
  }
}

if (!customElements.get(LandingPage.tagName)) {
  customElements.define(LandingPage.tagName, LandingPage);
}

export { LandingPage };
