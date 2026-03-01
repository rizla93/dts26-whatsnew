import{h as o,n as r,Y as a,a as c,b as l,c as p}from"./ShadowCastClear.glsl-D2y4lNvB.js";import"./index-q_6V94UJ.js";class n extends HTMLElement{static tagName="demo-fire-perimeters";connectedCallback(){const e=this.attachShadow({mode:"open"});e.innerHTML=`
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
    `,this.#e(e)}async#e(e){const t=e.getElementById("scene");t.map=new o({portalItem:{id:"49cc4d6ad8124b469505c4819a74875b"}}),await t.viewOnReady();const i=t.view;i?.ui&&(i.ui.components=[]),i?.environment?.lighting&&(i.environment.lighting.glow=new r({intensity:.3}));const s=new a({url:"https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/WoolseyFire/FeatureServer",elevationInfo:{mode:"relative-to-ground",offset:0},renderer:new c({symbol:new l({symbolLayers:[new p({width:10,height:50,cap:"round",join:"round",material:{color:[252,140,3,1],emissive:{strength:20,source:"color"}}})]})})});t.map.add(s)}}customElements.get(n.tagName)||customElements.define(n.tagName,n);export{n as DemoFirePerimeters};
