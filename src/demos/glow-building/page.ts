import "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-navigation-toggle";
import "@arcgis/map-components/components/arcgis-compass";
import "@arcgis/map-components/components/arcgis-daylight";

import ExtrudeSymbol3DLayer from "@arcgis/core/symbols/ExtrudeSymbol3DLayer";
import LineSymbol3DLayer from "@arcgis/core/symbols/LineSymbol3DLayer";
import LineSymbol3D from "@arcgis/core/symbols/LineSymbol3D";
import * as bufferOperator from "@arcgis/core/geometry/operators/bufferOperator";
import * as convexHullOperator from "@arcgis/core/geometry/operators/convexHullOperator";
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import Color from "@arcgis/core/Color";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import * as generalizeOperator from "@arcgis/core/geometry/operators/generalizeOperator";
import MeshComponent from "@arcgis/core/geometry/support/MeshComponent";
import MeshMaterialMetallicRoughness from "@arcgis/core/geometry/support/MeshMaterialMetallicRoughness";
import Mesh from "@arcgis/core/geometry/Mesh";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import MeshSymbol3D from "@arcgis/core/symbols/MeshSymbol3D";
import Polygon from "@arcgis/core/geometry/Polygon";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";
import TextSymbol3DLayer from "@arcgis/core/symbols/TextSymbol3DLayer";
import Polyline from "@arcgis/core/geometry/Polyline";
import Glow from "@arcgis/core/webscene/Glow";

type PopmotionLike = {
  animate: (options: Record<string, unknown>) => void;
  linear: (t: number) => number;
  easeInOut: (t: number) => number;
};

class DemoGlowBuilding extends HTMLElement {
  static tagName = "demo-glow-building";

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
      </style>

      <arcgis-scene
        basemap="satellite"
        ground="world-elevation"
        camera-position="-122.38429652, 37.78940182, 466"
        camera-heading="274"
        camera-tilt="54"
      >
        <arcgis-zoom slot="top-left"></arcgis-zoom>
        <arcgis-navigation-toggle slot="top-left"></arcgis-navigation-toggle>
        <arcgis-compass slot="top-left"></arcgis-compass>
        <arcgis-daylight slot="top-right"></arcgis-daylight>
      </arcgis-scene>
    `;

    void this.#initialize(root);
  }

  disconnectedCallback(): void {
    for (const dispose of this.#cleanup.splice(0)) {
      dispose();
    }
  }

  async #initialize(root: ShadowRoot): Promise<void> {
    const viewElement = root.querySelector("arcgis-scene") as any;

    const wallColor = new Color("#00fffb");

    const buildings = new SceneLayer({
      popupEnabled: false,
      url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/SF_BLDG_WSL1/SceneServer/layers/0",
    });
    const footprints = new FeatureLayer({
      url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/SF_BLDG_WSL1/FeatureServer/0",
    });
    const walls = new GraphicsLayer({
      elevationInfo: {
        mode: "absolute-height",
      } as any,
    });

    const popmotionUrl = "https://esm.sh/popmotion@11.0.3";
    const popmotion = (await import(
      /* @vite-ignore */ popmotionUrl
    )) as PopmotionLike;

    await viewElement.viewOnReady();
    const view = viewElement.view as any;

    viewElement.map.addMany([buildings, footprints, walls]);
    const buildingsLV = await view.whenLayerView(buildings);

    const gltfLayer = new GraphicsLayer({
      title: "GLTF building",
    });

    const floorsLayer = new GraphicsLayer({
      title: "Floors",
      elevationInfo: {
        mode: "absolute-height",
        offset: -20,
      } as any,
    });

    view.map.addMany([gltfLayer, floorsLayer]);

    const origin = new Point({
      x: -13624662.1976404,
      y: 4549682.655340326,
      z: 6,
      spatialReference: SpatialReference.WebMercator,
    });

    const buildingGlbUrl = `${import.meta.env.BASE_URL ?? "/"}building.glb`;
    const buildingMesh = await Mesh.createFromGLTF(origin, buildingGlbUrl);
    buildingMesh.scale(0.7);
    buildingMesh.rotate(0, 0, -45);

    const buildingGraphic = new Graphic({
      geometry: buildingMesh,
      symbol: new MeshSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              emissive: {
                strength: 1,
                source: "emissive",
              },
            } as any,
          }),
        ],
      }),
    });
    gltfLayer.add(buildingGraphic);

    const { zmin } = buildingMesh.extent;

    const base = zmin ?? 0;
    const heightFloor = 12;

    const polygon = new Polygon({
      rings: [
        [
          [-13624791.82531585, 4549745.094648252],
          [-13624719.66889523, 4549821.6342101535],
          [-13624516.803214941, 4549622.068283695],
          [-13624594.550592003, 4549547.257920391],
        ],
      ],
      spatialReference: SpatialReference.WebMercator,
    });

    const { r, g, b } = wallColor;

    const graphicVolume = new Graphic({
      geometry: polygon,
      symbol: new PolygonSymbol3D({
        symbolLayers: [
          new ExtrudeSymbol3DLayer({
            size: 0,
            material: {
              color: [r, g, b, 0.3],
              emissive: {
                strength: 1,
                source: "color",
              },
            } as any,
          }),
        ],
      }),
    });

    const graphicLineBottom = getCageGraphic(polygon, 1, 0);

    const labelOrigin = new Point({
      x: -13624622.176089698,
      y: 4549734.475898384,
      z: heightFloor,
      spatialReference: SpatialReference.WebMercator,
    });

    const label = new Graphic({
      geometry: labelOrigin,
      symbol: new PointSymbol3D({
        symbolLayers: [
          new TextSymbol3DLayer({
            text: "",
            material: {
              color: [255, 255, 255],
            } as any,
            font: {
              weight: "bold",
            } as any,
            size: 10,
          }),
        ],
        verticalOffset: {
          screenLength: 10,
          maxWorldLength: 200,
          minWorldLength: 20,
        } as any,
        callout: {
          type: "line",
          size: 0.5,
          color: [255, 255, 255, 0.9],
          border: {
            color: [0, 0, 0, 0],
          },
        } as any,
      }),
    });

    floorsLayer.addMany([graphicVolume, graphicLineBottom, label]);

    const clickHandle = view.on(
      "click",
      promiseUtils.debounce(async (e: any) => {
        const ht = await view.hitTest(e, {
          include: [buildings, gltfLayer],
        });

        walls.removeAll();

        const result = ht.results[0];
        if (result) {
          const graphic = result.graphic;
          if (graphic && graphic.layer == gltfLayer) {
            const height = result.mapPoint.z;
            const newHeight = height - ((height - base) % heightFloor);
            animateFloor(newHeight);
          } else {
            if (graphic && graphic.layer === buildings) {
              const extentResult = await buildingsLV.queryExtent({
                objectIds: [graphic.getObjectId()],
                returnGeometry: true,
              });

              await animateFootprint(graphic, extentResult.extent);
              return;
            }
          }
        }
      }),
    );
    this.#cleanup.push(() => clickHandle.remove());

    view.environment.lighting.glow = new Glow({ intensity: 0.7 });

    const pointerHandle = view.on("pointer-move", async (e: any) => {
      const ht = await view.hitTest(e, {
        include: [buildings, gltfLayer],
      });
      const result = ht.results[0];
      if (
        result &&
        result.graphic &&
        (result.graphic.layer == gltfLayer || result.graphic.layer == buildings)
      ) {
        view.container.style.cursor = "pointer";
      } else {
        view.container.style.cursor = "default";
      }
    });
    this.#cleanup.push(() => pointerHandle.remove());

    function animateFloor(newHeight: number): void {
      const oldHeight = ((floorsLayer.elevationInfo as any)?.offset ??
        0) as number;
      popmotion.animate({
        type: "linear",
        from: oldHeight,
        duration: 1000,
        to: newHeight,
        onUpdate: (height: number) => {
          floorsLayer.elevationInfo = {
            mode: "absolute-height",
            offset: height,
          } as any;
          const floor = Math.floor(height / 12);
          const symbol = (label.symbol as any).clone();
          (symbol as any).symbolLayers.getItemAt(0).text = `FLOOR ${floor}`;
          label.symbol = symbol as any;
        },
      });
    }

    function getCageGraphic(
      wall: any,
      opacity: number,
      height: number,
    ): Graphic {
      const bufferedWall = bufferOperator.execute(wall, 10, {
        unit: "meters",
      } as any) as any;
      const geometry = new Polyline({
        paths: [
          bufferedWall.rings[0].map((coords: number[]) => [...coords, height]),
        ],
        spatialReference: SpatialReference.WebMercator,
      });
      return new Graphic({
        geometry,
        symbol: new LineSymbol3D({
          symbolLayers: [
            new LineSymbol3DLayer({
              size: 1,
              material: {
                color: [153, 255, 253, opacity],
                emissive: {
                  strength: 1,
                  source: "color",
                },
              } as any,
            }),
          ],
        }),
      });
    }

    async function animateFootprint(building: any, extent: any): Promise<void> {
      const objectId = building.getObjectId();
      const query = footprints.createQuery();
      query.objectIds = [objectId];
      query.outFields = ["*"];
      query.multipatchOption = "xyFootprint";
      query.returnGeometry = true;
      const result = await footprints.queryFeatures(query);
      if (result.features.length === 0) {
        return;
      }
      const footprint = result.features[0];
      if (!footprint.geometry) return;
      const hull = convexHullOperator.execute(footprint.geometry) as any;
      const buffer = bufferOperator.execute(hull, 10, {
        unit: "meters",
      } as any) as any;
      const wall = generalizeOperator.execute(buffer, 10, {
        unit: "meters",
      } as any) as any;
      const size = (extent.zmax - extent.zmin) * 0.9;
      walls.removeAll();

      function createWall(s: number): void {
        const mesh = createMesh(wall, extent.zmin, size * s);
        walls.removeAll();
        const fill = new FillSymbol3DLayer({
          material: {
            color: wallColor,
            colorMixMode: "tint",
            emissive: {
              strength: 1,
              source: "color",
            },
          } as any,
          castShadows: false,
        } as any);
        walls.addMany([
          getCageGraphic(wall, 1, (extent.zmin + size / 3) * s),
          getCageGraphic(wall, 0.5, (extent.zmin + (2 * size) / 3) * s),
          getCageGraphic(wall, 0.2, (extent.zmin + size) * s),
        ]);
        walls.add(
          new Graphic({
            geometry: mesh,
            symbol: new MeshSymbol3D({
              symbolLayers: [fill],
            }),
          }),
        );
      }

      await new Promise<void>((resolve) => {
        popmotion.animate({
          ease: [popmotion.linear, popmotion.easeInOut],
          from: 0,
          velocity: 0,
          to: 1,
          stiffness: 200,
          onUpdate: createWall,
          onComplete: resolve,
        });
      });
    }

    function createMesh(polygon: any, zmin: number, height = 100): Mesh {
      const ring = polygon.rings[0];
      const triangles: number[] = [];
      const vertices: number[] = [];
      const colors: number[] = [];
      for (let i = 0; i < ring.length; i++) {
        const vIdx0 = 2 * i;
        const vIdx1 = 2 * i + 1;
        const vIdx2 = (2 * i + 2) % (2 * ring.length);
        const vIdx3 = (2 * i + 3) % (2 * ring.length);
        vertices.push(ring[i][0], ring[i][1], zmin);
        vertices.push(ring[i][0], ring[i][1], height / 2);
        colors.push(255, 255, 255, 50);
        colors.push(255, 255, 255, 0);
        triangles.push(vIdx0, vIdx1, vIdx2, vIdx2, vIdx1, vIdx3);
      }
      const wall = new MeshComponent({
        faces: triangles,
        shading: "flat",
        material: new MeshMaterialMetallicRoughness({
          emissiveColor: wallColor,
          metallic: 0.5,
          roughness: 0.8,
          doubleSided: true,
        } as any),
      } as any);
      return new Mesh({
        components: [wall],
        vertexAttributes: {
          position: vertices,
          color: colors,
        } as any,
        spatialReference: polygon.spatialReference,
      } as any);
    }
  }
}

if (!customElements.get(DemoGlowBuilding.tagName)) {
  customElements.define(DemoGlowBuilding.tagName, DemoGlowBuilding);
}

export { DemoGlowBuilding };
